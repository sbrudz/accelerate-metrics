import { rollingWindows, windowPerTimePoint } from "./rolling-window";
import { DateTime, Interval } from "luxon";

describe("rolling window calculations", () => {
  describe("rollingWindows", () => {
    describe("given a start date, a reportOnDuration, a window interval, and a window duration", () => {
      const reportStart = DateTime.fromISO("2019-06-07T18:00:00.000Z");
      const reportEnd = DateTime.fromISO("2020-06-07T18:00:00.000Z");
      const samplingFrequency = { days: 7 };
      const windowDuration = { days: 20 };

      it("should return one interval for each time point", () => {
        const result = rollingWindows({
          reportStart,
          reportEnd,
          samplingFrequency,
          windowDuration,
        });
        expect(result).toHaveLength(53);
      });

      it("should return intervals with a size of windowDuration", () => {
        const result = rollingWindows({
          reportStart,
          reportEnd,
          samplingFrequency,
          windowDuration,
        });
        expect(
          result.map((interval) => interval.length("days"))
        ).toContainEqual(20);
      });
    });
  });

  describe("windowPerTimePoint", () => {
    describe("given a windowDuration", () => {
      it("should return a function", () => {
        const result = windowPerTimePoint({ days: 20 });
        expect(result).toBeInstanceOf(Function);
      });

      describe("and when the resulting function is given an interval", () => {
        const intervalStart = DateTime.fromISO("2019-06-20T18:00:00.000Z");
        const intervalEnd = DateTime.fromISO("2019-06-30T18:00:00.000Z");
        const interval = Interval.fromDateTimes(intervalStart, intervalEnd);

        it("should return a new interval that ends on the same date as the original", () => {
          const result = windowPerTimePoint({ days: 20 })(interval);
          expect(result.end).toEqual(intervalEnd);
        });

        it("should return a new interval that starts windowDuration before the original interval end", () => {
          const expectedIntervalStart = DateTime.fromISO(
            "2019-06-10T18:00:00.000Z"
          );
          const result = windowPerTimePoint({ days: 20 })(interval);
          expect(result.start).toEqual(expectedIntervalStart);
        });
      });
    });
  });
});
