function createFloor() {

  // Floor Particle Buffer

  // Material
  let floorMaterial = new THREE.MeshPhysicalMaterial( {
    color: 0xAAAAAA,
    // emissive : 0x000000,
    //roughness : 0.5,
    //metalness : 0.5,
    reflectivity : 0.0,
    side : THREE.DoubleSide,
    flatShading : true,
    depthTest : false,
    transparent : true,
    // opacity: 1.0,
    blending: THREE.AdditiveBlending,
    // wireframe : true,
    map : floorTexture
  } );

  // Geometry
  for ( let i=0; i<2; i++ ) {

    switch (i) {
      case 0:
      y = -WORLD_HEIGHT/2
      break;
      case 1:
      y = WORLD_HEIGHT/2
      break;
      default:

    }

    floorMeshes.push( new ParticleBuffer( FLOOR_PARTICLES_MAX ) );
    let f = floorMeshes[ floorMeshes.length - 1 ];

    let segmentsWidth = WORLD_WIDTH / FLOOR_PARTICLES_SPACING - 1;
    let segmentsDepth = WORLD_DEPTH / FLOOR_PARTICLES_SPACING - 1;
    let floorGeometry = new THREE.PlaneBufferGeometry( WORLD_WIDTH, WORLD_DEPTH, segmentsWidth, segmentsDepth);
    f.positions = floorGeometry.attributes.position.array;

    let index = 0;
    let scale = 2.5;
    for ( let z = -WORLD_DEPTH/2 + FLOOR_PARTICLES_SPACING/2; z < WORLD_DEPTH/2; z += FLOOR_PARTICLES_SPACING ) {
      for ( let x = -WORLD_WIDTH/2 + FLOOR_PARTICLES_SPACING/2; x < WORLD_WIDTH/2; x += FLOOR_PARTICLES_SPACING ) {

        f.particles[ index ] = new FlowParticle( x * scale, y, z * scale );

        f.positions[ index * 3     ] = x * scale;
        f.positions[ index * 3 + 1 ] = y;
        f.positions[ index * 3 + 2 ] = z * scale;

        f.colors[ index * 3     ] = 0.0;
        f.colors[ index * 3 + 1 ] = 0.0;
        f.colors[ index * 3 + 2 ] = 0.0;

        index++;
      }
    }
    floorGeometry.addAttribute( 'color', new THREE.BufferAttribute( f.colors, 3 ).setDynamic( true ) );

    f.mesh = new THREE.Mesh( floorGeometry, floorMaterial );
    scene.add( f.mesh );
  }
  //
  //floorGeometry.addAttribute( 'position', new THREE.BufferAttribute( floor.positions, 3 ).setDynamic( true ) );

}



function updateFloor() {

  // Floor Mesh
  for ( let m = 0; m < floorMeshes.length; m ++) {
    let floor = floorMeshes[ m ];
    for ( let i = 0; i < FLOOR_PARTICLES_MAX; i ++ ) {
      let p = floor.particles[i];

      p.changeColorBasedOnVel();

      for ( let b = 0; b < bodies.length; b ++ ) {
        for ( let j = 0; j < BODY_JOINTS_MAX; j ++ ) {
          let bParticle = bodies[b].joints.particles[j];
          bParticle.repel( p, 0.0050 ); // 0.0010
        }
      }
      //let fluct = new THREE.Vector3(p.origin.x, p.origin.y + Math.sin(time*0.0005 + p.origin.x * 0.003 + p.origin.z * 0.004) * 30, p.origin.z);
      let fluct = getNoiseVector(p.origin.x, p.origin.y, p.origin.z).multiplyScalar(15).add(p.origin);
      p.attractedTo( fluct, 0.0025 );
      p.update();
      p.applyDamping( 0.975 );
      // p.checkBoundaries( WORLD_WIDTH, WORLD_HEIGHT, WORLD_DEPTH);

      floor.positions[ i * 3     ] = p.pos.x;
      floor.positions[ i * 3 + 1 ] = p.pos.y;
      floor.positions[ i * 3 + 2 ] = p.pos.z;
      floor.colors[ i * 3     ] = p.color.r;
      floor.colors[ i * 3 + 1 ] = p.color.g;
      floor.colors[ i * 3 + 2 ] = p.color.b;
    }
    floor.mesh.geometry.attributes.position.needsUpdate = true;
    floor.mesh.geometry.attributes.color.needsUpdate = true;
  }

}
