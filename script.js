'use strict';
const pages = Array.from(document.querySelectorAll('.page'));
const counter = document.getElementById('counter');
const viewport = document.getElementById('viewport');
const stage = document.getElementById('portfolio');
const previous = document.getElementById('prev');
const next = document.getElementById('next');
const fullscreen = document.getElementById('fullscreen');
const projects = Array.from(document.querySelectorAll('[data-goto]'));
let current = 0;
function show(index, updateHash = true) {
  current = Math.max(0, Math.min(pages.length - 1, index));
  pages.forEach((page, i) => {
    page.hidden = i !== current;
    page.classList.toggle('active', i === current);
    page.setAttribute('aria-hidden', String(i !== current));
  });
  pages[current].querySelector('img').loading = 'eager';
  counter.textContent = `${String(current + 1).padStart(2, '0')} / ${pages.length}`;
  previous.disabled = current === 0;
  next.disabled = current === pages.length - 1;
  const activeProject = projects.filter(button => Number(button.dataset.goto) <= current).pop();
  projects.forEach(button => {
    if (button === activeProject) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  if (updateHash) history.replaceState(null, '', `#slide-${current + 1}`);
  for (const i of [current - 1, current + 1]) {
    if (pages[i]) pages[i].querySelector('img').loading = 'eager';
  }
}
previous.addEventListener('click', () => show(current - 1));
next.addEventListener('click', () => show(current + 1));
projects.forEach(button => button.addEventListener('click', () => show(Number(button.dataset.goto))));
window.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
  const keys = ['ArrowRight', 'PageDown', 'ArrowLeft', 'PageUp', 'Home', 'End'];
  if (!keys.includes(event.key)) return;
  event.preventDefault();
  show(event.key === 'Home' ? 0 : event.key === 'End' ? pages.length - 1 : current + (['ArrowRight', 'PageDown'].includes(event.key) ? 1 : -1));
});
fullscreen.hidden = !document.fullscreenEnabled;
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { fullscreen.textContent = 'Fullscreen unavailable'; }
});
document.addEventListener('fullscreenchange', () => {
  const on = Boolean(document.fullscreenElement);
  fullscreen.setAttribute('aria-pressed', String(on));
  fullscreen.textContent = on ? 'Exit fullscreen' : 'Fullscreen';
});
let touchStart = null;
viewport.addEventListener('touchstart', event => {
  touchStart = event.touches.length === 1 ? {x:event.touches[0].clientX, y:event.touches[0].clientY} : null;
}, {passive:true});
viewport.addEventListener('touchmove', event => { if(event.touches.length > 1) touchStart = null; }, {passive:true});
viewport.addEventListener('touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) show(current + (dx < 0 ? 1 : -1));
  touchStart = null;
}, {passive:true});
viewport.addEventListener('touchcancel', () => { touchStart = null; }, {passive:true});
function fromHash() {
  const match = location.hash.match(/^#slide-(\d+)$/);
  const legacy = pages.findIndex(page => '#' + page.dataset.legacyId === location.hash);
  show(match ? Number(match[1]) - 1 : legacy >= 0 ? legacy : 0, false);
}
window.addEventListener('hashchange', fromHash);
function fitSlide() {
  const style = getComputedStyle(stage);
  const width = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const height = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  const fitted = Math.max(0, Math.min(width, height * 16 / 9, 1600));
  viewport.style.width = fitted + 'px';
  viewport.style.height = fitted * 9 / 16 + 'px';
}
new ResizeObserver(fitSlide).observe(stage);
fromHash();
fitSlide();
