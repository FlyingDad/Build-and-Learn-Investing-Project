// ETF Object
  // name
    // open
    // high
    // low
    // close
    // volume
    // sma(5)
    // sma(20)
    // MTbeta2(1.272,1,"HL/2")
    // rsi(2)
    // rsi(21)
    // Sharpe(close,21)
    // roc(21)


function parseJSON(etfJSON){
  // Key etf names (keys)
  let etfNames = Object.keys(etfJSON);
  console.log(etfNames);
  // example of how to get array of open prices
  let openArray = etfJSON[etfNames[0]].open;
  console.log(openArray);
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

fetchJSON('./data/new_data.json');