// render.js
import { getConfig } from './settings.js';
import { board, selectedSquare, getMoves } from './board.js';
import { images } from './assets.js';

let canvas, ctx;
export function setupCanvas(canvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = 8 * 60 + 'px';
  canvas.style.height = 8 * 60 + 'px';
  canvas.width = 8 * 60 * dpr;
  canvas.height = 8 * 60 * dpr;
  ctx.scale(dpr, dpr);
}
export function drawBoard() {
  const { theme, showGuider, playMode } = getConfig();
  const squareSize = 60;
  const themes = {
    classic: { light: '#f0d9b5', dark: '#b58863' },
    wood:    { light: '#d2a679', dark: '#8b5a2b' },
    dark:    { light: '#4f5b75', dark: '#2a2e38' },
    sand:    { light: '#d8c3a5', dark: '#b0906f' },
    ice:     { light: '#e3f2fd', dark: '#90a4ae' },
    red:     { light: '#ffffff', dark: '#ffc0cb' }
  };
  const colors = themes[theme] || themes.classic;

  ctx.clearRect(0, 0, 8 * squareSize, 8 * squareSize);

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
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

  // Move guider overlay
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

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '20px sans-serif';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const key = board[y][x];
      if (!key) continue;
      const img = images[key];
      const px = x * squareSize;
      const py = y * squareSize;
      if (img && img.complete && img.naturalWidth) {
        ctx.drawImage(img, px, py, squareSize, squareSize);
      } else {
        ctx.fillStyle = 'black';
        ctx.fillText(key, px + squareSize / 2, py + squareSize / 2);
      }
    }
  }
}
