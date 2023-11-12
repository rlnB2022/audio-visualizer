// create the canvas and get the 2d context
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

// set the initial canvas height and width
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// set center of canvas
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;

// varialbes for data frequencies, audio controls, etc.
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

// setup the context and splitter
const context = new AudioContext();
const splitter = context.createChannelSplitter();

// create the analyser
const analyserL = context.createAnalyser();
const analyserR = context.createAnalyser();

// setup values for frequency samples
analyserL.fftSize = 8192;
analyserR.fftSize = 8192;

// connect the splitter
splitter.connect(analyserL, 0, 0);
splitter.connect(analyserR, 1, 0);

// setup the frequencyBinCount (number of data points)
const bufferLengthL = analyserL.frequencyBinCount;
const bufferLengthR = analyserR.frequencyBinCount;

const audioDataArrayL = new Uint8Array(bufferLengthL);
const audioDataArrayR = new Uint8Array(bufferLengthR);

// create the audio and the source
const audio = new Audio();
const source = context.createMediaElementSource(audio);

/**
 * Loads the audio, sets the duration, and tells the system it's ready to run when fully loaded
 * @param {String} fileName
 */
function loadAudio(fileName) {
	audio.loop = false;
	audio.autoplay = false;
	audio.crossOrigin = "anonymous";

	audio.src = URL.createObjectURL(fileName);
	audio.load();
	audio.addEventListener("loadeddata", () => {
		audioLength = audio.duration;
		audioLoaded = true;
		source.connect(splitter);
		splitter.connect(context.destination);
	});
	running = true;
}

/**
 * Method that simply changes between play and paused states
 */
function toggleAudio() {
	if (audio.paused) {
		audio.play();
	} else {
		audio.pause();
	}
}

/**
 * Get user input by clicking on the canvas triggers the audio to play or pause
 */
canvas.addEventListener("click", () => {
	if (audioLoaded) {
		context.resume().then(() => {
			toggleAudio();
		});
	}
});

/**
 * get the values of each frequency
 * get the averageFreq for RGB background color values
 */
function update() {
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

/**
 * Method to draw onto the canvas
 */
function draw() {
	requestAnimationFrame(draw);

	if (running) {
		update();
	}

	ctx.save();
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	ctx.restore();
	ctx.save();
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	/********* DRAWING SPINNING RECORD *******/
	if (!audio.paused) {
		newTime = audio.currentTime;
	}
	drawArtistInfo();
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

	// draw center message to play or pause
	drawPlayOrPause();
}

/**
 * Method to display either Play or Pause
 */
function drawPlayOrPause() {
	if (audioLoaded) {
		const text = audio.paused ? "Click to Play!" : "Click to Pause!";
		ctx.font = "36px serif";
		ctx.fillText(text, canvas.width - 590, centerY + 130);
	}
}

/**
 * Method to draw the lines of colors that surround the spinning record!
 */
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
 * Method to draw the Red circle around the record that shows how much time is left
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

/**
 * Method to draw the red line that goes in circles to represent a spinning record
 */
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

/**
 * Method to draw the white circle at the center of the record
 */
function drawInnerRecord() {
	/* center of record */
	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.arc(canvas.width - 500, centerY, 50, 0, 2 * Math.PI);
	ctx.fill();
}

/**
 * Method to draw the black part of the record
 */
function drawOuterRecord() {
	/* vinyl part of record */
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.arc(canvas.width - 500, centerY, 200, 0, 2 * Math.PI);
	ctx.fill();
}

/**
 * Method to draw the amount of time that has expired when playing the song.
 */
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

/**
 * Method to draw the Artist header and name
 */
function drawArtistInfo() {
	// Album Header
	ctx.font = "36px serif";
	ctx.fillStyle = "#ffffff";
	ctx.fillText("Artist", 300, 100);

	// Album Name
	ctx.font = "18px serif";
	ctx.fillStyle = "#ffffff";
	ctx.fillText(artistName, 300, 125);
}

/**
 * Method to draw the Song header and name
 */
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

/**
 * Change listener - when user clicks the Choose a Song button
 * a file picker will display
 * Once a file is chosen, the file will be loaded for audio
 * and the jsmediatags library will parse the tags.
 * We will then get the artist and song names so they can be displayed
 */
const inputFile = document.querySelector("input[type=file]");
inputFile.addEventListener("change", (event) => {
	let music = document.querySelector("input[type=file]").files[0];
	let tempFile = event.target.files[0];
	jsmediatags.read(tempFile, {
		onSuccess: function (tag) {
			artistName = tag.tags.artist;
			songName = tag.tags.title;
		},
		onError: function (error) {
			console.log(error);
		},
	});
	loadAudio(music);
});

document.body.addEventListener("touchend", function (ev) {
	context.resume().then(() => {
		toggleAudio();
	});
});

draw();
