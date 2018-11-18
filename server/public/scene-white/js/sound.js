let soundwaves = [];
let bgms = [];
let soundEffects = [];

let audioRoot = "../audio/";
let audioExtension = ".mp3";
let soundwaveFilenames = [
  "otv1_Sine A1",
  "otv1_Sine B1",
  "otv1_Sine G1",
  "otv2_Sine A2",
  "otv2_Sine B2",
  "otv2_Sine C2",
  "otv2_Sine D2",
  "otv2_Sine E2",
  "otv2_Sine Fsharp2",
  "otv2_Sine G2",
  "otv3_Sine C3",
  "otv3_Sine D3",
  "otv3_Sine E3"
];
let bgmFilenames = [
  "BGM_Watercolor LONG NEW",
  "BGM_Watercolor LONG NEW",
];
let sfxFilenames = [
  "FX_Sand NEW",
  "FX_Sand LOW",
  "FX_Mellow Noise Sweep NEW"
]


initAudioNodes();


function initBGM() {
  let audio;

  audio = bgms[0];
  audio.play();
  audio.loop();
  audio.setVolume(0.8);

  audio = bgms[1];
  setTimeout( function() {
    audio.play();
    audio.loop();
    audio.setVolume(0.8);
  }, 20000);

  console.log( "! BGM Triggered" );
}


function initAudioNodes(){

  for(let i = 0; i < soundwaveFilenames.length; i++){
    soundwaves[i] = new AudioNode( soundwaveFilenames[i] );
  }
  for(let i = 0; i < bgmFilenames.length; i++){
    bgms[i] = new AudioNode( bgmFilenames[i] );
  }
  for(let i = 0; i < sfxFilenames.length; i++){
    soundEffects[i] = new AudioNode( sfxFilenames[i] );
  }

}
