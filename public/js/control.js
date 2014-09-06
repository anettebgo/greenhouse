$(document).ready(function() {
  var socket = io.connect('http://localhost:8080')
  socket.on('robot connected', function(data) {
    console.log(data);
    socket.emit('robot command', {command: 'nothing'});
  });

  $('#do-light-on').click(function(){
    socket.emit('robot command', { command: light-on });
  });

}); 
