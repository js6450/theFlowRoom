function createBody( skeleton ) {

	let body = new Body();
	//body.group.position.x = -300;
	//body.group.position.y = 100;
	//body.group.position.z = 0;


	// JOINTS PARTICLE BUFFER

	let sizes;

	body.joints = new ParticleBuffer( BODY_JOINTS_MAX );

	sizes = [];

	let bodyJointsGeometry = new THREE.BufferGeometry();
	for ( let i = 0; i < BODY_JOINTS_MAX; i++ ) {
		body.joints.particles[i] = new BodyParticle( Math.random() * 600 - 300, Math.random() * 600 - 300, Math.random() * 600 - 300);

		body.joints.positions[ i * 3     ] = body.joints.particles[i].pos.x;
		body.joints.positions[ i * 3 + 1 ] = body.joints.particles[i].pos.y;
		body.joints.positions[ i * 3 + 2 ] = body.joints.particles[i].pos.z;

		body.joints.colors[ i * 3     ] = Math.random() * 0.1; //1.0;
		body.joints.colors[ i * 3 + 1 ] = Math.random() * 0.5; //1.0;
		body.joints.colors[ i * 3 + 2 ] = Math.random(); //1.0;

		sizes.push( Math.random()*350 + 300 );
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
	body.joints.mesh = new THREE.Points( bodyJointsGeometry, shaderMaterial );
	body.group.add( body.joints.mesh );



		// BODY POINT CLOUD - PARTICLE BUFFER

		/*
		body.pointCloud = new ParticleBuffer( BODY_PARTICLES_MAX );

		sizes = [];

		let bodyPointCloudGeometry = new THREE.BufferGeometry();



		let sumOfPoints = 0;
		let count = 0;
		for ( let i = 0; i < skeleton.joints.length; i ++ ) {
		let bodyLineGeometry = new THREE.Geometry();
		let bodyLineMaterial = new THREE.LineBasicMaterial( {
		color : 0x111111,
		transparent: false,
		depthTest : false
	} );

	if (skeleton.joints[i].px != undefined) {
	for ( let p = 0; p < skeleton.joints[i].px.length; p ++ ) {

	body.pointCloud.particles[ count ] = new BodyParticle();

	body.pointCloud.positions[ count * 3     ] = skeleton.joints[i].px[p].x;
	body.pointCloud.positions[ count * 3 + 1 ] = skeleton.joints[i].px[p].y * -1;
	body.pointCloud.positions[ count * 3 + 2 ] = skeleton.joints[i].px[p].z * DEPTH_SCALING;

	body.pointCloud.colors[ count * 3     ] = Math.random() * 0.1;
	body.pointCloud.colors[ count * 3 + 1 ] = Math.random() * 0.5;
	body.pointCloud.colors[ count * 3 + 2 ] = Math.random();

	sizes.push( Math.random()*50 + 10 );

	let vec = new THREE.Vector3();
	vec.x = skeleton.joints[i].px[p].x;
	vec.y = skeleton.joints[i].px[p].y * -1;
	vec.z = skeleton.joints[i].px[p].z * DEPTH_SCALING;

	bodyLineGeometry.vertices.push( vec );
	count ++;
	}
	}

	let max = bodyLineGeometry.vertices.length;
	body.pointsMax.push( max );

	sumOfPoints += max;
	console.log( "! Joints[" + i + "], NumOfParticles: " + max );

	let bodyLines = new THREE.Line( bodyLineGeometry, bodyLineMaterial );
	bodyLines.material.color = new THREE.Color( Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5 );

	// to the Body object
	body.lines.push( bodyLines );

	// to the group of scene
	//body.group.add( bodyLines );
	}

	bodyPointCloudGeometry.addAttribute( 'position', new THREE.BufferAttribute( body.pointCloud.positions, 3 ).setDynamic( true ) );
	bodyPointCloudGeometry.addAttribute( 'color', new THREE.BufferAttribute( body.pointCloud.colors, 3 ).setDynamic( true ) );
	bodyPointCloudGeometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setDynamic( true ) );


	body.pointCloud.mesh = new THREE.Points( bodyPointCloudGeometry, shaderMaterial );
	body.group.add( body.pointCloud.mesh );


	console.log( "! Joints Total: " + skeleton.joints.length );
	console.log( "! Particles Total: " + sumOfPoints );

	*/

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
	let instLastTime = [];

	// instanced attributes
	for ( let i = 0; i < instances; i ++ ) {
		instOffsets.push( 0, -100000, 0 );
		instColors.push( Math.random(), Math.random(), Math.random(), Math.random() * 0.5 );
		instSizes.push( 10.0 + Math.random()*30 );
		instLastTime.push( 0 );
	}

	// box geometry
	var bufferGeometry = new THREE.BoxBufferGeometry( 0.1, 0.1, 0.1 );
	var geometry = new THREE.InstancedBufferGeometry();
	geometry.maxInstancedCount = instances; // set so its initalized for dat.GUI, will be set in first draw otherwise

	// SHAPE
	// Again, we don't have to do that because we are using a box mesh.
	// geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );

	// box
	geometry.index = bufferGeometry.index;
	geometry.attributes.position = bufferGeometry.attributes.position;

	instanceOffsetAttribute = new THREE.InstancedBufferAttribute( new Float32Array( instOffsets ), 3 ).setDynamic( true );
	instanceLastTimeAttribute = new THREE.InstancedBufferAttribute( new Float32Array( instLastTime ), 1 ).setDynamic( true );
	geometry.addAttribute( 'offset', instanceOffsetAttribute );
	geometry.addAttribute( 'lastTime', instanceLastTimeAttribute );
	geometry.addAttribute( 'color', new THREE.InstancedBufferAttribute( new Float32Array( instColors ), 4 ) );
	geometry.addAttribute( 'size', new THREE.InstancedBufferAttribute( new Float32Array( instSizes ), 1 ) );

	// material
	var material = new THREE.RawShaderMaterial( {
		uniforms: {
			time: { value: 0.0 }
		},
		vertexShader: ShaderLoader.get( "instance_vert" ),
		fragmentShader: ShaderLoader.get( "instance_frag" ),
		side: THREE.DoubleSide,
		blending: THREE.AdditiveBlending,
		transparent: true,
		depthTest: false
	} );
	//
	instanceObjs = new THREE.Mesh( geometry, material );
	scene.add( instanceObjs );

}





function updateBodies() {

	// BODY

	if ( MODE_TEST ) {
		bodyData = bodyDataJSON[currentFrame];

		if (frameCount % 5 == 0) currentFrame ++;
		if (currentFrame >= bodyDataJSON.length) {
			currentFrame = 0;
		}
	}

	// for instancing particles
	let count = 0;
	let maxCount = instanceOffsetAttribute.count;

	for ( let newDataIndex = 0 ; newDataIndex < newData.length; newDataIndex++) {
		let bodyData = newData[newDataIndex];
		// add or remove bodies
		while ( bodyData.length > bodies.length ) {
			createBody();
			//console.log( "! Body Added" );
		}
		let bIndex = bodies.length - 1;
		while ( bodyData.length < bodies.length ) {
			scene.remove( bodies[bIndex].group );
			bodies.splice( bIndex, 1 );
			bIndex--;
			//console.log( "! Body Removed" );
		}

		// main loop
		for ( let bodyIndex = 0; bodyIndex < bodyData.length; bodyIndex ++ ) {

			let skeleton = bodyData[bodyIndex];
			let body = bodies[bodyIndex];

			let prevPxIndex = 0;
			for ( let i = 0; i < skeleton.joints.length; i ++ ) {

				let destX = skeleton.joints[i].x;
				let destY = skeleton.joints[i].y * -1;
				let destZ = skeleton.joints[i].z * DEPTH_SCALING;

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

				//sizes[ i ] = 100 + 10 * ( 300 + Math.sin( 0.01 * i + time * 0.001 ) * 300 );
				sizes[ i ] = 100 + 10 * ( 100 + Math.sin( 0.01 * i + time * p.sizeVariation ) * 90 );

				body.joints.mesh.geometry.attributes.position.needsUpdate = true;
				body.joints.mesh.geometry.attributes.color.needsUpdate = true;
				body.joints.mesh.geometry.attributes.size.needsUpdate = true;


				if (skeleton.joints[i].px != undefined) {
					for ( let pxIndex = 0; pxIndex < skeleton.joints[i].px.length; pxIndex ++ ) {
						// let index = prevPxIndex + pxIndex;

						let x = skeleton.joints[i].px[pxIndex].x;
						let y = skeleton.joints[i].px[pxIndex].y * -1;
						let z = skeleton.joints[i].px[pxIndex].z * DEPTH_SCALING;

						instanceOffsetAttribute.setXYZ( instanceIndex, x, y, z );
						instanceLastTimeAttribute.setX( instanceIndex, time * 0.005 );
						instanceIndex++;
						if (instanceIndex == maxCount) {
							instanceIndex = 0;
						}

						count ++;

						/*
						let speed = 0.75;
						let xLerp = body.pointCloud.positions[ index * 3     ] += (x - body.pointCloud.positions[ index * 3     ]) * speed;
						let yLerp = body.pointCloud.positions[ index * 3 + 1 ] += (y - body.pointCloud.positions[ index * 3 + 1 ]) * speed;
						let zLerp = body.pointCloud.positions[ index * 3 + 2 ] += (z - body.pointCloud.positions[ index * 3 + 2 ]) * speed;

						body.lines[i].geometry.vertices[pxIndex].x = xLerp;
						body.lines[i].geometry.vertices[pxIndex].y = yLerp;
						body.lines[i].geometry.vertices[pxIndex].z = zLerp;
						*/
					}
				}
				// prevPxIndex += body.pointsMax[i];

				/*
				body.pointCloud.mesh.geometry.attributes.position.needsUpdate = true;
				body.pointCloud.mesh.geometry.attributes.color.needsUpdate = true;

				body.lines[i].geometry.verticesNeedUpdate = true;
				*/
			}
		}
	}
	instanceOffsetAttribute.needsUpdate = true;
	instanceLastTimeAttribute.needsUpdate = true;
	instanceObjs.material.uniforms.time.value = time * 0.005;

}
