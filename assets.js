// assets.js
import { getConfig } from './settings.js';

export let images = {};

export function preloadAssets(drawBoardCallback) {
  images = {};
  const { imagePrefix } = getConfig();
  // imagePrefix will be '' for default, or e.g. '1' for Set 1
  const prefix = imagePrefix || '';

  ['R','N','E','F','K','P'].forEach(pt => {
    ['w','b'].forEach(color => {
      const key = color + pt;                    // e.g. 'wF'
      const filename = `${prefix}${key}.png`;    // e.g. '1wF.png'
      const img = new Image();
      if (drawBoardCallback) img.onload = drawBoardCallback;
      img.onerror = () => console.warn(`Could not load image: pieces/${filename}`);
      img.src = `pieces/${filename}`;
      images[key] = img;
    });
  });
}
