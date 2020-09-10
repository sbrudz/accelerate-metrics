import { DateTime, DurationObject, DurationUnit, Interval } from "luxon";
import { median } from "mathjs";

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

export const medianFrequencyPerTimePeriod = (
  timestamps: DateTime[],
  window: Interval,
  timePeriod: DurationObject
) => {
  const bins = window.splitBy(timePeriod);
  const countsPerBin = bins.map((bin) => {
    return timestamps.reduce((acc, currTimestamp) => {
      if (bin.contains(currTimestamp)) {
        return acc + 1;
      }
      return acc;
    }, 0);
  });
  return median(countsPerBin);
};
