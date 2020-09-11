import { Interval, DateTime, DurationObject } from "luxon";

interface TimePointInputs {
  reportDate: DateTime;
  reportOnDuration: DurationObject;
  windowIntervalSize: DurationObject;
}

export const calculateTimePoints = ({
  reportDate,
  reportOnDuration,
  windowIntervalSize,
}: TimePointInputs): Interval[] => {
  const period = Interval.before(reportDate, reportOnDuration);
  return period.splitBy(windowIntervalSize);
};

export const windowPerTimePoint = (windowDuration: DurationObject) => (
  interval: Interval
): Interval => {
  return Interval.before(interval.end, windowDuration);
};

export interface RollingWindowInputs extends TimePointInputs {
  windowDuration: DurationObject;
}

export const rollingWindows = ({
  reportDate,
  reportOnDuration,
  windowIntervalSize,
  windowDuration,
}: RollingWindowInputs): Interval[] => {
  return calculateTimePoints({
    reportDate,
    reportOnDuration,
    windowIntervalSize,
  }).map(windowPerTimePoint(windowDuration));
};
