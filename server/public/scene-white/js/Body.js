class Body {
  constructor( id ) {
    this.id = id;
    this.group = new THREE.Group();
    this.position;
    this.scale;
    this.joints;
    this.lights = [];
    this.color;
    this.colorfulFreq = Math.random() * 0.0001 + 0.0001;

    this.activity = 0.0;
    this.motion = 0.0;

    this.partStates = [false, false, false, false]; // handL, handR, head, chest
    this.mode = 0;
    // 0: normal
    // 1: hug(chest distance)
    // 2: hand_left
    // 3: hand_right
    // 4: hand_both
  }
  updateActivity( amt ) {
    this.activity += amt;
    if (this.activity <= 0.0) this.activity = 0.0;
    else if (this.activity >= 1.0) this.activity = 1.0;
  }
  updateMotion() {
    let sum = 0;
    for (let i = 0; i < this.joints.particles.length; i++) {
      sum += this.joints.particles[i].vel.length();
    }
    this.motion = Math.pow(sum, 4) * 0.0000000001;
    // console.log(this.motion);
  }
  updateState() {

  }
}
