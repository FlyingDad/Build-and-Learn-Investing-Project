// https://www.amcharts.com/kbase/your-first-stock-chart/
// {date: Mon Apr 06 2009 00:00:00 GMT-0500 (Central Daylight Time), value: 1998, volume: 30821941}

console.log(etfData);
var chartData = generateChartData();
  
function generateChartData() {
  var chartData = [];
  var firstDate = new Date( 2012, 0, 1 );
  firstDate.setDate( firstDate.getDate() - 1000 );
  firstDate.setHours( 0, 0, 0, 0 );

  //var a = 2000;
 
  for ( var i = 0; i < 100; i++ ) {
    //var newDate = new Date( firstDate );
    //newDate.setHours( 0, i, 0, 0 );
    var newDate = etfData['GLD'].dates[i];
    //a += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);
    var a = etfData['GLD'].close[i];
    //var b = Math.round( Math.random() * 100000000 );
    var b = etfData['GLD'].volume[i];
    chartData.push( {
      "date": newDate,
      "value": a,
      "volume": b
    } );
  }
  return chartData;
}

// original function
// var chartData = generateChartData();
  
// function generateChartData() {
//   var chartData = [];
//   var firstDate = new Date( 2012, 0, 1 );
//   firstDate.setDate( firstDate.getDate() - 1000 );
//   firstDate.setHours( 0, 0, 0, 0 );

//   var a = 2000;
 
//   for ( var i = 0; i < 1000; i++ ) {
//     var newDate = new Date( firstDate );
//     newDate.setHours( 0, i, 0, 0 );

//     a += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);
//     var b = Math.round( Math.random() * 100000000 );

//     chartData.push( {
//       "date": newDate,
//       "value": a,
//       "volume": b
//     } );
//   }
//   return chartData;
// }

var chart = AmCharts.makeChart( "chartdiv", {
  "type": "stock",
  "theme": "light",
  "categoryAxesSettings": {
    "minPeriod": "DD"
  },

  "dataSets": [ {
    "color": "#b0de09",
    "fieldMappings": [ {
      "fromField": "value",
      "toField": "value"
    }, {
      "fromField": "volume",
      "toField": "volume"
    } ],

    "dataProvider": chartData,
    "categoryField": "date"
  } ],

  "panels": [ {
    "showCategoryAxis": false,
    "title": "Value",
    "percentHeight": 70,

    "stockGraphs": [ {
      "id": "g1",
      "valueField": "value",
      "type": "smoothedLine",
      "lineThickness": 2,
      "bullet": "round"
    } ],


    "stockLegend": {
      "valueTextRegular": " ",
      "markerType": "none"
    }
  }, {
    "title": "Volume",
    "percentHeight": 30,
    "stockGraphs": [ {
      "valueField": "volume",
      "type": "column",
      "cornerRadiusTop": 2,
      "fillAlphas": 1
    } ],

    "stockLegend": {
      "valueTextRegular": " ",
      "markerType": "none"
    }
  } ],

  "chartScrollbarSettings": {
    "graph": "g1",
    "usePeriod": "10mm",
    "position": "top"
  },

  "chartCursorSettings": {
    "valueBalloonsEnabled": true
  },

  "periodSelector": {
    "position": "top",
    "dateFormat": "MM/DD/YYYY",
    "inputFieldWidth": 100,
     "periods": [ {
    //   "period": "hh",
    //   "count": 1,
    //   "label": "1 hour"
    // }, {
    //   "period": "hh",
    //   "count": 2,
    //   "label": "2 hours"
    // }, {
    //   "period": "hh",
    //   "count": 5,
    //   "selected": true,
    //   "label": "5 hour"
    // }, {
      "period": "DD",
      "count": 30,
      "label": "30 days"
    }, {
      "period": "MAX",
      "label": "MAX"
    } ]
  },

  "panelsSettings": {
    "usePrefixes": true
  },

  "export": {
    "enabled": true,
    "position": "bottom-right"
  }
} );