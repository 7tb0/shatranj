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

// Initialize canvas and click handler
function setupCanvas() {
  canvas = document.getElementById('board');
  ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width  = boardSize * squareSize + 'px';
  canvas.style.height = boardSize * squareSize + 'px';
  canvas.width  = boardSize * squareSize * dpr;
  canvas.height = boardSize * squareSize * dpr;
  ctx.scale(dpr, dpr);
  canvas.addEventListener('click', handleClick);
}

// Load piece images from pieces/ folder with optional prefix
function preloadAssets() {
  images = {};
  const { imagePrefix } = getConfig();
  const prefix = imagePrefix || ''; // '' for default, '1' for Set 1, etc.

  ['R','N','E','F','K','P'].forEach(pt => {
    ['w','b'].forEach(color => {
      const key = color + pt;                 // e.g. 'wR', 'bF'
      const filename = `${prefix}${key}.png`; // e.g. '1wR.png' or 'bF.png'
      const img = new Image();
      img.onload = drawBoard;
      img.onerror = () => console.warn(`Could not load image: pieces/${filename}`);
      img.src = `pieces/${filename}`;
      images[key] = img;
    });
  });
}

// Initialize board array and timers
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
    whiteTime = blackTime = 0;
  } else {
    const t = parseInt(config.timer, 10);
    whiteTime = blackTime = isNaN(t) ? 0 : t * 60;
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

// Draw the board, pieces, and overlays
function drawBoard() {
  const { theme, showGuider, playMode } = getConfig();
  const themes = {
    classic: { light: '#f0d9b5', dark: '#b58863' },
    wood:    { light: '#d2a679', dark: '#8b5a2b' },
    dark:    { light: '#4f5b75', dark: '#2a2e38' },
    sand:    { light: '#d8c3a5', dark: '#b0906f' },
    ice:     { light: '#e3f2fd', dark: '#90a4ae' },
    red:     { light: '#ffffff', dark: '#ffc0cb' }
  };
  const colors = themes[theme] || themes.classic;

  ctx.clearRect(0, 0, boardSize * squareSize, boardSize * squareSize);

  // Squares
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const isLight = (x + y) % 2 === 0;
      ctx.fillStyle = isLight ? colors.light : colors.dark;
      ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
      if (theme === 'red') {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
      }
    }
  }

  // Move guider
  if (selectedSquare && showGuider && playMode === 'play') {
    ctx.fillStyle = 'rgba(0,255,0,0.3)';
    getMoves(...selectedSquare).forEach(([mx, my]) => {
      ctx.fillRect(mx * squareSize, my * squareSize, squareSize, squareSize);
    });
  }

  // Selection border
  if (selectedSquare) {
    const [sx, sy] = selectedSquare;
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      sx * squareSize + 2,
      sy * squareSize + 2,
      squareSize - 4,
      squareSize - 4
    );
  }

  // Pieces
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '20px sans-serif';
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const key = board[y][x];
      if (!key) continue;
      const img = images[key];
      const px = x * squareSize, py = y * squareSize;
      if (img && img.complete && img.naturalWidth) {
        ctx.drawImage(img, px, py, squareSize, squareSize);
      } else {
        ctx.fillStyle = 'black';
        ctx.fillText(key, px + squareSize/2, py + squareSize/2);
      }
    }
  }
}

// Click handler
function handleClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / squareSize);
  const y = Math.floor((e.clientY - rect.top) / squareSize);
  if (!isValid(x, y) || gameOver) return;
  const config = getConfig();

  // Custom mode: draw/erase
  if (config.playMode === 'custom') {
    board[y][x] = selectedSquare ? '' : board[y][x];
    drawBoard();
    return;
  }

  // Select
  if (!selectedSquare) {
    const p = board[y][x];
    if (p && (config.playMode === 'free' || p[0] === turn)) {
      selectedSquare = [x, y];
      drawBoard();
    }
    return;
  }

  // Move
  const [sx, sy] = selectedSquare;
  const moves = config.playMode === 'free' ? [[x,y]] : getMoves(sx, sy);
  if (moves.some(m => m[0] === x && m[1] === y)) {
    board[y][x] = board[sy][sx];
    board[sy][sx] = null;

    if (config.playMode === 'play' || config.playMode === 'two') {
      const enemy = turn === 'w' ? 'b' : 'w';
      if (inCheck(enemy)) {
        document.getElementById('message').textContent = 'Check!';
      } else {
        document.getElementById('message').textContent = '';
      }
      if (isCheckmate(enemy)) {
        gameOver = true;
        document.getElementById('message').textContent =
          (enemy === 'w' ? 'White' : 'Black') + ' is checkmated!';
      }
      turn = enemy;
    }
  }

  selectedSquare = null;
  drawBoard();
}

function isValid(x, y) {
  return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
}

function getMoves(x, y, ignoreCheck = false) {
  if (!isValid(x, y) || !board[y][x]) return [];
  const p = board[y][x], color = p[0], t = p[1], opp = color === 'w' ? 'b' : 'w';
  let moves = [], type = t;
  if (t === 'P' && (y === 0 || y === boardSize-1)) type = 'F';

  // Rook-like
  if (type === 'R') {
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => {
      for (let i=1; i<boardSize; i++) {
        const nx=x+dx*i, ny=y+dy*i;
        if (!isValid(nx,ny)) break;
        const o=board[ny][nx];
        if (!o) moves.push([nx,ny]);
        else { if(o[0]===opp) moves.push([nx,ny]); break; }
      }
    });
  }

  // Bishop/elephant, knight, king
  const defs = {
    E: { dirs:[[1,1],[1,-1],[-1,1],[-1,-1]], step:2 },
    F: { dirs:[[1,1],[1,-1],[-1,1],[-1,-1]], step:1 },
    N: { dirs:[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]], step:1 },
    K: { dirs:[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]], step:1 }
  };
  if(defs[type]) defs[type].dirs.forEach(([dx,dy])=>{
    const nx=x+dx*defs[type].step, ny=y+dy*defs[type].step;
    if(isValid(nx,ny)){
      const o=board[ny][nx];
      if(!o||o[0]===opp) moves.push([nx,ny]);
    }
  });

  // Pawn
  if(t==='P'){
    const dir=color==='w'?1:-1;
    if(isValid(x,y+dir)&&!board[y+dir][x]) moves.push([x,y+dir]);
    [[1,dir],[-1,dir]].forEach(([dx,dy])=>{
      const cx=x+dx, cy=y+dy;
      if(isValid(cx,cy)&&board[cy][cx]&&board[cy][cx][0]===opp)
        moves.push([cx,cy]);
    });
  }

  // Filter moves leaving king in check
  if(!ignoreCheck && getConfig().playMode==='play'){
    moves = moves.filter(([mx,my])=>{
      const backup=board[my][mx];
      board[my][mx]=board[y][x]; board[y][x]=null;
      const bad=inCheck(color);
      board[y][x]=board[my][mx]; board[my][mx]=backup;
      return !bad;
    });
  }

  return moves;
}

function inCheck(color){
  const opp=color==='w'?'b':'w';
  let kpos;
  board.forEach((r,y)=>r.forEach((c,x)=>{if(c===color+'K')kpos=[x,y]}));
  for(let y=0;y<boardSize;y++){
    for(let x=0;x<boardSize;x++){
      const p=board[y][x];
      if(p&&p[0]===opp){
        if(getMoves(x,y,true).some(m=>m[0]===kpos[0]&&m[1]===kpos[1]))
          return true;
      }
    }
  }
  return false;
}

function isCheckmate(color){
  if(!inCheck(color))return false;
  for(let y=0;y<boardSize;y++){
    for(let x=0;x<boardSize;x++){
      const p=board[y][x];
      if(!p||p[0]!==color)continue;
      for(const [mx,my] of getMoves(x,y)){
        const backup=board[my][mx];
        board[my][mx]=board[y][x]; board[y][x]=null;
        if(!inCheck(color)){
          board[y][x]=board[my][mx]; board[my][mx]=backup;
          return false;
        }
        board[y][x]=board[my][mx]; board[my][mx]=backup;
      }
    }
  }
  return true;
}

function updateTimers(){
  const { timer }=getConfig();
  const wt=document.getElementById('whiteTimer');
  const bt=document.getElementById('blackTimer');
  if(timer==='none'){
    document.getElementById('timers').style.display='none';
    return;
  }
  document.getElementById('timers').style.display='flex';
  wt.textContent='White: '+formatTime(whiteTime);
  bt.textContent='Black: '+formatTime(blackTime);
}

function formatTime(s){
  const m=Math.floor(s/60), sec=s%60;
  return m.toString().padStart(2,'0')+':'+sec.toString().padStart(2,'0');
}

// React to settings changes
onConfigChange(()=>{
  preloadAssets();
  initBoard();
});

// Initial load
window.addEventListener('DOMContentLoaded',()=>{
  setupCanvas();
  preloadAssets();
  initBoard();
});
