import Heroku from "heroku-client";
import { DateTime } from "luxon";
import { rollingWindows } from "./rolling-window";
import { bestMeanFrequency, toHertz } from "./deployment-frequency";
import { getDeployments } from "./heroku-deployments";
import ejs from "ejs";
import fs from "fs/promises";

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
const appName = "resiliencehealth-prod";
const projectStartDate = DateTime.utc(2020, 6, 9);
getDeployments(appName, heroku)
  .then((deployments) => {
    const windows = rollingWindows({
      reportDate: DateTime.fromJSDate(new Date()).startOf("day"),
      reportOnDuration: { months: 3 },
      windowIntervalSize: { days: 3 },
      windowDuration: { days: 30 },
    });

    const stats = windows
      .filter(
        (window) => window.start.toMillis() >= projectStartDate.toMillis()
      )
      .map((window) => {
        const deploymentTimeStampsInWindow = deployments
          .filter((deploy) => window.contains(deploy.timeCreated))
          .map((deployInWindow) => deployInWindow.timeCreated);
        const meanFrequency = bestMeanFrequency(
          deploymentTimeStampsInWindow,
          window
        );
        return [window.end.toMillis(), toHertz(meanFrequency)];
      });
    return JSON.stringify(stats);
  })
  .then((stats) => {
    return ejs.renderFile(
      "./src/report.ejs",
      { projectName: appName, deployFreqData: stats },
      { async: true }
    );
  })
  .then((reportHtml) => {
    return fs.writeFile("./report.html", reportHtml, "utf8");
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

// take our window and find all releases in that window
// need to somehow transform that list into a frequency bucket
// problem is that the data will be unevenly distributed
// does it fit once per hour? once per day? once per month?
// could calculate #/month, #/day, and #/hour
