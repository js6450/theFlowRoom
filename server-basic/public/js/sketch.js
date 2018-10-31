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

    for(let i = 0; i < kinect.length; i++){
        if(kinect[i] == null){
            kinect.splice(i, 1);
            //kinectCount--;
        }
    }

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

                            var r = map(mainArray[i].px[j].c.substring(0, 2), 0, 99, 0, 255);
                            var g = map(mainArray[i].px[j].c.substring(2, 4), 0, 99, 0, 255);
                            var b = map(mainArray[i].px[j].c.substring(4, 6), 0, 99, 0, 255);

                            var mappedX = map(rawX, 0, 512, 0, width);
                            var mappedY = map(rawY, 0, 424, 0, height);
                            var mappedZ = map(rawZ, -500, 500, 0, -500);

                            fill(r, g, b);
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
            kinectCount = data.length;
            console.log("send kinect count of " + kinectCount);
            socket.emit('sendLog', "Web Client - current number of kinects received: " + kinectCount);
        }


        for(var i = 0; i < data.length; i++){
            kinect[i] = JSON.parse(data[i]);
        }
    }

}

