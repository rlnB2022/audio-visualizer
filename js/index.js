// create the canvas and get the 2d context
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

// set the canvas height and width
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight - 15;

let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let running = false;
let rectLY = [];
let rectRY = [];
let angle = 0;
let audioLength = 0;

// Create points
for (let x = 0; x < 255; x++) {
	rectLY.push(0);
	rectRY.push(0);
}

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

	audio.addEventListener("canplay", handleCanplay);
	audio.src = "./eyeofthetiger.mp3";
	audio.load();
	audio.addEventListener("loadeddata", () => {
		audioLength = audio.duration;
	});
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
	}

	if (audio.paused) {
		audio.play();
	} else {
		audio.pause();
	}
}

canvas.addEventListener("click", toggleAudio);

document.body.addEventListener("touchend", function (ev) {
	context.resume();
});

function drawText(points) {
	let letters = ["J", "A", "V", "A", "S", "C", "R", "I", "P", "T"];

	for (let i = 0; i < 10; i++) {
		let ada = audioDataArrayL[i] / 255;

		ctx.font = points[0] * ada + "px serif";
		ctx.fillText(letters[i], 400 + i * 125, centerY);
	}
}

// draw each of the frequency data integers
// these represent the decibel value for a specific frequency
function drawSquare(points, audioSide) {
	let modifier = 0;
	const rightSide = audioSide === "R";

	if (rightSide) {
		modifier = 500;
	}
	for (let i = 0; i < 255; i++) {
		let ada;
		if (rightSide) {
			ada = audioDataArrayR[i] / 255;
		} else {
			ada = audioDataArrayL[i] / 255;
		}
		ctx.beginPath();
		ctx.rect(
			centerX - 3 * i + modifier,
			900 - points[i] - 50,
			1,
			0 + points[i]
		);
		if (ada >= 0.8) {
			ctx.strokeStyle = "#ff0000";
		} else if (ada >= 0.7 && ada < 0.8) {
			ctx.strokeStyle = "#ff038e";
		} else if (ada >= 0.6 && ada < 0.7) {
			ctx.strokeStyle = "#ff05ff";
		} else if (ada >= 0.5 && ada < 0.6) {
			ctx.strokeStyle = "#a805ff";
		} else if (ada >= 0.4 && ada < 0.5) {
			ctx.strokeStyle = "#2605ff";
		} else if (ada >= 0.3 && ada < 0.4) {
			ctx.strokeStyle = "#05a3ff";
		} else if (ada >= 0.2 && ada < 0.3) {
			ctx.strokeStyle = "#05ff69";
		} else if (ada >= 0.1 && ada < 0.2) {
			ctx.strokeStyle = "#ffee05";
		} else {
			ctx.strokeStyle = "#000000";
		}
		ctx.closePath();
		ctx.stroke();
	}
}

function update(dt) {
	let audioValueLY;
	let audioValueRY;

	// get the current audio data
	analyserL.getByteFrequencyData(audioDataArrayL);
	analyserR.getByteFrequencyData(audioDataArrayR);

	// get the audio data and make it go from 0 to 1
	for (let i = 0; i < 255; i++) {
		audioValueLY = audioDataArrayL[i] / 255;
		audioValueRY = audioDataArrayL[i] / 255;

		rectLY[i] = audioValueLY * canvas.height;
		rectRY[i] = audioValueRY * canvas.height;
	}
}

function draw(dt) {
	requestAnimationFrame(draw);

	if (running) {
		update(dt);
	}

	ctx.save();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	/********* DRAWING VERTICAL LINES *********/
	// drawSquare(rectLY, "L");
	// drawSquare(rectRY, "R");

	/********* DRAWING TEXT *********/
	// drawText(rectLY);
	// drawText(rectRY);

	/********* DRAWING SPINNING RECORD *******/
	if (!audio.paused) {
		newTime = audio.currentTime;
	}
	drawAlbumInfo();
	drawSongInfo();
	drawTimeUp();
	drawTimeLeft();
	drawOuterRecord();
	ctx.translate(canvas.width - 500, centerY);
	ctx.rotate((Math.PI / 180) * angle);
	ctx.translate(-(canvas.width - 500), -centerY);
	drawRecordLine();
	ctx.restore();
	drawInnerRecord();
	oldTime = audio.currentTime;
}

/**
 * Red circlea round the record that shows how much time is left
 * by reducing it's arc degrees
 */
function drawTimeLeft() {
	let timeRemaining;
	if (!audio.paused) {
		timeRemaining = ((audioLength - audio.currentTime) / audioLength) * 360;
	}
	ctx.beginPath();
	ctx.arc(
		canvas.width - 500,
		centerY,
		200,
		0,
		(timeRemaining * (2 * Math.PI)) / 360
	);
	ctx.lineWidth = 7;
	ctx.strokeStyle = "#ff0000";
	ctx.stroke();
}

function drawRecordLine() {
	if (!audio.paused) {
		angle += 2;
	}
	/* lines on record */
	ctx.beginPath();
	ctx.moveTo(canvas.width - 500, centerY);
	ctx.lineTo(canvas.width - 300, canvas.height - 450);
	ctx.strokeStyle = "#ff0000";
	ctx.lineWidth = 1;
	ctx.stroke();
}

function drawInnerRecord() {
	/* center of record */
	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.arc(canvas.width - 500, centerY, 50, 0, 2 * Math.PI);
	ctx.fill();
}

function drawOuterRecord() {
	/* vinyl part of record */
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.arc(canvas.width - 500, centerY, 200, 0, 2 * Math.PI);
	ctx.fill();
}

function drawTimeUp() {
	// convert audio.currentTime into minutes and seconds
	const minutes = Math.floor(audio.currentTime / 60);
	const seconds = Math.floor(audio.currentTime - minutes * 60);
	// Draw the amount of time listened
	ctx.font = "18px serif";
	ctx.fillStyle = "#cccccc";
	ctx.fillText(
		`${minutes}:${seconds < 10 ? "0" + seconds : seconds}`,
		canvas.width - 400,
		100
	);
}

function drawAlbumInfo() {
	// Album Header
	ctx.font = "36px serif";
	ctx.fillStyle = "#ffffff";
	ctx.fillText("Album", 300, 100);

	// Album Name
	ctx.font = "18px serif";
	ctx.fillStyle = "#ffffff";
	ctx.fillText("Name", 300, 125);
}

function drawSongInfo() {
	// Song Header
	ctx.font = "48px serif";
	ctx.fillStyle = "#ffffff";
	ctx.fillText("Song", 300, canvas.height / 2 + 100);
	// Song Name
	ctx.font = "24px serif";
	ctx.fillStyle = "#ffffff";
	ctx.fillText("Name", 300, canvas.height / 2 + 125);
}

draw();
