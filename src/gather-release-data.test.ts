import { mocked } from "ts-jest/utils";
import { gatherReleaseData } from "./gather-release-data";
import { DateTime } from "luxon";
import { getCommitsBetweenRevisions } from "./git-utils";

jest.mock("./git-utils");
const mockedGetCommitsBetweenRevisions = mocked(
  getCommitsBetweenRevisions,
  true
);

describe("gatherReleaseData()", () => {
  const time0 = DateTime.utc(2020, 8, 1);
  const time1 = DateTime.utc(2020, 9, 1);
  const time1a = DateTime.utc(2020, 9, 15);
  const time1b = DateTime.utc(2020, 9, 16);
  const time2 = DateTime.utc(2020, 10, 1);

  beforeEach(() => {
    mockedGetCommitsBetweenRevisions.mockReset();
    mockedGetCommitsBetweenRevisions.mockResolvedValueOnce([
      { commit: "123", timeCreated: time0 },
    ]);
    mockedGetCommitsBetweenRevisions.mockResolvedValueOnce([
      { commit: "456", timeCreated: time1a },
      { commit: "789", timeCreated: time1b },
    ]);
  });

  describe("when provided with a release gatherer function", () => {
    it("should return an object containing all of the gathered releases", async () => {
      const release1 = {
        commit: "abc",
        timeCreated: time1,
      };
      const release2 = {
        commit: "xyz",
        timeCreated: time2,
      };

      const gathererFn = async () => {
        return [release1, release2];
      };
      const result = await gatherReleaseData(gathererFn);

      const expected = {
        releases: [
          {
            timestamp: time1.toISO(),
            releaseId: "abc",
            changes: [
              {
                timestamp: time0.toISO(),
                changeId: "123",
              },
            ],
          },
          {
            timestamp: time2.toISO(),
            releaseId: "xyz",
            changes: [
              {
                timestamp: time1a.toISO(),
                changeId: "456",
              },
              {
                timestamp: time1b.toISO(),
                changeId: "789",
              },
            ],
          },
        ],
      };
      expect(result).toEqual(expected);
    });

    it.todo("should return an object the conforms to the DORA schema");
  });

  describe("when no releases are found", () => {
    it.todo("should return an empty array of releases");
  });

  describe("when only one release is found", () => {
    it.todo("should return data for that one release");
  });
});
