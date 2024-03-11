function startGame() {
    document.getElementById("usernameForm").classList.add("d-none");
    document.getElementById("gameBoard").classList.remove("d-none");
    document.getElementById("resetButton").classList.remove("d-none");
   
}

function makeMove(position) {
    fetch('/move', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position }),
    })
    .then(response => response.json())
    .then(data => {
        updateBoard(data.board);
        if (data.winner) {
            let winText;
            if (data.winner === 'Computer') {
                winText = "Dogs won!";
            } else {
                let username = document.getElementById("username").value || "Player";
                winText = `${username} won!`;
            }
            document.getElementById("winMessage").innerText = winText;
            $('#winModal').modal('show');
        }
    })
    .catch(error => console.error('Error:', error));
}

function updateBoard(board) {
    board.forEach((cell, index) => {
        const cellDiv = document.getElementsByClassName("game-cell")[index];
        cellDiv.textContent = cell;
    });
}

function resetGame() {
    fetch('/reset', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        updateBoard(Array(9).fill(null));
        document.getElementById("usernameForm").classList.remove("d-none");
        document.getElementById("gameBoard").classList.add("d-none");
        document.getElementById("resetButton").classList.add("d-none");
    })
    .catch(error => console.error('Error:', error));
    $('#winModal').modal('hide'); 
}
