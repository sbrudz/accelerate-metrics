import * as core from "@actions/core";
import { DateTime } from "luxon";
import { generateReport } from "./report";

async function run(): Promise<void> {
  const appName = core.getInput("heroku_app_name");
  if (appName === undefined) {
    throw new Error("heroku_app_name must be defined.");
  }
  const reportFileName = "./report.html";

  const reportEndInput = core.getInput("report_end_date");
  const reportEnd = reportEndInput
    ? DateTime.fromISO(reportEndInput)
    : DateTime.fromJSDate(new Date()).endOf("day");

  const reportTimeframe = core.getInput("report_timeframe");
  const monthsBack = parseInt(reportTimeframe, 10);
  const reportStart = reportEnd.minus({ months: monthsBack });

  const reportParams = {
    herokuAppName: appName,
    reportFileName,
    reportStart,
    reportEnd,
    samplingFrequency: { days: 3 },
    sampleWindowSize: { days: 30 },
  };

  try {
    await generateReport(reportParams);
    core.debug(
      `New report generated successfully. Available at ${reportFileName}`
    );
    core.setOutput("report", reportFileName);
  } catch (error) {
    core.setFailed(error);
  }
}

run();
