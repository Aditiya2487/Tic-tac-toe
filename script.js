const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetButton = document.getElementById("reset");
const modeSelector = document.getElementById("mode");
const difficultySelector = document.getElementById("difficulty");
const difficultyLabel = document.getElementById("difficulty-label");

let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let mode = modeSelector.value;
let difficulty = difficultySelector.value;

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

modeSelector.addEventListener("change", () => {
  mode = modeSelector.value;
  if (mode === "pvc") {
    difficultyLabel.style.display = "inline";
    difficultySelector.style.display = "inline";
  } else {
    difficultyLabel.style.display = "none";
    difficultySelector.style.display = "none";
  }
  resetGame();
});

difficultySelector.addEventListener("change", () => {
  difficulty = difficultySelector.value;
  resetGame();
});

function handleClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || board[index] !== "") return;

  makeMove(index, currentPlayer);

  if (mode === "pvc" && currentPlayer === "O" && gameActive) {
    setTimeout(aiMove, 500);
  }
}

function makeMove(index, player) {
  if (board[index] !== "") return;

  board[index] = player;
  cells[index].textContent = player;

  if (checkWinner(player)) {
    statusText.textContent = `Player ${player} wins!`;
    gameActive = false;
    return;
  }

  if (!board.includes("")) {
    statusText.textContent = "It's a draw!";
    gameActive = false;
    return;
  }

  currentPlayer = player === "X" ? "O" : "X";

  if (mode === "pvp") {
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  } else {
    if (currentPlayer === "X") {
      statusText.textContent = `Your turn (X)`;
    } else {
      statusText.textContent = `Computer's turn (${
        difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
      })`;
    }
  }
}

function aiMove() {
  let index;
  if (difficulty === "easy") {
    index = getEasyMove();
  } else if (difficulty === "medium") {
    index = Math.random() < 0.5 ? getEasyMove() : getSmartMove();
  } else {
    index = getBestMove("O"); // Hard
  }
  makeMove(index, "O");
}

function getEasyMove() {
  const empty = board
    .map((v, i) => (v === "" ? i : null))
    .filter((i) => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getSmartMove() {
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      if (checkWinner("O")) {
        board[i] = "";
        return i;
      }
      board[i] = "";
    }
  }
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "X";
      if (checkWinner("X")) {
        board[i] = "";
        return i;
      }
      board[i] = "";
    }
  }
  return getEasyMove();
}

function getBestMove(player) {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = player;
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(newBoard, depth, isMaximizing) {
  if (checkWinner("O")) return 10 - depth;
  if (checkWinner("X")) return depth - 10;
  if (!newBoard.includes("")) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "O";
        best = Math.max(best, minimax(newBoard, depth + 1, false));
        newBoard[i] = "";
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "X";
        best = Math.min(best, minimax(newBoard, depth + 1, true));
        newBoard[i] = "";
      }
    }
    return best;
  }
}

function checkWinner(player) {
  return winningCombinations.some(([a, b, c]) => {
    if (board[a] === player && board[b] === player && board[c] === player) {
      cells[a].classList.add("winning");
      cells[b].classList.add("winning");
      cells[c].classList.add("winning");
      return true;
    }
    return false;
  });
}

function resetGame() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("winning");
  });

  if (mode === "pvp") {
    statusText.textContent = "Player X's turn";
  } else {
    statusText.textContent = "Your turn (X)";
  }
}

cells.forEach((cell) => cell.addEventListener("click", handleClick));
resetButton.addEventListener("click", resetGame);

// Hide difficulty if starting in PVP mode
if (mode === "pvp") {
  difficultyLabel.style.display = "none";
  difficultySelector.style.display = "none";
}

// Initial status
statusText.textContent = mode === "pvp" ? "Player X's turn" : "Your turn (X)";
