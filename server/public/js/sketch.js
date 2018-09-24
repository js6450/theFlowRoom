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

        for(var k = 0; k < kinect.length; k++){

            var currentKinect = kinect[k];

            for(var b = 0; b < currentKinect.length; b++){
                var mainArray = currentKinect[b].joints;

                for (var i = 0; i < mainArray.length; i++) {

                    if (mainArray[i].px != null) {
                        for (var j = 0; j < mainArray[i].px.length; j++) {

                            var rawX = mainArray[i].px[j].x;
                            var rawY = mainArray[i].px[j].y;
                            var rawZ = mainArray[i].px[j].z;

                            var mappedX = map(rawX, 0, 512, 0, width);
                            var mappedY = map(rawY, 0, 424, 0, height);
                            var mappedZ = map(rawZ, -500, 500, 0, -500);

                            var mappedFill = map(rawZ, -500, 500, 255, 0);

                            fill(mappedFill, 100);
                            push();
                            translate(mappedX, mappedY, mappedZ);
                            sphere(5);
                            pop();

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

