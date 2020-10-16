google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(onLoadDrawChart);

function onLoadDrawChart() {
  // drawChart(initialStaticPrice);
  drawChart(initialStaticPrice);
}

function drawChart(staticPrice) {
  var data = new google.visualization.DataTable();
  data.addColumn('timeofday', 'Time');
  data.addColumn('number', 'Actual Revenue');
  data.addColumn('number', 'Revenue with Fixed Static Price');

  let rwsp = revenueWithStaticPrice(staticPrice);

  data.addRows(timestamps.map((ts, i) => [timeStringToTimeOfDay(ts), revenue[i], rwsp[i]]));

  var options = {
    title: 'Revenue (Dynamic Price vs Static Price, 5 minute intervals)',
    fontName: 'Raleway',
    hAxis: {
      title: 'Time',
      format: "h:mm a"
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('div_chart'));

  chart.draw(data, options);

  let totalBookedRevenueForToday = revenue.reduce((acc, cv) => acc + cv);
  let estimatedBookedRevenueForTodayWithStaticPrice = rwsp.reduce((acc, cv) => acc + cv);

  let estVsActualPercent = (estimatedBookedRevenueForTodayWithStaticPrice - totalBookedRevenueForToday) / totalBookedRevenueForToday;

  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  document.getElementById("currentPrice").innerHTML = `${formatter.format(staticPrice)}`;
  document.getElementById("totalBookedRevenueForToday").innerHTML = `${formatter.format(totalBookedRevenueForToday)}`;
  document.getElementById("estimatedBookedRevenueForTodayWithStaticPrice").innerHTML = `${formatter.format(estimatedBookedRevenueForTodayWithStaticPrice)}`;
  document.getElementById("estVsActualPercent").innerHTML = `(${(estVsActualPercent * 100).toFixed(2)}% vs actual)`;

  if (estVsActualPercent < 0) {
    document.getElementById("estimatedBookedRevenueForTodayWithStaticPrice").style.color = "red";
    document.getElementById("estVsActualPercent").style.color = "red";
  } else {
    document.getElementById("estimatedBookedRevenueForTodayWithStaticPrice").style.color = "green";
    document.getElementById("estVsActualPercent").style.color = "green";
  }
}

function timeStringToTimeOfDay(timeStr) {
  return timeStr.split(":").map(x => Number(x));
}
