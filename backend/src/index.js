var express = require('express');
var bodyParser = require('body-parser');
var path = require('path'); // Import path module
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var groups = 1;

app.use(bodyParser.urlencoded({ extended: true }));

var cors = require('cors');
app.use(cors()); 


//Begins connect here
io.on('connection', function(socket){
	//When player create a new game
	socket.on('startGame', function(data){
		socket.join(groups);
		socket.emit('new', {name: data.name, group: groups});
		groups++;
	});
	//When another player enter an exist game
	socket.on('joinGame', function(data){
		var group = io.nsps['/'].adapter.rooms[data.group];
		if (group && group.length == 1){
			socket.join(data.group);
			socket.broadcast.to(data.group).emit('player1', {});
			socket.emit('player2', {name: data.name, group: data.group })
		} else if (group && group.length > 1){
			socket.emit('err', {message: 'Room is full, please start a new game'});
		} else {
			socket.emit('err', {message: 'Invalid ID!'});
		}
	});
	//To show it's the current player turn
	socket.on('nextTurn', function(data){
		socket.broadcast.to(data.group).emit('toNext', {
			box: data.box,
			group: data.group
		});
	});
	//When there is a winner
	socket.on('gameOver', function(data){
		// Check if it's a win or a tie
		if (data.winner) {
			// It's a win, notify the winner and the loser
			socket.emit('endGame', { winner: data.winner, message: 'You win!' });
			socket.to(data.group).emit('endGame', { winner: data.winner, message: 'You lose!' });
		} else {
			// It's a tie, notify all clients in the group
			io.in(data.group).emit('endGame', { message: data.message });
		}
	});
	//When one of the user is leaving or clicked reset
	socket.on('reset', function(data){
		// This will emit to all clients in the group, including the sender
		io.in(data.group).emit('resetGame');
	});
})
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});
