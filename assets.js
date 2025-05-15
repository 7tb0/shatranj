// assets.js
import { getConfig } from './settings.js';

export let images = {};

export function preloadAssets(drawBoardCallback) {
  images = {};
  const { imagePrefix } = getConfig();
  const prefix = imagePrefix ? `pieces/set${imagePrefix}/` : 'pieces/';
  ['R','N','E','F','K','P'].forEach(pt => {
    ['w','b'].forEach(color => {
      const key = color + pt;
      const img = new Image();
      if (drawBoardCallback) img.onload = drawBoardCallback;
      img.onerror = () => console.warn(`Could not load image: ${prefix}${key}.png`);
      img.src = `${prefix}${key}.png`;
      images[key] = img;
    });
  });
}
