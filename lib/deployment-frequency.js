import { DateTime, Interval } from "luxon";

const sum = (items) => {
  return items.reduce((a, b) => a + b, 0);
};

export const averageFrequency = (timestamps) => {
  if (!timestamps || timestamps.length <= 1) {
    return 0;
  }
  const secondsBetweenTimestamps = timestamps
    .map((timestamp) => DateTime.fromISO(timestamp))
    .reduce((result, value, index, array) => {
      if (index > 0) {
        const prevValue = array[index - 1];
        const interval = Interval.fromDateTimes(prevValue, value);
        if (!interval.isValid) {
          throw new Error(interval.invalidExplanation);
        }
        result.push(interval);
      }
      return result;
    }, [])
    .map((interval) => interval.toDuration().as("seconds"));
  const averagePeriod =
    sum(secondsBetweenTimestamps) / secondsBetweenTimestamps.length;
  return 1 / averagePeriod; // frequency is the inverse of period
};
