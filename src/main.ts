import Heroku from "heroku-client";

const { DateTime } = require("luxon");
import { rollingWindows } from "./rolling-window";
import { averageFrequency } from "./deployment-frequency";
import { HerokuPlatformApiRelease } from "@heroku-cli/typescript-api-schema";

const heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN });

export const hello = () => {
  return "World";
};

// call heroku api to get list of releases
// perform rolling window calculation
// start with the full period you want to report on
// split that into timepoints based on the desired windowInterval
// for each timepoint, look back by the amount of windowSize, creating one window interval per timepoint
// filter heroku releases by timepoint window interval
const appName = "resiliencehealth-dev";
heroku.get<HerokuPlatformApiRelease[]>(`/apps/${appName}/releases`).then((releases) => {
  const windows = rollingWindows({
    reportDate: DateTime.fromJSDate(new Date()),
    reportOnDuration: { months: 1 },
    windowIntervalSize: { days: 7 },
    windowDuration: { days: 30 }
  });
  const stats = windows.map((window) => {
    const releaseTimestamps = releases
      .filter(release => /^Deploy/.test(release.description || ""))
      .map(release => DateTime.fromISO(release.created_at));
    const releasesInWindow = releaseTimestamps.filter(release => window.contains(release));
    const averageFrequencyCalc = averageFrequency(releasesInWindow);
    // return {
    //   timePoint: window.end.toISODate(),
    //   averageFrequency: averageFrequencyCalc
    // };
    return [window.end.toMillis(), averageFrequencyCalc * 1e5]
  });
  console.log(stats);
});
// calc deploy frequency:
// filter releases to get only code deploys
// create an interval for each pair of code deploys
// find release intervals that overlap the window interval
// calculate the average duration for the matching release intervals to find the period
// take the inverse of the period to get the frequency

// calc lead time is similar:
// filter releases to get only code deploys
// filter code deploys to get only deploys that are in the window interval
// for each code deploy, get all non-merge commits
// create an interval for each non-merge commit that ends with the deploy timestamp
// calculate the average duration for all the intervals == average lead time for window

// but maybe instead of the average / arithmetic mean, we want the median
