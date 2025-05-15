// main.js
import { getConfig, onConfigChange } from './settings.js';
import { preloadAssets } from './assets.js';
import { setupCanvas, drawBoard } from './render.js';
import { board, selectedSquare, turn, gameOver, initBoard, getMoves, isValid, inCheck, isCheckmate } from './board.js';
import { setTimes, getTimes, clearTimer, startTimer, updateTimersDisplay } from './timer.js';

let canvas;

function handleClick(e) {
  const squareSize = 60;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / squareSize);
  const y = Math.floor((e.clientY - rect.top) / squareSize);
  if (!isValid(x, y) || gameOver) return;
  const config = getConfig();
  if (config.playMode === 'custom') {
    board[y][x] = selectedSquare ? '' : board[y][x];
    drawBoard();
    return;
  }
  if (!selectedSquare) {
    const p = board[y][x];
    if (p && (config.playMode === 'free' || p[0] === turn)) {
      selectedSquare = [x, y];
      drawBoard();
    }
  } else {
    const [sx, sy] = selectedSquare;
    const moves = config.playMode === 'free' ? [[x, y]] : getMoves(sx, sy);
    if (moves.some(m => m[0] === x && m[1] === y)) {
      board[y][x] = board[sy][sx];
      board[sy][sx] = null;
      if (config.increment) {
        const times = getTimes();
        if (turn === 'w') setTimes(times.whiteTime + 10, times.blackTime);
        else setTimes(times.whiteTime, times.blackTime + 10);
      }
      if (config.playMode === 'play' || config.playMode === 'two') {
        if (inCheck(turn === 'w' ? 'b' : 'w'))
          document.getElementById('message').textContent = 'Check!';
        if (isCheckmate(turn === 'w' ? 'b' : 'w')) {
          gameOver = true;
          document.getElementById('message').textContent =
            (turn === 'w' ? 'Black' : 'White') + ' is checkmated!';
        }
        // Swap turn here, if you have a turn-swapping logic in board.js
      }
      updateTimersDisplay();
    }
    selectedSquare = null;
    drawBoard();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('board');
  setupCanvas(canvas);
  canvas.addEventListener('click', handleClick);

  preloadAssets(drawBoard);
  const config = getConfig();
  initBoard(config, updateTimersDisplay, drawBoard);
});

onConfigChange(() => {
  preloadAssets(drawBoard);
  const config = getConfig();
  initBoard(config, updateTimersDisplay, drawBoard);
});
