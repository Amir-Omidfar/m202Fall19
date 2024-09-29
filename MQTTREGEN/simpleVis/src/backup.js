//	........................................................................................................
//
// 3d visualization for project minuet, v1.0
//
// by xiangchen@acm.org, 07/2018
//
// 🚨 🚨 🚨 🚨 🚨 🚨 🚨  NOTE! 🚨 🚨 🚨 🚨 🚨 🚨 🚨
// - in three.js, y is vertical, z is horizontal, x remains the same
//
// TO IMPROVE:
// - interpolation to make the animation smoother
//	........................................................................................................

var XAC = XAC || {};
var MINUET = MINUET || {};
var mqtt;
var reconnectTimeout = 2000;
var host="192.168.1.8";
var port=9001;
//
//  ready function to initialize the vis
//
$(document).ready(function() {
  // load configuration and data
  YAML.load("config.yml", function(config) {
    Object.assign(MINUET, config);

    MINUET.setupScene(MINUET.room.lx, MINUET.room.ly, MINUET.room.lz);
    XAC.createUI();

    // load log data
    YAML.load("visual_data.yml", function(dataLogs) {
      MINUET.dataLogs = [];

      // compute positions and orientations
      for (entry of dataLogs) {
        MINUET.dataLogs.push({
          position: new THREE.Vector3(entry.x, MINUET.hardcodedZ, entry.y),
          orientation: new THREE.Vector3(
            Math.sin(((360 - entry.yaw) * Math.PI) / 180) *
              Math.cos((entry.pitch * Math.PI) / 180),
            Math.sin((entry.pitch * Math.PI) / 180),
            -Math.cos(((360 - entry.yaw) * Math.PI) / 180) *
              Math.cos((entry.pitch * Math.PI) / 180)
          )
        });
      }

      // visualize the user and anchors
      MINUET.user = addABall(MINUET.dataLogs[0].position, 0xff0000, 150);
      for (anchor of MINUET.anchors) {
        var posAnchor = new THREE.Vector3(anchor.x, anchor.z, anchor.y);
        addABall(posAnchor, 0x0000ff, 150);
      }

      // for debugging, press any key to start the animation
      $(document).on("keydown", function(event) {
        MINUET.idxData = 0;
        MINUET.animate();
      });
    });
  });
});

//
//  set up the scene for visualization
//
MINUET.setupScene = function(lx, ly, lz) {
  // scene and view point
  XAC.scene = new THREE.Scene();
  XAC.objects = new Array();

  //  draw ground
  var lineMaterial = new THREE.LineBasicMaterial({
    color: MINUET.gridColor
  });
  var lineGeometry = new THREE.Geometry();
  var floor = 0;
  var step = 250;
  var nxSteps = (lx / step) | 0;
  for (var i = 0; i <= nxSteps; i++) {
    lineGeometry.vertices.push(new THREE.Vector3(i * step, floor, 0));
    lineGeometry.vertices.push(new THREE.Vector3(i * step, floor, ly));
  }
  var nzSteps = (ly / step) | 0;
  for (var i = 0; i <= nzSteps; i++) {
    lineGeometry.vertices.push(new THREE.Vector3(0, floor, i * step));
    lineGeometry.vertices.push(new THREE.Vector3(lx, floor, i * step));
  }

  lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
  lineGeometry.vertices.push(new THREE.Vector3(0, lz, 0));
  lineGeometry.vertices.push(new THREE.Vector3(lx, 0, 0));
  lineGeometry.vertices.push(new THREE.Vector3(lx, lz, 0));
  lineGeometry.vertices.push(new THREE.Vector3(lx, 0, ly));
  lineGeometry.vertices.push(new THREE.Vector3(lx, lz, ly));
  lineGeometry.vertices.push(new THREE.Vector3(0, 0, ly));
  lineGeometry.vertices.push(new THREE.Vector3(0, lz, ly));

  lineGeometry.vertices.push(new THREE.Vector3(0, lz, 0));
  lineGeometry.vertices.push(new THREE.Vector3(lx, lz, 0));
  lineGeometry.vertices.push(new THREE.Vector3(lx, lz, 0));
  lineGeometry.vertices.push(new THREE.Vector3(lx, lz, ly));
  lineGeometry.vertices.push(new THREE.Vector3(lx, lz, ly));
  lineGeometry.vertices.push(new THREE.Vector3(0, lz, ly));
  lineGeometry.vertices.push(new THREE.Vector3(0, lz, ly));
  lineGeometry.vertices.push(new THREE.Vector3(0, lz, 0));

  var grid = new THREE.Line(lineGeometry, lineMaterial, THREE.LinePieces);
  XAC.scene.add(grid);

  // set up camera
  XAC.camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );

  var ratioCamPos = new THREE.Vector3(0.25, 2.5, 1.5).multiplyScalar(0.8);
  XAC.posCam = new THREE.Vector3(
    lx * ratioCamPos.x,
    lz * ratioCamPos.y,
    ly * ratioCamPos.z
  );
  XAC.camera.position.copy(XAC.posCam);

  XAC.lookAt = new THREE.Vector3(lx / 2, lz / 2, ly / 2);

  XAC.mouseCtrls = new THREE.TrackballControls(
    XAC.camera,
    undefined,
    XAC.lookAt
  );

  // set up mouse
  XAC.mouseCtrls.rotateSpeed = 5.0;
  XAC.mouseCtrls.zoomSpeed = 0.5;
  XAC.mouseCtrls.panSpeed = 2;

  XAC.mouseCtrls.noZoom = false;

  XAC.mouseCtrls.staticMoving = true;
  XAC.mouseCtrls.dynamicDampingFactor = 0.3;

  XAC.wheelDisabled = false;

  // add lights
  XAC.lights = [];
  XAC.lights[0] = new THREE.PointLight(0xffffff, 1, 0);
  XAC.lights[0].position.set(0, 10000, -10000);
  XAC.lights[0].castShadow = true;
  XAC.scene.add(XAC.lights[0]);

  // stats window
  XAC.stats = new Stats();
  XAC.stats.domElement.style.position = "absolute";
  XAC.stats.domElement.style.top = "0px";
  XAC.stats.domElement.style.right = "0px";
  $(document.body).append(XAC.stats.domElement);

  // renderer
  XAC.renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  XAC.renderer.setSize(window.innerWidth, window.innerHeight);
  $(document.body).append(XAC.renderer.domElement);
  XAC.renderer.setClearColor(MINUET.bgColor);

  var render = function() {
    requestAnimationFrame(render);
    XAC.mouseCtrls.update();
    XAC.stats.update();
    XAC.lights[0].position.copy(XAC.camera.position);
    XAC.renderer.render(XAC.scene, XAC.camera);
  };

  render();
};

//
// recursively do animation
//
MINUET.animate = function() {
  var data = MINUET.dataLogs[MINUET.idxData++];
  MINUET.user.position.copy(data.position);
  XAC.scene.remove(MINUET.pointer);
  MINUET.pointer = addAnArrow(
    MINUET.user.position,
    data.orientation,
    1000,
    0xff0000,
    25
  );
  XAC.scene.add(MINUET.pointer);
  if (MINUET.idxData < MINUET.dataLogs.length) setTimeout(MINUET.animate, 250);
};


////////////////////////////////////
//
//   MQTT section
//
////////////////////////////////////


function onFailure(message) {
      console.log("Connection Attempt to Host "+host+"Failed");
      setTimeout(MQTTconnect, reconnectTimeout);
        }


function onMessageArrived(msg){
  //change this function for the arrival of incoming data
  //msg.payloadString is the location+direction values (x,y,z,yaw,pitch,roll)
  //msg.destinationName is the topic which the data will be published on ( leave it and I will ajust it based on my server later)
  out_msg="Message received "+msg.payloadString+"<br>";
  out_msg=out_msg+"Message received Topic "+msg.destinationName;
  console.log(out_msg);

}

function onConnect() {
  console.log("Connected ");
  mqtt.subscribe("jsTest");
  message = new Paho.MQTT.Message("Hello World");
  message.destinationName = "jsTest";
  mqtt.send(message);
}


function MQTTconnect() {
  console.log("connecting to "+ host +" "+ port);
  mqtt = new Paho.MQTT.Client(host,port,"clientjs");
  var options = {
    timeout: 3,
    onSuccess: onConnect,
    onFailure: onFailure,
    userName:"admin",
    password:"19930903",
     };
  mqtt.onMessageArrived = onMessageArrived

  mqtt.connect(options); 
}
