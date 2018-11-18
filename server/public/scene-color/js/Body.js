class Body {
  constructor( id ) {
    this.id = id;
    this.group = new THREE.Group();
    this.position;
    this.scale;
    this.joints;
    this.lights = [];
    this.color;
    this.otherColor = new THREE.Color( Math.random(),Math.random(),Math.random() );
    this.colorChange = 0.0;
    this.colorfulFreq = Math.random() * 0.0001 + 0.0001;

    this.activity = 0.0;
    this.motion = 0.0;

    this.partStates = [false, false, false, false]; // handL, handR, head, chest
    this.state = 0;
    // 0: normal
    // 1: hand_left
    // 2: hand_right
    // 3: hand_both
    // 4: hug(chest distance)

    // sound
    let randomIndex;

    randomIndex = Math.floor( Math.random() * soundwaveFilenames.length );
    this.soundWave = new AudioNode( soundwaveFilenames[randomIndex] );

    randomIndex = Math.floor( Math.random() * sfxFilenames.length );
    this.soundSand = new AudioNode( sfxFilenames[randomIndex] );

    this.soundScatter = new AudioNode( "FX_Mellow Noise Sweep NEW" );
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

  updateSound( cameraPos ) {
    if (cameraPos == undefined) return;

    let snd;
    let distance = cameraPos.distanceTo( this.position );
    let volume = Math.pow((2000 - distance), 2) / Math.pow(1000, 2);;

    // update wave sound
    snd = this.soundWave;
    snd.setVolume( volume );
    if (volume < 0.01) {
      snd.stop();
    } else {
      snd.play();
    }
    // update sand effect
    snd = this.soundSand;
    snd.setVolume( THREE.Math.clamp(volume - 0.4, 0.0, 0.2) );
    if (volume < 0.01) {
      snd.stop();
    } else if (volume > 0.50){
      snd.play();
    }
    // update scatter sound
    snd = this.soundScatter;
    snd.setVolume( volume + this.motion );
    if (volume < 0.01) {
      snd.stop();
    } else if (volume > 0.30 && this.motion > 0.2){
      snd.play();
    }

  }
  updateState() {
    //partStates = [false, false, false, false]; // handL, handR, head, chest
    // 0: normal
    // 1: hand_left
    // 2: hand_right
    // 3: hand_both
    // 4: hug(chest distance)

    if (this.partStates[2] || this.partStates[3]) {
      // hug
      this.state = 4;
    }
    else if (this.partStates[0] && this.partStates[1]) {
      // both
      this.state = 3;
    }
    else if (!this.partStates[0] && this.partStates[1]) {
      // right
      this.state = 2;
    }
    else if (this.partStates[0] && !this.partStates[1]) {
      // left
      this.state = 1;
    }
    else {
      // noraml
      this.state = 0;
    }
  }

  applyState() {
    switch (this.state) {
      case 1: // left hand
      case 2: // right hand
      case 3: // both hands
      this.colorChange = mLerp(this.colorChange, 1.0, 0.03);
      break;
      case 4:
      // hug
      break;
      default:
      this.colorChange = mLerp(this.colorChange, 0.0, 0.01);
    }
  }

}
