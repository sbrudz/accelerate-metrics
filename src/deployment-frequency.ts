import { DateTime, Duration, DurationObject, Interval } from "luxon";
import { mean } from "mathjs";

const sum = (items: number[]) => {
  return items.reduce((a, b) => a + b, 0);
};

export const getIntervalsBetween = (timestamps: DateTime[]) => {
  return timestamps.reduce((result: Interval[], value, index, array) => {
    if (index > 0) {
      const prevValue = array[index - 1];
      const interval = Interval.fromDateTimes(prevValue, value);
      if (!interval.isValid) {
        throw new Error(interval.invalidExplanation || "Bad interval");
      }
      result.push(interval);
    }
    return result;
  }, []);
};

export const averageFrequency = (timestamps: DateTime[]) => {
  if (!timestamps || timestamps.length <= 1) {
    return 0;
  }
  const secondsBetweenTimestamps = getIntervalsBetween(
    timestamps
  ).map((interval) => interval.toDuration().as("seconds"));
  const averagePeriod =
    sum(secondsBetweenTimestamps) / secondsBetweenTimestamps.length;
  return 1 / averagePeriod; // frequency is the inverse of period
};

export const meanFrequencyPerTimePeriod = (
  timestamps: DateTime[],
  window: Interval,
  timePeriod: DurationObject
): number => {
  const bins = window.splitBy(timePeriod);
  const countsPerBin = bins.map((bin) => {
    return timestamps.reduce((acc, currTimestamp) => {
      if (bin.contains(currTimestamp)) {
        return acc + 1;
      }
      return acc;
    }, 0);
  });
  return mean(countsPerBin);
};

const TIME_PERIODS: DurationObject[] = [
  { hour: 1 },
  { day: 1 },
  { week: 1 },
  { month: 1 },
  { months: 6 },
  { year: 1 },
];

interface FrequencyOverTimePeriod {
  amount: number;
  timePeriod: DurationObject;
}

export const bestMeanFrequency = (
  timestamps: DateTime[],
  window: Interval
): FrequencyOverTimePeriod => {
  const defaultMean: FrequencyOverTimePeriod = {
    amount: 0,
    timePeriod: { year: 1 },
  };
  return TIME_PERIODS.map((timePeriod) => {
    return {
      amount: meanFrequencyPerTimePeriod(timestamps, window, timePeriod),
      timePeriod,
    };
  })
    .filter((freqObj) => freqObj.amount >= 1)
    .reduce((prev, curr) => {
      if (prev.amount && prev.amount < curr.amount) {
        return prev;
      }
      return curr;
    }, defaultMean);
};

export const toHertz = (frequencyOverTime: FrequencyOverTimePeriod) => {
  const secondsInTimePeriod = Duration.fromObject(
    frequencyOverTime.timePeriod
  ).as("seconds");
  return frequencyOverTime.amount / secondsInTimePeriod;
};
