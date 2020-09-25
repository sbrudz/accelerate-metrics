import { DateTime, Interval } from "luxon";
import {
  bestMeanFrequency,
  FrequencyOverTimePeriod,
  meanFrequencyPerTimePeriod,
  toHertz,
} from "./deployment-frequency";

describe("Deployment Frequency calculations", () => {
  const time1 = DateTime.fromISO("2020-06-01T14:00:00.000Z");
  const time2 = DateTime.fromISO("2020-06-01T18:00:00.000Z");
  const time3 = DateTime.fromISO("2020-06-07T18:00:00.000Z");
  const time4 = DateTime.fromISO("2020-06-15T18:00:00.000Z");
  const time5 = DateTime.fromISO("2020-06-25T18:00:00.000Z");
  const time6 = DateTime.fromISO("2020-07-01T18:00:00.000Z");

  describe("meanFrequencyPerTimePeriod", () => {
    describe("when provided with a window", () => {
      const window = Interval.fromDateTimes(
        time1.startOf("month"),
        time1.endOf("month")
      );
      describe("and a set of timestamps", () => {
        const timestamps = [
          time1,
          time2,
          time3,
          time4,
          time5,
          DateTime.fromISO("2020-06-08T18:00:00.000Z"),
          DateTime.fromISO("2020-06-08T19:00:00.000Z"),
        ];
        describe("and a timePeriod", () => {
          it("should bin the timestamps by timePeriod and find the median count", () => {
            const result = meanFrequencyPerTimePeriod(timestamps, window, {
              week: 1,
            });
            expect(result).toEqual(1.4);
          });
        });
        describe("and a different timePeriod", () => {
          it("should bin the timestamps by timePeriod and find the median count", () => {
            const result = meanFrequencyPerTimePeriod(timestamps, window, {
              month: 1,
            });
            expect(result).toEqual(7);
          });
        });
      });
    });
  });

  describe("bestMeanFrequency", () => {
    describe("when provided with a window", () => {
      const window = Interval.fromDateTimes(
        time1.startOf("month"),
        time6.endOf("month")
      );
      describe("and a set of timestamps", () => {
        const timestamps = [time1, time2, time3, time4, time5, time6];
        it("should return the mean frequency at the most accurate granularity", () => {
          const result = bestMeanFrequency(timestamps, window);
          expect(result).toEqual({
            amount: 3,
            timePeriod: { month: 1 },
          });
        });
      });
      describe("and no timestamps", () => {
        it("should return 0 per year", () => {
          const result = bestMeanFrequency([], window);
          expect(result).toEqual({
            amount: 0,
            timePeriod: { year: 1 },
          });
        });
      });
    });
    describe("when provided with a year-long window", () => {
      const window = Interval.fromDateTimes(
        time1.startOf("year"),
        time1.endOf("year")
      );
      describe("and a single timestamp", () => {
        const timestamps = [time1];
        it("should return the mean frequency at the yearly granularity", () => {
          const result = bestMeanFrequency(timestamps, window);
          expect(result).toEqual({
            amount: 1,
            timePeriod: { year: 1 },
          });
        });
      });
      describe("and two timestamps far apart", () => {
        const timestamps = [time1, time1.minus({ months: 4 })];
        it("should return the mean frequency at the 6 month granularity", () => {
          const result = bestMeanFrequency(timestamps, window);
          expect(result).toEqual({
            amount: 1,
            timePeriod: { months: 6 },
          });
        });
      });
    });

    describe("when the number of releases drops greatly in a window", () => {
      const window = Interval.fromDateTimes(
        DateTime.fromISO("2020-09-09T00:00:00.000Z"),
        DateTime.fromISO("2020-09-23T00:00:00.000Z")
      );
      const deploy1 = DateTime.fromISO("2020-09-17T18:45:00.000Z");
      const deploys = [deploy1];

      it("should NOT fall off a cliff", () => {
        const result = bestMeanFrequency(deploys, window);
        const expected: FrequencyOverTimePeriod = {
          amount: 1,
          timePeriod: { month: 1 },
        };
        expect(result).toEqual(expected);
      });
    });
  });

  describe("toHertz", () => {
    describe("when given a frequency of once per day", () => {
      it("should return ~11.57 uHz", () => {
        const result = toHertz({ amount: 1, timePeriod: { day: 1 } });
        expect(result).toBeCloseTo(11.57e-6, 8);
      });
    });
    describe("when given a frequency of once per week", () => {
      it("should return ~1.653 uHz", () => {
        const result = toHertz({ amount: 1, timePeriod: { week: 1 } });
        expect(result).toBeCloseTo(1.653e-6, 9);
      });
    });
    describe("when given a frequency of once per month", () => {
      it("should return ~385.8 nHz", () => {
        const result = toHertz({ amount: 1, timePeriod: { month: 1 } });
        expect(result).toBeCloseTo(385.8e-9, 10);
      });
    });
    describe("when given a frequency of once per year", () => {
      it("should return ~31.71 nHz", () => {
        const result = toHertz({ amount: 1, timePeriod: { year: 1 } });
        expect(result).toBeCloseTo(31.71e-9, 11);
      });
    });
    describe("when given a frequency of once per six months", () => {
      it("should return ~64.3 nHz", () => {
        const result = toHertz({ amount: 1, timePeriod: { months: 6 } });
        expect(result).toBeCloseTo(64.3e-9, 10);
      });
    });
  });
});
