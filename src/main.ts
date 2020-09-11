import Heroku from "heroku-client";
import { DateTime, Duration } from "luxon";
import { calculateDeploymentFrequency } from "./deployment-frequency";
import { getDeployments } from "./heroku-deployments";
import ejs from "ejs";
import fs from "fs/promises";
import { rollingWindows } from "./rolling-window";
import { calculateAverageLeadTime } from "./lead-time";

const heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN });
const appName = "resiliencehealth-prod";
const reportFileName = "./report.html";
const projectStartDate = DateTime.utc(2020, 6, 9);
const windowParams = {
  reportDate: DateTime.fromJSDate(new Date()).startOf("day"),
  reportOnDuration: { months: 3 },
  windowIntervalSize: { days: 3 },
  windowDuration: { days: 30 },
};

async function generateReport() {
  const deployments = await getDeployments(appName, heroku);
  const windows = rollingWindows(windowParams).filter(
    (window) => window.start.toMillis() >= projectStartDate.toMillis()
  );
  const deployFreqData = calculateDeploymentFrequency(deployments, windows);
  const leadTimeData = await calculateAverageLeadTime(deployments, windows);
  const reportHtml = await ejs.renderFile(
    "./src/report.ejs",
    {
      projectName: appName,
      windowSize: Duration.fromObject(windowParams.windowDuration).toFormat(
        "d"
      ),
      deployFreqData: JSON.stringify(deployFreqData),
      leadTimeData: JSON.stringify(leadTimeData),
    },
    { async: true }
  );
  await fs.writeFile(reportFileName, reportHtml, "utf8");
}

generateReport().then(() => {
  console.log("New report generated. Available at ./report.html");
});

// calc lead time is similar:
// filter releases to get only code deploys
// filter code deploys to get only deploys that are in the window interval
// for each code deploy, get all non-merge commits
// create an interval for each non-merge commit that ends with the deploy timestamp
// calculate the average duration for all the intervals == average lead time for window
