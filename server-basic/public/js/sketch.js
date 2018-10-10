'use strict';

var socket = io();

var kinect = [];

var kinectCount = 0;
var bodyCount = 0;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    noStroke();

    socket.emit('status', 1);
    socket.on('sendData', onSendData);
}

function draw() {
    background(0);
    orbitControl();
    translate(-width / 2, 0, -1000);

    if (kinect != null) {

       // console.log(kinect);

        for(var k = 0; k < kinect.length; k++){

            var currentKinect = kinect[k];

            for(var body = 0; body < currentKinect.length; body++){
                var mainArray = currentKinect[body].joints;

                for (var i = 0; i < mainArray.length; i++) {

                    if (mainArray[i].px != null) {
                        for (var j = 0; j < mainArray[i].px.length; j++) {

                            var rawX = mainArray[i].px[j].x;
                            var rawY = mainArray[i].px[j].y;
                            var rawZ = mainArray[i].px[j].z;

                            var rawC = mainArray[i].px[j].c + "";
                            var reducedR = map(int(rawC.substring(0, 2)), 0, 99, 0, 255);
                            var reducedG = map(int(rawC.substring(2, 4)), 0, 99, 0, 255);
                            var reducedB = map(int(rawC.substring(4, 6)), 0, 99, 0, 255);

                            // var r = int(rawC.substring(0, 3));
                            // var g = int(rawC.substring(3, 6));
                            // var b = int(rawC.substring(6, 9));

                            var r = mainArray[i].px[j].r;
                            var g = mainArray[i].px[j].g;
                            var b = mainArray[i].px[j].b;

                            var mappedX = map(rawX, 0, 512, 0, width);
                            var mappedY = map(rawY, 0, 424, 0, height);
                            var mappedZ = map(rawZ, -500, 500, 0, -500);

                            //fill(255, 100);
                            fill(r, g, b);
                            push();
                            translate(mappedX, mappedY, mappedZ);
                            sphere(5);
                            pop();

                             //fill(reducedR, reducedG, reducedB);
                             //push();
                             //translate(width - mappedX, mappedY, mappedZ);
                             //sphere(5);
                             //pop();
                        }
                    }
                }
            }
        }
    }
}

function onSendData(data) {

    if(data != null){

        if(kinectCount !== data.length){
            console.log("send kinect count");

            kinectCount = data.length;
            socket.emit('sendLog', "Web Client - current number of kinects received: " + kinectCount);
        }

        for(var i = 0; i < data.length; i++){
            kinect[i] = JSON.parse(data[i]);
        }
    }

}

