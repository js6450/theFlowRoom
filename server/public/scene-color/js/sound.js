let audioNum = 5;
let audioNodes = [];

let audioRoot = "audio/";

initAudioNodes();



document.addEventListener('keydown', function(event){
    //alert(event.keyCode);
    //let key = event.key.toUpperCase();
    let key = parseInt(event.key);
    audioNodes[key].play();
    console.log( "! Audio[" + key + "] played" );
} );



/*
Methods:

AudioNode.play()
AudioNode.pause()
AudioNode.stop()

AudioNode.loop()
AudioNode.noLoop()

AudioNode.easeVolume(finishVolume, easeDuration)
--> easeDuration is time it takes to reach finishVolume in seconds
AudioNode.setPan(x, y, z)
AudioNode.easePan(x, y, z, panDuration)
--> panDuration is time it takes to reach new pan position in seconds


*/


function initAudioNodes(){

  for(let i = 0; i < audioNum; i++){
    audioNodes.push(new AudioNode(i));
  }

}
