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
    //this.pointCloud;
    //this.pointsMax = [];
    //this.lines = [];
  }
  updateActivity( amt ) {
    this.activity += amt;
    if (this.activity <= 0.0) this.activity = 0.0;
    else if (this.activity >= 1.0) this.activity = 1.0;
  }
}
