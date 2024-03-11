const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); 

// Game state
let game = {
  board: Array(9).fill(null),
  currentPlayer: '😺', 
  playerSymbol: '😺',
  computerSymbol: '🐶',
};

// Reset game
app.post('/reset', (req, res) => {
  game = {
    board: Array(9).fill(null),
    currentPlayer: '😺', 
    playerSymbol: '😺',
    computerSymbol: '🐶',
  };
  res.json({ message: 'Game reset', game });
});

// Make a move
app.post('/move', (req, res) => {
  const { position } = req.body;

  if (game.board[position] !== null || !Number.isInteger(position) || position < 0 || position > 8) {
    return res.status(400).json({ message: 'Invalid move' });
  }

  // Player's move
  game.board[position] = game.currentPlayer;
  if (checkWin(game.board, game.currentPlayer)) {
    // Player wins
    return res.json({ winner: 'Player', board: game.board });
  }

  // Check for a tie before the computer makes its move
  if (!game.board.includes(null)) {
    // Game is a tie
    return res.json({ winner: 'Tie', board: game.board });
  }

  // Switch to computer's turn
  game.currentPlayer = game.computerSymbol;

  // Computer's move
  const openPositions = game.board.map((v, i) => v === null ? i : null).filter(v => v !== null);
  const randomMove = openPositions[Math.floor(Math.random() * openPositions.length)];
  if (randomMove !== undefined) {
    game.board[randomMove] = game.currentPlayer;
    if (checkWin(game.board, game.currentPlayer)) {
      
      return res.json({ winner: 'Computer', board: game.board });
    }
  }

 
  if (!game.board.includes(null)) {
    // Game is a tie
    return res.json({ winner: 'Tie', board: game.board });
  }

  // Switch back to player's turn if no win or tie
  game.currentPlayer = game.playerSymbol;

  res.json({ board: game.board, currentPlayer: game.currentPlayer });
});

// Check win
function checkWin(board, player) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];
  return lines.some(line => line.every(index => board[index] === player));
}

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
