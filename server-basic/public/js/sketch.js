'use strict';

var socket = io();

var kinect = [];

var mainX;
var mainY;

var index = 0;

var frameData;

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
                var mainArray = kinect[k][b].joints;

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

                            // var rawFill = mainArray[i].depthPixels[j].p[0] * 10 + mainArray[i].depthPixels[j].p[1];
                            // var mappedFill = map(rawFill, 0, 4500, 255, 0);
                            // var mappedZ = map(rawFill, 0, 4500, 0, -500);
                            // var mappedSize = map(rawFill, 0, 4500, 1, 20);

                            fill(mappedFill, 100);
                            // fill(mainArray[i].depthPixels[j].p[0], mainArray[i].depthPixels[j].p[1], 0);
                            // ellipse(mappedX, mappedY, mappedSize, mappedSize);

                            push();
                            translate(mappedX, mappedY, mappedZ);
                            sphere(5);
                            pop();

                        }
                    }
                }

                // index++;
                //
                // if (index > kinect.length - 1) {
                //     index = 0;
                // }
            }
        }
    }
}

function onSendData(data) {

    if(data != null){
        for(var i = 0; i < data.length; i++){
            kinect[i] = JSON.parse(data[i]);
        }
    }

}

