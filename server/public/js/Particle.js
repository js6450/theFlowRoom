"use strict";


class Particle {
  constructor( x, y, z, m ) {
    this.pos = (x == undefined) ? new THREE.Vector3() : new THREE.Vector3( x, y, z );
    this.vel = new THREE.Vector3();
    this.acc = new THREE.Vector3();
    this.mass = (m == undefined) ? 1.0 : m;
    this.color = new THREE.Color( 0.1, 0.1, 0.1 );
  }
  getPosition() {
    return this.pos;
  }
  getVelocity() {
    return this.vel;
  }
  getAcceleration() {
    return this.acc;
  }
  getMass() {
    return this.mass;
  }
  update() {
    this.vel.add( this.acc );
    this.pos.add( this.vel );
    this.acc.multiplyScalar( 0 );
    //limit
    this.vel.clampLength(0, 15);
  }
  applyDamping( amt ) {
    this.vel.multiplyScalar( amt );
  }
  applyForce( force ) {
    let f = force.clone().divideScalar( this.mass );
    this.acc.add( f );
  }
  attractedTo( otherPos, amt ) {
    let vector = new THREE.Vector3().subVectors( otherPos, this.pos );
    vector.multiplyScalar( amt );
    this.applyForce( vector );
  }
  checkDistanceSq( other, dist ) {
    // a fast way to get/check the distance
    let distSq = dist * dist;
    return ( distSq >= this.pos.distanceToSquared(other.pos) );

    // thisVector.distanceTo( otherVector );
    // the way above is relatively slow.
  }
  checkBoundaries( w, h, d ) {
    if (this.pos.x < -w/2 || this.pos.x > w/2) {
      this.pos.x = (this.pos.x < -w/2) ? w/2 : -w/2
    }
    if (this.pos.y < -h/2 || this.pos.y > h/2) {
      this.pos.y = (this.pos.y < -h/2) ? h/2 : -h/2
    }
    if (this.pos.z < -d/2 || this.pos.z > d/2) {
      this.pos.z = (this.pos.z < -d/2) ? d/2 : -d/2
    }
  }
}



// BODY PARTICLE

class BodyParticle extends Particle {
  constructor( x, y, z, m ) {
    super(x, y, z, m);
    this.sizeVariation = Math.random() * 0.001 + 0.0003;
  }
  attractedTo( otherPos ) {
    let vector = new THREE.Vector3().subVectors( otherPos, this.pos );
    //if (vector.length() > 100 ) {
      vector.multiplyScalar( 0.002 );
    //} else {
      //vector.multiplyScalar( -0.02 );
    //}
    this.applyForce( vector );
  }
  repel( other, amount ) {
    if ( this.checkDistanceSq(other, 100) ) {
      let vector = new THREE.Vector3().subVectors( other.pos, this.pos );
      vector.multiplyScalar( amount );
      other.applyForce( vector );
      //other.color = new THREE.Color( 1.0, 1.0, 1.0 );
    }
  }
}



// FLOW PARTICLE

class FlowParticle extends Particle {
  constructor( x, y, z, m ) {
    super(x, y, z, m);
    let velX = Math.random() * 2 - 1;
    let velY = Math.random() * 2 - 1;
    let velZ = Math.random() * 2 - 1;
    //this.vel = new THREE.Vector3( velX, velY, velZ );
    this.origin = new THREE.Vector3( x, y, z );
  }
  changeColorBasedOnVel() {

    // lengthSq() is slightly faster!
    let w = THREE.Math.mapLinear( this.vel.lengthSq(), 0, 4, 0.0, 1.0 );
    w = THREE.Math.clamp(w, 0, 1.0);

    let distSq = this.pos.distanceToSquared( this.origin );
    let d = THREE.Math.mapLinear( distSq, 0, 2000, 1.0, 0.0 );
    d = THREE.Math.clamp(d, 0, 1.0);

    // this.color = new THREE.Color( 1.0, 1.0, 1.0 );
    // this.color = new THREE.Color( w*0.2, w*0.5, w );
    this.color = new THREE.Color( w*d * 0.2, w*d * 0.5, w*d );
    // this.color = new THREE.Color( (1.0 - w*d), (1.0 - w*d), (1.0 - w*d)  );
  }
}



// BufferStruct
class ParticleBuffer {
  constructor( maxNum ) {
    this.mesh;
    this.particles = new Array( maxNum );
    this.positions = new Float32Array( maxNum * 3 );
    this.colors = new Float32Array( maxNum * 3 );
  }
  getPositionVec3() {
    let vec3s = new Array();
    for ( let i = 0; i < this.positions.length; i += 3 ) {
      let x = this.positions[ i     ];
      let y = this.positions[ i + 1 ];
      let z = this.positions[ i + 2 ];
      vec3s.push( new THREE.Vector3( x, y, z ) );
    }
    return vec3s;
  }
}
