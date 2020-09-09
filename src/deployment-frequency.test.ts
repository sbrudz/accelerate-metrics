import { DateTime } from "luxon";
import { averageFrequency } from "./deployment-frequency";

describe("Deployment Frequency calculation", () => {
  const time1 = DateTime.fromISO("2020-06-01T14:00:00.000Z");
  const time2 = DateTime.fromISO("2020-06-01T18:00:00.000Z");
  const time3 = DateTime.fromISO("2020-06-07T18:00:00.000Z");
  const time4 = DateTime.fromISO("2020-06-15T18:00:00.000Z");
  const time5 = DateTime.fromISO("2020-06-25T18:00:00.000Z");
  const time6 = DateTime.fromISO("2020-07-01T18:00:00.000Z");

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
