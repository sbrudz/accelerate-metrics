import * as core from "@actions/core";
import { Deployment } from "./heroku-deployments";
import parse from "csv-parse/lib/sync";
import { DateTime } from "luxon";
import { promisify } from "util";
import { exec as execCb } from "child_process";

const exec = promisify(execCb);

export const getCommitsBetweenRevisions = async (
  start: Deployment,
  end?: Deployment
): Promise<Deployment[]> => {
  const revisionQuery = end ? `${start.commit}..${end.commit}` : start.commit;
  const command = `git log --pretty=format:"%h,%aI" "${revisionQuery}" --no-merges`;
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

export const doesCommitExist = async (commit: string): Promise<boolean> => {
  const command = `git log -1 --format='%H' ${commit}`;
  try {
    await exec(command);
  } catch (error) {
    core.warning(`Commit ${commit} does not exist. Error: ${error}`);
    return false;
  }
  return true;
};
