const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); // Use JSON body parsing
app.use(cors()); // Enable CORS for all origins

let gameIdCounter = 1;
const games = {};

// Create a new game and return game ID
app.post('/api/games', (req, res) => {
    const gameId = gameIdCounter++;
    games[gameId] = {
        board: Array(3).fill(null).map(() => Array(3).fill('')),
        currentPlayer: 'X',
        gameState: 'waiting' // 'waiting', 'ongoing', 'finished'
    };
    res.json({ gameId: gameId, message: "Game created, waiting for another player." });
});

// Join an existing game
app.post('/api/games/:gameId/join', (req, res) => {
    const gameId = parseInt(req.params.gameId);
    const game = games[gameId];
    if (!game) {
        return res.status(404).send({ message: "Game not found." });
    }
    if (game.gameState !== 'waiting') {
        return res.status(400).send({ message: "Game is already in progress or finished." });
    }
    game.gameState = 'ongoing';
    res.json({ message: "Joined game, game starts.", gameId: gameId });
});

// Make a move
app.post('/api/games/:gameId/move', (req, res) => {
    const gameId = parseInt(req.params.gameId);
    const { player, x, y } = req.body;
    const game = games[gameId];
    if (!game || game.gameState !== 'ongoing') {
        return res.status(404).send({ message: "Game not found or not in progress." });
    }
    if (game.board[x][y] !== '') {
        return res.status(400).send({ message: "Cell is already occupied." });
    }
    if (game.currentPlayer !== player) {
        return res.status(400).send({ message: "It's not your turn." });
    }

    // Update the board
    game.board[x][y] = player;
    // Check if there is a winner or the game is tied
    if (checkWinner(game.board, player)) {
        game.gameState = 'finished';
        res.json({ winner: player, board: game.board });
    } else if (isBoardFull(game.board)) {
        game.gameState = 'finished';
        res.json({ message: "Game tied.", board: game.board });
    } else {
        game.currentPlayer = player === 'X' ? 'O' : 'X';
        res.json({ board: game.board, currentPlayer: game.currentPlayer });
    }
});

// Endpoint to get the current state of the game
app.get('/api/games/:gameId/state', (req, res) => {
    const gameId = parseInt(req.params.gameId);
    const game = games[gameId];
    if (!game) {
        return res.status(404).json({ message: "Game not found." });
    }
    res.json({
        board: game.board,
        currentPlayer: game.currentPlayer,
        gameState: game.gameState
    });
});


function checkWinner(board, player) {
    // Horizontal, vertical, and diagonal checks
    return (
        [0, 1, 2].some(index => 
            (board[index][0] === player && board[index][1] === player && board[index][2] === player) ||
            (board[0][index] === player && board[1][index] === player && board[2][index] === player)
        ) ||
        (board[0][0] === player && board[1][1] === player && board[2][2] === player) ||
        (board[2][0] === player && board[1][1] === player && board[0][2] === player)
    );
}

function isBoardFull(board) {
    return board.every(row => row.every(cell => cell !== ''));
}

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
