function createFlow() {

  // Flow Particle Buffer

  // Material
  let flowMaterial = new THREE.MeshBasicMaterial( {
    // color : 0xff0000,
    vertexColors: THREE.VertexColors,
    // blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 1.0,
    depthTest : false,
    side : THREE.DoubleSide,
    //wireframe : true,
    map: flowTexture
  } );

  let uniforms = {
    texture: { value: textureLoader.load( "img/spark.png" ) },
    time: { value: 0.0 }
  };
  flowParticleMaterial = new THREE.ShaderMaterial( {
    uniforms:       uniforms,
    vertexShader:   ShaderLoader.get( "flowParticle_vert" ),
    fragmentShader: ShaderLoader.get( "flowParticle_frag" ),
    blending:       THREE.AdditiveBlending,
    depthTest:      false,
    transparent:    true,
    vertexColors:   true
  } );


  // Geometry
  flow = new ParticleBuffer( FLOW_PARTICLES_MAX );
  let flowGeometry = new THREE.BufferGeometry();

  let index = 0;
  let sizes = [];
  for ( let y = -WORLD_HEIGHT/2 + FLOW_PARTICLES_SPACING/2; y < WORLD_HEIGHT/2; y += FLOW_PARTICLES_SPACING ) {
    for ( let z = -WORLD_DEPTH/2 + FLOW_PARTICLES_SPACING/2; z < WORLD_DEPTH/2; z += FLOW_PARTICLES_SPACING ) {
      for ( let x = -WORLD_WIDTH/2 + FLOW_PARTICLES_SPACING/2; x < WORLD_WIDTH/2; x += FLOW_PARTICLES_SPACING ) {

        flow.particles[ index ] = new FlowParticle( x, y, z );

        flow.positions[ index * 3     ] = x;
        flow.positions[ index * 3 + 1 ] = y;
        flow.positions[ index * 3 + 2 ] = z;

        flow.colors[ index * 3     ] = Math.random() * 0.1;
        flow.colors[ index * 3 + 1 ] = Math.random() * 0.5;
        flow.colors[ index * 3 + 2 ] = Math.random() * 1.0;

        sizes.push( Math.random()*300 + 10 );
        index++;
      }
    }
  }
  flowGeometry.addAttribute( 'position', new THREE.BufferAttribute( flow.positions, 3 ).setDynamic( true ) );
  flowGeometry.addAttribute( 'color', new THREE.BufferAttribute( flow.colors, 3 ).setDynamic( true ) );
  flowGeometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setDynamic( true ) );

  flow.mesh = new THREE.Points( flowGeometry, flowParticleMaterial );
  scene.add( flow.mesh );

}


function updateFlow() {

  // Flow Point Cloud
  for ( let i = 0; i < FLOW_PARTICLES_MAX; i ++ ) {
    let p = flow.particles[i];

    p.changeColorBasedOnVel();

    for ( let b = 0; b < bodies.length; b ++ ) {
      for ( let j = 0; j < BODY_JOINTS_MAX; j ++ ) {
        let bParticle = bodies[b].joints.particles[j];
        bParticle.repel( p, 0.0120 ); // 0.0010
      }
    }

    p.attractedTo( p.origin, 0.0025 );
    p.update();
    p.applyDamping( 0.982 ); // 0.975
    // p.checkBoundaries( WORLD_WIDTH, WORLD_HEIGHT, WORLD_DEPTH);

    flow.positions[ i * 3     ] = p.pos.x;
    flow.positions[ i * 3 + 1 ] = p.pos.y;
    flow.positions[ i * 3 + 2 ] = p.pos.z;
    // flow.colors[ i * 3     ] = p.color.r;
    // flow.colors[ i * 3 + 1 ] = p.color.g;
    // flow.colors[ i * 3 + 2 ] = p.color.b;
  }
  flow.mesh.geometry.attributes.position.needsUpdate = true;
  flow.mesh.geometry.attributes.color.needsUpdate = true;
  flow.mesh.material.uniforms.time.value = time * 0.005;

}
