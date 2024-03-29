export const REPORT_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Accelerate Metrics for <%= projectName; %></title>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/histogram-bellcurve.js"></script>
    <script src="https://unpkg.com/mathjs@7.2.0/dist/math.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/humanize-duration/3.23.1/humanize-duration.min.js"></script>
    <style type="text/css">
        body {
            font-family: sans-serif;
        }

        h1 {
            text-align: center;
        }

        p {
            margin: 1em 2em;
            text-align: justify;
        }
    </style>
</head>
<body>
<h1>Accelerate Metrics for <%= projectName; %></h1>
<p>
    The <a href="https://www.devops-research.com/research.html">DevOps Research & Assessment program</a> (DORA),
    a part of Google Cloud,
    uses behavioral science to identify the most effective and efficient ways to develop and deliver software.
    Over the last six years, they have developed and validated metrics that provide a high-level systems
    view of software delivery and performance and predict an organization's ability to achieve its goals.
    This report presents the metrics for the <b><%= projectName; %> project</b>. For more details on the metrics
    and methodology, see the <a href="https://itrevolution.com/book/accelerate/">Accelerate book</a> and the
    <a href="https://cloud.google.com/devops/state-of-devops">latest DORA report</a>.
</p>
<div id="deploy-freq"></div>
<div id="lead-time"></div>
<div id="mttr"></div>
<div id="change-fail"></div>
<script type="application/javascript">
  const bandColorsWarm = ['rgba(255,255,212,0.5)', 'rgba(254,217,142, 0.5)', 'rgba(254,153,41, 0.5)', 'rgba(204,76,2, 0.5)'];
  const bandColorsCool = ['rgba(237,248,251,0.5)', 'rgba(179,205,227,0.5)', 'rgba(140,150,198,0.5)', 'rgba(136,65,157,0.5)'];
  const bandColors = bandColorsWarm;
</script>
<script type="application/javascript">
  const formatFreq = (freq) => {
    if (freq >= 277.8e-6) {
      return math.round((freq / 277.8) * 1e6, 1) + " per hour";
    }
    if (freq >= 11.57e-6) {
      return math.round((freq / 11.57) * 1e6, 1) + " per day";
    }
    if (freq >= 1.653e-6) {
      return math.round((freq / 1.653) * 1e6, 1) + " per week";
    }
    if (freq >= 385.8e-9) {
      return math.round((freq / 385.8) * 1e9, 1) + " per month";
    }
    if (freq >= 64.3e-9) {
      return math.round((freq / 64.3) * 1e9, 1) + " per 6 months";
    }
    if (freq >= 31.7e-9) {
      return math.round((freq / 31.7) * 1e9, 1) + " per year";
    }
    if (freq >= 3.171e-9) {
      return math.round((freq / 3.171) * 1e9, 1) + " per decade";
    }
    return freq;
  };

  Highcharts.chart("deploy-freq", {
    chart: {
      zoomType: "x",
    },
    title: {
      text: "Deploy Frequency",
    },
    subtitle: {
      verticalAlign: "bottom",
      html: true,
      text:
        document.ontouchstart === undefined
          ? "<i>(Click and drag in the plot area to zoom in)</i>"
          : "<i>(Pinch the chart to zoom in)</i>",
    },
    caption: {
      verticalAlign: "top",
      align: "center",
      style: { color: '#000000' },
      text: "How often does your organization deploy code to production or release it to end users?"
    },
    xAxis: {
      type: "datetime",
    },
    time: {
      useUTC: false
    },
    yAxis: [{
      type: "logarithmic",
      title: {
        text: "<%= windowSize; %>-day rolling average<br/>of deploy frequency",
        html: true
      },
      labels: {
        formatter: function() {
          return formatFreq(this.value);
        },
      },
      tickPositions: [
        31.7e-9,
        64.3e-9,
        385.8e-9,
        1.653e-6,
        11.57e-6,
        277.8e-6,
      ].map((v) => Math.log10(v)),
      plotBands: [
        {
          from: 31.7e-9,
          to: 385.8e-9,
          color: bandColors[3],
          label: {
            text: "Low"
          }
        },
        {
          from: 385.8e-9,
          to: 1.653e-6,
          color: bandColors[2],
          label: {
            text: "Medium"
          }
        },
        {
          from: 1.653e-6,
          to: 11.57e-6,
          color: bandColors[1],
          label: {
            text: "High"
          }
        },
        {
          from: 11.57e-6,
          to: 277.8e-6,
          color: bandColors[0],
          label: {
            text: "Elite"
          }
        }
      ],
    }, {
      title: {
        text: "Releases per Day",
      },
      opposite: true
    }
    ],
    series: [
      {
        type: "line",
        name: "Average Deploy Frequency",
        data: <%= deployFreqData; %>,
        marker: {
          enabled: false
        },
        tooltip: {
          pointFormatter: function() {
            return \`<span style="color:\${this.color}">●</span> \${
  this.series.name
}: <b>\${formatFreq(this.y)}</b><br/>\`;
          },
        }
      },
      {
        type: "histogram",
        name: "Releases per Day",
        xAxis: 0,
        yAxis: 1,
        baseSeries: 'releases',
        zIndex: -100,
        binWidth: 8.64e+7,
        tooltip: {
          pointFormatter: function() {
            return \`
  <span style="font-size:10px">\${Highcharts.dateFormat(
    "%A, %b %d, %Y",
    this.x
  )} to \${Highcharts.dateFormat("%A, %b %d, %Y", this.x2)}</span><br/>
  <span style="color:\${this.color}">\u25CF</span> <b>\${
  this.y
}</b> releases<br/>\`;
          },
        },
      },
      {
        data: <%= deploymentTimestamps; %>,
        id: 'releases',
        visible: false,
        showInLegend: false
      }
    ],
  });
</script>
<script>
  Highcharts.chart("lead-time", {
    chart: {
      zoomType: "x",
    },
    title: {
      text: "Lead Time",
    },
    subtitle: {
      verticalAlign: "bottom",
      html: true,
      text:
        document.ontouchstart === undefined
          ? "<i>(Click and drag in the plot area to zoom in)</i>"
          : "<i>(Pinch the chart to zoom in)</i>",
    },
    caption: {
      verticalAlign: "top",
      align: "center",
      style: { color: '#000000' },
      text: "What is your lead time for changes (i.e., how long does it take to go from code committed to code successfully running in production)?"
    },
    xAxis: {
      type: "datetime"
    },
    time: {
      useUTC: false
    },
    yAxis: {
      type: "logarithmic",
      title: {
        html: true,
        text: "<%= windowSize; %>-day rolling average<br/>of lead time",
      },
      labels: {
        formatter: function() {
          return humanizeDuration(this.value, { largest: 1, round: true });
        },
      },
      reversed: true,
      tickPositions: [
        3600000,
        86400000,
        604800000,
        2629800000,
        31557600000
      ].map((v) => Math.log10(v)),
      plotBands: [
        {
          from: 31557600000,
          to: 2629800000,
          color: bandColors[3],
          label: {
            text: "Low"
          }
        },
        {
          from: 2629800000,
          to: 604800000,
          color: bandColors[2],
          label: {
            text: "Medium"
          }
        },
        {
          from: 604800000,
          to: 86400000,
          color: bandColors[1],
          label: {
            text: "High"
          }
        },
        {
          from: 86400000,
          to: 3600000,
          color: bandColors[0],
          label: {
            text: "Elite"
          }
        }
      ]
    },
    tooltip: {
      pointFormatter: function() {
        return \`<span style="color:\${this.color}">●</span> \${
  this.series.name
}: <b>\${humanizeDuration(this.y, { largest: 2 })}</b><br/>\`;
      },
    },
    series: [
      {
        type: "line",
        name: "Average Lead Time",
        data: <%= leadTimeData; %>,
        marker: {
          enabled: false
        }
      }
    ],
  });
</script>
<script>
  Highcharts.chart("mttr", {
    chart: {
      zoomType: "x",
    },
    title: {
      text: "Mean Time to Restore Service (MTTR) -- Coming Soon",
    },
    subtitle: {
      verticalAlign: "bottom",
      html: true,
      text:
        document.ontouchstart === undefined
          ? "<i>(Click and drag in the plot area to zoom in)</i>"
          : "<i>(Pinch the chart to zoom in)</i>",
    },
    caption: {
      verticalAlign: "top",
      align: "center",
      style: { color: '#000000' },
      text: "How long does it generally take to restore service when a service incident or a defect that impacts users occurs (e.g., unplanned outage or service impairment)?"
    },
    xAxis: {
      type: "datetime"
    },
    time: {
      useUTC: false
    },
    yAxis: {
      type: "logarithmic",
      title: {
        html: true,
        text: "<%= windowSize; %>-day rolling average<br/>of mean time to restore service",
      },
      labels: {
        formatter: function() {
          return humanizeDuration(this.value, { largest: 1, round: true });
        },
      },
      reversed: true,
      tickPositions: [
        3600000,
        86400000,
        604800000,
        2629800000,
        31557600000
      ].map((v) => Math.log10(v))
    },
    tooltip: {
      pointFormatter: function() {
        return \`<span style="color:\${this.color}">●</span> \${
  this.series.name
}: <b>\${humanizeDuration(this.y, { largest: 2 })}</b><br/>\`;
      },
    },
    series: [],
  });
</script>
<script>
  Highcharts.chart("change-fail", {
    chart: {
      zoomType: "x",
    },
    title: {
      text: "Change Fail Rate -- Coming Soon",
    },
    subtitle: {
      verticalAlign: "bottom",
      html: true,
      text:
        document.ontouchstart === undefined
          ? "<i>(Click and drag in the plot area to zoom in)</i>"
          : "<i>(Pinch the chart to zoom in)</i>",
    },
    caption: {
      verticalAlign: "top",
      align: "center",
      style: { color: '#000000' },
      text: "What percentage of changes to production or released to users result in degraded service (e.g., lead to service impairment or service outage) and subsequently require remediation (e.g., require a hotfix, rollback, fix forward, patch)?"
    },
    xAxis: {
      type: "datetime"
    },
    time: {
      useUTC: false
    },
    yAxis: {
      title: {
        html: true,
        text: "<%= windowSize; %>-day rolling average<br/>of change-fail percentage",
      },
      labels: {
        format: '{value}%'
      },
      reversed: true
    },
    series: [],
  });
</script>
</body>
</html>
`;
