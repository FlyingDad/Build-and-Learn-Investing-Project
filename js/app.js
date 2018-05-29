
//Business Logic
document.getElementById("test-class").innerHTML = "Paragraph changed from JS. <br> Hi Jim!";
$("#test-class").append("<br>Whaaaaazzzzuuuppp");
let dayType = "upDay";  //will let me style things, add icons etc. based on last price either being > or < prev last price. Can you pass me this please :)  


//UI
$("form#selector").submit(function (event) {
  event.preventDefault();
  let userInput = $("select#user-input").val();
  
  //check for valid input
  if (userInput !== "none") {
    $(".panel-body").show();
  } else {
    $(".panel-body").hide();
  }


// testing up day down day
  if (dayType === "downDay") {
    $("#panel-bias").removeClass("panel-default")
    $("#panel-bias").addClass("panel-danger") //down day
  } else if (dayType === "upDay") {
    $("#panel-bias").removeClass("panel-default")
    $("#panel-bias").addClass("panel-success") //up day
  } else {
    //unchanged
  }
});

/* jshint esversion: 6 */

document.getElementById("test-class").innerHTML = "Paragraph changed from JS. <br> Hi Jim!";

const goldUrl = 'https://www.quandl.com/api/v3/datasets/LBMA/GOLD.json?api_key=3EbrKYZd4sKnYn7CT79Q&start_date=2018-03-21';
const silverUrl = 'https://www.quandl.com/api/v3/datasets/LBMA/SILVER.json?api_key=3EbrKYZd4sKnYn7CT79Q&start_date=2018-05-20';

class Bullion {
	constructor(name, closing){
		this.name = name;
		this.closing = closing;
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
		//console.table(data);
		return data;
  }).catch(function(error) {
    console.log('Request failed', error);
	});
}

//let gold = new Gold();
function getBullion(url) {
	return getData(url)
	.then(data => {
	let bullion = new Bullion(data.dataset.dataset_code, data.dataset.data[0][1] );
	// console.log(data.dataset);
	// console.log(data.dataset.dataset_code);  // Buiiion name
	// console.log(data.dataset.data[0][1]); // closing price 
	return bullion;
});
}

(getBullion(goldUrl))
.then(b=>{
	//will send to HTML here
	console.table(b);
})
.then(getBullion(silverUrl)
.then(s=>{
	//will send to HTML here
	console.table(s);
}));
