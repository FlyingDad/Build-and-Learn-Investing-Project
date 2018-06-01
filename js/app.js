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
  //check for valid input
  if (userInput !== "none") {
		$(".panel-body").slideDown();
		switch (userInput){
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
const goldUrl = 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_GC1.json?api_key3EbrKYZd4sKnYn7CT79&start_date='
const silverUrl = 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_SI1.json?api_key=3EbrKYZd4sKnYn7CT79Q&start_date=';

class Bullion {
	constructor(name, priceData){
		this.name = name;   //Gold, Silver, etc
		this.priceData = priceData;	 // array of 90 days of bullion prices
	}

	get sma5Day(){
		return this.calcSma(5);   // 5 days
	}

	get sma20Day(){
		return this.calcSma(20); // 20 days
	}

	get sma50Day(){
		return this.calcSma(50); // 20 days
	}

	calcSma(days){
		// calculate sma's here
		//get last 'days' closing
		let sum = 0;
		for(let i = 0; i < days; i++){
			sum += this.priceData[i][2]; // 2nd element in each day is closing price
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

function getData(url){
	return fetch(url)
  .then(status)
  .then(json)
  .then(function(data) {
		//console.log('Request succeeded with JSON response', data);
		console.table(data);
		return data;
  }).catch(function(error) {
    console.log('Request failed', error);
	});
}

//let gold = new Gold();
function getBullion(url) {
	return getData(url)
	.then(data => {
	// create new bullion instance and return
	let bullion = new Bullion(data.dataset.dataset_code, data.dataset.data);
	return bullion;
});
}

function getUserSlected(selected){
	getBullion(selected + getDateStamp())
	.then(bullion=>{
	//will send to HTML here
	//console.table(bullion);
	document.getElementById('time-stamp').innerHTML = bullion.priceData[0][0];
	document.getElementById('description').innerHTML = bullion.name;
	document.getElementById('open-price').innerHTML = `Open: $${bullion.priceData[0][1]}`;
	document.getElementById('close-price').innerHTML = `Close: $' ${bullion.priceData[0][2]}`;
	document.getElementById('sma-5day').innerHTML = `5 Day SMA: ${bullion.sma5Day.toFixed(2)}`;
	document.getElementById('sma-20day').innerHTML = `20 Day SMA: ${bullion.sma20Day.toFixed(2)}`;
	document.getElementById('sma-50day').innerHTML = `50 Day SMA: ${bullion.sma50Day.toFixed(2)}`;
	calculateSMABias(bullion);
	});
	
}

function getDateStamp(){
	let now = new Date();
	let previousDate = now.subtractDays(90);  //gets date 90 days ago
	let year = previousDate.getFullYear()
	let month = previousDate.getMonth();
	let day = previousDate.getDay();
	return `${year}-${month}-${day}`
}

function calculateSMABias(bullion){
	let sma5 = bullion.sma5Day;
	let sma20 = bullion.sma20Day;
	let sma50 = bullion.sma50Day;
	let last = bullion.priceData[0][1]; //last price, settle or close value using
	let priorLast = bullion.priceData[1][1]; // prior last or....
	$(".bias").append(`<p>Yest Close: ${last}</p>`)
	
	if (last > priorLast) {
		$("#panel-bias").removeClass("panel-default");
		$("#panel-bias").addClass("panel-success"); //up day

	} else if (last < priorLast){	
		$("#panel-bias").removeClass("panel-default");
    $("#panel-bias").addClass("panel-danger"); //down day
	} else {
		//unchanged
	}

	let bias = "";
	let mom1 = (sma5 - last).toFixed(2); 
	let mom2 = (sma20 - last).toFixed(2);
	let mom3 = (sma50 - last).toFixed(2);
	$(".bias").append(`<p>Mom 1 ${mom1}</p>`)
	$(".bias").append(`<p>Mom 2 ${mom2}</p>`)
	$(".bias").append(`<p>Mom 3 ${mom3}</p>`)
	
	if (mom1 >=0 && mom2 >=0 && mom3 >= 0) {
		bias = "BUY"
	} else if (mom1 <=0 && mom2 <=0 && mom3 <= 0) {
		bias = "SELL"
	} else {
		bias = "NONE"
	}
	$(".bias").append(`<p>Bias is: ${bias}</p>`)
}

