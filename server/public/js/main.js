"use strict";


if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


const FLOW_PARTICLES_SPACING = 80;
const FLOOR_PARTICLES_SPACING = 80;

const WORLD_WIDTH = 1600;
const WORLD_DEPTH = 1600;
const WORLD_HEIGHT = FLOW_PARTICLES_SPACING * 12;

const BODY_JOINTS_MAX = 21;
// const BODY_PARTICLES_MAX = 610; // TODO: improve this.
const DEPTH_SCALING = -1.0;

const BODY_POS_OFFSET_X = -(512 * 0.5);
const BODY_POS_OFFSET_Y = -(424 * 0.5);
// const BODY_POS_OFFSET_Z = -(500 * 0.5);

// const MAX_OF_BODIES = 5;
// const BODY_EFFECT_PARTICLES_MAX = BODY_PARTICLES_MAX * MAX_OF_BODIES * 2;

const FLOW_PARTICLES_MAX = (WORLD_WIDTH/FLOW_PARTICLES_SPACING) * (WORLD_HEIGHT/FLOW_PARTICLES_SPACING) * (WORLD_DEPTH/FLOW_PARTICLES_SPACING);
const FLOOR_PARTICLES_MAX = (WORLD_WIDTH/FLOOR_PARTICLES_SPACING) * (WORLD_DEPTH/FLOOR_PARTICLES_SPACING);

// CAMERA
const CAMERA_DISTANCE_MAX = WORLD_WIDTH - 500;
const CAMERA_DISTANCE_MIN = 10;

console.log("! Flow Particles: " + FLOW_PARTICLES_MAX);
console.log("! Floor Particles: " + FLOOR_PARTICLES_MAX);


var socket = io();
let requestFrame = 1;


// three.js main
var container, stats;
var camera, scene, renderer;
var geometry, material;

// Loaders
let fontLoader, textureLoader;

var perlin = new ImprovedNoise();
var frameCount = 0;
var time = 0;



var flow = [];
var floorMeshes = [];

// BODIES
var bodies = [];

// TEXTURES
var flowTexture, floorTexture, bodyTexture;

// MATERIALS
var flowParticleMaterial;
var bodyShaderMaterial;

// BODY POINT CLOUD
var instanceObjs;
var instanceIndex = 0;
var instanceOffsetAttribute;
var instanceColorAttribute;
var instanceLastTimeAttribute;
var instanceScaleAttribute;
var instanceScatterSpeedAttribute;


// TEST
var curveLine;
var curveExtrude;
var extrudeShape;


// JSON Data
var newData = [];
var bodyDataObjs = [];


// Global lights
var pointLight;


// GUI
/*
var params = {
	pointLightColor: "#2711ca",
	pointLightDistance: 800
};

var gui = new dat.gui.GUI();
gui.addColor(params, 'pointLightColor').onChange(function (e) {
	pointLight.color = new THREE.Color(e);
});
gui.add(params, 'pointLightDistance', 0, WORLD_WIDTH).onChange(function (e) {
	pointLight.distance = e;
});
*/





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



function preloadShaders() {
	var sl = new ShaderLoader();
	sl.loadShaders({
		particle_vert : "",
		particle_frag : "",
		flowParticle_vert : "",
		flowParticle_frag : "",
		instance_vert : "",
		instance_frag : "",
	}, "glsl/", init );

}



function init() {

	// SOCKET
	socket.emit('status', 1);
	socket.on('sendData', onSendData);
	socket.on('statusChange', onStatusChange);



	// THREE.JS

	container = document.getElementById( 'container' );

	fontLoader = new THREE.FontLoader();
	textureLoader = new THREE.TextureLoader();



	// TEXTURES

	floorTexture = textureLoader.load( "img/texture_dots.jpg" );
	floorTexture.wrapS = THREE.RepeatWrapping;
	floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set( 6, 6 );

	flowTexture = textureLoader.load( "img/texture_dots.jpg" );
	flowTexture.wrapS = THREE.RepeatWrapping; //MirroredRepeatWrapping;
	flowTexture.wrapT = THREE.RepeatWrapping; //MirroredRepeatWrapping;
	flowTexture.repeat.set( 10, 10 );

	bodyTexture = textureLoader.load( "img/texture_flow.jpg" );
	bodyTexture.wrapS = THREE.MirroredRepeatWrapping;
	bodyTexture.wrapT = THREE.MirroredRepeatWrapping;
	bodyTexture.repeat.set( 2, 2 );


	// SHADERS

	let uniforms = {
		texture:   { value: textureLoader.load( "img/particle_sprite.png" ) }
	};
	bodyShaderMaterial = new THREE.ShaderMaterial( {
		uniforms:       uniforms,
		vertexShader:   ShaderLoader.get( "particle_vert" ),
		fragmentShader: ShaderLoader.get( "particle_frag" ),
		blending:       THREE.AdditiveBlending,
		depthTest:      false,
		transparent:    true,
		vertexColors:   true
	} );



	// SCENE

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x000000, 100, 2500 );



	// CAMERA

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 10, 20000 );
	camera.position.z = CAMERA_DISTANCE_MAX;



	// CONTROLS

	let controls = new THREE.OrbitControls( camera, container );
	//controls.addEventListener( 'change', render ); // remove when using animation loop
	// enable animation loop when using damping or autorotation
	//controls.enableDamping = true;
	//controls.dampingFactor = 0.25;
	//controls.enableZoom = false;



	// RENDERER

	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setClearColor( scene.fog.color );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	// TODO:
	// I don't know the reason yet
	// but if we don't have these gammaI&O we can't really see the box helper.
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	container.appendChild( renderer.domElement );



	// HELPERS

	let helper = new THREE.BoxHelper( new THREE.Mesh( new THREE.BoxGeometry( WORLD_WIDTH, WORLD_HEIGHT, WORLD_DEPTH ) ) );
	helper.material.color.setHex( 0x080808 );
	helper.material.blending = THREE.AdditiveBlending;
	helper.material.transparent = true;
	// scene.add( helper );



	// THREE OBJECTS


	// ambient lighting
	let ambiColor = "#000309";
	let ambientLight = new THREE.AmbientLight(ambiColor);
	scene.add(ambientLight);

	// point lighting
	let pointColor = "#2711ca";
	pointLight = new THREE.PointLight(pointColor);
	pointLight.distance = 1000;
	scene.add(pointLight);

	// point lighting2
	// let color = "#ffffff";
	// let light1 = new THREE.PointLight(color);
	// light1.distance = 100000;
	// light1.position.y = 1000;
	// scene.add(light1);


	// Ground plane
	/*
	let planeGeometry = new THREE.PlaneGeometry(WORLD_WIDTH*20, WORLD_DEPTH*20, 100, 100);


	for( let i = 0; i < planeGeometry.vertices.length; i ++) {
		planeGeometry.vertices[i].z = Math.random() * 200;
	}


	//let planeMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
	let planeMaterial = new THREE.MeshPhysicalMaterial( {
		color: 0xffffff,
		emissive : 0x000011,
		//roughness : 0.5,
		//metalness : 0.5,
		reflectivity : 0.0,
		//side : THREE.DoubleSide,
		// transparent : true,
		// opacity: 0.2,
		flatShading : true,
		//wireframe : true,
		// map : floorTexture
	} );


	let plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.receiveShadow = true;
	plane.rotation.x = -0.5 * Math.PI;
	plane.position.x = 0;
	plane.position.y = -WORLD_HEIGHT/2;
	plane.position.z = 0;
	scene.add(plane);
	*/


	// FLOW
	createFlow();
	createFloor();
	// BODY POINT CLOUD
	createBodyPointCloud();


	// other
	stats = new Stats();
	container.appendChild( stats.dom );
	window.addEventListener( 'resize', onWindowResize, false );

	animate();
}



function animate() {
	time = performance.now();

	frameCount ++;

	requestAnimationFrame( animate );

	render();

	stats.update();
}



function render() {

	updateCameraPosition();
	updateGlobalLight();

	if(frameCount % requestFrame == 0){
        socket.emit('requestData');
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

	if ( data != null ){
		for ( let i = 0 ; i < data.length; i++) {
			newData[i] = JSON.parse(data[i]);
		}
	}

}

function onStatusChange(data){
	console.log("! Device index " + data + " disconnected");

	newData.splice(data, 1);

	socket.emit('dataCleared', 1);
}


document.addEventListener('keydown', onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
	if(event.key == "="){
		requestFrame++;

		console.log("! requestFrame increased to : " + requestFrame);
	}

	if(event.key == "-"){
		if(requestFrame > 1){
			requestFrame--;

            console.log("! requestFrame decreased to : " + requestFrame);
        }
	}
}