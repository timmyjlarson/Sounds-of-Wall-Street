/**
 * Ideas: access several stocks from an api, user can specifiy which ones they want to hear
 * each stock can relate to a different range of notes, custimiziable colors
 * stock lines are green when trending up and red when trending down, just for those segmenats
 * 
 * use dat gui for user controls
 * 
 * interface with excel spreadsheet
 */
let waveform = ["sine", "sawtooth", "triangle", "square"]; //try adding func for selecting different wave forms?
let diatonic = [/*27.50,30.87,32.70,36.71,41.20,43.65,49.00,55.00,61.74,65.41,73.42,82.41,87.31,98.00,110.00,*/
    123.47,130.81,146.83,164.81,174.61,196.00,220.00,246.94,261.63,293.66,329.63,349.23,392.00,440.00,493.88,
    523.25,587.33,659.25,698.46,783.99,880.00,987.77,1046.50]; //commented out lower values for more paletable sound
let chromatic = [/*27.50,29.14,30.87,32.70,34.65,36.71,38.89,41.20,43.65,46.25,49.00,51.91,55.00,58.27,61.74,65.41,
    69.30,73.42,77.78,82.41,87.31,92.50,98.00,103.83,110.00,*/116.54,123.47,130.81,138.59,146.83,155.56,164.81,174.61,
    185.00,196.00,207.65,220.00,233.08,246.94,261.63,277.18,293.66,311.13,329.63,349.23,369.99,392.00,415.30,440.00,
    466.16,493.88,523.25,554.37,587.33,622.25,659.25,698.46,739.99,783.99,830.61,880.00,932.33,987.77,1046.50];
let bpm = 140;
let playing, reverb;
let stocks = [];
let stockData = [[],[]];
let stockCenter = [];
let stockWidth, stockHeight;
let layout = {      //include more for ui
    numStocks: 6, //turn this into an int
    title: 'sounds of wallstreet',
    titleSize: 50,
    accentColor: [245, 238, 42],
    backgroundColor: [128, 128, 128],
    frameRate: 7,
    soundWave: 'sine',
    soundType: 'diatonic'
}
let tickers = ['GME', 'AMC', 'GOOGL', 'AAPL', 'MSFT', 'AMZN', 'TSLA', 'NKE', 'META']; //currently hardcoded, may be able to fix?
let gui = new dat.GUI();
gui.close();
gui.add(layout, 'numStocks', 1, 6, 1);
gui.add(layout, 'title');
gui.add(layout, 'titleSize', 10, 100);
gui.add(layout, 'frameRate', 1, 144);
gui.add(layout, 'soundWave', {sine: 'sine', sawtooth: 'sawtooth', triangle: 'triangle', square: 'square'})
gui.add(layout, 'soundType', {diatonic: 'diatonic', chromatic: 'chromatic'})
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
    stockData = loadTable('stocks/stockData.csv', 'csv', 'header'); 
}

function setup(){
    canvas = createCanvas(windowWidth, windowHeight);
    yPosition = windowWidth/2
    canvas.mousePressed(startSound);
    getSizeFromNum();
    for(let i = 0; i < 9; i++) { //change 9 to be dynamic based on sheet size
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
    drawText();
    for(let i = 0; i<layout.numStocks; i++){
        stocks[i].display();
        stocks[i].noise();
    }
}

//initialize noise
function startSound() {
    playing = true;
}

//takes values and turns them into sounds using diatonic scale, possibility to add chromatic pending dat gui list knowledge
function getSoundFromValues(values){
    let array = [];
    soundVal= values[frameCount%values.length];
    let max = Math.max(...values);
    let min = Math.min(...values);
    if(layout.soundType == diatonic){
        freq = diatonic[map(soundVal, 10, 50, 0, diatonic.length)];
        amp = constrain(map(soundVal, 10, 50, 0, 1), 0, 1);
        for(let i =0; i < values.length; i++){
            array[i] = floor(map(values[i],min, max,0,diatonic.length));
        }
    } else {
        freq = chromatic[map(soundVal, 10, 50, 0, chromatic.length)];
        amp = constrain(map(soundVal, 10, 50, 0, 1), 0, 1);
        for(let i =0; i < values.length; i++){
            array[i] = floor(map(values[i],min, max,0,chromatic.length));
        }
    }
    return array;
}

//takes stock data and turns it into indexes for graph positions
function stockGraph(values, index, max, min, size){ 
    let array = [];
    let top = (stockCenter[(index*2)+1])-stockHeight/2;
    let bottom = (stockCenter[(index*2)+1])+stockHeight/2;
    for(let i =0; i < size; i++){ 
        array[i]= map(values[i], min *.5, max * 1.5, bottom, top);
    }
    return array;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    getSizeFromNum();
    for(let i = 0; i < layout.numStocks; i ++){
        this.graphPosition = stockGraph(this.values, this.index); //this almost works
    }
  }

//here to avoid bloat in draw function
function drawText(){
    textSize(layout.titleSize);
    textFont(sevenSegment);
    textAlign(CENTER);
    fill(layout.accentColor);
    if(layout.numStocks<=3){
        text(layout.title, windowWidth/2, (windowHeight/6))
    } else{
        text(layout.title, windowWidth/2, (windowHeight/7)*4)
    }
}

//used to find grid arrangement for stock array based on number of stocks
function getSizeFromNum(){
    if(layout.numStocks == 1){ 
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
    } else if(layout.numStocks == 5){
        stockWidth = width/7;
        stockHeight = width/7;
        stockCenter =[windowWidth/6, windowHeight/4, (windowWidth/6)*3, windowHeight/4, 
        (windowWidth/6)*5, windowHeight/4, windowWidth/4, (windowHeight/4)*3, (windowWidth/4)*3, 
        (windowHeight/4)*3];
    }else if(layout.numStocks == 6){
        stockWidth = width/7;
        stockHeight = width/7;
        stockCenter =[windowWidth/6, windowHeight/4, (windowWidth/6)*3, windowHeight/4, 
        (windowWidth/6)*5, windowHeight/4, windowWidth/6, (windowHeight/4) *3, (windowWidth/6)*3, 
        (windowHeight/4) *3, 
        (windowWidth/6)*5, (windowHeight/4) *3];
    }
}

//from step sequencer example, modify to use stock values as input for height
function playNotes(stockOsc, note) {
    if(playing){
        stockOsc.start();
        if(layout.soundType == diatonic){
            stockOsc.freq(diatonic[note], 0);
        } else{
            stockOsc.freq(chromatic[note], 0);
        }
        stockOsc.amp(1, 0);
        stockOsc.amp(0, 0.25);
    }
}

//from step sequencer example, mopdify to use stock values as input for height
function keyPressed() {
    if (key === ' ') {
      playing = !playing;
    }
    if (key === 'r') {  //can't tell if this works or not
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
        this.width = stockWidth;
        this.height = stockHeight;
        this.stockArrayIndex = 0;
        this.xPosition = 0;
        this.values = stockData.getColumn(this.index);
        this.max = Math.max(...this.values);
        this.min = Math.min(...this.values);
        this.size = this.values.length;
        this.graphPosition = stockGraph(this.values, this.index, this.max, this.min, this.size);
    }

    display(){ 
        fill(0)
        stroke(layout.accentColor);
        strokeWeight(4);
        rect(stockCenter[this.index*2], stockCenter[(this.index*2)+1], stockWidth,stockHeight)
        noStroke();
        strokeWeight(2);
        this.stockArrayIndex = frameCount%this.graphPosition.length; 
        this.xPosition = this.graphPosition[this.stockArrayIndex]; 
        if(this.graphPosition[this.stockArrayIndex] > this.graphPosition[this.stockArrayIndex-1]){ 
            stroke(0,255,0);
            fill(0,255,0);
        } else { // green for gain
            stroke(255,0,0);
            fill(255,0,0);
        } //red for loss
        circle(stockCenter[this.index*2], this.xPosition, 5); 
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
        text(this.ticker, stockCenter[(this.index*2)], stockCenter[(this.index*2)+1]+(stockHeight*.65)); 
        text("$" + this.values[this.stockArrayIndex], stockCenter[(this.index*2)], stockCenter[(this.index*2)+1]+(stockHeight*.81)); 
    }

    noise(){
        this.stockOsc = new p5.Oscillator(layout.soundWave);
        this.graphNoises = getSoundFromValues(this.values);
        if(this.values[this.stockArrayIndex] == this.max & playing){
            trumpet.play();
        }//52 week high
        if(this.values[this.stockArrayIndex] == this.min & playing){
            kick.play();
        }//52 week low
        if(this.values[this.stockArrayIndex] > this.values[this.stockArrayIndex-1] && this.values[this.stockArrayIndex]> this.values[this.stockArrayIndex+1]){
            //woo.play()
        }//local high
        playNotes(this.stockOsc, this.graphNoises[this.stockArrayIndex]);
    }
}