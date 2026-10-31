/*
 * IDB Programming: A3 — a musical instrument
 *
 * All of the code for your instrument goes in this file. It's split into sections:
 *   settings — the "fixed" parts of your program
 *   state    — the parts of your program that change over time
 *   sound    — the Tone.js instruments and effects
 *   update   — updates the state every 100ms, if necessary
 *   use      — uses the state to make sound and shapes every 100ms, if necessary
 *   controls — what happens when the player uses the pointer
 *   setup    — starts everything
 *
 * The pointer events change the state. update() and use() each run every
 * 100ms, in a loop:
 *   1. update: change the state, e.g. based on time or on the pointer's movement
 *   2. use:    make sound and move shapes, based on the state
 *
 * Shapes come from shape.js: createShape() makes one, and its methods
 * (setPosition, setSize, setColour ...) change it.
 *
 * Tone.js documentation: https://tonejs.github.io/docs/15.1.22/
 */

import { createShape } from "./shape.js";

// ---------- Settings ----------
// Settings variables should contain all of the "fixed" parts of your programs

const settings = {
  squareSize: 150,
  maxSpeed: 10,
  //Maximum number of recent speed values
  //stored in the array


};

const circle = createShape();
  const square = createShape();
// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
//Parts of the program that change over time:
const state = {
  pointer: {
    x: 0,
    y: 0,
    //Previous position is stored so speed
    //can be calculated from movement over time
    previousX: 0,
    previousY: 0,
  },

  speed: 0,
  //Average speed is used instead of
  //current speed to create smoother sound
  averageSpeed: 0,
  //Total pointer movement
  totalDistance: 0,

  //Stores recent speed
  speeds: [],

  isDragging: false,
};









// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth = new Tone.PolySynth(Tone.Synth).toDestination(); // can play several notes at once: a sustained "drone" note and short "melody notes on top of it."
synth.volume.value = -6;//We start the volume at -60 decibels, which is effectively silent.
let audioStarted = false;
let dronePlaying = false;
const droneNote = "C3";



//Calculates an average speed from the stored speed values
function calculateAverageSpeed() {

  if (state.speeds.length === 0) {
    state.averageSpeed = 0;
    return;
  }

  let total = 0;
  //forEach() loops through every speed value in the array
  state.speeds.forEach((speed) => {
    total += speed;
  });

  state.averageSpeed = total / state.speeds.length;
}




// ---------- Update ----------
// Update the state. This is called every 100ms.
function update() {
  console.log("speed", state.averageSpeed);

  if (audioStarted) {



//Faster movement = louder volume
//Speed controls volume
//If speed is high, volume is 0 (loud). If speed is 0, volume is -20
let volume = -10 + state.averageSpeed * 20000;

volume = Math.min(volume, 0);
volume = Math.max(volume, -20);

synth.volume.rampTo(volume, 0.1);



//Start drone when moving
//passes a minimum threshold
if (state.averageSpeed > 0.0005 && !dronePlaying) {
  synth.triggerAttack(droneNote);
  dronePlaying = true;
}

//Stop drone when movement
//becomes very small
if (state.averageSpeed <= 0.0001 && dronePlaying) {
  synth.triggerRelease(droneNote)
  dronePlaying = false;
}

//Movement speed controls pitch
//Higher speed creates higher notes
 if (state.averageSpeed > 0.0001) {
  const frequency = 220 + state.averageSpeed * 40000;

  synth.triggerAttackRelease(frequency, "16n");
  }

  //Slowly reduce the speed value
  //when dragging stops to create a smoother fade-out effect
  if (!state.isDragging) {
    state.averageSpeed *= 0.9;
  }

 }

 setTimeout(update, 100); // call update() again in 100 milliseconds

}








// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.

function use() {
  if (!circle || !square) {
     requestAnimationFrame(use);
     return;
  }

//Circle grows with speed
  circle.setSize(100 + state.averageSpeed * 2000);

//Speed is converted into a hue value so dragging changes the circle colour
if (state.isDragging) {
const hue = Math.min(state.averageSpeed * 10000, 360);

circle.setColour(hue, 100, 50);
 }

 requestAnimationFrame(use);

}









// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
//Only record data, they do not calculate physics
function pointerDown(event) {

  Tone.start();

  audioStarted = true;

  state.isDragging = true;
}





function pointerUp() {
  //Stop the drag when the trackpad is released
  state.isDragging = false;
}


function pointerMove(event) {
  //Store previous position before updating
  state.pointer.previousX = state.pointer.x;

  state.pointer.previousY = state.pointer.y;

  state.pointer.x = event.clientX / window.innerWidth;
  state.pointer.y = event.clientY / window.innerHeight;

  //Distance formula used to calculate pointer movement speed
  const dx = state.pointer.x - state.pointer.previousX;
  const dy = state.pointer.y - state.pointer.previousY;

  state.speed = Math.hypot(dx, dy);
  state.totalDistance += state.speed;
  //Store speed values so the program can process movement over time
  state.speeds.push(state.speed);


  if (state.speeds.length > settings.maxSpeed) {
    state.speeds.shift();
  }

  calculateAverageSpeed();
  //Only move the circle while it is being dragged
  if (state.isDragging) {
    circle.setPosition(state.pointer.x, state.pointer.y);
  }
console.log(state.averageSpeed);

}
//Melody played when the square is clicked
const melody = ["C4", "E4", "G4", "C5"];

function playMelody () {
//forEach() plays every note in the melody array
  melody.forEach((note, index) => {

    synth.triggerAttackRelease(note, "8n", Tone.now() + index * 0.25);
  });
}



// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  //Circle
  //const circle = createShape();
  //const square = createShape();
//Square


circle.setSize(100);
circle.setRoundedness(1);
circle.setColour(320, 100, 50)
circle.setPosition(0.5, 0.5);

square.setSize(100)
square.setRoundedness(0);
square.setColour(200, 100, 50);
square.setPosition(0.2, 0.2);


  //Global listeners(Move and let go)
  //We listen on the window for pointerup so it stops gragging even if you let go off the shape
  window.addEventListener("pointermove", pointerMove);
  window.addEventListener("pointerup", pointerUp);

  //Shape-specific listeners (Grab and unlock audio)
  circle.element.addEventListener("pointerdown", pointerDown);
  //circle.element.addEventListener("click", handleCircleClick);
  square.element.addEventListener("pointerdown", playMelody);

  update(); // start the update loop
  use(); // start the use loop

}

setup(); // Always remember to call setup()!

