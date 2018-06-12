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
let alphavantageSMA = function (symbol, period) {
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
			//["2018-06-11", 123.1, 123.42, 123.0175, 123.2, 1672195]
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

			for (let i in dailyDataObj) {
				switch (period) {
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
			$("#sma-50day").append(`<br>20 Day VMA: ${bullion.calcVma(20).toFixed(0)}`) //add div?

			//document.getElementById('description').innerHTML = `${bullion.description}`;
			calculateSMABias();
		})
		.then(function () {
			getSma(selected, 20).then(function () {
			})
				.then(function () {
					getSma(selected, 50).then(function () {
					});
				}).then(function () {
					getSma(selected, 5).then(function () {
						chart();
					});
				})
		})
}

function calculateSMABias() {
	let sma5 = bullion.sma5Day;
	let sma20 = bullion.sma20Day;
	let sma50 = bullion.sma50Day;

	// let cOpen = bullion.priceData[0][1];
	// let cHigh = bullion.priceData[0][2];
	// let cLow = bullion.priceData[0][3];	
	// let cClose = bullion.priceData[0][4];
	// let cVolume = bullion.priceData[0][5];
	// let pOpen = bullion.priceData[1][1];
	// let pHigh = bullion.priceData[1][2];
	// let pLow = bullion.priceData[1][3];	
	// let pClose = bullion.priceData[1][4];
	// let pVolume = bullion.priceData[1][5];


	let last = bullion.priceData[1][4]; //last price, settle or close value using
	let priorLast = bullion.priceData[2][4]; // prior last or....
	let change = (bullion.priceData[0][4] - last);
	$("#c-change").html(`Change: $${change.toFixed(2)}`);

	if (change > 0) {
		$(".panel-bias").removeClass("panel-default");
		$(".panel-bias").removeClass("panel-danger");
		$(".panel-bias").addClass("panel-success"); //up day
		// $("ul#bias").append(`<li><h2>Todays Projected High: ${fibPredictedHigh.toFixed(2)}</h2></li>`);


	} else if (change < 0) {
		$(".panel-bias").removeClass("panel-default");
		$(".panel-bias").removeClass("panel-success");
		$(".panel-bias").addClass("panel-danger"); //down day
		// $("ul#bias").append(`<li><h2>Todays Projected Low: ${fibPredictedLow.toFixed(2)}</h2></li>`);

	} else {
		$(".panel-bias").removeClass("panel-success");
		$(".panel-bias").removeClass("panel-danger");
		$(".panel-bias").addClass("panel-default"); //unchanged
	}

	let bias = "";
	let mom1 = (last - sma5).toFixed(2);
	let mom2 = (last - sma20).toFixed(2);
	let mom3 = (last - sma50).toFixed(2);
	//floor traders pivot points for the current session
	let fPP = ((bullion.priceData[1][2] + bullion.priceData[1][3] + bullion.priceData[1][4]) / 3);
	let r1 = ((fPP * 2) - bullion.priceData[1][3]);
	let s1 = ((fPP * 2) - bullion.priceData[1][2]);
	let r2 = ((fPP - s1) + r1);
	let s2 = (fPP - (r1 - s1));
	// console.log(typeof (fPP));
	console.log(`PP ${fPP} r1 ${r1} s1 ${s1} r2 ${r2} s2 ${s2}`)
	// $("ul#bias").append(`<li>Mom 1: ${mom1}</li>`)
	// $("ul#bias").append(`<li>Mom 2: ${mom2}</li>`)
	// $("ul#bias").append(`<li>Mom 3: ${mom3}</li>`)
	// $("ul#bias").append(`<li>VMA 20: ${bullion.calcVma(20).toFixed(0)}</li>`)

	if (mom1 >= 0 && mom2 >= 0 && mom3 >= 0) {
		bias = `BULLISH FOR ${bullion.lastTimeStamp}`;
		biasText = `Secret Sauce is looking for price to advance higher.<br> Since it is an up day, look for price to potentially trade up to or through the 'Projected High' listed below.<br>Look for significant price action along with volume around the price of: ${fPP.toFixed(2)}<br>If price continues to go up, look for the next target area of ${r1.toFixed(2)} and then ${r2.toFixed(2)}<br>If price reverses and goes down, look for the next target area of ${s1.toFixed(2)} and then ${s2.toFixed(2)}`
	} else if (mom1 <= 0 && mom2 <= 0 && mom3 <= 0) {
		bias = `BEARISH FOR ${bullion.lastTimeStamp}`
		biasText = `Secret Sauce is looking for price to decline lower.<br> Since it is a down day, look for price to potentially trade down to or through the 'Projected Low' listed below.<br>Look for significant price action along with volume around the price of: ${fPP.toFixed(2)}<br>If price continues to go down, look for the next target area of ${s1.toFixed(2)} and then ${s2.toFixed(2)}<br>If price reverses and goes up, look for the next target area of ${r1.toFixed(2)} and then ${r2.toFixed(2)}`
	} else {
		bias = `NEUTRAL FOR ${bullion.lastTimeStamp}`
		biasText = `No clues right now, as both short and mid term indicators are in flux.<br> Price may advance towards the 'Predicted High or Predicted Low' listed below.<br>Look for significant price action along with volume around the price of: ${fPP.toFixed(2)}<br>If price goes up, look for the next target area of ${r1.toFixed(2)} and then ${r2.toFixed(2)}<br>If price goes, look for the next target area of ${s1.toFixed(2)} and then ${s2.toFixed(2)}`
	}
	$("ul#bias").append(`<li>Bias is: ${bias}</li><li>${biasText}</li>`);

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
	// //floor traders pivot points for the current session
	// let fPP = ((bullion.priceData[1][2] + bullion.priceData[1][3] + bullion.priceData[1][4]) / 3);
	// let r1 = ((fPP * 2) - bullion.priceData[1][3]);
	// let s1 = ((fPP * 2) - bullion.priceData[1][2]);
	// let r2 = ((fPP - s1) + r1);
	// console.log(typeof (fPP));
	// let s2 = (fPP - (r1 - s1));


	//predictions
	let fibPredictedHigh = ((((bullion.priceData[1][2] - bullion.priceData[1][3]) * 1.618) + (bullion.priceData[1][3])));
	let fibPredictedLow = ((bullion.priceData[1][2] - ((bullion.priceData[1][2] - bullion.priceData[1][3])) * 1.618));
	let atrPredictedHigh = 0;
	let atrPredictedLow = 0;
	let totHigh;
	let totLow;

	$("ul#bias").append(`<li><h2>Projected High >= ${fibPredictedHigh.toFixed(2)}</h2></li><li><h2>Projected Low <= ${fibPredictedLow.toFixed(2)}</h2></li>`);

	console.log();
}

function chart() {

	// reset the chart
	// https://stackoverflow.com/questions/24785713/chart-js-load-totally-new-data
	document.getElementById("myChart").remove();
	document.getElementById("chart-wrapper").innerHTML = '<canvas id="myChart" width="400" height="400"></canvas>';
	// get smadata 
	let sma20Data = bullion.sma20Data.slice(0, 100).reverse();
	let sma50Data = bullion.sma50Data.slice(0, 100).reverse();
	let sma5Data = bullion.sma5Data.slice(0, 100).reverse();

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

