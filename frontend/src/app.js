(function() {
    var P1 = 'X', P2 = 'O';
    var currentTurn;
    var playerType;
    var gameId;
    var username;

    // Start a new game
    $('#start').on('click', function() {
        username = $('#username').val().trim();
        if (!username) {
            alert('Please enter a username.');
            return;
        }
        $.post('/api/games', { name: username }, function(data) {
            gameId = data.gameId;
            playerType = P1;
            currentTurn = P1;  // Start turn
            alert('Game started. Your game ID is ' + gameId + '. Waiting for another player to join.');
            checkGameState();
        });
    });

    // Join an existing game
    $('#join').on('click', function() {
        gameId = $('#group').val();
        username = $('#username').val().trim();
        if (!gameId || !username) {
            alert('Please enter the game ID and username.');
            return;
        }
        $.post('/api/games/' + gameId + '/join', { name: username }, function(data) {
            playerType = P2;
            currentTurn = P1;  // Game starts with player 1
            alert('Joined game, you are Player 2.');
            checkGameState();
        }).fail(function(response) {
            alert('Failed to join game: ' + response.responseText);
        });
    });

    // Function to periodically check the game state
    function checkGameState() {
        if (gameId) {
            $.get('/api/games/' + gameId + '/state', function(data) {
                updateGameUI(data);
            }).fail(function() {
                console.log('Error fetching game state.');
            });
        }
    }

    setInterval(checkGameState, 1000);

    // Update game UI based on current state
    function updateGameUI(data) {
        currentTurn = data.currentPlayer; // Update current turn based on server

        // Clear the board first
        $('.box').each(function(index) {
            var row = Math.floor(index / 3);
            var col = index % 3;
            $(this).text(data.board[row][col]);  // Update each cell
        });

        // Update turn indicator or game status
        if (data.gameState === 'finished') {
            $('#turn').text('Game Over');
            $('.box').off('click'); // Disable clicking if the game is over
        } else {
            $('#turn').text(currentTurn === playerType ? 'Your turn' : 'Waiting for opponent');
        }
    }

    // Click event for making a move
    $('.box').on('click', function() {
        if (!$(this).text() && currentTurn === playerType) {
            var boxId = $(this).attr('id');
            var x = parseInt(boxId.charAt(7));
            var y = parseInt(boxId.charAt(8));
            var move = { player: playerType, x: x, y: y };

            $.post('/api/games/' + gameId + '/move', move, function(data) {
                updateGameUI(data);
                checkGameState();  // Check for updates after move
            }).fail(function(response) {
                alert('Move failed: ' + response.responseText);
            });
        } else {
            alert('It is not your turn or cell is occupied.');
        }
    });

    // Reset or end game
    $('#reset').on('click', function() {
        if (!gameId) return;
        $.post('/api/games/' + gameId + '/reset', function(data) {
            $('.box').text('').off('click');
            alert('Game has been reset.');
            location.reload();  // Reload the page to start anew or rejoin
        });
    });
})();
