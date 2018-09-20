const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const fs = require('fs');
const util = require('util');

var logName = new Date().toISOString().split('T')[0] + ".log";

var log_file = fs.createWriteStream('log/' + logName, {flags : 'a'});
var log_stdout = process.stdout;

console.log = function(d) { //
    var timeStamp = new Date().toISOString();

    log_file.write(util.format(timeStamp + ": " + d) + '\n');
    log_stdout.write(util.format(timeStamp + ": " + d) + '\n');
};

var kinectCount = 0;
var kinectData = [];

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

io.on('connection', function(socket){

    function broadcastData(){
        if(socket.connected){

            if(kinectData != null){
                socket.emit('sendData', kinectData);
            }

            setTimeout(broadcastData, 50);
        }
    }

    broadcastData();

    socket.on('status', function(data){
        //status 0: kinect connection
        //status 1: client connection
        socket.userType = data;

        console.log("User of type " + socket.userType + " with id " + socket.id + " connected");

        if(socket.userType == 0){
            socket.kinectIndex = kinectCount;
            kinectCount++;

            console.log("Current number of kinect clients connected: " + kinectCount);
        }

    });

    socket.on('message', function(data){

        if(socket.userType == 0){
            kinectData[socket.kinectIndex] = data;
        }
    });

    socket.on('disconnect', function(){
        console.log("User of type " + socket.userType + " with id " + socket.id + " disconnected");

        if(socket.userType == 0){
            kinectData.splice(socket.kinectIndex, 1);
            kinectCount--;

            console.log("Current number of kinect clients connected: " + kinectCount);
        }
    });

});

io.on('disconnect', function(socket){
   console.log(socket.id + "disconnected");
});
