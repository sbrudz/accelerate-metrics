import { RollingWindowInputs, rollingWindows } from "./rolling-window";
import Heroku from "heroku-client";
import { getDeployments } from "./heroku-deployments";
import { calculateDeploymentFrequency } from "./deployment-frequency";
import { calculateAverageLeadTime } from "./lead-time";
import ejs from "ejs";
import { Duration } from "luxon";
import fs from "fs/promises";

export interface ReportParams extends RollingWindowInputs {
  reportFileName: string;
  herokuAppName: string;
}

export async function generateReport(params: ReportParams) {
  const heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN });
  const deployments = await getDeployments(params.herokuAppName, heroku);
  const windows = rollingWindows(params);
  const deployFreqData = calculateDeploymentFrequency(deployments, windows);
  const leadTimeData = await calculateAverageLeadTime(deployments, windows);
  const reportHtml = await ejs.renderFile(
    "./src/report.ejs",
    {
      projectName: params.herokuAppName,
      windowSize: Duration.fromObject(params.sampleWindowSize).toFormat("d"),
      deployFreqData: JSON.stringify(deployFreqData),
      leadTimeData: JSON.stringify(leadTimeData),
    },
    { async: true }
  );
  await fs.writeFile(params.reportFileName, reportHtml, "utf8");
  return params;
}
