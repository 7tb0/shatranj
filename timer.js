// timer.js
let whiteTime = 0;
let blackTime = 0;
let timerInterval = null;

export function setTimes(w, b) {
  whiteTime = w;
  blackTime = b;
}
export function getTimes() {
  return { whiteTime, blackTime };
}
export function clearTimer() {
  if (timerInterval) clearInterval(timerInterval);
}
export function startTimer(turn, updateCallback) {
  timerInterval = setInterval(() => {
    if (turn === 'w') whiteTime--;
    else blackTime--;
    updateCallback && updateCallback();
  }, 1000);
}
export function updateTimersDisplay() {
  const wt = document.getElementById('whiteTimer');
  const bt = document.getElementById('blackTimer');
  wt.textContent = 'White: ' + formatTime(whiteTime);
  bt.textContent = 'Black: ' + formatTime(blackTime);
}
export function formatTime(s) {
  const m = Math.floor(s/60), sec = s % 60;
  return m.toString().padStart(2,'0') + ':' + sec.toString().padStart(2,'0');
}
