import { Deployment } from "./heroku-deployments";
import { Interval } from "luxon";
import { mean } from "mathjs";
import { getCommitsBetweenRevisions } from "./git-utils";

type TimeStampValuePair = Array<number>;
type TimestampValuePairs = Array<TimeStampValuePair>;

export const calculateAverageLeadTime = async (
  deployments: Deployment[],
  windows: Interval[]
): Promise<TimestampValuePairs> => {
  return Promise.all(
    windows.map(async (window) => {
      const deploysInWindow = deployments.filter((deploy) => {
        return window.contains(deploy.timeCreated);
      });
      return await calculateMeanLeadTimeForWindow(window, deploysInWindow);
    })
  );
};

export const calculateMeanLeadTimeForWindow = async (
  window: Interval,
  deploys: Deployment[]
): Promise<TimeStampValuePair> => {
  const deployPairs = getPairs(deploys);
  const leadTimes = await Promise.all(
    deployPairs.map(async ([start, end]) => getLeadTimes(start, end))
  );
  if (leadTimes.length === 0) {
    return [window.end.toMillis(), 0];
  }
  const meanLeadTime = mean(leadTimes);
  return [window.end.toMillis(), meanLeadTime];
};

export const getPairs = <T>(items: T[]): Array<T[]> => {
  return items.reduce((result: Array<T[]>, value, index, array) => {
    if (index === 0 && array.length === 1) {
      result.push([value]);
    }
    if (index > 0) {
      const prevValue = array[index - 1];
      const pair = [prevValue, value];
      result.push(pair);
    }
    return result;
  }, []);
};

export const getLeadTimes = async (
  start: Deployment,
  end?: Deployment
): Promise<number[]> => {
  const commits = await getCommitsBetweenRevisions(start, end);
  const releaseDate = end ? end.timeCreated : start.timeCreated;
  const leadTimeIntervals = commits.map((commit) =>
    Interval.fromDateTimes(commit.timeCreated, releaseDate)
  );
  return leadTimeIntervals.map((leadTimeInterval) =>
    leadTimeInterval.toDuration().as("milliseconds")
  );
};
