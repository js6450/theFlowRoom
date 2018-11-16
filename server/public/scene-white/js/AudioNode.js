class AudioNode{

    constructor(fileName){
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        this.audioElement = document.createElement('audio');
        this.audioElement.id = fileName;

        document.body.appendChild(this.audioElement);

        this.audioElement.src = audioRoot + fileName + ".wav";

        this.audioSource = this.audioCtx.createMediaElementSource(this.audioElement);

        this.pannerNode = this.audioCtx.createPanner();
        this.pannerNode.panningModel = 'HRTF';

        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = 1;

        this.audioSource.connect(this.pannerNode);
        this.pannerNode.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);
    }


    async play(){
        try{
            await this.audioElement.play();
        }catch(err){
            console.log(err);
        }
    }

    pause(){
        this.audioElement.pause();
    }

    stop(){
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
    }

    loop(){
        this.audioElement.loop = true;
    }

    noLoop(){
        this.audioElement.loop = false;
    }

    easeVolume(vol, t){
        this.gainNode.gain.setTargetAtTime(vol, this.audioCtx.currentTime + t, 0.5);
    }

    setPan(x, y, z){
        this.pannerNode.positionX.value = x;
        this.pannerNode.positionY.value = y;
        this.pannerNode.positionZ.value = z;
    }

    easePan(x, y, z, t){
        this.pannerNode.positionX.setTargetAtTime(x, this.audioCtx.currentTime + t, 0.5);
        this.pannerNode.positionY.setTargetAtTime(y, this.audioCtx.currentTime + t, 0.5);
        this.pannerNode.positionZ.setTargetAtTime(z, this.audioCtx.currentTime + t, 0.5);
    }

}