google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(onLoadDrawChart);

function onLoadDrawChart() {
  // drawChart(initialStaticPrice);
  drawChart(initialStaticPrice);
}

function drawChart(staticPrice) {
  var data = new google.visualization.DataTable();
  data.addColumn('timeofday', 'Time');
  data.addColumn('number', 'Revenue');
  data.addColumn('number', 'SP Revenue');

  data.addRows(timestamps.map((ts, i) => [timeStringToTimeOfDay(ts), revenue[i], revenueWithStaticPrice(staticPrice)[i]]));

  var options = {
    title: 'Revenue (Dynamic Price vs Static Price)',
    curveType: 'function'
  };

  var chart = new google.visualization.LineChart(document.getElementById('div_chart'));

  chart.draw(data, options);
}

function timeStringToTimeOfDay(timeStr) {
  return timeStr.split(":").map(x => Number(x));
}
