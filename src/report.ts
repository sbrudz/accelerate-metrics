import { RollingWindowInputs, rollingWindows } from "./rolling-window";
import Heroku from "heroku-client";
import { getDeployments } from "./heroku-deployments";
import { calculateDeploymentFrequency } from "./deployment-frequency";
import { calculateAverageLeadTime } from "./lead-time";
import ejs from "ejs";
import { Duration, Interval } from "luxon";
import { promises as fs } from "fs";
import { REPORT_TEMPLATE } from "./report-template";

export interface ReportParams extends RollingWindowInputs {
  reportFileName: string;
  herokuAppName: string;
}

export async function generateReport(
  params: ReportParams,
  herokuClient: Heroku
): Promise<void> {
  const deployments = await getDeployments(params.herokuAppName, herokuClient);

  const reportPeriod = Interval.fromDateTimes(
    params.reportStart,
    params.reportEnd
  );
  const deploymentTimestamps = deployments
    .filter((d) => reportPeriod.contains(d.timeCreated))
    .map((d) => d.timeCreated.toMillis());

  const windows = rollingWindows(params);
  const deployFreqData = calculateDeploymentFrequency(deployments, windows);
  const leadTimeData = await calculateAverageLeadTime(deployments, windows);
  const reportHtml = await ejs.render(
    REPORT_TEMPLATE,
    {
      projectName: params.herokuAppName,
      windowSize: Duration.fromObject(params.sampleWindowSize).toFormat("d"),
      deployFreqData: JSON.stringify(deployFreqData),
      leadTimeData: JSON.stringify(leadTimeData),
      deploymentTimestamps: JSON.stringify(deploymentTimestamps),
    },
    { async: true }
  );
  await fs.writeFile(params.reportFileName, reportHtml, "utf8");
}
