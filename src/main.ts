import { DateTime } from "luxon";
import { generateReport } from "./report";

const appName = process.env.HEROKU_APP_NAME;
if (appName === undefined) {
  throw new Error("HEROKU_APP_NAME environment variable must be defined.");
}
const reportFileName = "./report.html";

const reportEndEnvStr = process.env.REPORT_END_DATE;
const reportEnd = reportEndEnvStr
  ? DateTime.fromISO(reportEndEnvStr)
  : DateTime.fromJSDate(new Date()).startOf("day");

const reportStartEnvStr = process.env.REPORT_START_DATE;
const reportStart = reportStartEnvStr
  ? DateTime.fromISO(reportStartEnvStr)
  : reportEnd.minus({ months: 3 });

const reportParams = {
  herokuAppName: appName,
  reportFileName,
  reportStart,
  reportEnd,
  samplingFrequency: { days: 3 },
  windowDuration: { days: 30 },
};

try {
  generateReport(reportParams).then((params) => {
    console.log(`New report generated. Available at ${params.reportFileName}`);
  });
} catch (e) {
  console.error(e);
}
