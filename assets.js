// assets.js
import { getConfig } from './settings.js';

export let images = {};

export function preloadAssets(drawBoardCallback) {
  images = {};
  const { imagePrefix } = getConfig();
  // Always look in the pieces/ folder; if the user selected a set number, use pieces/setX/
  const basePath = imagePrefix
    ? `pieces/set${imagePrefix}/`
    : 'pieces/';
  
  ['R','N','E','F','K','P'].forEach(pt => {
    ['w','b'].forEach(color => {
      const key = color + pt;
      const img = new Image();
      if (drawBoardCallback) img.onload = drawBoardCallback;
      img.onerror = () => console.warn(`Could not load image: ${basePath}${key}.png`);
      img.src = `${basePath}${key}.png`;
      images[key] = img;
    });
  });
}
