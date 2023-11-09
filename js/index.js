let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let running = false;
let rectY = [];

// Create points
for(let x = 0; x < 255; x++) {
    rectY.push(0);
}
// for(let angle = 0; angle < 360; angle += interval) {
//   let distUp = 1.1;
//   let distDown = 0.9;

//   pointsUp.push({
//     angle: angle + angleExtra,
//     x: centerX + radius * Math.cos((-angle + angleExtra) * Math.PI / 180) * distUp,
//     y: centerY + radius * Math.sin((-angle + angleExtra) * Math.PI / 180) * distUp,
//     dist: distUp
//   });

//   pointsDown.push({
//     angle: angle + angleExtra + 5,
//     x: centerX + radius * Math.cos((-angle + angleExtra + 5) * Math.PI / 180) * distDown,
//     y: centerY + radius * Math.sin((-angle + angleExtra + 5) * Math.PI / 180) * distDown,
//     dist: distDown
//   });
// }

const context = new AudioContext();
const splitter = context.createChannelSplitter();

const analyserL = context.createAnalyser();
const analyserR = context.createAnalyser();

analyserL.fftSize = 8192;
analyserR.fftSize = 8192;

splitter.connect(analyserL, 0, 0);
splitter.connect(analyserR, 1, 0);

const bufferLengthL = analyserL.frequencyBinCount;
const bufferLengthR = analyserR.frequencyBinCount;

const audioDataArrayL = new Uint8Array(bufferLengthL);
const audioDataArrayR = new Uint8Array(bufferLengthR);

const audio = new Audio();

function loadAudio() {
	audio.loop = false;
	audio.autoplay = false;
	audio.crossOrigin = "anonymous";
	
	audio.addEventListener('canplay', handleCanplay);
	audio.src = "./eyeofthetiger.mp3";
	audio.load();
	running = true;
}

function handleCanplay() {
  // connect the audio element to the analyser node and the analyser node
  // to the main Web Audio context
  const source = context.createMediaElementSource(audio);
  source.connect(splitter);
  splitter.connect(context.destination);
}

function toggleAudio() {
  if (running === false) {
    loadAudio();
    // document.querySelector('.call-to-action').remove();
  }

  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

canvas.addEventListener('click', toggleAudio);

document.body.addEventListener('touchend', function(ev) {
  context.resume();
});

function drawText(points) {
    let letters = ['J','A','V','A','S','C','R','I','P','T'];

    for(let i=0; i < 10; i++) {
        let ada = audioDataArrayL[i] / 255;

        ctx.font = (points[0] * .200) + 'px serif';
        ctx.fillText(letters[i], 400 + (i*75), 500);
        // ctx.fillText('J', 400, 500);
        // ctx.fillText('A', 450, 500);
        // ctx.fillText('V', 500, 500);
        // ctx.fillText('A', 550, 500);
        // ctx.fillText('S', 600, 500);
        // ctx.fillText('C', 650, 500);
        // ctx.fillText('R', 700, 500);
        // ctx.fillText('I', 750, 500);
        // ctx.fillText('P', 800, 500);
        // ctx.fillText('T', 850, 500);
    }
}

function drawSquare(points) {
    for(let i=0; i < 255; i++) {
        let ada = audioDataArrayL[i] / 255;
        ctx.beginPath();
        ctx.rect(centerX - (3 * i), centerY - points[i] -50, 1, 10 + points[i]);
        if(ada >= .8) {
            ctx.strokeStyle = "#ff0000";
        }
        else if(ada >= .7 && ada < .8) {
            ctx.strokeStyle = "#ff038e";
        }
        else if(ada >= .6 && ada < .7) {
            ctx.strokeStyle = "#ff05ff";
        }
        else if(ada >= .5 && ada < .6) {
            ctx.strokeStyle = "#a805ff";
        }
        else if(ada >= .4 && ada < .5) {
            ctx.strokeStyle = "#2605ff";
        }
        else if(ada >= .3 && ada < .4) {
            ctx.strokeStyle = "#05a3ff";
        }
        else if(ada >= .2 && ada < .3) {
            ctx.strokeStyle = "#05ff69";
        }
        else if(ada >= .1 && ada < .2) {
            ctx.strokeStyle = "#ffee05";
        }
        else {
            ctx.strokeStyle = "#000000";
        }
        ctx.closePath();
        ctx.stroke();
    }
}

// function drawLine(points) {
//   let origin = points[0];
  
//   ctx.beginPath();
//   ctx.strokeStyle = 'rgba(255,255,255,0.5)';
//   ctx.lineJoin = 'round';
//   ctx.moveTo(origin.x, origin.y);

//   for (let i = 0; i < points.length; i++) {
//     ctx.lineTo(points[i].x, points[i].y);
//   }

//   ctx.lineTo(origin.x, origin.y);
//   ctx.stroke();
// }

// function connectPoints(pointsA, pointsB) {
//   for (let i = 0; i < pointsA.length; i++) {
//     ctx.beginPath();
//     ctx.strokeStyle = 'rgba(255,255,255,0.5)';
//     ctx.moveTo(pointsA[i].x, pointsA[i].y);
//     ctx.lineTo(pointsB[i].x, pointsB[i].y);
//     ctx.stroke();
//   }
// }

function update(dt) {
  let audioValueY;

  // get the current audio data
  analyserL.getByteFrequencyData(audioDataArrayL);
  analyserR.getByteFrequencyData(audioDataArrayR);

//   for (let i = 0; i < pointsUp.length; i++) {
    // audioIndex = Math.ceil(pointsUp[i].angle * (bufferLengthL / (pCircle * 2))) | 0;
        // get the audio data and make it go from 0 to 1
    for(let i=0; i < 255; i++) {
        audioValueY = audioDataArrayL[i] / 255;
    
        rectY[i] = audioValueY * 400;
    }
    // console.log(audioValue);

    // pointsUp[i].dist = 1.1 + audioValue * .8;
    // pointsUp[i].x = centerX + radius * Math.cos(-pointsUp[i].angle * Math.PI / 180) * pointsUp[i].dist;
    // pointsUp[i].y = centerY + radius * Math.sin(-pointsUp[i].angle * Math.PI / 180) * pointsUp[i].dist;

    // audioIndex = Math.ceil(pointsDown[i].angle * (bufferLengthR / (pCircle * 2))) | 0;
    // get the audio data and make it go from 0 to 1
    // audioValue = audioDataArrayR[audioIndex] / 255;

    // pointsDown[i].dist = 0.9 + audioValue * 0.2;
    // pointsDown[i].x = centerX + radius * Math.cos(-pointsDown[i].angle * Math.PI / 180) * pointsDown[i].dist;
    // pointsDown[i].y = centerY + radius * Math.sin(-pointsDown[i].angle * Math.PI / 180) * pointsDown[i].dist;
//   }
}

function draw(dt) {
    requestAnimationFrame(draw);

    if (running) {
        update(dt);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

//   drawLine(pointsUp);
//   drawLine(pointsDown);
//   connectPoints(pointsUp, pointsDown);
    // drawSquare(rectY);
    drawText(rectY);
}

draw();