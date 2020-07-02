import {
  rollingWindows,
  calculateTimePoints,
  windowPerTimePoint,
} from "./rolling-window";
import { DateTime, Interval } from "luxon";

describe("rolling window calculations", () => {
  describe("rollingWindows", () => {
    describe("given a start date, a reportOnDuration, a window interval, and a window duration", () => {
      const reportDate = DateTime.fromISO("2020-06-07T18:00:00.000Z");
      const reportOnDuration = { years: 1 };
      const windowIntervalSize = { days: 7 };
      const windowDuration = { days: 20 };

      it("should return one interval for each time point", () => {
        const result = rollingWindows({
          reportDate,
          reportOnDuration,
          windowIntervalSize,
          windowDuration,
        });
        expect(result).toHaveLength(53);
      });

      it("should return intervals with a size of windowDuration", () => {
        const result = rollingWindows({
          reportDate,
          reportOnDuration,
          windowIntervalSize,
          windowDuration,
        });
        expect(
          result.map((interval) => interval.length("days"))
        ).toContainEqual(20);
      });
    });
  });

  describe("calculateTimePoints", () => {
    describe("given a start date, a reportOnDuration, and a window interval", () => {
      const reportDate = DateTime.fromISO("2020-06-07T18:00:00.000Z");
      const reportOnDuration = { years: 1 };
      const windowIntervalSize = { days: 7 };

      it("should return one interval for each time point in the reportOnDuration", () => {
        const result = calculateTimePoints({
          reportDate,
          reportOnDuration,
          windowIntervalSize,
        });
        expect(result).toHaveLength(53);
      });

      it("should return the first interval with a start date that lines up with the window start", () => {
        const expectedStart = DateTime.fromISO("2019-06-07T18:00:00.000Z");
        const result = calculateTimePoints({
          reportDate,
          reportOnDuration,
          windowIntervalSize,
        });
        expect(result[0].start).toEqual(expectedStart);
      });

      it("should return the last interval with an end date that lines up with the window end", () => {
        const expectedEnd = reportDate;
        const result = calculateTimePoints({
          reportDate,
          reportOnDuration,
          windowIntervalSize,
        });
        expect(result[52].end).toEqual(expectedEnd);
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
