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

let speeds = [];//Tracks recent speeds for the avarage

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

//Add to total distance (for brightness)
totalDistance += distance;

speeds.push(currentSpeed);

//Calculate rotation (for pitch and melody)
let angle = Math.atan2(pointerY - centerY, pointerX - centerX) * (180 / Math.PI);
let angleDelta = angle - currentAngle;

//Hnadle the jump when crossing 180 to -180 degrees
if (angleDelta > 180) angleDelta -= 360;
if (angleDelta < -180) angleDelta += 360;

totalRotation += angleDelta;
currentAngle = angle;

//Store current position for the next move?
lastPointerX = pointerX;
lastPointerY = pointerY;


 setTimeout(update, 100); // call update() again in 100 milliseconds
}



function forgetOldest() {
  if (speeds.length > 0) {
    speeds.shift();//Remove the oldest speed
  }
}



function useAverage() {
  let total = 0;
  for (let i=0; i < speeds.length; i++) {
    total = total + speeds[i];
  }
  let average = 0;
  if (speeds.length > 0) {
    average = total / speeds.length;
  }

  return average;//Instead of directly setting detune here, we return the average, so the use() loop can decide what to do with it.
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.

function use() {
  if (shape) {
//1. Get the average speed
let averageSpeed = useAverage();

 //2. Volume: Use averageSpeed instead of currentSpeed
    let volume = -60 + (averageSpeed/ maxSpeed) * 60;
  if (volume > 0) volume = 0;
  if (averageSpeed < 0.001) volume = -60;
  synth.volume.rampTo(volume, 0.1);


  //3.Color: Further = Brighter
  let brightness = Math.min(totalDistance * brightnessScale, 225);
  shape.setColour(brightness, 50, brightness);


  //4.Pitch & Melody
  if (averageSpeed > 0.005) {

    //Pitch Control
    //If moving counter-clockwise, play a higher drone note.
    //If moving clockwise, plat the normal drone note.
  if (totalRotation <= 0) {
    //To go higher, we release C3 and play C4 (one octave up)
    synth.triggerRelease("C3");
    synth.triggerAttack("C4");
  } else {
    //Clockwise: revert back to normal note
    synth.triggerRelease("C4");
    synth.triggerAttack("C3");

  }


  //Melody control
  //Only play the melody if moving clockwise
    if (totalRotation > 0 && totalRotation > 360) {
      totalRotation -= 360;

      for (let i = 0; i < melody.length; i++) {
       if (i === melodyIndex) {
        if (i === melody.length - 1) {
          melodyIndex = 0;
        } else {
          melodyIndex = i + 1;
        }
        synth.triggerAttackRelease(melody[melodyIndex], "8n");
        break;//Exit the loop once the note is played
       }
     } //else {
      //synth.detune.value = 0;
    }



//Drone control(Start/stop background sound)

    if (currentSpeed > 0.001 && !isDronePlaying) {
      synth.triggerAttack(droneNote);
      isDronePlaying = true;
    }  else if (currentSpeed <= 0.001 && isDronePlaying) {
      synth.triggerRelease(droneNote);
      isDronePlaying = false;
    }
   }
 }


  setTimeout(forgetOldest, 500);//This ensures speeds only stay in the array for 500ms

  setTimeout(use, 100); // call use() again in 100 milliseconds, loop

}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function pointerDown(event) {
  Tone.start(); // browsers only allow sound after the player has pressed something

  //console.log("Pointer down at", event.clientX, event.clientY);
  //synth.triggerAttackRelease(note, "8n"); // play the note for an eighth note
}


function pointerMove(event) {
  //Record position so the udate loop can do the math
  pointerX = event.clientX / window.innerWidth;
  pointerY = event.clientY / window.innerHeight;
}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {

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

update(); // start the update loop
  use(); // start the use loop

}

setup(); // Always remember to call setup()!

