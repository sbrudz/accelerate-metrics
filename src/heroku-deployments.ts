import Heroku from "heroku-client";
import { HerokuPlatformApiRelease } from "@heroku-cli/typescript-api-schema";
import { DateTime } from "luxon";

export const getDeployments = async (appName: string, herokuClient: Heroku) => {
  const releases = await herokuClient.get<HerokuPlatformApiRelease[]>(
    `/apps/${appName}/releases`
  );
  const deployRegExp = /^Deploy (?<commit>.+)/;
  const deployments = releases.filter((release) =>
    deployRegExp.test(release.description || "")
  );
  return deployments.map((deploy) => {
    const match = deployRegExp.exec(deploy.description || "");
    if (!match || !match.groups) {
      throw new Error(`Bad deployment description format: ${deploy}`);
    }
    return {
      commit: match.groups.commit as string,
      timeCreated: DateTime.fromISO(deploy.created_at || ""),
    };
  });
};