function createFlow() {

  // Flow Particle Buffer

  // Material
  let flowMaterial = new THREE.MeshBasicMaterial( {
    // color : 0xff0000,
    vertexColors: THREE.VertexColors,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 1.0,
    depthTest : false,
    side : THREE.DoubleSide,
    wireframe : true,
    map: flowTexture
  } );

  // let segmentsWidth = WORLD_WIDTH / FLOW_PARTICLES_SPACING - 1;
  // let segmentsDepth = WORLD_DEPTH / FLOW_PARTICLES_SPACING - 1;
  // let flowGeometry = new THREE.PlaneBufferGeometry( WORLD_WIDTH, WORLD_DEPTH, segmentsWidth, segmentsDepth );
  // console.log( flowGeometry.attributes.position.array );

  // Geometry
  let first = true;
  for ( let y = -WORLD_HEIGHT/2 + FLOW_PARTICLES_SPACING/2; y < WORLD_HEIGHT/2; y += FLOW_PARTICLES_SPACING ) {
    flowMeshes.push( new ParticleBuffer( FLOW_PARTICLES_MAX ) );
    let f = flowMeshes[ flowMeshes.length - 1 ];

    let segmentsWidth = WORLD_WIDTH / FLOW_PARTICLES_SPACING - 1;
    let segmentsDepth = WORLD_DEPTH / FLOW_PARTICLES_SPACING - 1;
    let flowGeometry = new THREE.PlaneBufferGeometry( WORLD_WIDTH, WORLD_DEPTH, segmentsWidth, segmentsDepth);
    f.positions = flowGeometry.attributes.position.array;

    let index = 0;
    for ( let z = -WORLD_DEPTH/2 + FLOW_PARTICLES_SPACING/2; z < WORLD_DEPTH/2; z += FLOW_PARTICLES_SPACING ) {
      for ( let x = -WORLD_WIDTH/2 + FLOW_PARTICLES_SPACING/2; x < WORLD_WIDTH/2; x += FLOW_PARTICLES_SPACING ) {

        f.particles[ index ] = new FlowParticle( x, y, z );

        f.positions[ index * 3     ] = x;
        f.positions[ index * 3 + 1 ] = y;
        f.positions[ index * 3 + 2 ] = z;

        f.colors[ index * 3     ] = 0.0;
        f.colors[ index * 3 + 1 ] = 0.0;
        f.colors[ index * 3 + 2 ] = 0.0;

        index++;
      }
    }
    flowGeometry.addAttribute( 'color', new THREE.BufferAttribute( f.colors, 3 ).setDynamic( true ) );

    if ( first ) {
      //f.mesh = new THREE.Mesh( flowGeometry, planeMaterial );
      first = !first;
    } else {
      //
    }
    f.mesh = new THREE.Mesh( flowGeometry, flowMaterial );
    scene.add( f.mesh );
  }
  //
  //flowGeometry.addAttribute( 'position', new THREE.BufferAttribute( flow.positions, 3 ).setDynamic( true ) );
  
  

  // var line = new THREE.Line( flowGeometry, flowMaterial );
  // scene.add( line );

}



function updateFlow() {

  // Flow Point Cloud
  for ( let m = 0; m < flowMeshes.length; m ++) {
    let flow = flowMeshes[ m ];
    for ( let i = 0; i < FLOW_PARTICLES_MAX; i ++ ) {
      let p = flow.particles[i];

      p.changeColorBasedOnVel();

      for ( let b = 0; b < bodies.length; b ++ ) {
        for ( let j = 0; j < BODY_JOINTS_MAX; j ++ ) {
          let bParticle = bodies[b].joints.particles[j];
          bParticle.repel( p, 0.0010 );
        }
      }

      p.attractedTo( p.origin, 0.0025 );
      p.update();
      p.applyDamping( 0.975 );
      // p.checkBoundaries( WORLD_WIDTH, WORLD_HEIGHT, WORLD_DEPTH);

      flow.positions[ i * 3     ] = p.pos.x;
      flow.positions[ i * 3 + 1 ] = p.pos.y;
      flow.positions[ i * 3 + 2 ] = p.pos.z;
      flow.colors[ i * 3     ] = p.color.r;
      flow.colors[ i * 3 + 1 ] = p.color.g;
      flow.colors[ i * 3 + 2 ] = p.color.b;
    }
    flow.mesh.geometry.attributes.position.needsUpdate = true;
    flow.mesh.geometry.attributes.color.needsUpdate = true;
  }

}