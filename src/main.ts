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
const projectStartDate = DateTime.utc(2020, 7, 10);
const windowParams = {
  reportStart: projectStartDate,
  reportEnd: DateTime.fromJSDate(new Date()).startOf("day"),
  windowIntervalSize: { days: 1 },
  windowDuration: { days: 14 },
};

async function generateReport() {
  const deployments = await getDeployments(appName, heroku);
  const windows = rollingWindows(windowParams);
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
