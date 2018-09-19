var Kinect2, kinect;

const WebSocketClient = require('websocket').client;
const client = new WebSocketClient();

const io = require('socket.io-client');
//const socket = io('https://theflowroom-server.herokuapp.com/');
const socket = io('http://localhost:8000');

const fs = require('fs');

var liveFeed = false;
var dataOrigin = "data/skeleton2.json";
var dataIndex = 0;

var skeletonData = [];

function init(){
    if(liveFeed){
        Kinect2 = require('kinect2');
        kinect = new Kinect2();
        console.log('Live Mode: Kinect connection made');
    }else{
        console.log('Saved Data Mode');
    }
}

init();

socket.on('connect', function(socket){
    console.log((new Date()) + " connection made");

    setConnection();

    if(liveFeed){
        startSkeletonTracking();
    }else{
        console.log('Reading saved data');

        fs.readFile(dataOrigin, 'utf8', function(err, data){
            skeletonData = JSON.parse(data);
            console.log("Total data length: " + skeletonData.length);
        });

        sendSavedData();
    }

});

socket.on('disconnect', function(socket){
    stopSkeletonTracking();
});


function setConnection(){
    socket.emit('status', 0);
}

/*
Prep Kinect for live feed
 */

var RAWWIDTH = 512;
var RAWHEIGHT = 424;

var busy = false;

var sendAllBodies = false;
var rawDepth = false;

// Key Tracking needs cleanup
var trackedBodyIndex = -1;

var jointCoords = [];
var depthData = [];

function startSkeletonTracking() {
    console.log('starting skeleton');
    rawDepth = true;

    if (kinect.open()) {
        console.log('kinect is open');
        kinect.on('rawDepthFrame', function (newPixelData) {
            if (busy) {
                return;
            }
            busy = true;

            depthData = newPixelData;
            busy = false;
        });

        kinect.on('bodyFrame', function (bodyFrame) {

            // if (sendAllBodies) {
            //
            // }

            var index = 0;
            bodyFrame.bodies.forEach(function (body) {
                if (body.tracked) {

                    //console.log((new Date()) + ' body tracked!!');
                   // console.log((new Date()) + " body available: " + bodyAvailable);

                    var newBody = [];
                    jointCoords = calcJointCoords(body.joints);

                    if (!sendAllBodies) {
                            var newJoints = [];
                            getDepthForJSON(jointCoords, depthData);

                            newBody.push({
                                "bodyIndex": body.bodyIndex,
                                "trackingId": body.trackingId,
                                "leftHandState": body.leftHandState,
                                "rightHandState": body.rightHandState,
                                "joints": jointCoords
                            });

                            sendData(newBody);
                    }
                    index++;
                }
            });
        });
        kinect.openBodyReader();
    }else{
        console.log('kinect is closed');
    }
    kinect.openRawDepthReader();
}

function stopSkeletonTracking() {
    console.log('stopping skeleton');
    kinect.closeBodyReader();
    kinect.removeAllListeners();

    kinect.closeRawDepthReader();
    rawDepth = false;
    busy = false;
}

function calcJointCoords(joints){
    var jointCoords = [];

    for(var i = 0; i < joints.length - 4; i++){
        var xpos = Math.floor(joints[i].depthX * RAWWIDTH);
        var ypos = Math.floor(joints[i].depthY * RAWHEIGHT);
        jointCoords.push({"x": xpos, "y": ypos});
    }

    return jointCoords;
}

function getDepthForJSON(jointCoords, pixels){

   // console.log('calculating depth for json');

    for(var i = 0; i < jointCoords.length; i++){

        var pArray = [];

        var jointX = jointCoords[i].x;
        var jointY = jointCoords[i].y;

        var zIndex = 2 * (jointY * RAWWIDTH + jointX);
        var jointZ = Math.round(map(pixels[zIndex] + pixels[zIndex + 1] * 255, 0, 4499, -500, 500));
        jointCoords[i].z = jointZ;

        if(jointY < 424 && jointX < 512 && jointX > 0 && jointY > 0){
            var pnum = 30;
            var dist;

            if(i == 1){
                dist = 60;
                pnum = 50;
            }else if(i == 3 || i == 14 || i == 18){
                dist = 30;
            }else if(i == 2){
                dist = 10;
                pnum = 10;
            }else if(i == 15 || i == 19){
                dist = 15;
                pnum = 10;
            }else if(i == 12 || i == 16){
                dist = 50;
            }else if(i == 13 || i == 17){
                dist = 60;
                pnum = 40;
            }else{
                dist = 40;
            }

            while(pArray.length < pnum){
                var x = jointX + Math.floor(Math.random() * dist * 2) - dist;
                var y = jointY + Math.floor(Math.random() * dist * 2) - dist;
                var index = 2 * (y * RAWWIDTH + x);

                while(index < 0 || index > 2 * 512 * 424){
                    x = jointX + Math.floor(Math.random() * dist * 2) - dist;
                    y = jointY + Math.floor(Math.random() * dist * 2) - dist;
                    index = 2 * (y * RAWWIDTH + x);
                }

                var z = Math.round(map(pixels[index] + pixels[index + 1] * 255, 0, 4499, -500, 500));

                if((jointX - x) * (jointX - x) + (jointY - y) * (jointY - y) + (jointZ - z) * (jointZ - z) < dist * dist){
                    pArray.push({"x": x, "y": y, "z": z});
                }

                // console.log(i + ": " + pArray.length);
                // console.log('jointX: ' + jointX + ", jointY: " + jointY);
            }

            jointCoords[i].px = pArray;
        }

    }

   // console.log('done calculating');
}

function map (num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function sendData(newBody){
  //  console.log((new Date()) + " sending new data");
    var data = JSON.stringify(newBody);
    socket.emit('message', data);
}

/*
Prep data for sending saved JSON data
 */

function sendSavedData(){

    if(socket.connected){
        //console.log(dataIndex);

        var currentData = JSON.stringify(skeletonData[dataIndex]);
        socket.emit('message', currentData);

        dataIndex++;

        if(dataIndex > skeletonData.length - 1){
            dataIndex = 0;
        }

        setTimeout(sendSavedData, 50);
    }

}

