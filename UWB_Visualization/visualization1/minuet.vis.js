//	........................................................................................................
//
// 3d visualization for project minuet, v1.0
//
// by xiangchen@acm.org, 07/2018
// by runchank@andrew.cmu.edu  07/2018
//

// 🚨 🚨 🚨 🚨 🚨 🚨 🚨  NOTE! 🚨 🚨 🚨 🚨 🚨 🚨 🚨
// - in three.js, y is vertical, z is horizontal, x remains the same
//
// TO IMPROVE:
// - interpolation to make the animation smoother
//	........................................................................................................
// July2018 - Richard - added the MQTT section for incoming data stream
// June 2019 - Shizhong Hao added registration,interpolation 

//用与pi连接的port 或者 传输的data带一个string 来更新updatecurpoint?

var XAC = XAC || {};
var MINUET = MINUET || {}; 
var fur_dict = {}
var path_list = [];
var data_stream =[];
var dataflag = 0;
var host = "192.168.1.40";
var port = 9001;
var flag = 0;
var counter = 0;
var pathflag = 0;
var fur = 0;
var path_counter = 0;

var x = 0;
var y = 0;
var z= 0;
var yaw= 0;
var pitch= 0;
var roll= 0;
//
function LinkedList(){
    this.head = null;
    this.tail = null;
    this.numberofpoint = 0;

}
function Node(data){
  this.data = data;
  this.next = null;
}


LinkedList.prototype.add = function(data){ //add node to the linked-list
  var node = new Node(data);
  if(!this.head){
    this.head = node;
    this.tail = node;

  }
  else{
    this.tail.next = null;
    this.tail = node;
  }
  this.numberofpoint++;
    
  
};
LinkedList.prototype.print = function() {
  
  var current = this.head;
  console.log(current.data);
  console.log(this.numberofpoint);
  while(current) {
    
    current = current.next; //这样不就只print一个node剩下的全都是带过嘛
  }
};
//linked list to store path
const list = new LinkedList();

//  ready function to initialize the vis
//
$(document).ready(function() {
  // load configuration and data



  YAML.load("config.yml", function(config) {


    Object.assign(MINUET, config);

    //MINUET.setupScene(MINUET.room.lx, MINUET.room.ly, MINUET.room.lz);
    MINUET.setupScene(-MINUET.room.lx, MINUET.room.ly, MINUET.room.lz);
    console.log(MINUET.room.lz);

    XAC.createUI();
    var mqtt;

    MINUET.dataLogs;

    MINUET.updateCurPoint("0 0 0 0 0 0");


          // visualize the user and anchors
    MINUET.user = addABall(MINUET.dataLogs.position, 0xff0000, 150);
    for (anchor of MINUET.anchors) {
      var posAnchor = new THREE.Vector3(-anchor.x, anchor.z, anchor.y);
      addABall(posAnchor, 0x0000ff, 150);
    }     



          function onFailure(message) {
            console.log("Connection Attempt to Host "+host+"Failed");
            setTimeout(MQTTconnect, 2000);
          }


          function onMessageArrived(msg){
            
            out_msg="Message received "+msg.payloadString;
            console.log(out_msg);
            MINUET.updateCurPoint(msg.payloadString);
            MINUET.animate();


          }

          function onConnect() {
            console.log("Connected ");
            mqtt.subscribe("userLoc");
            mqtt.subscribe("esp8266")
            message = new Paho.MQTT.Message("mqtt Start");
            message.destinationName = "jsStatus";
            mqtt.send(message);
          }


          function MQTTconnect() {
            console.log("connecting to "+ host +" "+ port);
            mqtt = new Paho.MQTT.Client(host,port,"clientjs");
            var options = {
              timeout: 3,
              onSuccess: onConnect,
              onFailure: onFailure,
              //userName:"admin",
              //password:"19930903",
            };
            mqtt.onMessageArrived = onMessageArrived

            mqtt.connect(options); 
          }

          MQTTconnect();
    });
});



calDist = function(location1,location2){
  var x_2 = Math.pow(location1.x - location2.x,2); 
  var z_2 = Math.pow(location1.z - location2.z,2);

  return Math.sqrt(x_2+z_2);


};

findNearestNode = function(list,location){
  var idx = 0;
  var cur = list[idx];
  var dis = calDist(location,cur);
  var idx_start = 0;
  console.log(dis);
  while(idx < list.length){
          
    var tmp = calDist(location,list[idx]);
    if(tmp < dis){
      dis = tmp;
      idx_start = idx; 
    }
    idx++;
  }

  return idx_start;
};



MINUET.updateCurPoint = function(rawData){
    //console.log("got: "+ rawData);

    if (rawData.includes('raspberrypi') == true) {

      var singleData = rawData.split(" ");
      
      if(dataflag == 0){
        data_stream[0] = singleData;
        data_stream[1] = singleData;
        data_stream[2] = singleData;
        data_stream[3] = singleData;
        dataflag = 1;
      }
      data_stream[0] = data_stream[1];
      data_stream[1] = data_stream[2];
      data_stream[2] = data_stream[3];
      data_stream[3] = singleData;
      x = -(Number(data_stream[0][0])+Number(data_stream[1][0])+Number(data_stream[2][0])+Number(data_stream[3][0]))/4;
      y = (Number(data_stream[0][1])+Number(data_stream[1][1])+Number(data_stream[2][1])+Number(data_stream[3][1]))/4;
    //var z = (Number(data_stream[0][2])+Number(data_stream[1][2])+Number(data_stream[2][2])+Number(data_stream[3][2]))/4;
    //var proxyZ = Number(singleData[2]);
    //var proxyZ = Number(singleData[2])-Math.sin((pitch * Math.PI) / 180)*MINUET.armLength;
      z = MINUET.hardcodedZ;
      
    }
    if (rawData.includes('Orientation') == true){
      //console.log("got: "+ rawData);
    
      var imuData = rawData.split(" ");
      yaw = Number(imuData[2]-30);
      pitch= Number(imuData[3]);
      roll= Number(imuData[4]);
      
    }

    if (yaw < 0){
      yaw += 360;
    }

    console.log("x: "+ x);
    console.log("y: "+ y);
    console.log("z: "+ z);
    console.log("pitch: "+ pitch);
    console.log("yaw: "+ yaw);
    console.log("roll: "+ roll);
    


  MINUET.dataLogs = {
          position: new THREE.Vector3(x, y, z),
          orientation: new THREE.Vector3(
            -Math.sin((360-yaw * Math.PI) / 180) *
              Math.cos((pitch * Math.PI) / 180),
            Math.sin((pitch* Math.PI) / 180),
            -Math.cos((pitch * Math.PI) / 180)*
              Math.cos((360-yaw * Math.PI) / 180),


          )
        }
        console.log(MINUET.dataLogs.position);
        console.log(MINUET.dataLogs.orientation);
        if(pathflag == 1){                              //245-265 在干什么？ 为什么251行要counter > 10才locate

          if(path_counter > 10){
            addABall(MINUET.dataLogs.position,0x808080,50);
            //list.add(MINUET.dataLogs.position);
            console.log("check counter "+ path_counter);
            //console.log(MINUET.dataLogs.position);
            path_list.push(MINUET.dataLogs.position);
            //list.print();
            path_counter =0;
          //var i;
          
          //for (i = 0;i < path_list.length;i++){
            //console.log(path_list[i]);
          //}
          }
          path_counter++;
        }
}


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
  var nxSteps = -(lx / step) | 0;
  
  for (var i = 0; i <= nxSteps; i++) {
    lineGeometry.vertices.push(new THREE.Vector3(-i * step, floor, 0));
    lineGeometry.vertices.push(new THREE.Vector3(-i * step, floor, ly));
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
document.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  //addABall(path_tmp_data.position,0x808080,50);
  
  if (event.keyCode == 13 && counter == 0) {
      // Cancel the default action, if needed
    var reg_tmp_data = MINUET.dataLogs;
    
    addABall(reg_tmp_data.position, 0x008000, 150);
    
    
    fur_dict[fur] = reg_tmp_data.position;
    fur++;

    console.log("location dict:"+fur_dict);


    counter = 1;



    event.preventDefault();
    //console.log("start registering");
      // Trigger the button element with a click
  }
  if (event.keyCode == 13 && counter == 1){
    counter = 0;
    event.preventDefault();
    //console.log("stop registering");
  }
  
  if (event.keyCode == 32 && pathflag == 1){
    //var path_tmp_data = MINUET.dataLogs;
    pathflag = 0;    

    event.preventDefault();
    
    //console.log("pathflag is " + pathflag );
    
  }

});


document.addEventListener("keydown", function(event) {
  if (event.keyCode == 32 && pathflag == 0){
    pathflag = 1;
    //path_counter++;
    //console.log("path_counter" + path_counter);
    event.preventDefault();
  }
});

//Add navigation to some destination
document.addEventListener("keypress", function(event) {
  if(event.keyCode == 48){
    //exit current navigation
    //reset all visualization to registration default
    console.log("exit current navigation");
    addABall(fur_dict[0],0x008000, 150);
    for (var i = 0;i < path_list.length;i++){
      addABall(path_list[i],0x808080,50);
    }
    event.preventDefault();

  }

  if(event.keyCode == 49){
    console.log("1 pressed");
    //console.log(Object.keys(fur_dict).length);
    //start navigation to 1st location

    if(Object.keys(fur_dict).length != 0){
       var idx = 0;
       var destination = Object.values(fur_dict)[idx]; //vecter 3
       addABall(destination, 0xff8000, 150)

       //console.log(calDist(MINUET.user.position,destination));
       //start navigation
       //find the nearest route node
       var i_start = findNearestNode(path_list,MINUET.user.position); //current position --> nearest node
       var i_end = findNearestNode(path_list,destination); //dest --> dest's nearest node
       //console.log(path_list[idx_start]);
       


       //choose nshortest path
       if(i_start < i_end){

          if (i_end - i_start > (path_list.length - i_end + i_start)){
            for (var i = i_end; i < path_list.length ;i++){
              addABall(path_list[i], 0xff007f, 50);
            }
            for (var i = 0; i < i_start; i++){
              addABall(path_list[i], 0xff007f, 50);
            }
          }
          else{
            for (var i = i_start; i < i_end ;i++){
            addABall(path_list[i], 0xff007f, 50);
            }  
          }
          
       }
       else{
          if (i_start - i_end > (path_list.length - i_start + i_end))
          {
            for (var i = i_start; i < path_list.length ;i++){
              addABall(path_list[i], 0xff007f, 50);
            }
            for (var i = 0; i < i_end; i++){
              addABall(path_list[i], 0xff007f, 50);
            } 
          }
          else{
            for (var i = i_start; i > i_end ;i--){
            addABall(path_list[i], 0xff007f, 50);
            }  

          }
          
       }

       //addABall(path_list[i_start], 0xff007f, 50);
       addABall(path_list[i_end], 0xf000000, 50)
       //}
       //console.log(Object.values(fur_dict)[idx]);
    }
    event.preventDefault();

  }
  
});
MINUET.animate = function() {
  var data = MINUET.dataLogs;
  
  MINUET.user.position.copy(MINUET.dataLogs.position);
  //MINUET.user.
  XAC.scene.remove(MINUET.pointer);

  MINUET.pointer = addAnArrow(
    MINUET.user.position,
    data.orientation,
    1000,
    0xff0000,
    25
    );
  XAC.scene.add(MINUET.pointer);

};


