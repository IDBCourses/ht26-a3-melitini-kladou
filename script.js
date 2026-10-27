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
// For example: which notes you can play, how fast things move, the tempo.
//const droneNote = "C3"; // the note USED
const melody = ["C4", "D4", "E4", "G4", "A4", "C5"];//The melody the orb will play when you spin it clockwise
const maxSpeed = 0.015;//The speed required to reach maximum volume (0 dB)

//The centre of the screen, used to calculate angles for rotation
const centerX = 0.5;
const centerY = 0.5;

const brightnessScale = 200;//How much to multiply total distance by to get the color brightness

const droneNote = "C3";//The note used for the background drone
// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
//Parts of the program that change over time:
let shape;//The energy ob

//Pointer tracking
let pointerX = centerX;
let pointerY = centerY;
let lastPointerX = centerX;
let lastPointerY = centerY;


//Physics & Sound tracking
let currentSpeed = 0;
let totalDistance = 0;
let totalRotation = 0;
let currentAngle = 0;
let melodyIndex = 0;
let isDronePlaying = 0;


// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth = new Tone.PolySynth(Tone.Synth).toDestination(); // can play several notes at once: a sustained "drone" note and short "melody notes on top of it."
synth.volume.value = -60;//We start the volume at -60 decibels, which is effectively silent.


// ---------- Update ----------
// Update the state. This is called every 100ms.Calculates the math based on pointer position
function update() {
  let dx = pointerX - lastPointerX;
  let dy = pointerY - lastPointerY;
  let distance = Math.hypot(dx, dy);

  //Update current speed
  currentSpeed = distance;

  //Add total distance(for brightness)
  totalDistance += distance;

  //Calculate rotation (for pitch and melody)
  let angle = Math.atan2(pointerY - centerY, pointerX - centerX) * (180 / Math.PI);
  let angleDelta = angle - currentAngle;

  //Handle the jump when crossing 180 to -180 degrees
  if (angleDelta > 180) angleDelta -= 360;
  if (angleDelta < -180) angleDelta += 360;

  totalRotation += angleDelta;
  currentAngle = angle;

  //Store curent position fot the next move?
  lastPointerX = pointerX;
  lastPointerY = pointerY;

 setTimeout(update, 100); // call update() again in 100 milliseconds
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.

function use() {
  setTimeout(use, 100); // call use() again in 100 milliseconds
}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function pointerDown(event) {
  Tone.start(); // browsers only allow sound after the player has pressed something

  console.log("Pointer down at", event.clientX, event.clientY);
  synth.triggerAttackRelease(note, "8n"); // play the note for an eighth note
}


function pointerMove(event) {
  //Record position so the udate loop can do the math
  pointerX = event.clientX / window.innerWidth;
  pointerY = event.clientY / window.innerHeight;
}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  update(); // start the update loop
  use(); // start the use loop

  //Create the energy Orb
  shape = createShape("energy-orb");
  shape.setSize(250);
  shape.setPosition(centerX, centerY);
  shape.setColour(0, 50, 0);//Start dark

  // Example: a shape near the middle of the window. Replace it with your own.
  //const example = createShape("example");
  //example.setPosition(0.5, 0.5);

  // Put your event listener code here
  window.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointermove", pointerMove);
}

setup(); // Always remember to call setup()!
