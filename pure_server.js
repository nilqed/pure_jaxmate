// Start as follows (for the moment), paths have to be adjusted later
// C:\Users\kfp\Desktop\work\jaxmate_pure>cd %USERPROFILE%
// C:\Users\kfp>node C:\Users\kfp\Desktop\work\jaxmate_pure\pure_server.js


// Spawning App
const { spawn } = require('child_process');
const repl = spawn('pure', ['-i']);


// Server
var port = 3010;
var clientHTML = '/pure_client.html';
var dataID = '';

var http = require('http');
var express = require('express');
var app = express();

var server = http.createServer(app);

// Passing the http.Server instance to the listen method
var io = require('socket.io').listen(server);

var input = process.stdin.pipe(repl.stdin);

// Input init/end handling
input.on('end', () => {console.log('Goodbye\n'); process.exit() });
input.write('let x=123;let x=x+1;'); // let __jaxmate__=true;

// REPL on data event (response from pure interpreter)
repl.stdout.on('data', (data) => {
  answer=data.toString();
  if (answer.endsWith('> ')){
    answer = answer.replace(/> $/, ''); // rtrim pure prompt '>'
  };
  console.log(`Out[${dataID}]:\n${answer}`);
  io.emit('pure_output',{id:dataID, data:answer});
});


// The server starts listening
server.listen(port);
console.log ("Welcome to Pure");
console.log("Pure Server listening on port "+ port.toString());

// Registering the route of your app that returns the HTML start file
app.get('/', function (req, res) {
    console.log("App root");
    res.sendFile(__dirname + clientHTML);
});

// Expose the node_modules folder as static resources 
// (to access socket.io.js in the browser)
// maybe path.join(__dirname, 'directory')
app.use('/static', express.static('node_modules'));


// Handling the connection
io.on('connection', function (socket) {
    //console.log(socket.handshake);  // a lot of data without .handshake
    console.log("Client X connected @");

    socket.on('pure_eval', function (data) {
        console.log('In['+data.id+']: '+data.data);
        input.write(data.data+'\n'); // send to repl process
        dataID=data.id; // push id
        // --> client debug: data.id/data.data
        //socket.emit('pure_output',{id:data.id, data:'pure_input:'+data.data});
    });
    
    socket.on('disconnect', function(){console.log('Client disconnect ...');});
});