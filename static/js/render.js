
var clock = new THREE.Clock();

var camera, controls, scene, renderer;
var mixer, skeletonHelper;
var use_vr = false;
init();
animate();

var loader = new THREE.BVHLoader();
var boneContainer = new THREE.Group();

function load_bvh(filename){

	loader.load( "/bvh_models/" + filename + ".bvh" , function ( result ) {

	skeletonHelper = new THREE.SkeletonHelper( result.skeleton.bones[ 0 ] );
	skeletonHelper.skeleton = result.skeleton; // allow animation mixer to bind to SkeletonHelper directly

	
	boneContainer.add( result.skeleton.bones[ 0 ] );

	scene.add( skeletonHelper );
	scene.add( boneContainer );

	// play animation
	mixer = new THREE.AnimationMixer( skeletonHelper );
	mixer.clipAction( result.clip ).setEffectiveWeight( 1.0 ).play();

	} );

}

function init() {

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 10, 1000 );
	camera.position.set( 400, 200, 200 );

	controls = new THREE.OrbitControls( camera );
	controls.minDistance = 200;
	controls.maxDistance = 500;

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xeeeeee );

	scene.add( new THREE.GridHelper( 400, 10 ) );

	// renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	// VR settings
	effect = new THREE.StereoEffect(renderer);

	document.body.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	effect.setSize(window.innerWidth, window.innerHeight);
}

function animate() {

	requestAnimationFrame( animate );

	var delta = clock.getDelta();

	if ( mixer ) mixer.update( delta );

	if(use_vr){
		effect.render(scene,camera);
	}
	else{
		renderer.render( scene, camera );
	}
}


var options_selected = []

function toggle_vr(){
	use_vr = !use_vr;

}

