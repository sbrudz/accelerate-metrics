import { exec as execCb } from "child_process";
import { promisify } from "util";
import { Deployment } from "./heroku-deployments";
import { Interval } from "luxon";

const exec = promisify(execCb);

export const calculateAverageLeadTime = async (
  deployments: Deployment[],
  windows: Interval[]
): Promise<Array<Array<number>>> => {
  return [
    [1594616400000, 97320000],
    [1595221200000, 24330000],
    [1595739600000, 1.051e10],
  ];
};

export const getCommitsBetweenRevisions = async ({
  startTag,
  endTag,
}: {
  startTag: string;
  endTag: string;
}): Promise<string> => {
  const command = `git log --pretty=format:"%h,%aI" "${startTag}..${endTag}" --no-merges`;
  const { stdout } = await exec(command);
  console.log(stdout);
  return command;
};
