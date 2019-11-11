//	........................................................................................................
//
//	useful recurring routines, v1.0
//
//  by xiangchen@acm.org, 12/2017
//
//	........................................................................................................

var XAC = XAC || {};

function log(msg) {
	console.log(msg);
}

//
//	load models from stl binary/ascii data
//
XAC.loadStl = function (data) {
	var stlLoader = new THREE.STLLoader();
	var geometry = stlLoader.parse(data);
	var object = new THREE.Mesh(geometry, MATERIALNORMAL);
	XAC.scene.add(object);

	var dims = getBoundingBoxDimensions(object);
	var ctr = getBoundingBoxCenter(object);

	// reposition the ground & grid
	XAC.ground.position.y -= dims[1] * 0.55;

	XAC.scene.remove(XAC.grid);
	XAC.grid = XAC.drawGrid(dims[1] * 0.55);
	XAC.scene.add(XAC.grid);

	// relocate the camera
	var r = Math.max(25, XAC.getBoundingSphereRadius(object));
	XAC.camera.position.copy(XAC.posCam.clone().normalize().multiplyScalar(r * 2));

	// re-lookAt for the camera
	XAC.mouseCtrls.target = new THREE.Vector3(0, 0, 0);

	// store the object
	// objects.push(object);
}