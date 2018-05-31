/* jshint esversion: 6 */

//Business Logic
document.getElementById("test-class").innerHTML = "Paragraph changed from JS. <br> Hi Jim!";
$("#test-class").append("<br>Whaaaaazzzzuuuppp");
$("#test-class").append("<br>Nothin', just watching the code, having a Bud!");
let dayType = "upDay";  //will let me style things, add icons etc. based on last price either being > or < prev last price. Can you pass me this please :)  

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
		$(".panel-body").show();
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


// testing up day down day
  if (dayType === "downDay") {
    $("#panel-bias").removeClass("panel-default");
    $("#panel-bias").addClass("panel-danger"); //down day
  } else if (dayType === "upDay") {
    $("#panel-bias").removeClass("panel-default");
    $("#panel-bias").addClass("panel-success"); //up day
  } else {
    //unchanged
  }
});

// Mikes Code Below

const goldUrl = 'https://www.quandl.com/api/v3/datasets/LBMA/GOLD.json?api_key=3EbrKYZd4sKnYn7CT79Q&start_date=';
const silverUrl = 'https://www.quandl.com/api/v3/datasets/LBMA/SILVER.json?api_key=3EbrKYZd4sKnYn7CT79Q&start_date=';

class Bullion {
	constructor(name, priceData){
		this.name = name;   //Gold, Silver, etc
		this.priceData = priceData;	 // array of 90 days of bullion prices
	}

	get sma15Week(){
		return this.calcSma(75);   // 15wks = 75 days
	}

	get sma20Day(){
		return this.calcSma(20);
	}

	calcSma(days){
		// calulate sma's here
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
		console.log('Request succeeded with JSON response', data);
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
	console.table(bullion);
	document.getElementById('time-stamp').innerHTML = bullion.priceData[0][0];
	document.getElementById('description').innerHTML = bullion.name;
	document.getElementById('open-price').innerHTML = 'Open: $' + bullion.priceData[0][1];
	document.getElementById('close-price').innerHTML = 'Close: $' + bullion.priceData[0][2];
	//console.table(bullion.priceData);
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
