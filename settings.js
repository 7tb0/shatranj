// settings.js
// Manages rendering and interaction of Settings and Play panels, plus piece-set selection

const config = {
  theme: 'classic',
  playMode: 'free',
  timer: 'none',
  increment: false,
  showGuider: false,
  imagePrefix: ''  // '' = default set, '1' = Set 1, etc.
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
    <button class="closeBtn" id="closeSettings">×</button>
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
        <!-- add more sets here -->
      </select>
    </label>
    <label><input type="checkbox" id="guiderToggle"> Show Move Guider</label>
  `;
}

function buildPlayHTML() {
  return `
    <button class="closeBtn" id="closePlay">×</button>
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
  // Close button
  document.getElementById('closeSettings').addEventListener('click', () => {
    document.getElementById('settingsPanel').style.display = 'none';
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
  // Close button
  document.getElementById('closePlay').addEventListener('click', () => {
    document.getElementById('playPanel').style.display = 'none';
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const settingsContainer = document.getElementById('settingsPanel');
  const playContainer     = document.getElementById('playPanel');

  settingsContainer.innerHTML = buildSettingsHTML();
  playContainer.innerHTML     = buildPlayHTML();

  attachSettingsListeners();
  attachPlayListeners();

  document.getElementById('settingsButton').onclick = () => {
    const p = settingsContainer;
    p.style.display = p.style.display === 'block' ? 'none' : 'block';
  };
  document.getElementById('playButton').onclick = () => {
    const p = playContainer;
    p.style.display = p.style.display === 'block' ? 'none' : 'block';
  };

  // initial load
  notifyChange();
});
