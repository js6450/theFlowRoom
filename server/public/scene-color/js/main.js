"use strict";

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


const FLOW_PARTICLES_SPACING = 80;
const FLOOR_PARTICLES_SPACING = 80;

const WORLD_WIDTH = 1600;
const WORLD_DEPTH = 1600;
const WORLD_HEIGHT = FLOW_PARTICLES_SPACING * 11;

const BODY_JOINTS_MAX = 21;
const DEPTH_SCALING = -1.0;

const BODY_POS_OFFSET_X = -(512 * 0.5);
const BODY_POS_OFFSET_Y = -(424 * 0.5);
// const BODY_POS_OFFSET_Z = -(500 * 0.5);

const FLOW_PARTICLES_MAX = (WORLD_WIDTH/FLOW_PARTICLES_SPACING) * (WORLD_HEIGHT/FLOW_PARTICLES_SPACING) * (WORLD_DEPTH/FLOW_PARTICLES_SPACING);
const FLOOR_PARTICLES_MAX = (WORLD_WIDTH/FLOOR_PARTICLES_SPACING) * (WORLD_DEPTH/FLOOR_PARTICLES_SPACING);

// CAMERA
const CAMERA_DISTANCE_MAX = WORLD_WIDTH - 500;
const CAMERA_DISTANCE_MIN = 10;

console.log("! Flow Particles: " + FLOW_PARTICLES_MAX);
console.log("! Floor Particles: " + FLOOR_PARTICLES_MAX);

const INTERACTION_DISTANCE = 100;


// Network
let socket = io();
// let receivedData = 0; //?
let requestFrame = 10;
let pingTime = 0;
let responseTime = 0;

// three.js main
let container, stats;
let camera, scene, renderer;
let geometry, material;

// Loaders
let fontLoader, textureLoader;

let perlin = new ImprovedNoise();
let frameCount = 0;
let time = 0;


// MAIN OBJECTS
let bodies = [];
let flow = [];
let floorMeshes = [];

// TEXTURES
let flowTexture, floorTexture, bodyTexture;

// MATERIALS
let flowParticleMaterial;
let bodyShaderMaterial;

// BODY POINT CLOUD
let instanceObjs;
let instanceIndex = 0;
let instanceOffsetAttribute;
let instanceColorAttribute;
let instanceLastTimeAttribute;
let instanceScaleAttribute;
let instanceScatterSpeedAttribute;


// JSON Data
let bodyDataObjs = [];
let allData = [];
let allDataIndex = 0;
let allDataIndexDirection = -1;
const allDataMax = 5;

// Global lights
let pointLight;





// main funtions

window.onload = function() {

	preload();

};



function preload() {
	preloadShaders();

	// loadJSON(function(response) {
	// 	// Parse JSON string into object
	// 	bodyDataJSON = JSON.parse(response);
	// 	// load others
	// });
}







function init() {
	// SOCKET
	socket.emit('status', 1);
	socket.on('sendData', onSendData);
	//socket.on('statusChange', onStatusChange);

	// THREE.JS
	setupThreeObjects();
	createFlow();
	createFloor();
	createBodyPointCloud();

	// other
	stats = new Stats();
	stats.showPanel(0);
	container.appendChild( stats.dom );
	window.addEventListener( 'resize', onWindowResize, false );

	animate();
}



function animate() {
	time = performance.now();
	frameCount++;

	requestAnimationFrame( animate );

	render();

	stats.update();
	ui.requestRate = requestFrame;
}




function render() {

	updateCameraPosition();
	updateGlobalLight();

	if(frameCount % requestFrame == 0){
		socket.emit('requestData');
	}
	//console.log(receivedData);
	if(performance.now() - pingTime > 50 * requestFrame){
		//newData = [];
		allData = [];
	}

	updateBodyData();
	updateBodies();
	updateFlow();
	updateFloor();

	renderer.render( scene, camera );
}



// BROWSER FUNCTIONS

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}



// SOCKET

function onSendData(data){

	responseTime = performance.now() - pingTime;
	pingTime = performance.now();

	//console.log(responseTime);

	let newData = [];

	//console.log("length of received data" + data.length);

	if ( data != null ){
		for ( let i = 0 ; i < data.length; i++) {
			newData[i] = JSON.parse(data[i]);
		}
	}


	allData.push( newData );
	if (allData.length == allDataMax ) {
		allData.splice(0, 1);
	}
	allDataIndex = allData.length - 1;
	allDataIndexDirection = -1;

	// console.log(" length of saved data " + newData.length);

}

// function onStatusChange(data){
// 	console.log("! Device index " + data + " disconnected");
//
// 	newData.splice(data, 1);
//
// 	socket.emit('dataCleared', 1);
// }



// MANUAL FRAMERATE CONTROL

document.addEventListener('keydown', onDocumentKeyDown, false);
function onDocumentKeyDown(event) {

	let key = event.key.toUpperCase();

	if(key == "="){
		requestFrame++;
		console.log("! requestFrame increased to : " + requestFrame);
	}

	if(key == "-"){
		if(requestFrame > 1){
			requestFrame--;
			console.log("! requestFrame decreased to : " + requestFrame);
		}
	}

  if (key == " ") {
    dat.GUI.toggleHide();
		guiToggle ? stats.showPanel(0) : stats.showPanel(-1);
		guiToggle = !guiToggle;
  }

	if (key == "B") {
    initBGM()
  }

  if (key > 0 && key < 10) {
    let index = parseInt(key);
    soundwaves[key].play();
    console.log( "! Audio[" + index + "]"+ soundwaveFilenames[index]+" played" );
  }

}
