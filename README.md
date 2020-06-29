# accelerate-metrics
A tool to calculate Accelerate DevOps metrics using Heroku release data.

For the current report, download: https://cloud.google.com/devops/state-of-devops/

## Motivation

In 2019, [Red Gate Software](https://www.red-gate.com/), a UK-based DevOps software provider, released their [code](https://github.com/red-gate/RedGate.Metrics) for generating the four key metrics based on data in a git repository.  This release, along with their [overview](https://medium.com/ingeniouslysimple/forget-dumb-productivity-measures-focus-on-software-delivery-performance-with-the-four-key-3ad0e045e5b8) and [explanation](https://medium.com/ingeniouslysimple/learning-from-the-accelerate-four-key-metrics-91725675e30a) of how they use it, is a great service to the community, as it makes the automated calculation of metrics much easier and thus more likely to be used.  Their approach is tightly coupled to the use of annotated tags in git to mark releases.

For applications deployed to the Heroku platform, this coupling is less than ideal.  Heroku uses a "push to deploy" model and, as a result, most teams using Heroku do not create git tags for each release.  Heroku's [pipeline promotion feature](https://devcenter.heroku.com/articles/pipelines#promoting) further complicates the picture since a particular commit can be promoted from one environment stage in a pipeline to a downstream stage, so the time a commit is pushed to Heroku will not usually match the time when that commit is finally deployed to the production environment.  On the other hand, Heroku maintains a comprehensive history of release information, which can be used in place of annotated git tags.

The goal of this project is to provide an easy way to generate the four key metrics for a Heroku application using the Heroku API and a small amount of git history.

## The four key metrics from Accelerate

- **lead time**: "the time it takes to go from code committed to code successfully running in production"
- **deployment frequency**: how often code is deployed to production
- **mean time to restore**: how long it takes to restore service for the primary application when a service incident occurs
- **change fail percentage**: what percentage of changes for the primary application result in degraded service or subsequently require remediation

### Lead Time

The RedGate approach is as follows:

> Given a list of tagged releases:
> 
> * Get all new commits included in each release
> * Calculate the time between each commit and the time of release (the Delivery Lead Time of each individual commit)
> * Find the median one and treat it as the average Delivery Lead Time for that release
> * Present the mean average of all release Delivery Lead Times
>
> NB: This excludes merge commits, but otherwise includes all commits included in the release (including time those commits may have existed on branches, prior to being merged into the release branch).

Data required from Heroku:
* Release timestamp
* Release commit SHA

Data require from GitHub:
* Git history to determine which commits are included in the release and their timestamps.

Challenges: 
* If a branch was force pushed and the commit released to heroku was overwritten, then it becomes much more difficult to determine the lead time for that release

Questions:
* Why use the average delivery lead time for each release to calculate this metric?  As opposed to using the delivery lead time of each individual commit.

### Deployment Frequency

The RedGate approach is as follows:

> Given a list of tagged releases:
>  
> * Calculate the time period passed between releases being made
> * Present the mean average of those release intervals

Data required from Heroku:
* List of releases
* Release timestamps

No GitHub data is required for this metric.

### Change Fail Percentage

The RedGate approach is as follows:

> Given a list of tagged releases:
>
> * Present the percentage of releases that were followed by a "fix release" (see What is a "fix release"?, below)

RedGate's approach uses git annotated tags with a special format to note which releases are fix releases.

With Heroku, there's the opportunity to leverage their data instead of depending on manually entering tags. A fix release can be:
* A rollback to a previous release version.  The rollback indicates that there was a failure that needed to be corrected.
* A release with a status of failed, which indicates that there was an issue with the release.  It may or may not be visible to end users, but counts as a failed release.  Releases with a failed status often occur because a script run as part of the deploy process fails (e.g., a broken schema migration or data migration script)

No GitHub data is required for this metric.

### Mean Time to Restore (MTTR)

The RedGate approach is as follows:

> Given a list of tagged releases:
>
> * Identify the number of failed releases
> * For each failed release, calculate how long it was until a "fix release" was issued (the time to restore for each failure)
> * Present the mean of those times to restore

RedGate's approach relies on the same fix release tags noted above.

This project uses Heroku rollbacks and release statuses to calculate MTTR.
* For a rollback, the time to restore is the difference between the rollback timestamp and the timestamp of the release that was rolled back to
* For a release with a failed status, the time to restore is the difference between the next successful release timestamp and the timestamp of the release with the failed status.

No GitHub data is required for this metric.

### Other Considerations for Stability Metrics

The one murky area remaining related to stability is the release or situation that causes degraded stability for end-users but is fixed either by a new release (not a Heroku rollback) or a configuration change.  For example, the Redis AddOn runs out of space or connections and users are unable to log in until the service configuration has been manually updated.  This ties into the Availability metric referenced in the 2019 version of the DevOps Report.  Ideally, it would also add to MTTR metric.

The challenge is that "degraded service" will likely mean different things for different applications.  Monitoring services such as New Relic allow thresholds to be configured.  Heroku offers similar functionality for professional dynos but does not expose it via their public API.  This data could be used to inform the MTTR metric.  In the future, this project will look at integrating that availability and alerting data into the metrics.  For now, it is out of scope.
