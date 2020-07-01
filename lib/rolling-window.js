import { Interval } from "luxon";

export const calculateTimePoints = ({
  reportDate,
  reportOnDuration,
  windowIntervalSize,
}) => {
  const period = Interval.before(reportDate, reportOnDuration);
  return period.splitBy(windowIntervalSize);
};

export const windowPerTimePoint = (windowDuration) => (interval) => {
  return Interval.before(interval.end, windowDuration);
};

export const rollingWindows = ({
  reportDate,
  reportOnDuration,
  windowIntervalSize,
  windowDuration,
}) => {
  return calculateTimePoints({
    reportDate,
    reportOnDuration,
    windowIntervalSize,
  }).map(windowPerTimePoint(windowDuration));
};
