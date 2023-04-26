/**
 * Ideas: access several stocks from an api, user can specifiy which ones they want to hear
 * each stock can relate to a different range of notes, custimiziable colors
 * stock lines are green when trending up and red when trending down, just for those segmenats
 * 
 * use dat gui for user controls
 * 
 * interface with excel spreadsheet
 */

let diatonic = [27.50,30.87,32.70,36.71,41.20,43.65,49.00,55.00,61.74,65.41,73.42,82.41,87.31,98.00,110.00,
    123.47,130.81,146.83,164.81,174.61,196.00,220.00,246.94,261.63,293.66,329.63,349.23,392.00,440.00,493.88,
    523.25,587.33,659.25,698.46,783.99,880.00,987.77,1046.50];
let stocks = [];
let stockData = [[],[]];
let stockCenter;
let soundVal; //prob obj values
let playing, stockWidth, stockHeight;
let title = '$soundsofwallstreet';
let layout = {      //include more for ui
    numStocks: 2, //turn this into an int
    title: '$soundsofwallstreet'
}
let tickers = ['$GME', '$AMC'];
let gui = new dat.GUI();
gui.add(layout, 'numStocks', 1, 9);
gui.add(layout, 'title');

//things that happen before the page can render, include file reading for stock data here
function preload(){
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
    background(0);
    frameRate(15);
    getSizeFromNum();
    for(let i = 0; i < layout.numStocks; i++) {
        //let ticker = stockData[0][i*4];
        let ticker = tickers[i];
        stocks[i] = new Stock(ticker, i);
    }
    rectMode(CENTER);
}

function draw(){
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
    osc.start();
    playing = true;
}

//takes values and turns them into sounds, needs refactor to support class functionality
//add func for nicer sound ranges
function getSoundFromValues(values){
    soundVal= values[frameCount%values.length];
    freq = diatonic[map(soundVal, 10, 50, 0, diatonic.length)];
    amp = constrain(map(soundVal, 10, 50, 0, 1), 0, 1);
}

function stockGraph(values){
    let array = [];
    for(let i =0; i < values.length; i++){ //fix to something like stockCenter/2 + stockHeight + 2
        array[i]= constrain(map(values[i], Math.min(...values), Math.max(...values), (windowHeight/2-175), (windowHeight/2+175)), (windowHeight/2-175), (windowHeight/2+175));
    }   //triple period compares all values in array. probably dogshit for time complexity, but simple to implement
    return array;
}

//here to avoid bloat in draw function, might be adapted for stock labels
function drawText(){
    textSize(50);
    textFont(sevenSegment);
    textAlign(CENTER);
    fill(208, 9, 235);
    text(layout.title, windowWidth/2, (windowHeight/6))
}


//supposed to toggle sound, untested
/*function mousePressed(){
    if(!playing){
        osc.start();
    } else {
        osc.stop();
    }
    playing != playing; //this is buggy
}*/

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
        stockCenter = [windowWidth/6, windowHeight/2, (windowWidth/6)*2, windowHeight/2, 
                        (windowWidth/6)*4, windowHeight/2];
    } else if(layout.numStocks == 4){
        stockWidth = width/5;
        stockHeight = width/5;
        stockCenter =[windowWidth/4, windowHeight/4, (windowWidth/4)*3, windowHeight/4,
                        (windowWidth/4)*3, (windowHeight/4)*3];
    } else if(layout.numStocks == 5){
        stockWidth = width/5;
        stockHeight = width/5;
        stockCenter =[windowWidth/4, windowHeight/4, (windowWidth/4)*3, windowHeight/4,
                        (windowWidth/4)*3, (windowHeight/4)*3]; //this is wrong
    } else if(layout.numStocks == 6){
        stockWidth = width/5;
        stockHeight = width/5;
        stockCenter =[windowWidth/4, windowHeight/4, (windowWidth/4)*3, windowHeight/4,
                        (windowWidth/4)*3, (windowHeight/4)*3]; //this is wrong
    } else if(layout.numStocks == 7){
        stockWidth = width/5;
        stockHeight = width/5;
        stockCenter =[windowWidth/4, windowHeight/4, (windowWidth/4)*3, windowHeight/4,
                        (windowWidth/4)*3, (windowHeight/4)*3]; //this is wrong
    } else if(layout.numStocks == 8){
        stockWidth = width/5;
        stockHeight = width/5;
        stockCenter =[windowWidth/4, windowHeight/4, (windowWidth/4)*3, windowHeight/4,
                        (windowWidth/4)*3, (windowHeight/4)*3]; //this is wrong
    } else if(layout.numStocks == 9){
        stockWidth = width/5;
        stockHeight = width/5;
        stockCenter =[windowWidth/4, windowHeight/4, (windowWidth/4)*3, windowHeight/4,
                        (windowWidth/4)*3, (windowHeight/4)*3]; //this is wrong
    }
}

class Stock {
    constructor(ticker, index){
        this.index = index;
        this.ticker = ticker;
        this.frameX = stockCenter[index*2];
        this.frameY = stockCenter[(index*2)+1];
        this.width = stockWidth;
        this.height = stockHeight
        this.stockOsc = new p5.Oscillator('sine'); 
        this.stockArrayIndex = 0;
        this.xPosition = 0;
        //this.values = gmeValues;
        this.values = stockData.getColumn(stockData.columns[index * 2]); //here is where the columns are read in
        console.log("values for stock number " + index + ": " + this.values);
        this.graphPosition = stockGraph(this.values);
    }

    display(){
        fill(94,93,92)
        rect(stockCenter[this.index*2], stockCenter[(this.index*2)+1], stockWidth,stockHeight)
        this.stockArrayIndex = frameCount%this.graphPosition.length; 
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
            }
            line(stockCenter[this.index*2]-((i-1)*10),this.graphPosition[(this.stockArrayIndex-(i-1))%this.graphPosition.length], stockCenter[this.index*2]-(i*10), this.graphPosition[(this.stockArrayIndex-i)%this.graphPosition.length]);
        } 
        noStroke();
        textSize(40);
        textFont(sevenSegment);
        textAlign(CENTER);
        fill(208, 9, 235);
        text(this.ticker, this.frameY, this.frameX-(this.frameX*.5)); 
    }

    noise(){
        getSoundFromValues(this.values);
        if (playing) {
            osc.freq(freq, 0);
            osc.amp(amp, 0);
        }
    }
}