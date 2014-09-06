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
var board;
var light;
var photoresistor;
var darkness = 300;

board = new five.Board();

board.on('ready', function(){
  light = new five.Led(9);
  
  photoresistor = new five.Sensor({
    pin: "A0",
    freq: 250
  });

  this.repl.inject({
    pot: photoresistor
  });

  this.repl.inject({
    led: light
  });
  
  photoresistor.on("data", function() {
    console.log("photo: " + this.value);
    if(this.value > darkness){
	light.on();
    } else {
	light.off();
    };
  });


});

  
  
io.sockets.on('connection', function(socket){
  
  socket.emit('board connected', {data: 'Connected'});
  

  socket.on('robot command', function(data){
    
    console.log(data);
    var command = data.command;
    if(command == "toggle-light"){
      light.toggle();
    }
  });
});


