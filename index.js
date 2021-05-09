var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const PORT = process.env.PORT || 8080;

// Events
const CONNECTION = 'connection';
const DISCONNECT = 'disconnect';
const SOCKET_ID = 'socketId';
const NEW_PLAYER_CONNECTED = 'newPlayerConnected';
const PLAYER_DISCONNECTED = 'playerDisconnected';
const GET_PLAYERS = 'getPlayers';
const PLAYER_MOVED = 'playerMoved';
const PLAYER_READY = 'playerReady';

var players = [];

server.listen(PORT, function() {
	console.log("Server is now running on port " + PORT);
});

io.on(CONNECTION, function(socket) {
	console.log("Player connected");
	
	socket.emit(SOCKET_ID, { id: socket.id });
	
	socket.on(PLAYER_READY, function(data) {
		console.log("Player ready : " + socket.id);
		socket.broadcast.emit(NEW_PLAYER_CONNECTED, { id: socket.id, character: data.character, name: data.name });
		socket.emit(GET_PLAYERS, players);
		players.push(new Player(socket.id, 0, 0, false, "IDLE", data.character, data.name));
	});

	socket.on(PLAYER_MOVED, function(data) {
		data.id = socket.id;
		socket.broadcast.emit(PLAYER_MOVED, data);

		for (var i = 0; i < players.length; i++) {
			if (players[i].id == socket.id) {
				players[i].x = data.x;
				players[i].y = data.y;
				players[i].flipX = data.flipX;
			}
		}
	});
	
	socket.on(DISCONNECT, function() {
		console.log("Player disconnected");
		socket.broadcast.emit(PLAYER_DISCONNECTED, { id: socket.id });
		for (var i = 0; i < players.length; i++) {
			if (players[i].id == socket.id) {
				players.splice(i, 1);
			}
		}
	});
});

function Player(id, x, y, flipX, state, character, name) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.flipX = flipX;
	this.state = state;
	this.character = character;
	this.name = name;
}