import { DateTime, Interval } from "luxon";
import {
  averageFrequency,
  bestMeanFrequency,
  getIntervalsBetween,
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

  describe("getIntervalsBetween", () => {
    describe("given an ordered list of timestamps", () => {
      it("should return one interval for each pair of timestamps", () => {
        const timestamps = [time1, time2, time3, time4, time5];
        const result = getIntervalsBetween(timestamps);
        expect(result).toHaveLength(4);
      });
    });

    describe("given two timestamps", () => {
      it("should return an interval starting with the first timestamp", () => {
        const timestamps = [time1, time2];
        const result = getIntervalsBetween(timestamps);
        expect(result[0].start).toEqual(time1);
      });

      it("should return an interval ending with the second timestamp", () => {
        const timestamps = [time1, time2];
        const result = getIntervalsBetween(timestamps);
        expect(result[0].end).toEqual(time2);
      });
    });

    describe("given timestamps that are out of order", () => {
      it("should throw an error", () => {
        const misorderedTimestamps = [time2, time1];
        expect(() => getIntervalsBetween(misorderedTimestamps)).toThrowError(
          /The end of an interval must be after its start/
        );
      });
    });

    describe("given one timestamp", () => {
      it("should return an empty array", () => {
        const result = getIntervalsBetween([time1]);
        expect(result).toHaveLength(0);
      });
    });

    describe("given no timestamps", () => {
      it("should return 0", () => {
        const result = getIntervalsBetween([]);
        expect(result).toHaveLength(0);
      });
    });

    describe("given a bad timestamp", () => {
      it("should throw an error", () => {
        const badTime = DateTime.fromISO("bad");
        expect(() => getIntervalsBetween([badTime, time1])).toThrowError(
          /Bad interval/
        );
      });
    });
  });

  describe("averageFrequency", () => {
    describe("given a list of code deployment timestamps", () => {
      const codeDeploys = [time1, time2, time3, time4, time5];
      it("should calculate the average deployment frequency in releases per second", () => {
        const expectedFrequency = 0.000001916;
        const result = averageFrequency(codeDeploys);
        expect(result).toBeCloseTo(expectedFrequency, 9);
      });
    });

    describe("given two timestamps", () => {
      it("should return the inverse of the difference between those timestamps", () => {
        const expectedFrequency = 0.000069444;
        const result = averageFrequency([time1, time2]);
        expect(result).toBeCloseTo(expectedFrequency, 9);
      });
    });

    describe("given two timestamps a month apart", () => {
      it("should return a frequency of once per month", () => {
        const expectedFrequency = 380.5e-9; // 380.5 nHz
        const result = averageFrequency([time1, time6]);
        expect(result).toBeCloseTo(expectedFrequency, 8);
      });
    });

    describe("given timestamps that are out of order", () => {
      it("should throw an error", () => {
        const misorderedTimestamps = [time2, time1];
        expect(() => averageFrequency(misorderedTimestamps)).toThrowError(
          /The end of an interval must be after its start/
        );
      });
    });

    describe("given one timestamp", () => {
      it("should return 0", () => {
        const result = averageFrequency([time1]);
        expect(result).toEqual(0);
      });
    });

    describe("given no timestamps", () => {
      it("should return 0", () => {
        const result = averageFrequency([]);
        expect(result).toEqual(0);
      });
    });

    describe("given bad timestamps", () => {
      it("should throw an error", () => {
        const badTime = DateTime.fromISO("bad");
        expect(() => averageFrequency([badTime, time1])).toThrowError(
          /Bad interval/
        );
      });
    });
  });

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
  });
});
