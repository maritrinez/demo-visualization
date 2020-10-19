google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
  var data1 = new google.visualization.DataTable();
  data1.addColumn('timeofday', 'Time');
  data1.addColumn('number', 'Unique Visitors (smoothed)');
  data1.addColumn({type: "string", role: "tooltip", p: {'html': true}});
  data1.addColumn('number', 'Unique Visitors (actual)');
  data1.addColumn({type: "string", role: "tooltip", p: {'html': true}});

  var smoothedVisitors = smoothDataWithWindow(rawData1.map(r => r[1]), 2).map(x => Math.floor(x));

  data1.addRows(rawData1.map((r, i) => [
    time_string_to_time_of_day(r[0]),
    smoothedVisitors[i],
    `<b>${milToCivTime(r[0])}</b><br>Unique Visitors: <b>${smoothedVisitors[i]}</b>`,
    r[1],
    `<b>${milToCivTime(r[0])}</b><br>Unique Visitors: <b>${smoothedVisitors[i]}</b>`
  ]));

  var options = {
    title: 'Unique Visitors (5 minute intervals)',
    fontName: 'Raleway',
    hAxis: {
      title: 'Time',
      format: "h:mm a"
    },
    series: {
      0: {
        targetAxisIndex: 1,
      },
      1: {
        targetAxisIndex: 0,
        color: "gray",
        lineDashStyle: [2, 4]
      }
    },
    tooltip: {
      isHtml: true
    }
  };

  var chart1 = new google.visualization.LineChart(document.getElementById('div_chart1'));

  chart1.draw(data1, options);

  var data2 = new google.visualization.DataTable();
  data2.addColumn('timeofday', 'Time');
  data2.addColumn('number', 'Conversion Rate');
  data2.addColumn({type: "string", role: "tooltip", p: {'html': true}});

  data2.addRows(rawData2.map(r => [
    time_string_to_time_of_day(r[0]),
    r[1] / 100,
    `<b>${milToCivTime(r[0])}</b><br>Conversion Rate: <b>${r[1]}%</b>`
  ]));

  var options = {
    title: 'Conversion Rate (5 minute intervals)',
    fontName: 'Raleway',
    hAxis: {
      title: 'Time',
      format: "h:mm a"
    },
    vAxis: {
      format: "percent"
    },
    tooltip: {
      isHtml: true
    }
  };

  var chart2 = new google.visualization.LineChart(document.getElementById('div_chart2'));

  chart2.draw(data2, options);
}

function time_string_to_time_of_day(time_str) {
  return (time_str + ":00").split(":").map(x => Number(x));
}

function milToCivTime(timeStr) {
  // convert military time (13:51) to civilian time (1:51 pm)
  let hour, minute, rest;

  [hour, minute, ...rest] = timeStr.split(":");

  return `${[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11][parseInt(hour) % 12]}:${minute} ${(parseInt(hour) < 12 ) ? "AM" : "PM"}`
}

function smoothDataWithWindow(data, windowSize) {
  var smoothedData = new Array(data.length);

  for (i = 0; i < windowSize; i++) {
    smoothedData[i] = data[i];
  }

  for (i = windowSize; i < data.length - windowSize; i++) {
    var sum = 0;

    for (j = -windowSize; j < (windowSize + 1); j++) {
      sum += data[i + j];
    }
    smoothedData[i] = sum / ((windowSize * 2) + 1);
  }

  for (i = (data.length - windowSize); i < data.length; i++) {
    smoothedData[i] = data[i];
  }

  return smoothedData;
}
