import { getConfig, onConfigChange } from './settings.js';
import { preloadAssets } from './assets.js';
import { setupCanvas, drawBoard } from './render.js';
import { board, getSelectedSquare, setSelectedSquare, turn, gameOver, initBoard, getMoves, isValid, inCheck, isCheckmate } from './board.js';
// You can also import timer logic if using timers

let canvas;

function handleClick(e) {
  const squareSize = 60;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / squareSize);
  const y = Math.floor((e.clientY - rect.top) / squareSize);
  if (!isValid(x, y) || gameOver) return;
  const config = getConfig();
  if (config.playMode === 'custom') {
    board[y][x] = getSelectedSquare() ? '' : board[y][x];
    drawBoard();
    return;
  }
  if (!getSelectedSquare()) {
    const p = board[y][x];
    if (p && (config.playMode === 'free' || p[0] === turn)) {
      setSelectedSquare([x, y]);
      drawBoard();
    }
  } else {
    const [sx, sy] = getSelectedSquare();
    const moves = config.playMode === 'free' ? [[x, y]] : getMoves(sx, sy);
    if (moves.some(m => m[0] === x && m[1] === y)) {
      board[y][x] = board[sy][sx];
      board[sy][sx] = null;
      setSelectedSquare(null);
      drawBoard();
      // You can add timer, checkmate logic here if you wish
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
  initBoard(config, undefined, drawBoard); // updateTimers optional
});

onConfigChange(() => {
  preloadAssets(drawBoard);
  const config = getConfig();
  initBoard(config, undefined, drawBoard);
});
