import { Deployment } from "./heroku-deployments";
import parse from "csv-parse/lib/sync";
import { DateTime } from "luxon";
import { promisify } from "util";
import { exec as execCb } from "child_process";

const exec = promisify(execCb);

const gitProjectDirectory = process.env.GIT_PROJECT_DIRECTORY || ".";

export const getCommitsBetweenRevisions = async (
  start: Deployment,
  end?: Deployment
): Promise<Deployment[]> => {
  // TODO: Remove this hard coding of directory
  const revisionQuery = end ? `${start.commit}..${end.commit}` : start.commit;
  const command = `cd ${gitProjectDirectory} && git log --pretty=format:"%h,%aI" "${revisionQuery}" --no-merges`;
  const { stdout, stderr } = await exec(command);

  if (stderr) {
    console.error(stderr);
  }

  return parse(stdout, {
    columns: ["commit", "timeCreated"],
    on_record: (record) => {
      return {
        commit: record.commit,
        timeCreated: DateTime.fromISO(record.timeCreated),
      };
    },
  });
};
