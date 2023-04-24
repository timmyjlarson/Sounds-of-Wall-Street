/**
 * Ideas: access several stocks from an api, user can specifiy which ones they want to hear
 * each stock can relate to a different range of notes, custimiziable colors
 * stock lines are green when trending up and red when trending down, just for those segmenats
 * 
 * use dat gui for user controls
 * 
 * interface with excel spreadsheet
 */

let gmeValues = [42, 37.752499, 38.5275, 37.272499, 35.759998, 36.625, 36.025002, 37.317501, 37.5, 35.712502, 
    38, 37.5, 35.637501, 33.852501, 33.91, 31.817499, 32.57, 31.825001, 30.9125, 29.620001, 29.8025, 30.985001, 
    29.32, 27.695, 25.745001, 23.3675, 20.76, 24.75, 24.700001, 23.475, 24.094999, 22.805, 24.952499, 24.1425, 
    23.512501, 22.535, 29, 35.25, 34.302502, 30.705, 29.75, 32.5, 33.825001, 32.5, 35.3475, 34.697498, 31.5, 
    30.127501, 29.3925, 31.237499, 31.235001, 31.715, 34.555, 34.6675, 35.41, 35.75, 34.1175, 32.752499, 
    30.387501, 29.842501, 30.282499, 30.375, 30.172501, 31.122499, 31.665001, 32.139999, 32.700001, 33.75, 
    34.797501, 34.860001, 36.25, 37.435001, 38.5, 39.93, 36.880001, 35, 32.869999, 32.959999, 33.389999, 33.68, 
    33.799999, 35.900002, 36.220001, 38.34, 37.369999, 41.290001, 42.139999, 42, 40.91, 40, 39.75, 39.169998, 
    42.18, 39.27, 35.18, 34.310001, 34.700001, 34, 32.84, 31.5, 30.48, 31.620001, 29.25, 28, 28.26, 25.75, 24.73, 
    25, 26.299999, 29.030001, 27.4, 27.559999, 27.860001, 28.33, 28.34, 29.280001, 27.450001, 27.17, 24.15, 24.66, 
    25.469999, 25.889999, 27.08, 25.030001, 25.139999, 25.950001, 26.77, 26.290001, 25.84, 25.370001, 24.870001, 
    25.959999, 24.42, 25.77, 25.370001, 27.1, 26, 24.65, 24.15, 25, 24.82, 26.370001, 25.75];

let diatonic = [27.50,30.87,32.70,36.71,41.20,43.65,49.00,55.00,61.74,65.41,73.42,82.41,87.31,98.00,110.00,
    123.47,130.81,146.83,164.81,174.61,196.00,220.00,246.94,261.63,293.66,329.63,349.23,392.00,440.00,493.88,
    523.25,587.33,659.25,698.46,783.99,880.00,987.77,1046.50];
let stocks = [];
let stockData = [];
let stockCenter;
let soundVal; //prob obj values
let playing, stockWidth, stockHeight;
let title = '$soundsofwallstreet';
let layout = {      //include more for ui
    numStocks: 2, //turn this into an int
    title: '$soundsofwallstreet'
}
let gui = new dat.GUI();
gui.add(layout, 'numStocks', 1, 9);
gui.add(layout, 'title');

//things that happen before the page can render, include file reading for stock data here
function preload(){
    sevenSegment = loadFont('fonts/Seven Segment.ttf');
    stockData = loadTable('stocks/stockData.xlsx', 'xlsx', 'header'); //read in the whole sheet
    console.log(stockData); //this also shows only one column
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
        let ticker = 'gme';
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

//takes values and turns them into lines, needs refactor to support class functionality
function stockGraph(values){
    let array = [];
    for(let i =0; i < values.length; i++){
        array[i]= constrain(map(values[i], 10, 50, (windowHeight/2-175), (windowHeight/2+175)), (windowHeight/2-175), (windowHeight/2+175));
    }
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
    console.log("stock center: " + stockCenter);
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
        this.values = gmeValues;
        this.values = stockData.getColumn(stockData.columns[1]); //here is where the columns are read in
        console.log(this.values);
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
    }

    noise(){
        getSoundFromValues(this.values);
        if (playing) {
            osc.freq(freq, 0);
            osc.amp(amp, 0);
        }
    }
}