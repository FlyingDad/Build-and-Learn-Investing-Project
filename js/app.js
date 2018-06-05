/* jshint esversion: 6 */

//Business Logic


// Gets date n days earlier
Date.prototype.subtractDays = function (n) {
	var time = this.getTime();
	var changedDate = new Date(time - (n * 24 * 60 * 60 * 1000));
	this.setTime(changedDate.getTime());
	return this;
};


//UI
$("form#selector").submit(function (event) {
	event.preventDefault();
	let userInput = $("select#user-input").val();
	console.log(userInput);
	$( "ul#bias" ).empty(); // to clear the ul
	//check for valid input
	if (userInput !== "none") {
		$(".panel-body").slideDown();
		switch (userInput) {
			case 'gold':
				getUserSlected(goldUrl);
				break;
			case 'silver':
				getUserSlected(silverUrl);
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

// const goldUrl = 'https://www.quandl.com/api/v3/datasets/LBMA/GOLD.json?api_key=3EbrKYZd4sKnYn7CT79Q&start_date=';
// const silverUrl = 'https://www.quandl.com/api/v3/datasets/LBMA/SILVER.json?api_key=3EbrKYZd4sKnYn7CT79Q&start_date=';
const goldUrl = 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_GC1.json?api_key=3EbrKYZd4sKnYn7CT79Q&start_date='
const silverUrl = 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_SI1.json?api_key=3EbrKYZd4sKnYn7CT79Q&start_date=';

class Bullion {
	constructor(name, description, priceData) {
		this.name = name;   //Gold, Silver, etc
		this.description = description; //get decription
		this.priceData = priceData;	 // array of 90 days of bullion prices
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
		for (let i = 0; i < days; i++) {
			sum += this.priceData[i][6]; // 6th element in each day is closing price
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
			console.table(data);
			return data;
		}).catch(function (error) {
			console.log('Request failed', error);
		});
}

//let gold = new Gold();
function getBullion(url) {
	return getData(url)
		.then(data => {
      // check for nulls in price data 
      let goodData = validateData(data.dataset.data);
			// create new bullion instance and return
			let bullion = new Bullion(data.dataset.name, data.dataset.description, goodData);
			return bullion;
		});
}

function validateData(data){
  // lat at open, high, low, last
  // if null, change to settle price
  data.forEach(day => {
    let settle = day[6];
    if(day[1] == null){
      day[1] = settle;
    }
    if(day[2] == null){
      day[2] = settle;
    }
    if(day[3] == null){
      day[3] = settle;
    }
    if(day[4] == null){
      day[4] = settle;
    }
  });
  return data;
}

function getUserSlected(selected) {
	getBullion(selected + getDateStamp())
		.then(bullion => {
			//will send to HTML here
			//console.table(bullion);
			//["Date","Open","High","Low","Last","Change","Settle","Volume","Previous Day Open Interest"]
			document.getElementById('time-stamp').innerHTML = `Date: ${bullion.priceData[0][0]}`;
			document.getElementById('name').innerHTML = ` ${bullion.name}`;
			document.getElementById('open-price').innerHTML = `Open: $${bullion.priceData[0][1]}`;
			document.getElementById('high-price').innerHTML = `High: $${bullion.priceData[0][2]}`;
			document.getElementById('low-price').innerHTML = `Low: $${bullion.priceData[0][3]}`;
			document.getElementById('close-price').innerHTML = `Close: $${bullion.priceData[0][6]}`;
			document.getElementById('sma-5day').innerHTML = `5 Day SMA: ${bullion.sma5Day.toFixed(2)}`;
			document.getElementById('sma-20day').innerHTML = `20 Day SMA: ${bullion.sma20Day.toFixed(2)}`;
			document.getElementById('sma-50day').innerHTML = `50 Day SMA: ${bullion.sma50Day.toFixed(2)}`;
			document.getElementById('description').innerHTML = `${bullion.description}`;
			calculateSMABias(bullion);
		});

}

function getDateStamp() {
	let now = new Date();
	let previousDate = now.subtractDays(90);  //gets date 90 days ago
	let year = previousDate.getFullYear()
	let month = previousDate.getMonth() + 1;
	let day =now.getDate();
	return `${year}-${month}-${day}`
}

function calculateSMABias(bullion) {
	let sma5 = bullion.sma5Day;
	let sma20 = bullion.sma20Day;
	let sma50 = bullion.sma50Day;
	let last = bullion.priceData[0][6]; //last price, settle or close value using
	let priorLast = bullion.priceData[1][6]; // prior last or....
	$("ul#bias").append(`<li>Settle Price: ${last}</li>`)
	$("ul#bias").append(`<li>Prior Settle Price: ${priorLast}</li>`)

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
	$("ul#bias").append(`<li>Mom 1 ${mom1}</li>`)
	$("ul#bias").append(`<li>Mom 2 ${mom2}</li>`)
	$("ul#bias").append(`<li>Mom 3 ${mom3}</li>`)
	$("ul#bias").append(`<li>MA 20 test: ${bullion.calcSma(20)}</li>`)

	if (mom1 >= 0 && mom2 >= 0 && mom3 >= 0) {
		bias = "BUY"
	} else if (mom1 <= 0 && mom2 <= 0 && mom3 <= 0) {
		bias = "SELL"
	} else {
		bias = "NONE"
	}
	$("ul#bias").append(`<li>Bias is: ${bias}</li>`)
}

