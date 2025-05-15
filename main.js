import { getConfig, onConfigChange } from './settings.js';
import { preloadAssets } from './assets.js';
import { setupCanvas, drawBoard } from './render.js';
import { board, getSelectedSquare, setSelectedSquare, turn, gameOver, initBoard, getMoves, isValid, inCheck, isCheckmate } from './board.js';

let canvas;

function handleClick(e) {
  const squareSize = 60;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / squareSize);
  const y = Math.floor((e.clientY - rect.top) / squareSize);
  if (!isValid(x, y) || gameOver) return;
  const config = getConfig();

  // Custom mode: erase piece
  if (config.playMode === 'custom') {
    board[y][x] = getSelectedSquare() ? '' : board[y][x];
    drawBoard();
    return;
  }

  // Selecting a piece
  if (!getSelectedSquare()) {
    const p = board[y][x];
    if (p && (config.playMode === 'free' || p[0] === turn)) {
      setSelectedSquare([x, y]);
      drawBoard();
    }
  } else {
    // Move the selected piece
    const [sx, sy] = getSelectedSquare();
    const moves = config.playMode === 'free' ? [[x, y]] : getMoves(sx, sy);
    if (moves.some(m => m[0] === x && m[1] === y)) {
      board[y][x] = board[sy][sx];
      board[sy][sx] = null;

      // Turn swap, check, checkmate logic
      if (config.playMode === 'play' || config.playMode === 'two') {
        // Increment timer logic can be added here if you use timers
        if (inCheck(turn === 'w' ? 'b' : 'w')) {
          document.getElementById('message').textContent = 'Check!';
        } else {
          document.getElementById('message').textContent = '';
        }
        if (isCheckmate(turn === 'w' ? 'b' : 'w')) {
          document.getElementById('message').textContent =
            (turn === 'w' ? 'Black' : 'White') + ' is checkmated!';
          // Set game over flag
          // You must set gameOver in board.js or export a setter if needed.
        }
        // Swap turn
        if (typeof board !== "undefined") {
          // We export `turn` as a let from board.js,
          // so just reassign it here:
          if (turn === 'w') {
            board.__proto__.turn = 'b';
          } else {
            board.__proto__.turn = 'w';
          }
        }
      }
      setSelectedSquare(null);
      drawBoard();
    } else {
      setSelectedSquare(null);
      drawBoard();
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('board');
  setupCanvas(canvas);
  canvas.addEventListener('click', handleClick);

  preloadAssets(drawBoard);
  const config = getConfig();
  initBoard(config, undefined, drawBoard);
});

onConfigChange(() => {
  preloadAssets(drawBoard);
  const config = getConfig();
  initBoard(config, undefined, drawBoard);
});
