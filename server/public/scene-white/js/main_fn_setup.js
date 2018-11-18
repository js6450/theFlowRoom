function preloadShaders() {
	let sl = new ShaderLoader();
	sl.loadShaders({
		particle_vert : "",
		particle_frag : "",
		flowParticle_vert : "",
		flowParticle_frag : "",
		instance_vert : "",
		instance_frag : "",
	}, "glsl/", init );
}


function setupThreeObjects() {
  container = document.getElementById( 'container' );

	fontLoader = new THREE.FontLoader();
	textureLoader = new THREE.TextureLoader();



	// TEXTURES

	floorTexture = textureLoader.load( "../img/texture_dots.jpg" );
	floorTexture.wrapS = THREE.RepeatWrapping;
	floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set( 16, 16 );

	flowTexture = textureLoader.load( "../img/texture_dots.jpg" );
	flowTexture.wrapS = THREE.RepeatWrapping; //MirroredRepeatWrapping;
	flowTexture.wrapT = THREE.RepeatWrapping; //MirroredRepeatWrapping;
	flowTexture.repeat.set( 10, 10 );

	bodyTexture = textureLoader.load( "../img/texture_flow.jpg" );
	bodyTexture.wrapS = THREE.MirroredRepeatWrapping;
	bodyTexture.wrapT = THREE.MirroredRepeatWrapping;
	bodyTexture.repeat.set( 2, 2 );


	// SHADERS

	let uniforms;

	// Body Material
	uniforms = {
		texture:   { value: textureLoader.load( "../img/particle_sprite.png" ) }
	};
	bodyShaderMaterial = new THREE.ShaderMaterial( {
		uniforms:       uniforms,
		vertexShader:   ShaderLoader.get( "particle_vert" ),
		fragmentShader: ShaderLoader.get( "particle_frag" ),
		blending:       THREE.AdditiveBlending,
		depthTest:      false,
		transparent:    true,
		vertexColors:   true
	} );

	// Flow Material
  uniforms = {
    texture: { value: textureLoader.load( "../img/spark.png" ) },
    time: { value: 0.0 }
  };
  flowParticleMaterial = new THREE.ShaderMaterial( {
    uniforms:       uniforms,
    vertexShader:   ShaderLoader.get( "flowParticle_vert" ),
    fragmentShader: ShaderLoader.get( "flowParticle_frag" ),
    blending:       THREE.AdditiveBlending,
    depthTest:      false,
    transparent:    true,
    vertexColors:   true
  } );



	// SCENE

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xDDDDE0, 10, 3500 );



	// CAMERA

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 10, 20000 );
	camera.position.z = CAMERA_DISTANCE_MAX;



	// CONTROLS

	let controls = new THREE.OrbitControls( camera, container );
	//controls.addEventListener( 'change', render ); // remove when using animation loop
	// enable animation loop when using damping or autorotation
	//controls.enableDamping = true;
	//controls.dampingFactor = 0.25;
	//controls.enableZoom = false;



	// RENDERER

	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setClearColor( scene.fog.color );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	// TODO:
	// I don't know the reason yet
	// but if we don't have these gammaI&O we can't really see the box helper.
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	container.appendChild( renderer.domElement );



	// HELPERS

	let helper = new THREE.BoxHelper( new THREE.Mesh( new THREE.BoxGeometry( WORLD_WIDTH, WORLD_HEIGHT, WORLD_DEPTH ) ) );
	helper.material.color.setHex( 0x080808 );
	helper.material.blending = THREE.AdditiveBlending;
	helper.material.transparent = true;
	// scene.add( helper );



	// THREE OBJECTS

	// ambient lighting
	let ambiColor = "#000309";
	let ambientLight = new THREE.AmbientLight(ambiColor);
	// scene.add(ambientLight);

	// point lighting
	let pointColor = "#CCCCCC";
	pointLight = new THREE.PointLight(pointColor);
	pointLight.distance = 1000;
	// scene.add(pointLight);

	// point lighting2
	// let color = "#ffffff";
	// let light1 = new THREE.PointLight(color);
	// light1.distance = 100000;
	// light1.position.y = 1000;
	// scene.add(light1);


	// Ground plane
	let planeGeometry = new THREE.PlaneGeometry(WORLD_WIDTH*10, WORLD_DEPTH*10, 100, 100);
	for( let i = 0; i < planeGeometry.vertices.length; i ++) {
		planeGeometry.vertices[i].z = Math.random() * 150;
	}


	//let planeMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
	let planeMaterial = new THREE.MeshPhysicalMaterial( {
		// color: 0xffffff,
		emissive : 0x445566,
		//roughness : 0.5,
		//metalness : 0.5,
		reflectivity : 0.0,
		//side : THREE.DoubleSide,
		// transparent : true,
		// opacity: 0.2,
		flatShading : true,
		//wireframe : true,
		// map : floorTexture
	} );

	let plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.receiveShadow = true;
	plane.rotation.x = -0.5 * Math.PI;
	plane.position.x = 0;
	plane.position.y = -WORLD_HEIGHT/2-200;
	plane.position.z = 0;
	scene.add(plane);
}
