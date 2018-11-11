// SKELETON INDEX
const BODY = {
	CHEST : 1,
	HEAD : 3,
	HAND_LEFT : 7,
	HAND_RIGHT : 11,
	ANKLE_LEFT : 14,
	FOOT_LEFT : 15,
	ANKLE_RIGHT : 18,
	FOOT_RIGHT : 19
}

function createBody( id ) {
	let body = new Body( id );

	// POSITION
	body.position = new THREE.Vector3(
		Math.random() * 2000 - 1000,
		-300,
		Math.random() * -1000 - 300
	);

	// SCALE
	body.scale = 0.5 + Math.random() * 2.0;

	// LIGHT
	let hue = Math.floor(Math.random() * 360);
	body.color = new THREE.Color( "hsl( " + hue + ", 100%, 50%)" );

	for (let i = 0; i < 6; i++) {
		let variation = 100;
		let hueVariation = Math.floor(hue + Math.random() * variation - variation/2) % 360;
		let color = new THREE.Color( "hsl( " + hueVariation + ", 100%, 50%)" );
		let light = new THREE.PointLight( color, 0.05 );
		// PointLight( color : Integer, intensity : Float, distance : Number, decay : Float )
		body.lights.push( light );
		body.group.add( light );
	}



	// JOINTS PARTICLE BUFFER
	let sizes;

	body.joints = new ParticleBuffer( BODY_JOINTS_MAX );

	sizes = [];

	let bodyJointsGeometry = new THREE.BufferGeometry();
	for ( let i = 0; i < BODY_JOINTS_MAX; i++ ) {
		body.joints.particles[i] = new BodyParticle(
			Math.random() * WORLD_WIDTH - WORLD_WIDTH/2,
			Math.random() * WORLD_HEIGHT - WORLD_HEIGHT/2,
			Math.random() * WORLD_DEPTH - WORLD_DEPTH/2
		);

		let x = body.scale * (body.joints.particles[i].pos.x + BODY_POS_OFFSET_X);
		let y = body.scale * (body.joints.particles[i].pos.y + BODY_POS_OFFSET_Y);
		let z = body.scale * body.joints.particles[i].pos.z * body.scale;

		body.joints.positions[ i * 3     ] = body.position.x + x;
		body.joints.positions[ i * 3 + 1 ] = body.position.y + y;
		body.joints.positions[ i * 3 + 2 ] = body.position.z + z;

		body.joints.colors[ i * 3     ] = body.color.r * 0.4 + Math.random() * 0.6;
		body.joints.colors[ i * 3 + 1 ] = body.color.g * 0.4 + Math.random() * 0.6;
		body.joints.colors[ i * 3 + 2 ] = body.color.b * 0.4 + Math.random() * 0.6;

		sizes.push( 1.0 );

		let lightIndex;
		switch (i) {
			case BODY.CHEST:
			lightIndex = 0;
			break;
			case BODY.HEAD:
			lightIndex = 1;
			break;
			case BODY.HAND_LEFT:
			lightIndex = 2;
			break;
			case BODY.HAND_RIGHT:
			lightIndex = 3;
			break;
			case BODY.ANKLE_LEFT:
			lightIndex = 4;
			break;
			case BODY.ANKLE_RIGHT:
			lightIndex = 5;
			break;
			default:
			lightIndex = -1;
		}
		if (lightIndex >= 0) {
			body.lights[lightIndex].position.set( body.position.x + x, body.position.y + y, body.position.z + z );
		}
	}

	bodyJointsGeometry.addAttribute( 'position', new THREE.BufferAttribute( body.joints.positions, 3 ).setDynamic( true ) );
	bodyJointsGeometry.addAttribute( 'color', new THREE.BufferAttribute( body.joints.colors, 3 ).setDynamic( true ) );
	bodyJointsGeometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setDynamic( true ) );

	// Material - not used // TODO: Improve this!
	let bodyJointsMaterial = new THREE.PointsMaterial( {
		vertexColors: THREE.VertexColors,
		blending: THREE.AdditiveBlending,
		transparent: true,
	} );

	// create the particle system
	body.joints.mesh = new THREE.Points( bodyJointsGeometry, bodyShaderMaterial );
	body.group.add( body.joints.mesh );

	scene.add(body.group);
	bodies.push( body );
}



function createBodyPointCloud() {

	// INSTANCING PARTICLES FOR BODIES

	let vector = new THREE.Vector4();
	let instances = 200000;

	// SHAPE
	// we don't have to do that because we are using a box mesh.
	// let positions = [];
	// positions.push( 0.025, -0.025, 0 );
	// positions.push( -0.025, 0.025, 0 );
	// positions.push( 0, 0, 0.025 );

	let instOffsets = [];
	let instColors = [];
	let instSizes = [];
	let instScales = [];
	let instLastTime = [];
	let instDecaySpeed = [];
	let instScatterSpeed = [];

	// instanced attributes
	for ( let i = 0; i < instances; i ++ ) {
		instOffsets.push( 0, -100000, 0 );
		let randomColor = Math.random() * 0.3 + 0.5;
		instColors.push( randomColor, randomColor, randomColor, Math.random() * 0.5 );
		// instColors.push( Math.random(), Math.random(), Math.random(), Math.random() * 0.5 );
		instSizes.push( 8.0 + Math.random() * 30 );
		instScales.push( 1.0 );
		instLastTime.push( 0.0 );
		instDecaySpeed.push( Math.random() * 0.25 + 0.3 );
		instScatterSpeed.push( 0.03 );
	}

	// box geometry
	let bufferGeometry = new THREE.BoxBufferGeometry( 0.1, 0.1, 0.1 );
	let geometry = new THREE.InstancedBufferGeometry();
	geometry.maxInstancedCount = instances; // set so its initalized for dat.GUI, will be set in first draw otherwise

	// SHAPE
	// Again, we don't have to do that because we are using a box mesh.
	// geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );

	// box
	geometry.index = bufferGeometry.index;
	geometry.attributes.position = bufferGeometry.attributes.position;

	instanceOffsetAttribute = new THREE.InstancedBufferAttribute( new Float32Array( instOffsets ), 3 ).setDynamic( true );
	instanceColorAttribute = new THREE.InstancedBufferAttribute( new Float32Array( instColors ), 4 ).setDynamic( true );
	instanceLastTimeAttribute = new THREE.InstancedBufferAttribute( new Float32Array( instLastTime ), 1 ).setDynamic( true );
	instanceScaleAttribute = new THREE.InstancedBufferAttribute( new Float32Array( instScales ), 1 ).setDynamic( true );
	instanceScatterSpeedAttribute = new THREE.InstancedBufferAttribute( new Float32Array( instScatterSpeed ), 1 ).setDynamic( true );

	geometry.addAttribute( 'offset', instanceOffsetAttribute );
	geometry.addAttribute( 'lastTime', instanceLastTimeAttribute );
	geometry.addAttribute( 'color', instanceColorAttribute );
	geometry.addAttribute( 'scale', instanceScaleAttribute );
	geometry.addAttribute( 'scatterSpeed', instanceScatterSpeedAttribute );
	geometry.addAttribute( 'size', new THREE.InstancedBufferAttribute( new Float32Array( instSizes ), 1 ) );
	geometry.addAttribute( 'decaySpeed', new THREE.InstancedBufferAttribute( new Float32Array( instDecaySpeed ), 1 ) );

	// material
	var material = new THREE.RawShaderMaterial( {
		uniforms: {
			time: { value: 0.0 }
		},
		vertexShader: ShaderLoader.get( "instance_vert" ),
		fragmentShader: ShaderLoader.get( "instance_frag" ),
		side: THREE.DoubleSide,
		//blending: THREE.AdditiveBlending,
		transparent: true,
		depthTest: false
	} );
	//
	instanceObjs = new THREE.Mesh( geometry, material );
	scene.add( instanceObjs );

}



function updateBodyData() {

	if (newData == null) return;

	// update body data with the steaming data
	bodyDataObjs = [];
	for ( let newDataIndex = 0 ; newDataIndex < newData.length; newDataIndex++) {
		let data = newData[newDataIndex];
		for (let i = 0; i < data.length; i++) {
			let id = data[i].sid + i;
			let element = {};
			element.id = id;
			element.data = data[i];
			bodyDataObjs.push( element );
		}
	}
	// create body if there is a new id
	for (let i=0; i < bodyDataObjs.length; i++) {
		let count = 0;
		for (let b = 0; b < bodies.length; b++) {
			if (bodies[b].id == bodyDataObjs[i]["id"]) {
				count++;
			}
		}
		if (count == 0) {
			createBody( bodyDataObjs[i]["id"] );
			console.log("! Body Added");
		}
	}
}



function updateBodies() {

	// BODY

	// for instancing particles
	let count = 0;
	let maxCount = instanceOffsetAttribute.count;

	// main loop
	for ( let bodyIndex = bodies.length-1; bodyIndex >= 0; bodyIndex-- ) {

		let body = bodies[bodyIndex];
		// get the body data with body id
		let bodyData;
		for (let dataIndex=0; dataIndex < bodyDataObjs.length; dataIndex++) {
			if (body.id == bodyDataObjs[dataIndex]["id"]) {
				bodyData = bodyDataObjs[dataIndex].data;
				body.updateActivity( 0.01 ); // live
			}
		}
		// decay
		body.updateActivity( -0.005 );

		// quantity of motion
		body.updateMotion();

		// remove if it's done
		if (body.activity <= 0.0) {
			scene.remove( body.group );
			bodies.splice( bodyIndex, 1 );
			console.log( "! Body Removed" );
		}

		// update lights' intensity
		for (let li = 0; li < body.lights.length; li++) {
			body.lights[li].intensity = 0.05 * body.activity;
		}




		// update interaction

		// for ( let otherIndex = bodies.length-1; otherIndex >= 0; otherIndex-- ) {
		// 	if (bodyIndex == otherIndex) continue;
		//
		// 	let otherBody = bodies[otherIndex];
		// 	//BODY.CHEST
		// 	//BODY.HEAD
		// 	//BODY.HAND_RIGHT
		// 	//BODY.HAND_LEFT
		//
		// 	// hand
		// 	let handState
		// 	for (let handIndex = 0; handIndex < 2; handIndex++) {
		//
		// 		let hand;
		// 		if (handIndex == 0) hand = body.joints.particles[BODY.HAND_LEFT];
		// 		else if (handIndex == 1) hand = body.joints.particles[BODY.HAND_RIGHT];
		//
		// 		for (let otherHandIndex = 0; otherHandIndex < 2; otherHandIndex++) {
		// 			let otherHand;
		// 			if (otherHandIndex == 0) otherHand = otherBody.joints.particles[BODY.HAND_LEFT];
		// 			else if (otherHandIndex == 1) otherHand = otherBody.joints.particles[BODY.HAND_RIGHT];
		//
		// 			let distance = hand.distanceTo.otherHand;
		// 			if (distance < 20) {
		//
		//
		// 			}
		//
		// 		}
		// 	}
		// }






		// body joints and point cloud update
		if (bodyData == undefined) continue;

		let prevPxIndex = 0;
		for ( let i = 0; i < bodyData.joints.length; i ++ ) {

			let scaledX = body.scale * (bodyData.joints[i].x + BODY_POS_OFFSET_X);
			let scaledY = body.scale * (bodyData.joints[i].y + BODY_POS_OFFSET_Y) * -1;
			let scaledZ = body.scale * bodyData.joints[i].z * DEPTH_SCALING;
			let destX = body.position.x + scaledX;
			let destY = body.position.y + scaledY;
			let destZ = body.position.z + scaledZ;

			var sizes = body.joints.mesh.geometry.attributes.size.array;

			let p = body.joints.particles[i];

			p.attractedTo( new THREE.Vector3( destX, destY, destZ ), 0.1 );
			p.update();
			p.applyDamping( 0.98 );

			body.joints.positions[ i * 3     ] = p.pos.x;// = destX;
			body.joints.positions[ i * 3 + 1 ] = p.pos.y;// = destY;
			body.joints.positions[ i * 3 + 2 ] = p.pos.z;// = destZ;
			// bodies[bodyIndex].joints.colors[ i * 3     ] = 255;
			// bodies[bodyIndex].joints.colors[ i * 3 + 1 ] = 0;
			// bodies[bodyIndex].joints.colors[ i * 3 + 2 ] = 0;

			// update light positions
			let lightIndex;
			switch (i) {
				case BODY.CHEST:
				lightIndex = 0;
				break;
				case BODY.HEAD:
				lightIndex = 1;
				break;
				case BODY.HAND_LEFT:
				lightIndex = 2;
				break;
				case BODY.HAND_RIGHT:
				lightIndex = 3;
				break;
				case BODY.ANKLE_LEFT:
				lightIndex = 4;
				break;
				case BODY.ANKLE_RIGHT:
				lightIndex = 5;
				break;
				default:
				lightIndex = -1;
			}
			if (lightIndex >= 0) {
				body.lights[lightIndex].position.set( p.pos.x, p.pos.y, p.pos.z );
			}

			// size update
			sizes[ i ] = (500 + Math.sin( 0.01 * i + time * p.sizeVariation ) * 1000 ) * body.scale * body.activity;

			body.joints.mesh.geometry.attributes.position.needsUpdate = true;
			// body.joints.mesh.geometry.attributes.color.needsUpdate = true;
			body.joints.mesh.geometry.attributes.size.needsUpdate = true;


			// POINT CLOUD

			if (bodyData.joints[i].px != undefined) {

				for ( let pxIndex = 0; pxIndex < bodyData.joints[i].px.length; pxIndex ++ ) {

					let colorString = bodyData.joints[i].px[pxIndex].c;
					let r,g,b;
					if (typeof colorString == "string") {
						r = parseInt( colorString.substr(0, 2) ) * 0.016 - Math.random() * 0.15;
						g = parseInt( colorString.substr(2, 2) ) * 0.016 - Math.random() * 0.15;
						b = parseInt( colorString.substr(4, 2) ) * 0.016 - Math.random() * 0.15;
					} else {
						r = body.color.r;
						g = body.color.g;
						b = body.color.b;
					}

					// remove too bright pixels;
					if (r+g+b > 2.9) continue;
					// remove error pixels (px.z range: -500 ~ 500)
					if (bodyData.joints[i].px[pxIndex].z == -500) continue;


					let sX = body.scale * (bodyData.joints[i].px[pxIndex].x + BODY_POS_OFFSET_X);
					let sY = body.scale * (bodyData.joints[i].px[pxIndex].y + BODY_POS_OFFSET_Y) * -1;
					let sZ = body.scale * bodyData.joints[i].px[pxIndex].z * DEPTH_SCALING;
					let x = body.position.x + sX;
					let y = body.position.y + sY;
					let z = body.position.z + sZ;
					instanceOffsetAttribute.setXYZ( instanceIndex, x, y, z );

					let cR = body.color.r * 0.6 + Math.random() * 0.4;
					let cG = body.color.g * 0.6 + Math.random() * 0.4;
					let cB = body.color.b * 0.6 + Math.random() * 0.4;

					let pct1 = Math.abs( Math.sin(time * body.colorfulFreq) );
					let pct2 = 1.0 - pct1;
					instanceColorAttribute.setXYZ( instanceIndex, r*pct1 + cR*pct2, g*pct1 + cG*pct2, b*pct1 + cB*pct2 );
					// instanceColorAttribute.setXYZ( instanceIndex, r,g,b );

					instanceLastTimeAttribute.setX( instanceIndex, time * 0.005 );
					instanceScaleAttribute.setX( instanceIndex, body.scale * body.activity );
					instanceScatterSpeedAttribute.setX( instanceIndex, body.motion );

					instanceIndex++;
					if (instanceIndex == maxCount) {
						instanceIndex = 0;
					}

					count ++;
				}
			}
		}
	}
	instanceOffsetAttribute.needsUpdate = true;
	instanceColorAttribute.needsUpdate = true;
	instanceLastTimeAttribute.needsUpdate = true;
	instanceScaleAttribute.needsUpdate = true;
	instanceScatterSpeedAttribute.needsUpdate = true;
	instanceObjs.material.uniforms.time.value = time * 0.005;

}
