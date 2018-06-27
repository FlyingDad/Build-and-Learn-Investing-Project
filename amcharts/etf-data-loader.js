// jshint esversion: 6
// ETF Object
// name: name,
//       dates: [],
//       open: [],
//       high: [],
//       low: [],
//       close: [],
//       volume: [],
//       sma5: [],
//       sma20: [],
//       MTbeta2: [],
//       rsi2: [],
//       rsi21: [],
//       Sharpe21: [],
//       roc21: [],
let etfData;

function parseJSON(etfJSON){
  // set global var
  etfData = etfJSON;
  // Key etf names (keys)
  
  let etfNames = Object.keys(etfJSON);

  etfNames.forEach(name => {
    etfJSON[name].open = etfJSON[name].open.map(e=>parseFloat(e)).reverse();
    etfJSON[name].high = etfJSON[name].high.map(e=>parseFloat(e)).reverse();
    etfJSON[name].low = etfJSON[name].low.map(e=>parseFloat(e)).reverse();
    etfJSON[name].close = etfJSON[name].close.map(e=>parseFloat(e)).reverse();
    etfJSON[name].volume = etfJSON[name].volume.map(e=>parseFloat(e)).reverse();
    etfJSON[name].sma5 = etfJSON[name].sma5.map(e=>parseFloat(e)).reverse();
    etfJSON[name].sma20 = etfJSON[name].sma20.map(e=>parseFloat(e)).reverse();
    etfJSON[name].MTbeta2 = etfJSON[name].MTbeta2.map(e=>parseFloat(e)).reverse();
    etfJSON[name].rsi2 = etfJSON[name].rsi2.map(e=>parseFloat(e)).reverse();
    etfJSON[name].rsi21 = etfJSON[name].rsi21.map(e=>parseFloat(e)).reverse();
    etfJSON[name].Sharpe21 = etfJSON[name].Sharpe21.map(e=>parseFloat(e)).reverse();
    etfJSON[name].roc21 = etfJSON[name].roc21.map(e=>parseFloat(e)).reverse();
  });
  
}


function readResponseAsText(response) {
  return response.json();
}

function fetchJSON(pathToResource) {
  fetch(pathToResource)
    .then(readResponseAsText)
    .then(parseJSON)
    .catch();
}

fetchJSON('new_data.json');