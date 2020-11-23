import { Deployment } from "./heroku-deployments";
import { getCommitsBetweenRevisions } from "./git-utils";

export const gatherReleaseData = async (
  gathererFn: () => Promise<Deployment[]>
) => {
  const deployments = await gathererFn();
  const releases = [];
  let prevDeploy;
  for (const deploy of deployments) {
    // TODO: fix getCommitsBetweenRevisions so that prevDeploy is optional
    let commits;
    if (prevDeploy) {
      commits = await getCommitsBetweenRevisions(prevDeploy, deploy);
    } else {
      commits = await getCommitsBetweenRevisions(deploy);
    }
    releases.push({
      timestamp: deploy.timeCreated.toISO(),
      releaseId: deploy.commit,
      changes: commits.map((commit) => ({
        timestamp: commit.timeCreated.toISO(),
        changeId: commit.commit,
      })),
    });
    prevDeploy = deploy;
  }

  return { releases };
};
