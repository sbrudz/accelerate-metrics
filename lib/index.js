export const hello = () => {
  return "World";
};

console.log("Hello World");

// call heroku api to get list of releases
// perform rolling window calculation
// start with the full period you want to report on
// split that into timepoints based on the desired windowInterval
// for each timepoint, look back by the amount of windowSize
// filter heroku releases by timepoint window interval

// calc deploy frequency:
// filter releases to get only code deploys
// map releases to get timestamps
// calculate deploy frequency for each window
