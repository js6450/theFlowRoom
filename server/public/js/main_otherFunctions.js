function createText( text, x, y, z ) {

	fontLoader.load( 'font/helvetiker_regular.typeface.json', function ( font ) {

		let geometry = new THREE.TextBufferGeometry( text, {
			font: font,
			size: 5,
			height: 0.5,
			curveSegments: 6,
			//bevelEnabled: true,
			//bevelThickness: 10,
			//bevelSize: 8,
			//bevelSegments: 5
		} );
		let material = new THREE.MeshBasicMaterial( {
			color : 0xffffff,
			side : THREE.DoubleSide
		} );
		let textMesh = new THREE.Mesh( geometry, material );
		scene.add( textMesh );

		textMesh.position.x = x;
		textMesh.position.y = y;
		textMesh.position.z = z;

	} );
}



function updateCurve( mesh, points, resolution ) {
	if (mesh == undefined) return;
	let curve = new THREE.CatmullRomCurve3( points, true, "centripetal", 0.1 );
	let curvePoints = curve.getPoints( points.length * resolution );
	mesh.geometry = new THREE.BufferGeometry().setFromPoints( curvePoints );
}



function updateCurveExtrude( mesh, points, resolution ) {
	if (mesh == undefined) return;
	let curve = new THREE.CatmullRomCurve3( points, true, "centripetal", 0.1 );
	let extrudeSettings = {
		steps: points.length * resolution,
		bevelEnabled: false,
		extrudePath: curve
	};
	mesh.geometry = new THREE.ExtrudeBufferGeometry( extrudeShape, extrudeSettings );
}



function getNoiseVector(x, y, z) {
	let noiseTwist = 12;

	let noiseValue = perlin.noise(
		( x + frameCount ) / 2500,
		( y + frameCount ) / 2500,
		( z + frameCount ) / 2500
		);

	let vector = new THREE.Vector3( 1, 0, 0 );

	let xAxis = Math.cos( frameCount * 0.5 ) * 0.5 + 0.5;
	let yAxis = Math.sin( frameCount * 0.5 ) * 0.5 + 0.5;
	let axis = new THREE.Vector3( xAxis, yAxis, xAxis*2 );
	axis.normalize();

	vector.applyAxisAngle( axis, Math.PI * noiseTwist * noiseValue);
	return vector;
}



function loadJSON( callback ) {

	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
  //xobj.open('GET', 'json/pointCloud_25-500.json', true);
  xobj.open('GET', JSON_PATH, true);

  xobj.onreadystatechange = function () {
  	if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);

}
