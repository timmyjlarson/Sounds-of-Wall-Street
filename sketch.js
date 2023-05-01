/**
 * Ideas: access several stocks from an api, user can specifiy which ones they want to hear
 * each stock can relate to a different range of notes, custimiziable colors
 * stock lines are green when trending up and red when trending down, just for those segmenats
 * 
 * use dat gui for user controls
 * 
 * interface with excel spreadsheet
 */
let waveform = ["sine", "sawtooth", "triangle", "square"];
let diatonic = [/*27.50,30.87,32.70,36.71,41.20,43.65,49.00,55.00,61.74,65.41,73.42,82.41,87.31,98.00,110.00,*/
    123.47,130.81,146.83,164.81,174.61,196.00,220.00,246.94,261.63,293.66,329.63,349.23,392.00,440.00,493.88,
    523.25,587.33,659.25,698.46,783.99,880.00,987.77,1046.50];
let bpm = 140;
let playing, reverb;

let stocks = [];
let stockData = [[],[]];
let stockCenter = [];
let stockWidth, stockHeight;
let title = 'sounds of wallstreet';
let layout = {      //include more for ui
    numStocks: 4, //turn this into an int
    title: 'sounds of wallstreet',
    accentColor: [245, 238, 42],
    backgroundColor: [128, 128, 128],
    frameRate: 7
}
let tickers = ['GME', 'AMC', 'GOOGL', 'AAPL']; //currently hardcoded, may be able to fix?
let gui = new dat.GUI();
gui.add(layout, 'numStocks', 1, 6);
gui.add(layout, 'title');
gui.add(layout, 'frameRate');
gui.addColor(layout, 'accentColor');
gui.addColor(layout, 'backgroundColor');

//things that happen before the page can render, include file reading for stock data here
function preload(){
    soundFormats('wav');
    airhorn = loadSound('sounds/airhorn');
    flush = loadSound('sounds/flush');
    woo = loadSound('sounds/woo');
    kick = loadSound('sounds/technoKick');
    trumpet = loadSound('sounds/trumpet');
    sevenSegment = loadFont('fonts/Seven Segment.ttf');
    stockData = loadTable('stocks/stockData.csv', 'csv', 'header'); //read in the whole sheet
    //tickers = stockData.getRow(0);
    //console.log(stockData.getRow(0));
    //need to update xlsx manually and then convert to csv, pending more elegant solution
}

function setup(){
    canvas = createCanvas(windowWidth, windowHeight);
    yPosition = windowWidth/2
    canvas.mousePressed(startOscillator);
    osc = new p5.Oscillator('sine');
    background(layout.backgroundColor);
    frameRate(layout.frameRate);
    getSizeFromNum();
    for(let i = 0; i < layout.numStocks; i++) {
        //let ticker = stockData[0][i*4];
        let ticker = tickers[i];
        stocks[i] = new Stock(ticker, i);
    }
    rectMode(CENTER);

    //sound stuff
    beatDur = round(6000 / bpm / 8);
    reverb = new p5.Reverb();
    reverb.set(5,0,false);
}

function draw(){
    frameRate(layout.frameRate);
    background(layout.backgroundColor);
    stroke(255, 255, 255);
    noStroke();
    drawText();
    for(let i = 0; i<stocks.length; i++){
        stocks[i].display();
        stocks[i].noise();
    }
}

//initialize noise
function startOscillator() {
    //osc.start();
    playing = true;
}

//takes values and turns them into sounds, needs refactor to support class functionality
//add func for nicer sound ranges
function getSoundFromValues(values){
    let array = [];
    soundVal= values[frameCount%values.length];
    freq = diatonic[map(soundVal, 10, 50, 0, diatonic.length)];
    amp = constrain(map(soundVal, 10, 50, 0, 1), 0, 1);
    let max = Math.max(...values);
    let min = Math.min(...values);
    for(let i =0; i < values.length; i++){
        array[i] = floor(map(values[i],min, max,0,diatonic.length));
    }
    return array;
}

function stockGraph(values, index){ //change to be called by class, access class index
    let array = [];
    let max = Math.max(...values);
    let min = Math.min(...values);
    let top = (stockCenter[(index*2)+1])-stockHeight/2;
    let bottom = (stockCenter[(index*2)+1])+stockHeight/2;
    for(let i =0; i < values.length; i++){ //fix to something like stockCenter/2 + stockHeight + 2
        array[i]= map(values[i], min *.5, max * 1.5, bottom, top);
        //array[i]= constrain(map(values[i], max *.5, min * 1.5, (stockCenter[(index*2)+1])-stockHeight/2, (stockCenter[(index*2)+1])+stockHeight/2), (stockCenter[(index*2)+1])-stockHeight/2, (stockCenter[(index*2)+1])+stockHeight/2);
    }   //triple period compares all values in array. probably dogshit for time complexity, but simple to implement
    return array;
}

//here to avoid bloat in draw function, might be adapted for stock labels
function drawText(){
    textSize(50);
    textFont(sevenSegment);
    textAlign(CENTER);
    fill(layout.accentColor);
    text(layout.title, windowWidth/2, (windowHeight/6))
}

//used to find grid arrangement for stock array based on number of stocks
function getSizeFromNum(){
    if(layout.numStocks == 1){ // look at mod math and patterns for more concise code
        stockWidth = width/5;
        stockHeight = width/5;
        stockCenter = [windowWidth/2, windowHeight/2];
    } else if(layout.numStocks == 2){
        stockWidth = width/5;
        stockHeight = width/5;
        stockCenter = [windowWidth/4, windowHeight/2, (windowWidth/4)*3, windowHeight/2];
    } else if(layout.numStocks == 3){
        stockWidth = width/5;
        stockHeight = width/5;
        stockCenter = [windowWidth/6, windowHeight/2, (windowWidth/6)*3, windowHeight/2, 
                        (windowWidth/6)*5, windowHeight/2];
    } else if(layout.numStocks == 4){
        stockWidth = width/7;
        stockHeight = width/7;
        stockCenter =[windowWidth/4, windowHeight/4, (windowWidth/4)*3, windowHeight/4,
        windowWidth/4, (windowHeight/4)*3, (windowWidth/4)*3, (windowHeight/4)*3];
    } else if(layout.numStocks == 6){
        stockWidth = width/7;
        stockHeight = width/7;
        stockCenter =[windowWidth/6, windowHeight/4, (windowWidth/6)*3, windowHeight/4, 
        (windowWidth/6)*5, windowHeight/4, windowWidth/6, (windowHeight/4) *3, (windowWidth/6)*3, (windowHeight/4) *3, 
        (windowWidth/6)*5, (windowHeight/4) *3];
    }
}

//from step sequencer example, modify to use stock values as input for height
function playNotes(stockOsc, note) {
    if(playing){
        stockOsc.start();
        stockOsc.freq(diatonic[note], 0);
        stockOsc.amp(1, 0);
        stockOsc.amp(0, 0.25);
    }
}

//from step sequencer example, mopdify to use stock values as input for height
function keyPressed() {
    if (key === ' ') {
      playing = !playing;
    }
    if (key === 'r') {
      rev = !rev;
      if (rev) {
        for (let i = 0; i < layers; i++) {
            for(Stock in stocks){
                this.stockOsc[i].connect(reverb);
            }
        }        
      }
      else {
        for (let i = 0; i < layers; i++) {
            for(Stock in stocks){
            this.stockOsc[i].disconnect(reverb);
            this.stockOsc[i].connect(soundOut);
            }
        }
      }
    }
  }

class Stock {
    constructor(ticker, index){
        this.index = index;
        this.ticker = ticker;
        this.frameX = stockCenter[index*2];
        this.frameY = stockCenter[(index*2)+1]; //these don't work
        this.width = stockWidth;
        this.height = stockHeight
        this.stockOsc = new p5.Oscillator('sine'); 
        this.stockArrayIndex = 0;
        this.xPosition = 0;
        //this.values = gmeValues;
        this.values = stockData.getColumn(this.index); //here is where the columns are read in
        //console.log("values for stock number " + this.index + ": " + this.values);
        this.graphPosition = stockGraph(this.values, this.index);
        this.graphNoises = getSoundFromValues(this.values);
        console.log("graph noise values for stock "+ this.index+ ": "+this.graphNoises);
        this.max = Math.max(...this.values);
        this.min = Math.min(...this.values);
    }

    display(){ 
        fill(0)
        stroke(layout.accentColor);
        strokeWeight(4);
        rect(stockCenter[this.index*2], stockCenter[(this.index*2)+1], stockWidth,stockHeight)
        noStroke();
        strokeWeight(2);
        this.stockArrayIndex = frameCount%this.graphPosition.length; 
        //console.log(this.values[this.stockArrayIndex]);
        this.xPosition = this.graphPosition[this.stockArrayIndex]; 
        if(this.graphPosition[this.stockArrayIndex] > this.graphPosition[this.stockArrayIndex-1]){ 
            fill(0,255,0);
        } else {
            fill(255,0,0);
        }
        circle(stockCenter[this.index*2], this.xPosition, 5); 
        if(this.graphPosition[this.stockArrayIndex] > this.graphPosition[this.stockArrayIndex-1]){ 
            stroke(0,255,0);
        } else {
            stroke(255,0,0);
        }
        line(stockCenter[this.index*2],this.xPosition, stockCenter[this.index*2]-10, this.graphPosition[this.stockArrayIndex-1]); 
        let endLine = floor(stockWidth/10)/2;
        for(let i = 2; i < endLine; i++){
            if(this.graphPosition[this.stockArrayIndex-i] > this.graphPosition[this.stockArrayIndex-(i-1)]){ 
                stroke(0,255,0);
            } else {
                stroke(255,0,0);
            } //stock center index *2 is the x axis, i -1 *10 gets offset to left   gets graph pos for prev using mod math to stay in bounds
            line(stockCenter[this.index*2]-((i-1)*10),this.graphPosition[(this.stockArrayIndex-(i-1))%this.graphPosition.length], stockCenter[this.index*2]-(i*10), this.graphPosition[(this.stockArrayIndex-i)%this.graphPosition.length]);
        } //add mod math here to make sure the loop back is more fluid
        noStroke();
        textSize(40);
        textFont(sevenSegment);
        textAlign(CENTER);
        fill(layout.accentColor);
        text(this.ticker, stockCenter[(this.index*2)], stockCenter[(this.index*2)+1]+(stockCenter[(this.index*2)+1]*.6)); 
        text("$" + this.values[this.stockArrayIndex], stockCenter[(this.index*2)], stockCenter[(this.index*2)+1]+(stockCenter[(this.index*2)+1]*.75)); 
    }

    noise(){
        //getSoundFromValues(this.values);
        if (playing) {
            osc.freq(freq, 0);
            osc.amp(amp, 0);
        }
        if(this.values[this.stockArrayIndex] == this.max){
            trumpet.play();
        }
        if(this.values[this.stockArrayIndex] == this.min){
            kick.play();
        }
        if(this.values[this.stockArrayIndex] > this.values[this.stockArrayIndex-1] && this.values[this.stockArrayIndex]> this.values[this.stockArrayIndex+1]){
            //woo.play()
        }
        //console.log(this.graphNoises)
        //https://editor.p5js.org/jkeston/sketches/67DfafWvt
        playNotes(this.stockOsc, this.graphNoises[this.stockArrayIndex]);
    }
}