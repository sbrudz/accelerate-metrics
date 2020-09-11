import { mocked } from "ts-jest/utils";
import { DateTime, Interval } from "luxon";
import {
  calculateAverageLeadTime,
  calculateMeanLeadTimeForWindow,
  getLeadTimes,
  getPairs,
} from "./lead-time";
import { getCommitsBetweenRevisions } from "./git-utils";
import { Deployment } from "./heroku-deployments";

jest.mock("./git-utils");
const mockedGetCommitsBetweenRevisions = mocked(
  getCommitsBetweenRevisions,
  true
);

describe("lead-time functions", () => {
  const time1 = DateTime.utc(2020, 6, 10);
  const time2 = DateTime.utc(2020, 6, 12);
  const time3 = DateTime.utc(2020, 6, 5);

  beforeEach(() => {
    mockedGetCommitsBetweenRevisions.mockReset();
    mockedGetCommitsBetweenRevisions.mockResolvedValue([
      { commit: "789", timeCreated: time3 },
    ]);
  });

  describe("calculateAverageLeadTime", () => {
    describe("when provided with deployments", () => {
      const deployments = [
        {
          commit: "123",
          timeCreated: time1,
        },
        {
          commit: "456",
          timeCreated: time2,
        },
      ];

      describe("and windows that overlap those deployments", () => {
        const windows = [
          Interval.fromDateTimes(time1.startOf("month"), time1.endOf("month")),
          Interval.fromDateTimes(time2.startOf("month"), time2.endOf("month")),
        ];

        it("should return one average lead time for each window", async () => {
          const result = await calculateAverageLeadTime(deployments, windows);
          expect(result).toHaveLength(windows.length);
        });
      });
    });

    describe("when there is only 1 deploy in the window", () => {
      const deployments = [
        {
          commit: "123",
          timeCreated: time1,
        },
      ];
      const windows = [
        Interval.fromDateTimes(time1.startOf("month"), time1.endOf("month")),
      ];
      it("should return the average lead time for the commits associated with that deploy", async () => {
        const result = await calculateAverageLeadTime(deployments, windows);
        expect(result).toHaveLength(windows.length);
      });
    });
  });

  describe("calculateMeanLeadTimeForWindow", () => {
    const window = Interval.fromDateTimes(
      time1.startOf("month"),
      time1.endOf("month")
    );
    describe("when a window and multiple deploys are provided", () => {
      const deployments = [
        {
          commit: "123",
          timeCreated: time1,
        },
        {
          commit: "456",
          timeCreated: time2,
        },
      ];
      it("should return the average lead time for that window", async () => {
        const result = await calculateMeanLeadTimeForWindow(
          window,
          deployments
        );
        expect(result).toEqual([
          window.end.toMillis(),
          7 * 86400000, // 7 days in milliseconds
        ]);
      });
    });
    describe("when only one deploy falls in the window", () => {
      const deployments = [
        {
          commit: "123",
          timeCreated: time1,
        },
      ];
      it("should return the average lead time for that deploy", async () => {
        const result = await calculateMeanLeadTimeForWindow(
          window,
          deployments
        );
        expect(result).toEqual([
          window.end.toMillis(),
          5 * 86400000, // 5 days in milliseconds
        ]);
      });
    });
    describe("when no deploys fall in the window", () => {
      const deployments: Deployment[] = [];
      it("should return a 0 lead time for that window", async () => {
        const result = await calculateMeanLeadTimeForWindow(
          window,
          deployments
        );
        expect(result).toEqual([window.end.toMillis(), 0]);
      });
    });
  });

  describe("getPairs", () => {
    describe("given an ordered list of items", () => {
      it("should return one entry for each pair of items", () => {
        const items = [1, 2, 3, 4, 5];
        const result = getPairs(items);
        expect(result).toHaveLength(4);
      });
    });

    describe("given two items", () => {
      it("should return an entry starting with the first timestamp", () => {
        const items = [1, 2];
        const result = getPairs(items);
        expect(result[0][0]).toEqual(1);
      });

      it("should return an entry ending with the second timestamp", () => {
        const items = [1, 2];
        const result = getPairs(items);
        expect(result[0][1]).toEqual(2);
      });
    });

    describe("given one item", () => {
      it("should return an entry with just that item", () => {
        const result = getPairs([1]);
        expect(result[0][0]).toEqual(1);
      });
    });

    describe("given no items", () => {
      it("should return an empty array", () => {
        const result = getPairs([]);
        expect(result).toHaveLength(0);
      });
    });
  });

  describe("getLeadTimes", () => {
    describe("when provided with both start and end revisions", () => {
      const start = {
        commit: "123",
        timeCreated: time1,
      };
      const end = {
        commit: "456",
        timeCreated: time2,
      };

      it("should return the lead times for any commits between the two revisions", async () => {
        const result = await getLeadTimes(start, end);
        expect(result).toEqual([7 * 86400000]);
      });
    });
    describe("when provided with just a start revision", () => {
      const start = {
        commit: "123",
        timeCreated: time1,
      };

      it("should return the lead times for all commits for that revision", async () => {
        const result = await getLeadTimes(start);
        expect(result).toEqual([5 * 86400000]);
      });
    });
  });
});
