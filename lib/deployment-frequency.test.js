import { averageFrequency } from "./deployment-frequency";

describe("Deployment Frequency calculation", () => {
  describe("given a list of code deployment timestamps", () => {
    const codeDeploys = [
      "2020-06-01T14:00:00.000Z",
      "2020-06-01T18:00:00.000Z",
      "2020-06-07T18:00:00.000Z",
      "2020-06-15T18:00:00.000Z",
      "2020-06-25T18:00:00.000Z",
    ];
    it("should calculate the average deployment frequency in releases per second", () => {
      const expectedFrequency = 0.000001916;
      const result = averageFrequency(codeDeploys);
      expect(result).toBeCloseTo(expectedFrequency, 9);
    });
  });

  describe("given two timestamps", () => {
    it("should return the inverse of the difference between those timestamps", () => {
      const expectedFrequency = 0.000069444;
      const result = averageFrequency([
        "2020-06-01T14:00:00.000Z",
        "2020-06-01T18:00:00.000Z",
      ]);
      expect(result).toBeCloseTo(expectedFrequency, 9);
    });
  });

  describe("given timestamps that are out of order", () => {
    it("should throw an error", () => {
      const misorderedTimestamps = [
        "2020-06-01T18:00:00.000Z",
        "2020-06-01T14:00:00.000Z",
      ];
      expect(() => averageFrequency(misorderedTimestamps)).toThrowError(
        /The end of an interval must be after its start/
      );
    });
  });

  describe("given one timestamp", () => {
    it("should return 0", () => {
      const result = averageFrequency(["2020-06-01T14:00:00.000Z"]);
      expect(result).toEqual(0);
    });
  });

  describe("given no timestamps", () => {
    it("should return 0", () => {
      const result = averageFrequency([]);
      expect(result).toEqual(0);
    });
  });

  describe("given a null list of timestamps", () => {
    it("should return 0", () => {
      const result = averageFrequency();
      expect(result).toEqual(0);
    });
  });
});
