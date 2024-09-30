let clock;
let secs = 0;
let points = [];
let timeText = "0:00";
let startingPoints = 0;
let startingSecs = 0;
let clockTickMillis = 125;
let clockTickSeconds = clockTickMillis / 1000;
let textAlpha = 255;
let textColor;
let dotColor;
let tail = 15;
let lineSize = 5;
let introText = "Click + drag to set time, release to start the timer.";
let introSize = null;
let timeSize = null;
let intro = true;
let env;
let triOsc;
let reverb;



function setup() {
  createCanvas(windowWidth, windowHeight);
  lineSize = floor(width / 50);
  introSize = width / 32;
  timeSize = width / 4;
  textColor = color(10, 10, 10);
  dotColor = color(250, 250, 250);
  env = new p5.Envelope(0.01, 0.5, 0.01, 0);
  triOsc = new p5.Oscillator('sine');
  triOsc.freq(2000);
  reverb = new p5.Reverb();
  reverb.process(triOsc, 5, 5);
}

function playSound() {
  triOsc.start();
  env.play(triOsc);
}

function draw() {
  background("red");
  if (intro) {
    displayIntro();
  } else {
    drawLine();
    calculateTextAlpha();
    displayTime();
    console.log(points.length);
  }
}

function drawLine() {
  for (let i = 0; i < points.length - 1; i++) {
    let p = points[i];
    let p2 = points[i + 1];
    let distanceFromEnd = points.length - i;
    let lineAlpha = 255;
    if (distanceFromEnd < tail) {
      lineAlpha = map(distanceFromEnd, tail, 0, 240, 0);
    }
    dotColor.setAlpha(lineAlpha);
    stroke(dotColor);
    strokeWeight(lineSize);
    line(p.x, p.y, p2.x, p2.y);
  }
}

function calculateTextAlpha() {
  if (points.length === 0 || mouseIsPressed) {
    textAlpha = 255;
  } else {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
      let mouseMovement = dist(pmouseX, pmouseY, mouseX, mouseY);
      textAlpha += floor(mouseMovement / 3);
    }
    textAlpha--;
    textAlpha = constrain(textAlpha, 128, 255);
  }
  textColor.setAlpha(textAlpha);
}

function displayIntro() {
  textFont("Times");
  fill(textColor);
  textSize(introSize);
  textAlign(CENTER, CENTER);
  text(introText, 0, 0, width, height);
}

function displayTime(x, y, size) {
  textFont("Courier");
  textSize(width / 4);
  noStroke();
  fill(textColor);
  textAlign(CENTER, CENTER);
  text(timeText, 0, 0, width, height);
}

function startClock() {
  clearInterval(clock);
  clock = setInterval(clockTick, clockTickMillis);
}

function clockTick() {
  if (secs <= 0) {
    clearInterval(clock);
    setInterval(playSound, 1500);
  } else {
    secs = secs - clockTickSeconds;
    let secsRatio = secs / startingSecs;
    let pointsRatio = points.length / startingPoints;
    while (pointsRatio > secsRatio) {
      points.pop();
      pointsRatio = points.length / startingPoints;
    }
    timeText = getTimeText();
  }
}

function mousePressed() {
  intro = false;
  secs = 0;
  points = [];
}

function mouseReleased() {
  console.log(points.length);
  points = smoothPointsLine();
  console.log(points.length);
  startingPoints = points.length;
  startingSecs = secs;
  startClock();
}

function mouseDragged() {
  let dragDist = dist(pmouseX, pmouseY, mouseX, mouseY);
  let dragAmount = floor(map(dragDist, 1, width, 1, 60));
  secs += dragAmount;
  points.push({ x: mouseX, y: mouseY });
  timeText = getTimeText();
}

function getTimeText() {
  let numSecs = floor(secs);
  let minText = floor(numSecs / 60);
  let secText = numSecs % 60;
  let output = minText + ":";
  if (secText < 10) {
    output += "0";
  }
  return output + secText;
}

function smoothPointsLine() {
  let output = [];
  for (let i = 0; i < points.length - 2; i++) {
    let p1 = points[i];
    let p2 = points[i + 1];
    let d = dist(p1.x, p1.y, p2.x, p2.y);
    let num = floor(d / 2);
    if (num <= 1) {
      // if p1 and p2 are close enough, do nothing
      output.push(p1);
    } else {
      // otherwise, subdivide!
      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      for (let step = 0; step < num; step++) {
        let pN = { x: null, y: null };
        pN.x = dx * (step / num) + p1.x;
        pN.y = dy * (step / num) + p1.y;
        output.push(pN);
      }
    }
  }
  return output;
}
