//UI
let userInput = $("select#user-input").val();  //placed here so I can use it in the panel header as a title 
let bullion;

$("form#selector").submit(function (event) {
	event.preventDefault();
	userInput = $("select#user-input").val();  // deleted the let since it is now a global var
	// console.log(userInput);
	$("ul#bias").empty(); // to clear the ul
	$(".panel-body, .basic-data, .data-box, #chart-wrapper, #myChart").hide();
	//check for valid input
	if (userInput !== "none") {
		$(".panel-body, .basic-data, .data-box, #chart-wrapper, #myChart").slideDown();
		switch (userInput) {
			case 'gold':
				getUserSlected(alphaVantageGld);
				break;
			case 'silver':
				getUserSlected(alphaVantageSLV);
				break;
			default:
				console.log("user selection not defined");
				break;
		}
	} else {
		$(".panel-body").hide();
	}
});

// Mikes Code Below
const alphaVantageGld = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=gld&outputsize=compact&apikey=US1IZUWPMLEXWK4H'
const alphaVantageSLV = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=slv&outputsize=compact&apikey=US1IZUWPMLEXWK4H'
let alphavantageSMA = function (symbol, period){
  return `https://www.alphavantage.co/query?function=SMA&symbol=${symbol}&interval=daily&time_period=${period}&series_type=close&apikey=US1IZUWPMLEXWK4H`;
};

class Bullion {
	constructor(name, lastTimeStamp, description, priceData) {
		this.name = name;   //Gold, Silver, etc
		this.lastTimeStamp = lastTimeStamp;   //meta data ['3. Last Refreshed']
		this.description = description; //get decription
    this.priceData = priceData;	 // array of 90 days of bullion prices
    this.sma5Data = [];
    this.sma20Data = [];
    this.sma50Data = [];
	}

	get sma5Day() {
		return this.calcSma(5);   // 5 days
	}

	get sma20Day() {
		return this.calcSma(20); // 20 days
	}

	get sma50Day() {
		return this.calcSma(50); // 20 days
	}

	calcSma(days) {
		// calculate sma's here
		//get last 'days' closing
		let sum = 0;
		for (let i = 0; i < days; i++) {  			// NEED TO DOUBLE CHECK THIS changed i to = 1 but values off as to always use yesterdays data
			sum += this.priceData[i][4]; // 4th element in each day is closing price
		}
		return sum / days;
	}

	calcVma(days) {
		// calculate sma's here
		//get last 'days' closing
		let sum = 0;
		for (let i = 0; i < days; i++) {  			// NEED TO DOUBLE CHECK THIS changed i to = 1 as to always use yesterdays data
			sum += this.priceData[i][5]; // 5th element in each day is volume
		}
		return sum / days;
	}
}

function status(response) {
	if (response.status >= 200 && response.status < 300) {
		return Promise.resolve(response);
	} else {
		return Promise.reject(new Error(response.statusText));
	}
}

function json(response) {
	return response.json();
}

function getData(url) {
	return fetch(url)
		.then(status)
		.then(json)
		.then(function (data) {
			//console.log('Request succeeded with JSON response', data);
			//console.table(data);
			return data;
		}).catch(function (error) {
			console.log('Request failed', error);
		});
}

//let gold = new Gold();
function getBullion(url) {
	return getData(url)
		.then(data => {
			let name = data['Meta Data']['2. Symbol'];
			//added last timestamp for current day data display
			let lastTimeStamp = data['Meta Data']['3. Last Refreshed'];
			// dailyData is an object containing all daily data objects
			let dailyData = data['Time Series (Daily)'];
			// Make an array of dates for the data, we need these to extract
			// daily data from each day object in dailyData
			let dateKeys = Object.keys(dailyData);
			// dailyDataObjArray will be an array of daily dates
			let dailyDataObjArray = [];
			dateKeys.forEach(function (day) {
				dailyDataObjArray.push(dailyData[day]);
			});
			// Take each daily object and turn into array
			// get daily object keys, well get them from first object
			let dailyKeys = Object.keys(dailyDataObjArray[0]);
			//console.log(dailyKeys);
			let dailyDataArray = [];
			dailyDataObjArray.forEach(function (day) {
				let eachDayData = []
				dailyKeys.forEach(function (key) {
					eachDayData.push(Number(day[key]));
				});
				dailyDataArray.push(eachDayData);
			});

			// now lets put the date in the first element of each daily data array
			dailyDataArray.forEach(function (day, index) {
				//console.log(day);
				day.splice(0, 0, dateKeys[index]);
				//console.log(day);
			});
			// Convert all data to numbers, except date'

			// Daily data is now
			//["Date","Open","High","Low","close","volume"]
			bullion = new Bullion(name, lastTimeStamp, 'Test', dailyDataArray);
			return bullion;
		});
}

function getSma(commodity, period) {
  let url = alphavantageSMA(commodity, period);
	return getData(url)
		.then(data => {
      // get object that has array of daily objects
      let dailyDataObj = data['Technical Analysis: SMA'];

      for(let i in dailyDataObj){
        switch (period){
          case 5:
          bullion.sma5Data.push(dailyDataObj[i]['SMA']);
          break;
          case 20:
          bullion.sma20Data.push(dailyDataObj[i]['SMA']);
          break;
          case 50:
          bullion.sma50Data.push(dailyDataObj[i]['SMA']);
          default:
          break;
        }
        
      }
		});
}

function getUserSlected(selected) {
	getBullion(selected)
		.then(bullion => {
			console.log(bullion);
			//Alphavantage is real time so index of 0 will return current days info
			//changed first index to 1 as to always use yesterdays data. 
			//["Date","Open","High","Low","close","volume"]  
			document.getElementById('name').innerHTML = `${userInput.toUpperCase()} (${bullion.name.toUpperCase()})`;

			document.getElementById('c-time-stamp').innerHTML = `${bullion.lastTimeStamp}`;
			document.getElementById('c-open-price').innerHTML = `Open: $${bullion.priceData[0][1]}`;
			document.getElementById('c-high-price').innerHTML = `High: $${bullion.priceData[0][2]}`;
			document.getElementById('c-low-price').innerHTML = `Low: $${bullion.priceData[0][3]}`;
			document.getElementById('c-close-price').innerHTML = `Last Trade: $${(bullion.priceData[0][4]).toFixed(2)}`;
			document.getElementById('c-volume').innerHTML = `Volume: ${bullion.priceData[0][5]}`;

			document.getElementById('time-stamp').innerHTML = `Date: ${bullion.priceData[1][0]}`;
			document.getElementById('open-price').innerHTML = `Open: $${(bullion.priceData[1][1]).toFixed(2)}`;
			document.getElementById('high-price').innerHTML = `High: $${(bullion.priceData[1][2]).toFixed(2)}`;
			document.getElementById('low-price').innerHTML = `Low: $${(bullion.priceData[1][3]).toFixed(2)}`;
			document.getElementById('close-price').innerHTML = `Close: $${(bullion.priceData[1][4]).toFixed(2)}`;
			document.getElementById('volume').innerHTML = `Volume: ${bullion.priceData[1][5]}`;

			document.getElementById('sma-5day').innerHTML = `5 Day SMA: ${bullion.sma5Day.toFixed(2)}`;
			document.getElementById('sma-20day').innerHTML = `20 Day SMA: ${bullion.sma20Day.toFixed(2)}`;
			document.getElementById('sma-50day').innerHTML = `50 Day SMA: ${bullion.sma50Day.toFixed(2)}`;
			//document.getElementById('description').innerHTML = `${bullion.description}`;
			calculateSMABias();
    })
    .then(function(){
      getSma(selected, 20).then(function(){
      })
      .then(function(){
        getSma(selected, 50).then(function(){
        });
      }).then(function(){
        getSma(selected, 5).then(function(){
        chart();
        });
      })     
    })
  }

function calculateSMABias() {
	let sma5 = bullion.sma5Day;
	let sma20 = bullion.sma20Day;
	let sma50 = bullion.sma50Day;
	let last = bullion.priceData[1][4]; //last price, settle or close value using
	let priorLast = bullion.priceData[2][4]; // prior last or....
	let change = (bullion.priceData[0][4] - last);
	$("#c-change").html(`Change: $${change.toFixed(2)}`);

	if (last > priorLast) {
		$(".panel-bias").removeClass("panel-default");
		$(".panel-bias").removeClass("panel-danger");
		$(".panel-bias").addClass("panel-success"); //up day

	} else if (last < priorLast) {
		$(".panel-bias").removeClass("panel-default");
		$(".panel-bias").removeClass("panel-success");
		$(".panel-bias").addClass("panel-danger"); //down day
	} else {
		$(".panel-bias").removeClass("panel-success");
		$(".panel-bias").removeClass("panel-danger");
		$(".panel-bias").addClass("panel-default"); //unchanged
	}

	let bias = "";
	let mom1 = (sma5 - last).toFixed(2);
	let mom2 = (sma20 - last).toFixed(2);
	let mom3 = (sma50 - last).toFixed(2);
	$("ul#bias").append(`<li>Mom 1: ${mom1}</li>`)
	$("ul#bias").append(`<li>Mom 2: ${mom2}</li>`)
	$("ul#bias").append(`<li>Mom 3: ${mom3}</li>`)
	$("ul#bias").append(`<li>VMA 20: ${bullion.calcVma(20).toFixed(0)}</li>`)

	if (mom1 >= 0 && mom2 >= 0 && mom3 >= 0) {
		bias = "BUY"
	} else if (mom1 <= 0 && mom2 <= 0 && mom3 <= 0) {
		bias = "SELL"
	} else {
		bias = "NONE"
	}
	$("ul#bias").append(`<li>Bias is: ${bias}</li>`);

	let xDayDiff = [];
	let smallestDiff;
	let averageDiff;
	for (let i = 1; i < 8; i++) {
		let high = bullion.priceData[i][2];
		let low = bullion.priceData[i][3];
		xDayDiff.push(Math.abs(high - low));
		smallestDiff = Math.min(...xDayDiff);

		sumDiff = xDayDiff.reduce((previous, current) => current += previous);
		// console.log("sumDiff " + sumDiff)
		averageDiff = sumDiff / xDayDiff.length;
		// console.log("Avg TR " + averageDiff)
	}



	//look for narrowest range in the last 7 session
	let nr7 = 0;
	if (xDayDiff[1] <= smallestDiff) {
		nr7 = 1;
	}

	//look for inside day
	let insideDay = 0;
	if (bullion.priceData[1][2] <= bullion.priceData[2][2] && bullion.priceData[1][3] >= bullion.priceData[2][3]) {
		insideDay = 1;
	}

	// look for idNr7 combo
	if (nr7 != 0 && insideDay != 0) {
		// idNr7 = 1;
		$("ul#bias").append(`<li>Buy</li>`)
	}
	//floor traders pivot points for the current session
	let fPP = ((bullion.priceData[1][2] + bullion.priceData[1][3] + bullion.priceData[1][4]) / 3);
	let r1 = ((fPP * 2) - bullion.priceData[1][3]);
	let s1 = ((fPP * 2) - bullion.priceData[1][2]);
	let r2 = (fPP - s1) + r1;
	// console.log(typeof (fPP));
	let s2 = (fPP - (r1 - s1));
	// console.log(`PP ${fPP} r1 ${r1} s1 ${s1} r2 ${r2} s2 ${s2}`)

	let fibPredictedHigh = ((((bullion.priceData[1][2] - bullion.priceData[1][3]) * 1.272) + (bullion.priceData[1][3])));

	let fibPredictedLow = ((bullion.priceData[1][2] - ((bullion.priceData[1][2] - bullion.priceData[1][3])) * 1.272));
	console.log("fib High" + fibPredictedHigh + "fib low" + fibPredictedLow);
}

// // Gets date n days earlier
// Date.prototype.subtractDays = function (n) {
// 	var time = this.getTime();
// 	var changedDate = new Date(time - (n * 24 * 60 * 60 * 1000));
// 	this.setTime(changedDate.getTime());
// 	return this;
// };


// function getDateStamp() {
// 	let now = new Date();
// 	let previousDate = now.subtractDays(90);  //gets date 90 days ago
// 	let year = previousDate.getFullYear()
// 	let month = previousDate.getMonth() + 1;
// 	let day =now.getDate();
// 	return `${year}-${month}-${day}`
// }

// function validateData(data){
//   // lat at open, high, low, last
//   // if null, change to settle price
//   data.forEach(day => {
//     let settle = day[6];
//     if(day[1] == null){
//       day[1] = settle;
//     }
//     if(day[2] == null){
//       day[2] = settle;
//     }
//     if(day[3] == null){
//       day[3] = settle;
//     }
//     if(day[4] == null){
//       day[4] = settle;
//     }
//   });
//   return data;
// }



// const goldUrl = 'https://www.quandl.com/api/v3/datasets/LBMA/GOLD.json?api_key=3EbrKYZd4sKnYn7CT79Q&start_date=';
// const silverUrl = 'https://www.quandl.com/api/v3/datasets/LBMA/SILVER.json?api_key=3EbrKYZd4sKnYn7CT79Q&start_date=';
//const goldUrl = 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_GC1.json?api_key=3EbrKYZd4sKnYn7CT79Q&start_date='
//const silverUrl = 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_SI1.json?api_key=3EbrKYZd4sKnYn7CT79Q&start_date=';

function chart() {

  // reset the chart
  // https://stackoverflow.com/questions/24785713/chart-js-load-totally-new-data
  document.getElementById("myChart").remove();
  document.getElementById("chart-wrapper").innerHTML = '<canvas id="myChart" width="400" height="400"></canvas>';
  // get smadata 
  let sma20Data = bullion.sma20Data.slice(0,100).reverse();
  let sma50Data = bullion.sma50Data.slice(0,100).reverse();
  let sma5Data = bullion.sma5Data.slice(0,100).reverse();

	var ctx = document.getElementById("myChart");
	var last50 = [];
	var last50Dates = [];
	for (let i = 0; i < 100; i++) {
		last50.push(bullion.priceData[i][4]);
		last50Dates.push(bullion.priceData[i][0]);
	}
	last50.reverse();
	last50Dates.reverse();
	//console.log(last50);
	var myChart = new Chart(ctx, {
		type: 'line',
		data: {
      labels: last50Dates,
      
              datasets: [{
                label: 'Price',
                pointStyle: 'circle',
                radius: 0,
                data: last50,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.0)',
                ],
                borderColor: [
                  'rgba(4, 55, 137,1)',
                ],
                borderWidth: 3
              },
              {
                label: 'SMA20',
                pointStyle: 'circle',
                radius: 0,
                data: sma20Data,
                backgroundColor: [
                  'rgba(2,199, 1, 0.0)',
                ],
                borderColor: [
                  'rgba(2,199, 1,1)',
                ],
                borderWidth: 1
              },
              {
                label: 'SMA50',
                pointStyle: 'circle',
                radius: 0,
                data: sma50Data,
                backgroundColor: [
                  'rgba(100,1, 100, 0.0)',
                ],
                borderColor: [
                  'rgba(100,1, 100,1)',
                ],
                borderWidth: 1
              },
              {
                label: 'SMA5',
                pointStyle: 'circle',
                radius: 0,
                data: sma5Data,
                backgroundColor: [
                  'rgba(255,0, 0, 0.0)',
                ],
                borderColor: [
                  'rgba(255 ,0, 0, 1)',
                ],
                borderWidth: 1
              },

      ]

    },    
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: false
					}
				}]
			}
		}
	});
}


//this function manually calc the data before we decided to get it from URL
// function getSMAHistory(smaDays){
//   // smaDays is the sma average we want: ie: 20day
//   // get all closing prices
//   let smas = [];
  
//   let closingPrices = [];
//   bullion.priceData.forEach(data => closingPrices.push(data[4]));
  
//   // we can only get averages from pricedata length - the avaerage value
//   for(let i = 0; i < closingPrices.length - smaDays; i++){
//     // this loop calulates each average
//     let prices = []
//     for(let j = 0; j < smaDays; j++){
//       prices.push(closingPrices[i + j]);
//     }
//     //debugger
//     const sum = prices.reduce(function(total, num) {
//       return total + num;
//     });
//     smas.push(sum / smaDays);
//   }
//   // while(smas.length < closingPrices.length){
//   //   smas.push(0);
//   // }
//  // debugger;
//  // fill first values with null so data matches up
//  for(let i = 0; i < smaDays; i++){
//   smas.push(null);
// }
//   console.log(smas.reverse());
//   return smas;
// }
