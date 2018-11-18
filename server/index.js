const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const fs = require('fs');
const util = require('util');

let debug = false;
let log_stdout = process.stdout;

if(debug){
    let logName = new Date().toISOString().split('T')[0] + ".log";

    let log_file = fs.createWriteStream('log/' + logName, {flags : 'a'});
}

console.log = function(d) { //
    let timeStamp = new Date().toISOString();

    if(debug){
        log_file.write(util.format(timeStamp + ": " + d) + '\n');
    }

    log_stdout.write(util.format(timeStamp + ": " + d) + '\n');

};

let kinectCount = 0;

let devices = [];
let kinectData = [];

let clientTotal = 0;

app.set("views", __dirname + "/views");
app.engine(".html", require('ejs').__express);
app.set("view engine", "html");
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());

const http = require('http');
const socketHTTP = http.Server(app);

const io = require('socket.io')(socketHTTP);
const port = process.env.PORT || 8000;

socketHTTP.listen(port, () => console.log('listening on port ' + port));

app.get('/', function(req, res){
    res.render("index");
});

app.get('/scene-color', function(req, res){
    res.render("scene-color");
});

app.get('/scene-white', function(req, res){
    res.render("scene-white");
});

io.on('connection', function(socket){

    socket.on('requestData', function(){
        if(kinectData.length > 0){
            socket.emit('sendData', kinectData);
        }
    });

    socket.on('status', function(data){
        //status 0: kinect connection
        //status 1: client connection
        socket.userType = data;

        console.log("User of type " + socket.userType + " with id " + socket.id + " connected");

        if(socket.userType == 0){

            if(!devices.includes(socket.id)){
                devices.push(socket.id);

                kinectCount++;
            }
        }else if(socket.userType == 1){
            clientTotal++;
        }

        console.log("No of devices: " + kinectCount + ", No of web clients: " + clientTotal);

    });

    socket.on('message', function(data){

        if(socket.userType == 0){
            //console.log("data from " + socket.id);
            kinectData[devices.indexOf(socket.id)] = data;
        }
    });

    socket.on('disconnect', function(){

        if(socket.userType == 0){

            kinectData.splice(devices.indexOf(socket.id), 1);
            kinectCount--;

            devices.splice(devices.indexOf(socket.id), 1);

            console.log("devices array splice, now: " + devices.length);
            console.log("kinect data array splice, now: " + kinectData.length);

        }else if(socket.userType == 1){
            clientTotal--;
        }

        console.log("No of devices: " + kinectCount + ", No of web clients: " + clientTotal);
        console.log("User of type " + socket.userType + " with id " + socket.id + " disconnected");
    });

});

io.on('disconnect', function(socket){
   console.log(socket.id + "disconnected");
});
