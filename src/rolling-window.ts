import { Interval, DateTime, DurationObject } from "luxon";

export const windowPerTimePoint = (windowDuration: DurationObject) => (
  interval: Interval
): Interval => {
  return Interval.before(interval.end, windowDuration);
};

export interface RollingWindowInputs {
  reportStart: DateTime;
  reportEnd: DateTime;
  samplingFrequency: DurationObject;
  sampleWindowSize: DurationObject;
}

export const rollingWindows = ({
  reportStart,
  reportEnd,
  samplingFrequency,
  sampleWindowSize,
}: RollingWindowInputs): Interval[] => {
  const interval = Interval.fromDateTimes(reportStart, reportEnd);
  return interval
    .splitBy(samplingFrequency)
    .map(windowPerTimePoint(sampleWindowSize));
};
