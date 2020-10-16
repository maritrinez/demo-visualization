google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
  var data1 = new google.visualization.DataTable();
  data1.addColumn('timeofday', 'Time');
  data1.addColumn('number', 'Unique Visitors');
  data1.addColumn({type: "string", role: "tooltip", p: {'html': true}});

  data1.addRows(rawData1.map(r => [
    time_string_to_time_of_day(r[0]),
    r[1],
    `<b>${milToCivTime(r[0])}</b><br>Unique Visitors: <b>${r[1]}</b>`
  ]));

  var options = {
    title: 'Unique Visitors (5 minute intervals)',
    fontName: 'Raleway',
    hAxis: {
      title: 'Time',
      format: "h:mm a"
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
    r[1],
    `<b>${milToCivTime(r[0])}</b><br>Conversion Rate: <b>${r[1]}%</b>`
  ]));

  var options = {
    title: 'Conversion Rate Percentage (5 minute intervals)',
    fontName: 'Raleway',
    hAxis: {
      title: 'Time',
      format: "h:mm a"
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
