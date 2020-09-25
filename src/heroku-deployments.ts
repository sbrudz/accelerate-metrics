import Heroku from "heroku-client";
import { HerokuPlatformApiRelease } from "@heroku-cli/typescript-api-schema";
import { DateTime } from "luxon";

export interface Deployment {
  commit: string;
  timeCreated: DateTime;
}

export const getDeployments = async (
  appName: string,
  herokuClient: Heroku
): Promise<Deployment[]> => {
  const releases = await herokuClient.get<HerokuPlatformApiRelease[]>(
    `/apps/${appName}/releases`
  );
  console.log(`Found ${releases.length} Heroku releases for ${appName}`);
  const deployRegExp = /^Deploy (?<commit>.+)/;
  const deployments = releases.filter((release) =>
    deployRegExp.test(release.description || "")
  );
  console.log(`${deployments.length} of those releases were code deploys`);
  return deployments.map((deploy) => {
    const match = deployRegExp.exec(deploy.description || "");
    if (!match || !match.groups) {
      throw new Error(`Bad deployment description format: ${deploy}`);
    }
    return {
      commit: match.groups.commit,
      timeCreated: DateTime.fromISO(deploy.created_at || ""),
    };
  });
};
