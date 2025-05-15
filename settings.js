// settings.js
// Manages rendering and interaction of Settings and Play panels
// Exposes getConfig() and onConfigChange(callback)

const config = {
  theme: 'classic',
  playMode: 'free',
  timer: 'none',
  increment: false,
  showGuider: false,
  imagePrefix: ''  // '' or '1' for set1
};

const listeners = [];

export function getConfig() {
  return { ...config };
}

export function onConfigChange(cb) {
  if (typeof cb === 'function') listeners.push(cb);
}

function notifyChange() {
  listeners.forEach(cb => cb(getConfig()));
}

function buildSettingsHTML() {
  return `
    <h3>Settings</h3>
    <label>Theme:
      <select id="themeSelect">
        <option value="classic">Classic</option>
        <option value="wood">Wood</option>
        <option value="dark">Dark</option>
        <option value="sand">Sand</option>
        <option value="ice">Ice</option>
      </select>
    </label>
    <label>Piece Set:
      <select id="setSelect">
        <option value="">Default</option>
        <option value="1">Set 1</option>
      </select>
    </label>
    <label><input type="checkbox" id="guiderToggle"> Show Move Guider</label>
  `;
}

function buildPlayHTML() {
  return `
    <h3>Game Options</h3>
    <label>Play Mode:
      <select id="playModeSelect">
        <option value="free">Free Mode</option>
        <option value="custom">Custom Mode</option>
        <option value="play">Play Mode</option>
        <option value="two">2 Players Mode</option>
      </select>
    </label>
    <label>Timer:
      <select id="timerSelect">
        <option value="none">No Timer</option>
        <option value="5">5 Minutes</option>
        <option value="10">10 Minutes</option>
        <option value="open">Open</option>
      </select>
    </label>
    <label><input type="checkbox" id="incrementToggle"> Add 10s increment each move</label>
  `;
}

function attachSettingsListeners() {
  document.getElementById('themeSelect').addEventListener('change', e => {
    config.theme = e.target.value;
    notifyChange();
  });
  document.getElementById('setSelect').addEventListener('change', e => {
    config.imagePrefix = e.target.value;
    notifyChange();
  });
  document.getElementById('guiderToggle').addEventListener('change', e => {
    config.showGuider = e.target.checked;
    notifyChange();
  });
}

function attachPlayListeners() {
  document.getElementById('playModeSelect').addEventListener('change', e => {
    config.playMode = e.target.value;
    notifyChange();
  });
  document.getElementById('timerSelect').addEventListener('change', e => {
    config.timer = e.target.value;
    notifyChange();
  });
  document.getElementById('incrementToggle').addEventListener('change', e => {
    config.increment = e.target.checked;
    notifyChange();
  });
}

// Render panels and hook toggle buttons
window.addEventListener('DOMContentLoaded', () => {
  const settingsContainer = document.getElementById('settingsPanel');
  const playContainer = document.getElementById('playPanel');

  settingsContainer.innerHTML = buildSettingsHTML();
  playContainer.innerHTML = buildPlayHTML();

  attachSettingsListeners();
  attachPlayListeners();

  document.getElementById('settingsButton').onclick = () => {
    settingsContainer.style.display = settingsContainer.style.display === 'block' ? 'none' : 'block';
  };
  document.getElementById('playButton').onclick = () => {
    playContainer.style.display = playContainer.style.display === 'block' ? 'none' : 'block';
  };
});
