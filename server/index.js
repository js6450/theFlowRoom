const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

var kinectCount = 0;
var kinectData = [];

var debug = true;

app.set("views", __dirname + "/views");
app.engine(".html", require('ejs').__express);
app.set("view engine", "html");
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());

const http = require('http');
const socketHTTP = http.Server(app);

const io = require('socket.io')(socketHTTP);
const port = process.env.PORT || 8000;

const dest = __dirname + "/public/data.json";

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

            // fs.readFile(dest, 'utf8', function(err, data){
            //     socket.emit('sendData', data);
            // });

            setTimeout(broadcastData, 50);
        }
    }

    broadcastData();

    socket.on('status', function(data){
        //status 0: kinect connection
        //status 1: client connection
        socket.userType = data;

        if(socket.userType == 0){
            socket.kinectIndex = kinectCount;

            kinectCount++;
        }

        console.log("User of type " + socket.userType + " with id " + socket.id + " connected");
    });

    socket.on('message', function(data){

        if(socket.userType == 0){

            // var currentKinect = socket.kinectIndex;
           // var nextKinect = currentKinect + 1;
            //
            // kinectData = {currentKinect: data};
            // kinectData = {nextKinect: data};

            kinectData[socket.kinectIndex] = data;
           // kinectData[currentKinect + 1] = data;

            if(debug){
                fs.writeFile(dest, data, 'utf8', function(err){
                    if(err){
                        return console.log(err);
                    }
                });
            }
        }
    });

    socket.on('disconnect', function(){
       console.log("User of type " + socket.userType + " with id " + socket.id + " disconnected");
    });

});

io.on('disconnect', function(socket){
   console.log(socket.id + "disconnected");
});
