// create the canvas and get the 2d context
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

// set the canvas height and width
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight - 15;

let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let running = false;
let audioLoaded = false;
let rectLY = [];
let rectRY = [];
let angle = 0;
let audioLength = 0;
let averageFreq = [0, 0, 0]; // RGB

// media tags
let jsmediatags = window.jsmediatags;
let artistName = "";
let songName = "";

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

const source = context.createMediaElementSource(audio);

function loadAudio(fileName) {
	audio.loop = false;
	audio.autoplay = false;
	audio.crossOrigin = "anonymous";

	audio.src = URL.createObjectURL(fileName);
	audio.load();
	audio.addEventListener("canplay", handleCanplay);
	audio.addEventListener("loadeddata", () => {
		audioLength = audio.duration;
		audioLoaded = true;
		source.connect(splitter);
		splitter.connect(context.destination);
	});
	running = true;
}

function handleCanplay() {
	if (audioLoaded) {
		// connect the audio element to the analyser node and the analyser node
		// to the main Web Audio context
	}
}

function toggleAudio() {
	if (audio.paused) {
		audio.play();
	} else {
		audio.pause();
	}
}

canvas.addEventListener("click", () => {
	if (audioLoaded) {
		context.resume().then(() => {
			toggleAudio();
		});
	}
});

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
	averageFreq = [0, 0, 0];

	// get the current audio data
	analyserL.getByteFrequencyData(audioDataArrayL);
	analyserR.getByteFrequencyData(audioDataArrayR);

	// get the audio data and make it go from 0 to 1
	for (let i = 0; i < 255; i++) {
		audioValueLY = audioDataArrayL[i] / 255;
		audioValueRY = audioDataArrayL[i] / 255;

		rectLY[i] = audioValueLY * canvas.height;
		rectRY[i] = audioValueRY * canvas.height;

		if (i < 85.3) {
			averageFreq[0] += audioValueLY * 2;
		} else if (i > 85.3 && i < 170.66) {
			averageFreq[1] += audioValueLY * 2;
		} else {
			averageFreq[2] += audioValueLY * 2;
		}
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
	if (!audio.paused) {
		drawRecordVisualizer();
	}
	drawTimeLeft();
	drawOuterRecord();
	drawRecordLine();
	drawInnerRecord();
	oldTime = audio.currentTime;

	// draw BG colors
	const bgColor = document.querySelector(".bg-color");
	bgColor.style.backgroundColor = `rgba(${Math.floor(
		averageFreq[0]
	)}, ${Math.floor(averageFreq[1])}, ${Math.floor(averageFreq[2])}, .3)`;
}

function drawRecordVisualizer() {
	for (let i = 0; i < 255; i++) {
		let ada = audioDataArrayL[i] / 255;
		const angle = (i / 255) * 2 * Math.PI;
		const x = canvas.width - 500 + (0.56 + ada * 0.3) * 360 * Math.cos(angle);
		const y = centerY + (0.56 + ada * 0.3) * 360 * Math.sin(angle);

		ctx.beginPath();
		ctx.moveTo(canvas.width - 500, centerY);
		ctx.lineTo(x, y);
		ctx.lineWidth = 5;
		ctx.lineCap = "round";

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
			ctx.strokeStyle = "#00000000";
		}
		ctx.stroke();
	}
}

/**
 * Red circlea round the record that shows how much time is left
 * by reducing it's arc degrees
 */
function drawTimeLeft() {
	let timeRemaining;
	timeRemaining = ((audioLength - audio.currentTime) / audioLength) * 360;
	ctx.beginPath();
	ctx.arc(
		canvas.width - 500,
		centerY,
		200,
		0,
		(timeRemaining * (2 * Math.PI)) / 360
	);
	ctx.lineWidth = 10;
	ctx.strokeStyle = "#ff0000";
	ctx.stroke();
}

function drawRecordLine() {
	if (!audio.paused) {
		angle += 2;
	}
	/* line on record */
	ctx.translate(canvas.width - 500, centerY);
	ctx.rotate((Math.PI / 180) * angle);
	ctx.translate(-(canvas.width - 500), -centerY);
	ctx.beginPath();
	ctx.moveTo(canvas.width - 500, centerY);
	ctx.lineTo(canvas.width - 300, canvas.height - 450);
	ctx.strokeStyle = "#ff0000";
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.restore();
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
	ctx.fillText("Artist", 300, 100);

	// Album Name
	ctx.font = "18px serif";
	ctx.fillStyle = "#ffffff";
	ctx.fillText(artistName, 300, 125);
}

function drawSongInfo() {
	// Song Header
	ctx.font = "48px serif";
	ctx.fillStyle = "#ffffff";
	ctx.fillText("Song", 300, canvas.height / 2 + 100);
	// Song Name
	ctx.font = "24px serif";
	ctx.fillStyle = "#ffffff";
	ctx.fillText(songName, 300, canvas.height / 2 + 125);
}

draw();

const inputFile = document.querySelector("input[type=file]");
inputFile.addEventListener("change", (event) => {
	let music = document.querySelector("input[type=file]").files[0];
	let tempFile = event.target.files[0];
	jsmediatags.read(tempFile, {
		onSuccess: function (tag) {
			console.log(tag.tags);
			artistName = tag.tags.artist;
			songName = tag.tags.title;
		},
		onError: function (error) {
			console.log(error);
		},
	});
	loadAudio(music);
	// get the name, artist and album name
});
