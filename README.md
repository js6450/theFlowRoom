# The Flow Room

The Flow Room is a web-based interactive & immersive environment. Created based on Lisa Jamhoury's [Kinectron](https://kinectron.github.io/)

Project by [Jung Hyun Moon](http://moqn.net/), [Jiwon Shin](http://jiwonshin.com/) and [Lisa Jamhoury](http://lisajamhoury.com/)

This project is funded by NYU Arts Council Visual Arts Initiative 2017 - 18.

## Folder Structure

* kinectClient: 
  * Connects to the Kinect V2 device and preps JSON data to send over to the server
* kinectClient-copy:
  * Duplicate of kinectClient for testing purposes to send multiple kinect data from one machine
* server:
  * Server that receives all kinect data from kinectClient (or also kinectClient-copy)
  * Contains the visuals for the project created in Three.js
* server-basic:
  * Server that receives all kinect data from kinectClient (or also kinectClient-copy) - server-side code is exact duplicate of server folder
  * Contains test visuals for back-end server development created in p5.js

## Basic Code Structure

* kinectClient:
  * kinectClient uses kinect2 node module and structures of [Kinectron](https://kinectron.github.io/) to open Kinect V2 device's depth camera, depth color camera and body (skeleton) tracking camera to calculate 3D depth & color point cloud around the joints of the skeleton of the detected bodies in the frame.
  * Data calculated & collected from kinectClient is sent over to the server using socket.io web socket node module in JSON format. For more details about the JSON format of the body data, please take a look at the [kinect data](https://github.com/js6450/kinect-data) repository.

* server:
  * collects JSON data sent from multiple kinectClient end points and sends to the index.html page running the graphics built using three.js using socket.io javascript client API.
