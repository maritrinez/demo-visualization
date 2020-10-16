google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(onLoadDrawChart);

function onLoadDrawChart() {
  // drawChart(initialStaticPrice);
  drawChart(initialStaticPrice);
}

var currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});


function drawChart(staticPrice) {
  var data = new google.visualization.DataTable();
  data.addColumn('timeofday', 'Time');
  data.addColumn('number', 'Actual Revenue');
  data.addColumn({type: "string", role: "tooltip", p: {'html': true}});
  data.addColumn('number', 'Revenue with Fixed Static Price');
  data.addColumn({type: "string", role: "tooltip", p: {'html': true}});

  let rwsp = revenueWithStaticPrice(staticPrice);

  data.addRows(timestamps.map((ts, i) => [
    timeStringToTimeOfDay(ts),
    revenue[i],
    `<b>${milToCivTime(ts)}</b><br>Actual Revenue: <b>${currencyFormatter.format(revenue[i])}</b>`,
    rwsp[i],
    `<b>${milToCivTime(ts)}</b><br>Revenue with Fixed Static Price: <b>${currencyFormatter.format(rwsp[i])}</b>`,
  ]));

  var options = {
    title: 'Revenue (Dynamic Price vs Static Price, 5 minute intervals)',
    fontName: 'Raleway',
    tooltip: {
      isHtml: true
    },
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

  document.getElementById("currentPrice").innerHTML = `${currencyFormatter.format(staticPrice)}`;
  document.getElementById("totalBookedRevenueForToday").innerHTML = `${currencyFormatter.format(totalBookedRevenueForToday)}`;
  document.getElementById("estimatedBookedRevenueForTodayWithStaticPrice").innerHTML = `${currencyFormatter.format(estimatedBookedRevenueForTodayWithStaticPrice)}`;
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

function milToCivTime(timeStr) {
  // convert military time (13:51) to civilian time (1:51 pm)
  let hour, minute, rest;

  [hour, minute, ...rest] = timeStr.split(":");

  return `${[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11][parseInt(hour) % 12]}:${minute} ${(parseInt(hour) < 12 ) ? "AM" : "PM"}`
}
