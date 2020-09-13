import { Interval, DateTime, DurationObject } from "luxon";

export const windowPerTimePoint = (windowDuration: DurationObject) => (
  interval: Interval
): Interval => {
  return Interval.before(interval.end, windowDuration);
};

export interface RollingWindowInputs {
  reportStart: DateTime;
  reportEnd: DateTime;
  windowIntervalSize: DurationObject;
  windowDuration: DurationObject;
}

export const rollingWindows = ({
  reportStart,
  reportEnd,
  windowIntervalSize,
  windowDuration,
}: RollingWindowInputs): Interval[] => {
  const interval = Interval.fromDateTimes(reportStart, reportEnd);
  return interval
    .splitBy(windowIntervalSize)
    .map(windowPerTimePoint(windowDuration));
};
