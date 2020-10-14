google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(initialDrawChart);

function initialDrawChart() {
  drawChart(initialSelectedPrice);
}

function eventHandler(e) {
  updateNumbers(staticPrice[e.row]);
}

function updateNumbers(selectedPrice) {
  let row = staticPrice.findIndex(x => x === selectedPrice);

  var currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  var projectedRevenue = revenue[row] - 100;
  var unrealizedRevenue = revenue[row] - projectedRevenue;

  document.getElementById('selectedRentalPrice').innerHTML = `${currencyFormatter.format(staticPrice[row])}`;
  document.getElementById('demandAtThatPrice').innerHTML = `${conversionRate[row]}`;
  document.getElementById('projectedRevenue').innerHTML = `${currencyFormatter.format(projectedRevenue)}`;
  document.getElementById('unrealizedRevenue').innerHTML = `${unrealizedRevenue}`
}

function drawChart(selectedPrice) {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'Price');
  data.addColumn({type: 'string', role: 'annotation'});
  data.addColumn('number', 'Revenue');
  data.addColumn({type: "string", role: "tooltip", p: {'html': true}});
  data.addColumn('number', 'Conversion Rate Percentage');
  data.addColumn({type: "string", role: "tooltip", p: {'html': true}});

  data.addRows(staticPrice.map((x, i) =>
    [x,
     x == 99.5 ? " " : null,
     revenue[i],
     `Price: <b>$${staticPrice[i]}</b><br>Revenue: <b>$${revenue[i]}</b><br>Conversion Rate: <b>${conversionRate[i]}%</b>`,
     conversionRate[i] / 100,
     `Price: <b>$${staticPrice[i]}</b><br>Revenue: <b>$${revenue[i]}</b><br>Conversion Rate: <b>${conversionRate[i]}%</b>`
    ]));

  var options = {
    title: 'Revenue and Conversion Rate Percentage',
    series: {
      0: {targetAxisIndex: 0},
      1: {targetAxisIndex: 1}
    },
    vAxes: {
      0: {
        viewWindow: {
          min: 49000,
          max: 54000
        },
        format: "currency"
      },
      1: {
        viewWindow: {
          min: 0.015,
          max: 0.04
        },
        format: "percent"
      }
    },
    tooltip: {
      isHtml: true
    },
    annotations: {
      style: 'line',
      stem: {
        color: 'red'
      },
    },
    hAxis: {
      ticks: [{v: 95, f: '$95'},
              {v: 99.5, f: '$99.50\n(Optimal)'},
              {v: 105, f: '$105'}]
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('div_chart'));

  chart.draw(data, options);

  google.visualization.events.addListener(chart, 'onmouseover', eventHandler)

  updateNumbers(selectedPrice);
}
