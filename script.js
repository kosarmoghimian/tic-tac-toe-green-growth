const board = document.getElementById("board");
const message = document.getElementById("message");
const flower = document.getElementById("flower");
const resetBtn = document.getElementById("resetBtn");

let cells = Array(9).fill(null);
let player = "X";
let ai = "O";
let flowerStage = 0;

function createBoard() {
  board.innerHTML = "";
  cells = Array(9).fill(null);
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", () => makeMove(i));
    board.appendChild(cell);
  }
}

function makeMove(i) {
  if (cells[i] || checkWinner(cells)) return;
  cells[i] = player;
  render();
  if (checkGameEnd(player)) return;
  aiMove();
}

function aiMove() {
  let move = bestMove();
  if (move !== null) {
    cells[move] = ai;
    render();
    checkGameEnd(ai);
  }
}

function bestMove() {
  // Minimax ساده برای حرکات منطقی
  let bestScore = -Infinity;
  let move = null;
  for (let i = 0; i < 9; i++) {
    if (!cells[i]) {
      cells[i] = ai;
      let score = minimax(cells, 0, false);
      cells[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(boardState, depth, isMaximizing) {
  let winner = checkWinner(boardState);
  if (winner === ai) return 10 - depth;
  if (winner === player) return depth - 10;
  if (boardState.every(c => c)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!boardState[i]) {
        boardState[i] = ai;
        let score = minimax(boardState, depth + 1, false);
        boardState[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!boardState[i]) {
        boardState[i] = player;
        let score = minimax(boardState, depth + 1, true);
        boardState[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWinner(b) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a,b1,c] of wins) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }
  return null;
}

function checkGameEnd(current) {
  let winner = checkWinner(cells);
  if (winner) {
    if (winner === player) {
      flowerStage = Math.min(flowerStage + 1, 3);
      flower.style.opacity = 0;
      setTimeout(() => {
        flower.src = `assets/flower${flowerStage}.png`;
        flower.style.opacity = 1;
      }, 300);
      if (flowerStage < 3) {
        message.innerHTML = "بردی! مرحله بعد 👉";
      } else {
        message.innerHTML = "🎉 تبریک! رشد سبز کامل شد 🎉";
      }
    } else {
      message.innerHTML = "باختی! دوباره امتحان کن 👉";
    }
    return true;
  } else if (cells.every(c => c)) {
    message.innerHTML = "مساوی شد! دوباره امتحان کن 👉";
    return true;
  }
  return false;
}

function render() {
  const divs = document.querySelectorAll(".cell");
  divs.forEach((div, i) => {
    div.textContent = cells[i] || "";
  });
}

resetBtn.addEventListener("click", () => {
  flowerStage = 0;
  flower.src = "assets/flower0.png";
  message.textContent = "";
  createBoard();
});

createBoard();
