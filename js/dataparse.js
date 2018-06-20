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

// DBC,1/19/2018,16.88,16.925,16.82,16.88,1306181,16.912,16.665,16.7749032,25.360730614867,65.8064696080575,26.1770173661359,6.09679446888749


// https://developers.google.com/web/ilt/pwa/working-with-the-fetch-api

// this will hold each etf's data (1 objects for each etf)
let etfData = {};

function readResponseAsText(response) {
  return response.text();
}

function parseText(responseAsText) {
  // get each line of data
  var data = responseAsText.split('\n');
  // split each line by commas and put into array
  let rowsArray = [];
  data.forEach(element => {
      rowsArray.push(element.split(','));
  });
  console.log(rowsArray[0])
  // extract etf names
  let etfNames = [];
  rowsArray.forEach(row => {
    if(!etfNames.includes(row[0]) && row[0] != ''){
      etfNames.push(row[0]);
    }
  })
  //console.log(etfNames);

  etfNames.forEach(name => {
    let etf = { 
      name: name,
      dates: [],
      open: [],
      high: [],
      low: [],
      close: [],
      volume: [],
      sma5: [],
      sma20: [],
      MTbeta2: [],
      rsi2: [],
      rsi21: [],
      Sharpe21: [],
      roc21: [],
      
    };
    rowsArray.forEach(row => {
      let dates = [];
      let open = [];
      let high = [];
      let low = [];
      let close = [];
      let volume = [];
      let sma5 = [];
      let sma20 = [];
      let MTbeta2 = [];
      let rsi2 = [];
      let rsi21 = [];
      let Sharpe21 = [];
      let roc21 = [];

      if(row[0] === name){
        etf.dates.push(row[1]);
        etf.open.push(row[2]);
        etf.high.push(row[3]);
        etf.low.push(row[4]);
        etf.close.push(row[5]);
        etf.volume.push(row[6]);
        etf.sma5.push(row[7]);
        etf.sma20.push(row[8]);
        etf.MTbeta2.push(row[9]);
        etf.rsi2.push(row[10]);
        etf.rsi21.push(row[11]);
        etf.Sharpe21.push(row[12]);
        etf.roc21.push(row[13]);
      }
      
    })
    etfData[name] = etf;
  })
  //console.table(etfData[0]);
  // convert to JSON
  let etfJSON = JSON(etfData);
  //write new file
  var blob = new Blob([etfJSON], {type: "text/plain;charset=utf-8"});anchor = document.createElement('a');

  anchor.download = "hello.json";
  anchor.href = (window.URL).createObjectURL(blob);
  anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');

  //uncomment to get file (download through browser)
  anchor.click();
}//end of parseText()

function fetchText(pathToResource) {
  fetch(pathToResource)
    //.then(validateResponse)
    .then(readResponseAsText)
    .then(parseText)
    .catch();
}

fetchText('./data/new_data.txt');
