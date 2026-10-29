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

const melody = ["C4", "D4", "E4", "G4", "A4", "C5"];//The melody the orb will play when you spin it clockwise

//The centre of the screen, used to calculate angles for rotation

const startX = 0.5;
const startY = 0.5;

const droneNote = "C3";
// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
//Parts of the program that change over time:
let circle;//The energy ob


//Pointer tstate
let pointerX = startX;
let pointerY = startY;

let previousPointerX = startX;
let previousPointerY = startY;

let isDragging = false;

let movementSpeed = 0;
let totalDistanceTravelled = 0;

let melodyIsPlaying = false;
let droneIsPlaying = false;



// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth = new Tone.PolySynth(Tone.Synth).toDestination(); // can play several notes at once: a sustained "drone" note and short "melody notes on top of it."
synth.volume.value = -60;//We start the volume at -60 decibels, which is effectively silent.



function playMelody() {
  if (!melodyIsPlaying) {
    return;
  }

  for (let i = 0; i < melody.length; i++) {
    if (melody[i] === "rest") {
      continue;
    }
    synth.triggerAttackRelease(melody[i], "8n", Tone.now() + i * 0.4);
  }

  setTimeout(playMelody, 3000);
}


// ---------- Update ----------
// Update the state. This is called every 100ms.Calculates the math based on pointer position
function update() {
  if (!circle) {
    setTimeout(update, 16);
    return;
  }

//Speed controls volume
//If speed is high, volume is 0 (loud). If speed is 0, volume is -60 (silent)
let volume = -60 + movementSpeed * 100;
if (volume > 0) {
  volume = 0;
}

if (volume < -60) {
  volume = -60;
}

synth.volume.rampTo(volume, 0.1);

//Start drone when moving
if (movementSpeed > 0.05 && !droneIsPlaying) {
  synth.triggerAttack(droneNote);
  droneIsPlaying = true;
}

//Stop drone when still
if (movementSpeed <= 0.05 && droneIsPlaying) {
  synth.triggerRelease(droneNote);
  droneIsPlaying = false;
 }


 //Distance controls size
 let size = 100 + totalDistanceTravelled * 300;

 if (size > 250) {
  size = 250;
 }

 circle.setSize(size);


 //Gradually fade movement
 movementSpeed *= 0.9;

 totalDistanceTravelled *= 0.0995



 setTimeout(update, 16); // call update() again in 16 milliseconds
}









// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.

function use() {
  if (shape) {
//1. Get the average speed
//let averageSpeed = useAverage();

 //1. Volume: Use averageSpeed instead of currentSpeed
    let volume = -60 //+ (averageSpeed/ maxSpeed) * 60;



    if (averageSpeed > 0 && maxSpeed > 0) {
      volume = -60 + (averageSpeed / maxSpeed) * 60;
    }
    if (volume > 0) volume = 0;
    if (volume < -60) volume = -60;

    synth.volume.rampTo(volume, 0.1);


  //2.Color: Further = Brighter
  //If dragging, base color on distance from center.If not, base on total movement.
   let brightness = Math.min(totalDistance * 200, 200);
  if (isDragging){
  let distanceFromCenter = Math.hypot(pointerX - centerX, pointerY - centerY);
  brightness = Math.min(distanceFromCenter * 500, 200);
 } else {
  brightness = Math.min(totalDistance * 200, 200);
 }
 shape.setColour(brightness + 55, 50, brightness + 55);//Glowing pink/purple

  //3.Drone sound
  if (averageSpeed > 0.001 && !isDronePlaying) {
    synth.triggerAttack(droneNote);
    isDronePlaying = true;
  } else if (averageSpeed <- 0.001 && isDronePlaying) {
    synth.triggerRelease(droneNote);
    isDronePlaying = false;
  }

     //Pitch Control
    //If moving counter-clockwise, play a higher drone note.
    //If moving clockwise, plat the normal drone note.
    if (averageSpeed > 0.005) {

  if (totalRotation <= 0) {
    //To go higher, we release C3 and play C4 (one octave up)
    synth.triggerRelease("C3");
    synth.triggerAttack("C4");
  } else {
    //Clockwise: revert back to normal note
    synth.triggerRelease("C4");
    synth.triggerAttack("C3");

  }
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

     }

    }

//Clean up old speeds
if (speeds.length > 5) speeds.shift();

setTimeout(use, 100); // call use() again in 100 milliseconds, loop

 }
}



// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
//Only record data, they do not calculate physics
function pointerDown(event) {

  Tone.start();

   isDragging = true;


//Record exactly where we clicked relative to the center
  pointerX = event.clientX / window.innerWidth;
  pointerY = event.clientY / window.innerHeight;
}



function pointerUp() {
  //Stop the drag when the trackpad is released
  isDragging = false;
}


function pointerMove(event) {
  //Record pointer positions
  pointerX = event.clientX / window.innerWidth;
  pointerY = event.clientY / window.innerHeight;

  //If dragging, move the shape
  if (isDragging) {
    shape.setPosition(pointerX, pointerY);
  }


  //Calculate distance and speed
  const changeX = pointerX - previousPointerX;
  const changeY = pointerY - previousPointerY;
  const distanceMoved = Math.hypot(changeX, changeY);

  movementSpeed = distanceMoved * 10;
  totalDistanceTravelled += distanceMoved;



  previousPointerX = pointerX;
  previousPointerY = pointerY;


}



function handleCircleClick() {

  Tone.start();

  melodyIsPlaying = !melodyIsPlaying;

  if (melodyIsPlaying) {
    playMelody();
  }
}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  console.log("setup running");

 //Create the energy Orb
  circle = createShape("circle");

  circle.setSize(100);
  circle.setPosition(startX, startY);
  circle.setColour(255, 100, 255);//pink

  //Global listeners(Move and let go)
  //We listen on the window for pointerup so it stops gragging even if you let go off the shape
  window.addEventListener("pointermove", pointerMove);
  window.addEventListener("pointerup", pointerUp);

  //Shape-specific listeners (Grab and unlock audio)
  circle.element.addEventListener("pointerdown", pointerDown);
  circle.element.addEventListener("click", handleCircleClick);

  update(); // start the update loop
  //use(); // start the use loop

}

setup(); // Always remember to call setup()!

