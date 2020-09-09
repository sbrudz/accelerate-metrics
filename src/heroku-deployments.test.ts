import { HerokuPlatformApiRelease } from "@heroku-cli/typescript-api-schema";
import { getDeployments } from "./heroku-deployments";
import { DateTime } from "luxon";

describe("getDeployments", () => {
  const mockHerokuClient = {
    request: jest.fn(),
    get: jest.fn(),
  };
  beforeEach(() => {
    mockHerokuClient.get.mockReset();
    mockHerokuClient.request.mockReset();
  });

  describe("when the Heroku API provides release data", () => {
    const createdAt = DateTime.utc(2020, 8, 20, 11);
    const r1: HerokuPlatformApiRelease = {
      created_at: createdAt.toISO(),
      description: "Deploy 99912345",
    };
    const releases = [r1];
    describe("and there is at least one deploy", () => {
      beforeEach(() => {
        mockHerokuClient.get.mockResolvedValue(releases);
      });
      it("should return an array of deployments", async () => {
        const result = await getDeployments("test", mockHerokuClient);
        expect(result).toHaveLength(1);
      });
      it("should include the time created timestamp", async () => {
        const result = await getDeployments("test", mockHerokuClient);
        expect(result).toEqual([
          expect.objectContaining({
            timeCreated: createdAt.toLocal(),
          }),
        ]);
      });
      it("should include the git commit SHA for the deploy", async () => {
        const result = await getDeployments("test", mockHerokuClient);
        expect(result).toEqual([
          expect.objectContaining({
            commit: "99912345",
          }),
        ]);
      });
    });
  });
});
