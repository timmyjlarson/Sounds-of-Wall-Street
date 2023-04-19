/**
 * Ideas: access several stocks from an api, user can specifiy which ones they want to hear
 * each stock can relate to a different range of notes, custimiziable colors
 * stock lines are green when trending up and red when trending down, just for those segmenats
 * 
 * add time based open/closing bell events, during downtime maybe play lofi hip hop or something?
 * 
 * when no stocks are selected or active, cycle through a few gifs like bell ringing, wolf of wallstreet,
 * etc.
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
let soundVal;
let playing;
let xPosition;
let yPosition;
let xPos = [];
let xIndex;
let gui = new dat.GUI();
gui.add(circ, 'width', 0, 400);
gui.add(circ, 'height', 0, 400);
gui.add(circ, 'alpha', 0, 255);

function preload(){
    sevenSegment = loadFont('fonts/Seven Segment.ttf');
}

function setup(){
    canvas = createCanvas(windowWidth, windowHeight);
    yPosition = windowWidth/2
    canvas.mousePressed(playOscillator);
    osc = new p5.Oscillator('sine');
    stockGraph();
    background(0);
    frameRate(15);
}

function draw(){
    stroke(255, 255, 255);
    fill(94,93,92)
    rectMode(CENTER);
    rect(windowWidth/2, windowHeight/2, width/5, width/5)
    noStroke();   
    textSize(50);
    textFont(sevenSegment);
    textAlign(CENTER);
    fill(208, 9, 235);
    text("$soundsofwallstreet", windowWidth/2, (windowHeight/6)) //replace with seven segment style font
    getSoundFromValues();
    if (playing) {
        // smooth the transitions by 0.1 seconds
        osc.freq(freq, 0.1);
        osc.amp(amp, 0.1);
    }
    xIndex = frameCount%xPos.length;
    xPosition = xPos[xIndex];
    fill(8, 204, 34);
    circle(yPosition, xPosition, 5);
    stockGraph(frameCount-1);
    stroke(8, 204, 34);
    line(yPosition,xPosition, yPosition-1, xPos[xIndex-1]);
    for(let i =2; i < 13; i++){
        line(yPosition-((i-1)*10),xPos[(xIndex-(i-1))%xPos.length], yPosition-(i*10), xPos[(xIndex-i)%xPos.length]);
    }
}

function playOscillator() {
    osc.start();
    playing = true;
}

function getSoundFromValues(){
    soundVal= gmeValues[frameCount%gmeValues.length];
    freq = constrain(map(soundVal, 10, 50, 100, 500), 100, 500);
    amp = constrain(map(soundVal, 10, 50, 0, 1), 0, 1);
}

function stockGraph(){
    for(let i =0; i < gmeValues.length; i++){
        xPos[i]= constrain(map(gmeValues[i], 10, 50, (windowHeight/2-175), (windowHeight/2+175)), (windowHeight/2-175), (windowHeight/2+175));
    }
}