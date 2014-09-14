var express = require('express');
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io').listen(server);

server.listen(8080);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + "/index.html");
});



var five = require('johnny-five');
var fs = require('fs');
var time = require('moment');

var board;
var light;
var photoresistor;
var humidity;
var temperature;
var servo;

var pollingFrequency = 3000;
var darkness = 300;
var cold = 165;

var open = 0;
var close = 180;

var bedtime = 20;
var morning = 5;


function nightTime(){
  var date = new Date();
  if(date.getHours() >= bedtime || date.getHours() <= morning){
    return true;
  }
  return false;    
};

function log(name, value){
    fs.appendFile("public/logs/" + name + ".tsv", 
	time().format() + "\t " + value + "\n", 
	function(err){
	  if(err) {throw err};
    });
};

board = new five.Board();

board.on('ready', function(){
  light = new five.Led(9);
  heatlight = new five.Led(10);

  var fan = new five.Pin(12); 
 
  servo = new five.Servo({
    pin: 8,
    range: [0, 180],
    type: "standard",
    startAt: 90,
    center: false,
  });

  photoresistor = new five.Sensor({
    pin: "A0",
    freq: pollingFrequency 
  });
  
  temperature = new five.Sensor({
    pin: "A1",
    freq: pollingFrequency
  });

  humidity  = new five.Sensor({
    pin: "A2",
    freq: pollingFrequency
  });

  this.repl.inject({
    pot: humidity,
    pot: photoresistor,
    pot: temperature,
    led: heatlight,
    led: light,
    s: servo
  });
  
  humidity.on("data", function() {
    log("humidity", this.value);
    console.log("humidity: " + this.value);  
  });

  photoresistor.on("data", function() {
    log("photo", this.value);    
    if(this.value > darkness){
	if(nightTime()){
	  console.log("No light - nighttime");
        } else {
	  light.on();
        };
    } else {
	light.off();
    };
  });

  temperature.on("data", function() {
    log("temperature", this.value);
    console.log("temp: " + this.value);
    if(this.value < cold){
	heatlight.on();
        console.log("c-c-c-cold");
        fan.low();
    } else {
	console.log("toasty");
        fan.high();
	heatlight.off();
    };

  });
});

  
  
io.on('connection', function(socket){
  
  socket.emit('board connected', {data: 'Connected'});
  

  socket.on('robot command', function(data){
    
    console.log(data);
    var command = data.command;
    if(command == "toggle-light"){
      light.toggle();
    };
    
    if(command == "servo-open"){
      servo.to(open);
    };
    
    if(command == "servo-close"){
      servo.to(close);
    };

  });
});


