import { DateTime, Duration, DurationObject, Interval } from "luxon";
import { mean } from "mathjs";
import { Deployment } from "./heroku-deployments";

export const calculateDeploymentFrequency = (
  deployments: Deployment[],
  windows: Interval[]
): Array<Array<number>> => {
  return windows.map((window) => {
    const deploymentTimeStampsInWindow = deployments
      .filter((deploy) => window.contains(deploy.timeCreated))
      .map((deployInWindow) => deployInWindow.timeCreated);
    const meanFrequency = bestMeanFrequency(
      deploymentTimeStampsInWindow,
      window
    );
    return [window.end.toMillis(), toHertz(meanFrequency)];
  });
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

export interface FrequencyOverTimePeriod {
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
  const frequenciesPerTimePeriod = TIME_PERIODS.map((timePeriod) => {
    return {
      amount: meanFrequencyPerTimePeriod(timestamps, window, timePeriod),
      timePeriod,
    };
  });
  const frequenciesPerTimePeriodGreaterThan1 = frequenciesPerTimePeriod.filter(
    (freqObj) => freqObj.amount >= 1
  );
  return frequenciesPerTimePeriodGreaterThan1.shift() || defaultMean;
};

export const toHertz = (frequencyOverTime: FrequencyOverTimePeriod): number => {
  const secondsInTimePeriod = Duration.fromObject(
    frequencyOverTime.timePeriod
  ).as("seconds");
  return frequencyOverTime.amount / secondsInTimePeriod;
};
