const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const fs = require('fs');
const util = require('util');

var debug = false;
var log_stdout = process.stdout;

if(debug){
    var logName = new Date().toISOString().split('T')[0] + ".log";

    var log_file = fs.createWriteStream('log/' + logName, {flags : 'a'});
}

console.log = function(d) { //
    var timeStamp = new Date().toISOString();

    if(debug){
        log_file.write(util.format(timeStamp + ": " + d) + '\n');
    }

    log_stdout.write(util.format(timeStamp + ": " + d) + '\n');

};

var kinectCount = 0;
var kinectData = [];

var clearData = false;
let clearedDeviceIndex;

let clientTotal = 0;
let clientDataCleared = 0;

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

            if(kinectData.length > 0){
                //console.log('broadcasting data of ' + kinectData.length + " length");
                socket.emit('sendData', kinectData);
                //kinectData = [];
            }

            if(clearData){
                if(clientDataCleared < clientTotal){
                    console.log('clear data of device index ' + clearedDeviceIndex);

                    socket.emit('statusChange', clearedDeviceIndex);
                }else{
                    console.log("reset data clear values");
                    console.log("in reset: cleardata: " + clearData + ', client total: ' + clientTotal + ", client data cleared: " + clientDataCleared);

                    clientDataCleared = 0;
                    clearData = false;
                }

            }

            setTimeout(broadcastData, 50);
        }
    }

    broadcastData();

    socket.on('dataCleared', function(data){
        if(data == 1 && clearData){
            clientDataCleared++;
            console.log("data cleared");

        }

    });

    socket.on('status', function(data){
        //status 0: kinect connection
        //status 1: client connection
        socket.userType = data;

        console.log("User of type " + socket.userType + " with id " + socket.id + " connected");

        if(socket.userType == 0){
            socket.kinectIndex = kinectCount;
            kinectCount++;

            console.log("Current number of kinect clients connected: " + kinectCount);
        }else if(socket.userType == 1){
            clientTotal++;

            console.log("Current number of web clients connected: " + clientTotal);
        }

    });

    socket.on('message', function(data){

        if(socket.userType == 0){
            kinectData[socket.kinectIndex] = data;

            // if(debug){
            //     fs.writeFile(dest, data, 'utf8', function(err){
            //         if(err){
            //             return console.log(err);
            //         }
            //     });
            // }
        }
    });

    socket.on('sendLog', function(data){
        console.log(data);
    });

    socket.on('disconnect', function(){

        if(socket.userType == 0){

            clearData = true;
            clearedDeviceIndex = socket.kinectIndex;

            kinectData.splice(socket.kinectIndex, 1);
            kinectCount--;

            console.log("cleardata: " + clearData + ', client total: ' + clientTotal + ", client data cleared: " + clientDataCleared);
            console.log("splice kinectData array, now array length: " + kinectData.length);

        }else if(socket.userType == 1){
            clientTotal--;
            console.log("client total: " + clientTotal);
        }

       console.log("User of type " + socket.userType + " with id " + socket.id + " disconnected");
    });

});

io.on('disconnect', function(socket){
   console.log(socket.id + "disconnected");
});
