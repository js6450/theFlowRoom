var Kinect2, kinect;

const io = require('socket.io-client');
//const socket = io('https://theflowroom-server.herokuapp.com/');
const addr = 'http://localhost:8000';
//const addr = "http://128.122.151.58:8000"
const socket = io(addr);

const fs = require('fs');
const util = require('util');

var saveLog = false;

var logName = new Date().toISOString().split('T')[0] + ".log";

var log_file = fs.createWriteStream('log/' + logName, {flags : 'a'});
var log_stdout = process.stdout;

console.log = function(d) {
    var timeStamp = new Date().toISOString();

    if(saveLog){
        log_file.write(util.format(timeStamp + ": " + d) + '\n');
    }

    log_stdout.write(util.format(timeStamp + ": " + d) + '\n');
};

var liveFeed = true;
var saveFeed = false;
var firstData = true;

var dataDest = "data/";
var dataOrigin = "data/1009-color.json";
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

    if(saveFeed){
       dataDest += Date.now() + ".json";

       console.log("Saving data to " + dataDest);
    }
}

init();

socket.on('connect', function(socket){
    console.log("Connection made to " + addr);

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
    console.log('Socket with ' + socket.id + ' disconnected');

    stopSkeletonTracking();

    if(saveFeed){
        fs.appendFile(dataDest, "]", 'utf8', function(err){
            if(err){
                return console.log(err);
            }
        });
    }
});


function setConnection(){
    socket.emit('status', 0);

    if(saveFeed){
        fs.writeFile(dataDest, '[', 'utf8', function(err){
            if(err){
                return console.log(err);
            }
        });
    }
}

/*
Prep Kinect for live feed
 */
var RAWWIDTH = 512;
var RAWHEIGHT = 424;

var busy = false;

var sendAllBodies = false;
var rawDepth = false;

var bodyCount = 0;

var jointCoords = [];
var depthData = [];
var colorData = [];
var bodyFrame = [];

function startSkeletonTracking() {
    console.log('Starting skeleton tracking');
    rawDepth = true;

    if (kinect.open()) {
        console.log('Kinect device is open');

        //https://github.com/wouterverweirder/kinect2/blob/master/examples/point-cloud-colors-electron/index.html

        kinect.on('multiSourceFrame', function(frame){

            if(busy) {
                return;
            }
            busy = true;

            //length = 434176
            depthData = frame.rawDepth.buffer;
            //length = 868352
            colorData = frame.depthColor.buffer;

            bodyFrame = frame.body.bodies;

            var index = 0;
            var newBody = [];
            if(bodyFrame.length > 0){
                //console.log("there is body");
                bodyFrame.forEach(function (body) {
                    if (body.tracked) {

                        //console.log((new Date()) + ' body tracked!!');
                        // console.log((new Date()) + " body available: " + bodyAvailable);

                        jointCoords = calcJointCoords(body.joints);

                        if (!sendAllBodies) {
                            getDataForJSON(jointCoords, depthData, colorData);

                            newBody.push({
                                "sid": socket.id,
                                "bodyIndex": body.bodyIndex,
                                "trackingId": body.trackingId,
                                "leftHandState": body.leftHandState,
                                "rightHandState": body.rightHandState,
                                "joints": jointCoords
                            });
                        }
                        index++;
                    }
                });

                if(bodyCount != index){
                    bodyCount = index;

                    console.log("Total number of bodies detected: " + bodyCount);
                }

                if(newBody != null){
                    sendData(newBody);
                }
            }

            busy = false;
        });
        kinect.openMultiSourceReader({
            frameTypes: Kinect2.FrameType.rawDepth | Kinect2.FrameType.depthColor | Kinect2.FrameType.body
        });
    }else{
        console.log('kinect is closed');
    }
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

function getDataForJSON(jointCoords, depths, colors){
    for(var i = 0; i < jointCoords.length; i++){

        var pArray = [];

        var jointX = jointCoords[i].x;
        var jointY = jointCoords[i].y;

        var zIndex = 2 * (jointY * RAWWIDTH + jointX);
        var jointZ = Math.round(map(depths[zIndex] + depths[zIndex + 1] * 255, 0, 4499, -500, 500));
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

                var z = Math.round(map(depths[index] + depths[index + 1] * 255, 0, 4499, -500, 500));

                if((jointX - x) * (jointX - x) + (jointY - y) * (jointY - y) + (jointZ - z) * (jointZ - z) < dist * dist){
                    // var mappedX = Math.round(map(x, 0, RAWWIDTH - 1, 0, COLWIDTH - 1));
                    // var mappedY = Math.round(map(y, 0, RAWHEIGHT - 1, 0, COLHEIGHT - 1));
                    var cIndex = 4 * (y * RAWWIDTH + x);

                    let rVal = ("0" + Math.round(map(colors[cIndex], 0, 255, 0, 99))).slice(-2);
                    let gVal = ("0" + Math.round(map(colors[cIndex + 1], 0, 255, 0, 99))).slice(-2);
                    let bVal = ("0" + Math.round(map(colors[cIndex + 2], 0, 255, 0, 99))).slice(-2);

                    // var r = ("0" + colors[index]).slice(-3);
                    // var g = ("0" + colors[index + 1]).slice(-3);
                    // var b = ("0" + colors[index + 2]).slice(-3);

                    let c = rVal + gVal + bVal;

                    //"rawC": [colors[cIndex], colors[cIndex + 1], colors[cIndex + 2]],
                    pArray.push({"x": x, "y": y, "z": z, "c": c});
                }
            }

            jointCoords[i].px = pArray;
        }

    }
}

function map (num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function sendData(newBody){
  //  console.log((new Date()) + " sending new data");
    var data = JSON.stringify(newBody);
    socket.emit('message', data);

    if(saveFeed && data != "[]"){

        if(firstData){
            firstData = false;
        }else{
            data = ", " + data;
        }

        fs.appendFile(dataDest, data, 'utf8', function(err){
            if(err){
                return console.log(err);
            }
        });
    }
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
