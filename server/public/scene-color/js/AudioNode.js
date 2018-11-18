class AudioNode{

  constructor(fileName){
    this.element = document.createElement('audio');
    document.body.appendChild(this.element)
    this.element.src = audioRoot + fileName + audioExtension;
    this.element.preload = true;
  }


  async play(){
    try{
      await this.element.play();
    }catch(err){
      console.log(err);
    }
  }

  pause(){
    this.element.pause();
  }

  stop(){
    this.element.pause();
    this.element.currentTime = 0;
  }

  loop(){
    this.element.loop = true;
  }

  noLoop(){
    this.element.loop = false;
  }

  setPosition(t) {
    this.element.currentTime = t;
  }

  getPosition() {
    return this.element.currentTime;
  }

  getVolume() {
    return this.element.volume;
  }

  setVolume(vol) {
    this.element.volume = THREE.Math.clamp(vol, 0.0, 1.0);
  }

  isPlaying() {
    if ( !this.element.paused() ) {
      return true;
    } else {
      return false;
    }
  }

  isStopped() {
    if ( this.element.paused() && this.element.currentTime == 0) {
      return true;
    } else {
      return false;
    }
  }

}
