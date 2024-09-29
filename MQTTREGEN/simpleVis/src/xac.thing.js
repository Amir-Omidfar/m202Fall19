// ........................................................................................................
//
//  generating 3d things v0.4
//
//  by xiangchen@acm.org, 05/2017
//
// ........................................................................................................

var XAC = XAC || {};

var BACKGROUNDCOLOR = 0xF2F0F0;
var GROUNDCOLOR = 0xF2F0F0;
var GRIDCOLOR = 0x888888;

var COLORNORMAL = 0xDB5B8A; // the normal color, pink-ish
var COLORCONTRAST = 0xD1D6E7; // is the contrast of the COLORNORMAL, grey-ish
var COLORHIGHLIGHT = 0xFFFA90; // highlight color, yellow-ish
var COLORFOCUS = 0xE82C0C; // color to really draw users' focus, red-ish

XAC.MATERIALNORMAL = new THREE.MeshPhongMaterial({
	color: COLORNORMAL,
	transparent: true,
	opacity: 0.33,
});

XAC.MATERIALCONTRAST = new THREE.MeshPhongMaterial({
	color: COLORCONTRAST,
	transparent: true,
	opacity: 0.75
});

XAC.MATERIALHIGHLIGHT = new THREE.MeshPhongMaterial({
	color: COLORHIGHLIGHT,
	transparent: true,
	opacity: 1.0,
});

XAC.MATERIALFOCUS = new THREE.MeshPhongMaterial({
	color: COLORFOCUS,
	transparent: true,
	opacity: 0.75,
});

XAC.MATERIALINVISIBLE = new THREE.MeshPhongMaterial({
	color: 0xffffff,
	transparent: true,
	opacity: 0.0,
	side: THREE.BackSide,
});

XAC.MATERIALWIRED = new THREE.MeshBasicMaterial({
	color: 0x000000,
	wireframe: true
});

XAC.Thing = function (m) {
	this._g = undefined; // the original geometry, always!
	this._m = m;
	this._opacity = 1;
	this._weight = undefined;
};

XAC.Thing.prototype = {
	constructor: XAC.Thing,

	get g() {
		return this._g;
	},

	get gt() {
		this._m.updateMatrixWorld();
		var gTransformed = this._g.clone();
		gTransformed.applyMatrix(this._m.matrixWorld);
		return gTransformed;
	},

	get m() {
		return this._m;
	}
}

XAC.circularShape = function (r, n) {
	var shape = new THREE.Shape();
	var step = Math.PI * 2 / n;
	for (var i = 0, theta = 0; i <= n; i++, theta += step) {
		var x = r * Math.cos(theta);
		var y = r * Math.sin(theta);
		if (i > 0) shape.lineTo(x, y);
		shape.moveTo(x, y);
	}
	return shape;
}

//
//	line
//
XAC.Line = function (p1, p2, clr) {
	this._g = new THREE.Geometry();
	this._g.vertices.push(p1);
	this._g.vertices.push(p2);
	clr = clr == undefined ? 0x000000 : clr;
	var mat = new THREE.LineBasicMaterial({
		color: clr
	});
	this._m = new THREE.Line(this._g, mat);
};
XAC.Line.prototype = Object.create(XAC.Thing.prototype);

//
//	thick line
//
XAC.ThickLine = function (p1, p2, r, mat) {
	var h = p1.distanceTo(p2);
	this._line = new XAC.Cylinder(r, h, mat, false);
	this._g = this._line.g;
	this._m = this._line.m;

	this._dir = p2.clone().sub(p1);
	rotateObjTo(this._m, this._dir);
	var ctr = p1.clone().add(p2).multiplyScalar(0.5);
	this._m.position.copy(ctr);

	this._r = r;
}
XAC.ThickLine.prototype = Object.create(XAC.Thing.prototype);
XAC.ThickLine.prototype.update = function (p1, p2, r) {
	var h = p1.distanceTo(p2);
	this._line.update(r, h, undefined, false);

	rotateObjTo(this._m, this._dir, true);
	this._dir = p2.clone().sub(p1);
	rotateObjTo(this._m, this._dir);

	var ctr = p1.clone().add(p2).multiplyScalar(0.5);
	this._m.position.copy(ctr);
}
XAC.ThickLine.prototype.updateEfficiently = function (p1, p2, r) {
	var dir = p2.clone().sub(p1);
	if (dir.length() > XAC.EPSILON && this._dir.length() > XAC.EPSILON) {
		// rotate back
		rotateObjTo(this._m, this._dir, true);

		// scale
		var yScale = dir.length() / this._dir.length();
		var xzScale = (r.r1 + r.r2) / (this._r.r1 + this._r.r2);
		scaleAroundVector(this._m, xzScale, new THREE.Vector3(0, 1, 0));
		scaleAlongVector(this._m, yScale, new THREE.Vector3(0, 1, 0));

		// rotate
		rotateObjTo(this._m, dir);

		this._r = r;
		this._dir = dir;
	}

	// reposition
	var ctr = p1.clone().add(p2).multiplyScalar(0.5);
	this._m.position.copy(ctr);
}

//
//	plane
//
XAC.Plane = function (w, l, mat) {
	this._g = new THREE.CubeGeometry(w, 0.1, l);
	this._m = new THREE.Mesh(this._g, mat == undefined ? XAC.MATERIALNORMAL.clone() :
		mat.clone());
}
XAC.Plane.prototype = Object.create(XAC.Thing.prototype);
XAC.Plane.prototype.fitTo = function (p, a, b, c) {
	rotateObjTo(this._m, new THREE.Vector3(a, b, c));
	this._m.position.copy(p);
}

//
//	sphere
//
XAC.Sphere = function (r, mat, highFi) {
	this._r = r;
	this._highFi = highFi;
	this._g = this._highFi == true ? new THREE.SphereBufferGeometry(r, 32, 32) : new THREE
		.SphereBufferGeometry(r, 8, 8);
	this._m = new THREE.Mesh(this._g, mat == undefined ? XAC.MATERIALNORMAL.clone() :
		mat.clone());
};
XAC.Sphere.prototype = Object.create(XAC.Thing.prototype);
XAC.Sphere.prototype.update = function (r, ctr) {
	if (r != undefined)
		this._m.geometry = this._highFi == true ? new THREE.SphereBufferGeometry(r, 32, 32) :
		new THREE.SphereBufferGeometry(r, 8, 8);
	if (ctr != undefined)
		this._m.position.copy(ctr);
}

//
// cylinder
//
XAC.Cylinder = function (r, h, mat, openEnded) {
	this.update(r, h, mat, openEnded)
}
XAC.Cylinder.prototype = Object.create(XAC.Thing.prototype);
XAC.Cylinder.prototype.update = function (r, h, mat, openEnded) {
	this._h = h;
	if (r.r1 != undefined && r.r2 != undefined) {
		this._r1 = r.r1;
		this._r2 = r.r2;
	} else {
		this._r1 = this._r2 = r;
	}

	// TODO: make sure the radius segment is enough for visualization
	this._g = new THREE.CylinderBufferGeometry(this._r1, this._r2, this._h, 32, 1,
		openEnded);
	if (this._m == undefined) {
		this._m = new THREE.Mesh(this._g, mat == undefined ? XAC.MATERIALNORMAL.clone() :
			mat.clone());
	} else {
		this._m.geometry = this._g;
	}
};

//
//	box
//
XAC.Box = function (w, t, l, mat) {
	this._material = mat;
	this.update(w, t, l, this._material);
}
XAC.Box.prototype = Object.create(XAC.Thing.prototype);
XAC.Box.prototype.update = function (w, t, l) {
	this._g = new THREE.CubeGeometry(w, t, l);
	this._m = new THREE.Mesh(this._g,
		this._material == undefined ? MATERIALNORMAL.clone() : this._material.clone()
	);
}

//
// 	polyhedron
//	  - vertices - an array of THREE.Vector3
//	  - faces - which vertices each face corresponds to
//
XAC.Polygon = function (vertices, faces, mat) {
	this._g = new THREE.Geometry();
	this._g.vertices = vertices;
	this._g.faces = faces;
	this._m = new THREE.Mesh(this._g, mat == undefined ? XAC.MATERIALNORMAL.clone() :
		mat.clone());
}
XAC.Polygon.prototype = Object.create(XAC.Thing.prototype);


//
//	polyline
//
XAC.Polyline = function (shape, points, mat) {
	this._curvePath = new THREE.CurvePath();
	this._shape = shape;
	this._material = mat;
	this.update(points);
}
XAC.Polyline.prototype = Object.create(XAC.Thing.prototype);
XAC.Polyline.prototype.update = function (points) {
	for (var i = 0; i < points.length - 1; i++) {
		var p0 = points[i];
		var p1 = points[i + 1];
		if (this._curvePath.curves[i] == undefined) {
			var curve = new THREE.LineCurve(p0, p1);
			this._curvePath.add(curve);
		} else {
			this._curvePath.curves[i].v1.copy(p0);
			this._curvePath.curves[i].v2.copy(p1);
		}
	}

	var extrudeSettings = {
		steps: points.length,
		amount: 16,
		extrudePath: this._curvePath
	};

	this._g = new THREE.ExtrudeGeometry(this._shape, extrudeSettings);
	this._material == undefined ? MATERIALNORMAL.clone() : this._material.clone()
	this._m = new THREE.Mesh(this._g, this._material);
}

//
//	ad hoc shape helpers
//
_balls = [];

function addABall(point, color, radius, opacity) {
	var geometry = new THREE.SphereGeometry(radius || 1, 10, 10);
	var material = new THREE.MeshBasicMaterial({
		color: color || 0xff0000,
		transparent: true,
		opacity: opacity || 1.0
	});
	var ball = new THREE.Mesh(geometry, material);
	ball.position.copy(point)

	_balls.push(ball);
	XAC.scene.add(ball);

	return ball;
}

function removeBalls() {
	for (var i = _balls.length - 1; i >= 0; i--) {
		XAC.scene.remove(_balls[i]);
	}
}

function addATriangle(v1, v2, v3, clr, wired) {
	// var vs = [v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z];
	// var fs = new THREE.Face3(0, 1, 2);

	var geometry = new THREE.Geometry(); //PolyhedronGeometry(vs, fs, 1, 1);
	geometry.vertices.push(v1);
	geometry.vertices.push(v2);
	geometry.vertices.push(v3);
	geometry.faces.push(new THREE.Face3(0, 1, 2));
	var material = new THREE.MeshBasicMaterial({
		color: clr,
		transparent: true,
		opacity: 0.5,
		wireframe: wired || false
	});
	var tri = new THREE.Mesh(geometry, material);
	tri.material.side = THREE.DoubleSide;

	XAC.scene.add(tri);

	return tri;
}

function addALine(v1, v2, clr, r) {
	var geometry = new THREE.Geometry();
	geometry.vertices.push(v1);
	geometry.vertices.push(v2);
	var material = new THREE.LineBasicMaterial({
		color: clr
	});
	var line = new THREE.Line(geometry, material);

	// HACK
	// _balls.remove(addABall(v1, clr, 0.1));
	// _balls.remove(addABall(v2, clr, 0.1));

	XAC.scene.add(line);
	return line;
}

function addAnArrow(v1, dir, len, clr, r) {
	var flipped = len < 0;

	var rArrow = r || 0.025 * len;
	var lArrow = len == undefined ? 100 : Math.abs(len);

	var mat = clr == undefined ? MATERIALFOCUS : new THREE.MeshBasicMaterial({
		color: clr,
		// transparent: true,
		// opacity: 1.0
	});

	var bodyArrow = new XAC.Cylinder(rArrow, lArrow, mat).m;

	var rArrowHead = rArrow * 5;
	var headArrow = new XAC.Cylinder({
		r1: 0,
		r2: rArrowHead
	}, rArrowHead * 2, mat).m;
	headArrow.position.add(new THREE.Vector3(0, 1, 0).multiplyScalar(lArrow * 0.5 + rArrowHead));

	var arrow = new THREE.Object3D();
	arrow.add(bodyArrow);
	arrow.add(headArrow);

	rotateObjTo(arrow, dir.clone().normalize().multiplyScalar(flipped == true ? -1 : 1));
	arrow.position.copy(v1.clone().add(
		dir.clone().normalize().multiplyScalar(lArrow * 0.5 + (flipped == true ?
			rArrowHead * 2 : 0))));

	XAC.scene.add(arrow);
	return arrow;
}