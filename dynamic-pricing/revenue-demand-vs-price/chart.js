google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'Price');
  data.addColumn('number', 'Revenue');
  data.addColumn('number', 'Demand');

  data.addRows(staticPrice.map((x, i) => [x, revenue[i], conversionRate[i]]));

  var options = {
    title: 'Price and Revenue',
    curveType: "function",
    series: {
      0: {targetAxisIndex: 0},
      1: {targetAxisIndex: 1}
    },
    vAxes: {
      1: {
        viewWindow: {
          min: 1.5,
          max: 4
        }
      },
      0: {
        viewWindow: {
          min: 49000,
          max: 54000
        }
      }
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('div_chart'));

  chart.draw(data, options);
}
