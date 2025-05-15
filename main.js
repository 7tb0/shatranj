// main.js
import { getConfig, onConfigChange } from './settings.js';

let canvas, ctx;
const boardSize = 8;
const squareSize = 60;
let board = [];
let images = {};
let selectedSquare = null;
let turn = 'w';
let whiteTime = 0;
let blackTime = 0;
let timerInterval = null;
let gameOver = false;

function setupCanvas() {
  canvas = document.getElementById('board');
  ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = boardSize * squareSize + 'px';
  canvas.style.height = boardSize * squareSize + 'px';
  canvas.width = boardSize * squareSize * dpr;
  canvas.height = boardSize * squareSize * dpr;
  ctx.scale(dpr, dpr);

  canvas.addEventListener('click', handleClick);
}

function preloadAssets() {
  images = {};
  const { imagePrefix } = getConfig();
  const prefix = imagePrefix || '';
  ['R','N','E','F','K','P'].forEach(pt => {
    ['w','b'].forEach(color => {
      const key = color + pt;
      const img = new Image();
      img.onload = drawBoard;
      img.onerror = () => { console.warn(`Image ${prefix+key}.png not found`); };
      img.src = `${prefix}${key}.png`;
      images[key] = img;
    });
  });
}

function initBoard() {
  const config = getConfig();
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
  selectedSquare = null;
  turn = 'w';
  gameOver = false;
  document.getElementById('message').textContent = '';

  if (config.playMode !== 'custom') {
    const backRank = ['R','N','E','F','K','E','N','R'];
    for (let x = 0; x < boardSize; x++) {
      board[0][x] = 'w' + backRank[x];
      board[1][x] = 'wP';
      board[6][x] = 'bP';
      board[7][x] = 'b' + backRank[x];
    }
  }

  if (config.timer === 'open') {
    whiteTime = 0; blackTime = 0;
  } else {
    whiteTime = blackTime = parseInt(config.timer, 10) * 60 || 0;
  }

  updateTimers();
  drawBoard();

  if (timerInterval) clearInterval(timerInterval);
  if (config.timer !== 'none' && config.timer !== 'open') {
    timerInterval = setInterval(() => {
      if (turn === 'w') whiteTime--; else blackTime--;
      updateTimers();
    }, 1000);
  }
}

function drawBoard() {
  const { theme, showGuider, playMode } = getConfig();
  const themes = {
    classic: { light: '#f0d9b5', dark: '#b58863' },
    wood:    { light: '#d2a679', dark: '#8b5a2b' },
    dark:    { light: '#4f5b75', dark: '#2a2e38' },
    sand:    { light: '#d8c3a5', dark: '#b0906f' },
    ice:     { light: '#e3f2fd', dark: '#90a4ae' }
  };
  const colors = themes[theme];

  ctx.clearRect(0, 0, boardSize * squareSize, boardSize * squareSize);

  // Draw squares
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? colors.light : colors.dark;
      ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    }
  }

  // Move guider
  if (selectedSquare && showGuider && playMode === 'play') {
    const moves = getMoves(...selectedSquare);
    ctx.fillStyle = 'rgba(0,255,0,0.3)';
    moves.forEach(([mx,my])=> ctx.fillRect(mx*squareSize, my*squareSize, squareSize, squareSize));
  }

  // Selection border
  if (selectedSquare) {
    const [sx,sy] = selectedSquare;
    ctx.strokeStyle = 'red'; ctx.lineWidth = 2;
    ctx.strokeRect(sx*squareSize+2, sy*squareSize+2, squareSize-4, squareSize-4);
  }

  // Draw pieces
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font='20px sans-serif';
  for (let y=0; y<boardSize; y++) {
    for (let x=0; x<boardSize; x++) {
      const key = board[y][x];
      if (!key) continue;
      const img = images[key];
      if (img && img.complete && img.naturalWidth) {
        ctx.drawImage(img, x*squareSize, y*squareSize, squareSize, squareSize);
      } else {
        ctx.fillStyle = 'black';
        ctx.fillText(key, x*squareSize + squareSize/2, y*squareSize + squareSize/2);
      }
    }
  }
}

function handleClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / squareSize);
  const y = Math.floor((e.clientY - rect.top) / squareSize);
  if (!isValid(x,y) || gameOver) return;

  const config = getConfig();
  if (config.playMode === 'custom') {
    board[y][x] = selectedSquare ? '' : board[y][x];
    drawBoard();
    return;
  }

  if (!selectedSquare) {
    const p = board[y][x];
    if (p && (config.playMode==='free' || p[0] === turn)) {
      selectedSquare = [x,y]; drawBoard();
    }
  } else {
    const [sx,sy] = selectedSquare;
    const moves = (config.playMode==='free') ? [[x,y]] : getMoves(sx,sy);
    if (moves.some(m=>m[0]===x&&m[1]===y)) {
      board[y][x] = board[sy][sx]; board[sy][sx] = null;
      if (config.increment) { if (turn==='w') whiteTime+=10; else blackTime+=10; }
      if (config.playMode==='play' || config.playMode==='two') {
        if (inCheck(turn==='w'?'b':'w')) document.getElementById('message').textContent='Check!';
        if (isCheckmate(turn==='w'?'b':'w')) { gameOver=true; document.getElementById('message').textContent = (turn==='w'?'Black':'White')+' is checkmated!'; }
        turn = turn==='w'?'b':'w';
      }
      updateTimers();
    }
    selectedSquare = null;
    drawBoard();
  }
}

function isValid(x,y) { return x>=0&&x<boardSize&&y>=0&&y<boardSize; }

function getMoves(x,y,ignoreCheck=false) {
  // Implement move logic (rook, elephant, ferz, knight, king, pawn)
  // ... (same as previous) ...
  return [];
}

function inCheck(color) { /* ... */ return false; }
function isCheckmate(color) { /* ... */ return false; }

function updateTimers() {
  const { timer } = getConfig();
  const wt = document.getElementById('whiteTimer');
  const bt = document.getElementById('blackTimer');
  if (timer==='none') { document.getElementById('timers').style.display='none'; return; }
  document.getElementById('timers').style.display='flex';
  wt.textContent = 'White: ' + formatTime(whiteTime);
  bt.textContent = 'Black: ' + formatTime(blackTime);
}

function formatTime(s) { const m=Math.floor(s/60), sec=s%60; return m.toString().padStart(2,'0')+':'+sec.toString().padStart(2,'0'); }

// Initialize everything
onConfigChange(cfg => {
  preloadAssets();
  initBoard();
});

document.addEventListener('DOMContentLoaded', () => {
  setupCanvas();
  preloadAssets();
  initBoard();
});
