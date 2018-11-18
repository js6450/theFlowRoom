// GUI
let gui = new dat.gui.GUI();
let guiToggle = false;

let ui = {
  requestRate: 10,
  bodyState: -1,
  interactionDistance: 100
};

gui.add(ui, 'requestRate', 1, 300)
.step(1)
.listen()
.onChange(function (e) {
  requestFrame = parseInt(e);
});

gui.add(ui, 'bodyState', -1, 4)
.step(1);

gui.add(ui, 'interactionDistance', 50, 300)
.step(10);
// gui.addColor(ui, 'pointLightColor').onChange(function (e) {
// 	pointLight.color = new THREE.Color(e);
// });
