import { getConfig } from './settings.js';

export let board = [];
let selectedSquare = null;
export function getSelectedSquare() { return selectedSquare; }
export function setSelectedSquare(val) { selectedSquare = val; }
export let turn = 'w';
export let gameOver = false;

export function isValid(x, y) {
  return x >= 0 && x < 8 && y >= 0 && y < 8;
}

export function getMoves(x, y, ignoreCheck = false) {
  if (!isValid(x, y) || !board[y][x]) return [];
  const p = board[y][x], color = p[0], t = p[1], opp = color === 'w' ? 'b' : 'w';
  let moves = [];
  let type = t;
  if (t === 'P' && (y === 0 || y === 7)) type = 'F';
  if (type === 'R') {
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => {
      for (let i = 1; i < 8; i++) {
        const nx = x + dx*i, ny = y + dy*i;
        if (!isValid(nx, ny)) break;
        const o = board[ny][nx];
        if (!o) moves.push([nx, ny]);
        else { if (o[0] === opp) moves.push([nx, ny]); break; }
      }
    });
  }
  const defs = {
    E: { dirs: [[1,1],[1,-1],[-1,1],[-1,-1]], step: 2 },
    F: { dirs: [[1,1],[1,-1],[-1,1],[-1,-1]], step: 1 },
    N: { dirs: [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]], step:1 },
    K: { dirs: [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]], step:1 }
  };
  if (defs[type]) defs[type].dirs.forEach(([dx,dy]) => {
    const nx = x + dx*defs[type].step, ny = y + dy*defs[type].step;
    if (isValid(nx, ny)) {
      const o = board[ny][nx];
      if (!o || o[0] === opp) moves.push([nx, ny]);
    }
  });
  if (t === 'P') {
    const dir = color === 'w' ? 1 : -1;
    const nx = x, ny = y + dir;
    if (isValid(nx, ny) && !board[ny][nx]) moves.push([nx, ny]);
    [[1, dir],[-1, dir]].forEach(([dx,dy]) => {
      const cx = x + dx, cy = y + dy;
      if (isValid(cx, cy) && board[cy][cx] && board[cy][cx][0] === opp)
        moves.push([cx, cy]);
    });
  }
  if (!ignoreCheck && getConfig().playMode === 'play') {
    moves = moves.filter(([mx, my]) => {
      const backup = board[my][mx];
      board[my][mx] = board[y][x]; board[y][x] = null;
      const bad = inCheck(color);
      board[y][x] = board[my][mx]; board[my][mx] = backup;
      return !bad;
    });
  }
  return moves;
}

export function inCheck(color) {
  const opp = color === 'w' ? 'b' : 'w';
  let kpos;
  board.forEach((row,y) => row.forEach((c,x) => { if (c === color+'K') kpos=[x,y]; }));
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const p = board[y][x];
      if (p && p[0] === opp) {
        if (getMoves(x, y, true).some(m => m[0] === kpos[0] && m[1] === kpos[1])) return true;
      }
    }
  }
  return false;
}

export function isCheckmate(color) {
  if (!inCheck(color)) return false;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const p = board[y][x]; if (!p || p[0] !== color) continue;
      for (const [mx, my] of getMoves(x, y)) {
        const backup = board[my][mx]; board[my][mx] = board[y][x]; board[y][x] = null;
        if (!inCheck(color)) return false;
        board[y][x] = board[my][mx]; board[my][mx] = backup;
      }
    }
  }
  return true;
}

export function initBoard(config, updateTimers, drawBoard) {
  board = Array.from({ length: 8 }, () => Array(8).fill(null));
  setSelectedSquare(null);
  turn = 'w';
  gameOver = false;
  document.getElementById('message').textContent = '';

  if (config.playMode !== 'custom') {
    const backRank = ['R','N','E','F','K','E','N','R'];
    for (let x = 0; x < 8; x++) {
      board[0][x] = 'w' + backRank[x];
      board[1][x] = 'wP';
      board[6][x] = 'bP';
      board[7][x] = 'b' + backRank[x];
    }
  }

  updateTimers && updateTimers();
  drawBoard && drawBoard();
}
