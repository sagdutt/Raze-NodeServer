var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var PORT = process.env.PORT || 8080;

// Events
const CONNECTION = 'connection';
const DISCONNECT = 'disconnect';
const SOCKET_ID = 'socketId';
const NEW_PLAYER_CONNECTED = 'newPlayerConnected';
const PLAYER_DISCONNECTED = 'playerDisconnected';
const GET_PLAYERS = 'getPlayers';
const PLAYED_MOVED = "playerMoved";

var players = [];

server.listen(PORT, function() {
	console.log("Server is now running on port " + PORT);
});

io.on(CONNECTION, function(socket) {
	console.log("Player connected");
	
	socket.emit(SOCKET_ID, { id: socket.id });
	socket.broadcast.emit(NEW_PLAYER_CONNECTED, { id: socket.id });
	socket.emit(GET_PLAYERS, players);

	socket.on(PLAYED_MOVED, function(data) {
		data.id = socket.id;
		socket.broadcast.emit(PLAYED_MOVED, data);

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
	players.push(new Player(socket.id, 0, 0, false, "IDLE"));
});

function Player(id, x, y, flipX, state) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.flipX = flipX;
	this.state = state;
}