'use strict';

/* Os links e textos ficam direto no index.html (funcionam mesmo sem JavaScript).
   Este arquivo só adiciona as interações e os efeitos. */

const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const center = (el) => {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
};

const COLORS = ['#e38c9a', '#e7bf59', '#a8d5a2', '#a9b5ee', '#cfa8d6', '#ec9c8b', '#8fd0d6'];
const SHAPES = ['i-sparkle', 'i-heart', 'i-star'];

/* ───────── Partículas (estrelinhas, corações, brilhos) ───────── */
const SVG_NS = 'http://www.w3.org/2000/svg';
const layer = document.createElement('div');
layer.className = 'fx-layer';
layer.setAttribute('aria-hidden', 'true');
document.body.append(layer);

let alive = 0;

function spawn(x, y, o) {
  if (reduce || alive > 160) return;
  const size = o.size ?? rand(12, 20);
  const half = size / 2;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'fx');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `#${o.shape}`);
  svg.append(use);
  svg.style.setProperty('--c', o.color);
  svg.style.width = `${size}px`;
  svg.style.height = `${size}px`;
  layer.append(svg);
  if (!svg.animate) { svg.remove(); return; }
  alive++;

  const frame = (dx, dy, scale, rot, opacity, offset) => ({
    transform: `translate(${x - half + dx}px, ${y - half + dy}px) scale(${scale}) rotate(${rot}deg)`,
    opacity,
    ...(offset === undefined ? {} : { offset })
  });

  const frames = o.fall
    ? [frame(0, 0, 1, 0, 1), frame(o.dx, o.dy, 1, o.rot, 1, 0.85), frame(o.dx, o.dy, 0.6, o.rot, 0)]
    : [frame(0, 0, 0.3, 0, 1), frame(o.dx, o.dy, 1, o.rot / 2, 1, 0.4), frame(o.dx * 1.25, o.dy + (o.gravity ?? 60), 0.5, o.rot, 0)];

  const anim = svg.animate(frames, {
    duration: o.life ?? 900,
    easing: o.fall ? 'linear' : 'cubic-bezier(.2,.7,.3,1)',
    fill: 'forwards'
  });
  anim.onfinish = () => { svg.remove(); alive--; };
}

function burst(x, y, { colors = COLORS, count = 10, shapes = SHAPES } = {}) {
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2);
    const dist = rand(40, 110);
    spawn(x, y, {
      color: pick(colors),
      shape: pick(shapes),
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - 30,
      rot: rand(-200, 200)
    });
  }
}

function pop(el, { scale = 1.3, rotate = 0 } = {}) {
  if (reduce || !el.animate) return;
  el.animate(
    [{ scale: 1, rotate: '0deg' }, { scale, rotate: `${rotate}deg` }, { scale: 1, rotate: '0deg' }],
    { duration: 420, easing: 'cubic-bezier(.3,1.5,.5,1)' }
  );
}

/* ───────── Balãozinho de mensagem ───────── */
const bubble = $('.bubble');
let bubbleTimer;
function say(message) {
  if (!bubble) return;
  bubble.textContent = message;
  bubble.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.remove('show'), 2600);
}

/* ───────── Números da audiência ───────── */
const formatK = (n) => `${(n / 1000).toFixed(1).replace('.', ',')}k`;

const counters = $$('[data-count]');
const totalEl = $('[data-count-total]');
if (totalEl) totalEl.dataset.count = String(counters.reduce((sum, el) => sum + Number(el.dataset.count || 0), 0));
const allCounters = totalEl ? [...counters, totalEl] : counters;

const showFinal = (el) => { el.textContent = formatK(Number(el.dataset.count)); };
allCounters.forEach(showFinal);

function countUp(els, { duration = 1300, delay = 0 } = {}) {
  if (reduce) { els.forEach(showFinal); return; }
  const start = performance.now() + delay;
  const token = String(start);
  els.forEach((el) => { el.dataset.run = token; el.textContent = formatK(0); });

  const tick = (now) => {
    const t = clamp((now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    let running = false;
    els.forEach((el) => {
      if (el.dataset.run !== token) return; // outra contagem assumiu
      el.textContent = formatK(Number(el.dataset.count) * eased);
      running = true;
    });
    if (t < 1 && running) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

countUp(allCounters, { delay: 350 });

$$('.stat').forEach((button) => {
  button.addEventListener('click', () => {
    const number = $('strong', button);
    const isTotal = number.hasAttribute('data-count-total');
    countUp(isTotal ? allCounters : [number], { duration: 1100 });
    const [x, y] = center(button);
    burst(x, y, { colors: isTotal ? ['#e7bf59', '#f8f4e9', '#e38c9a'] : COLORS, count: isTotal ? 14 : 8 });
    pop(button, { scale: 1.12, rotate: isTotal ? 0 : -4 });
  });
});

/* ───────── Nome: cada letra reage ───────── */
const title = $('#profile-name');
if (title) {
  const text = title.textContent.trim();
  title.setAttribute('aria-label', text);
  title.textContent = '';

  const words = text.split(' ');
  words.forEach((word, index) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'word';
    wordEl.setAttribute('aria-hidden', 'true');
    [...word].forEach((char) => {
      const letter = document.createElement('span');
      letter.className = 'ch';
      letter.textContent = char;
      letter.style.setProperty('--rot', `${rand(-8, 8).toFixed(1)}deg`);
      wordEl.append(letter);
    });
    title.append(wordEl);
    if (index < words.length - 1) title.append(' ');
  });

  const letters = $$('.ch', title);
  const underline = $('.underline path');

  const wave = () => {
    if (reduce) return;
    letters.forEach((letter, i) => {
      letter.animate(
        [{ translate: '0 0' }, { translate: '0 -16px' }, { translate: '0 0' }],
        { duration: 520, delay: i * 45, easing: 'cubic-bezier(.3,1.5,.5,1)' }
      );
    });
    underline?.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], { duration: 700, easing: 'ease-out' });
  };

  // toque no celular: a letra pula (no desktop o :hover já faz isso)
  title.addEventListener('pointerdown', (e) => {
    const letter = e.target.closest('.ch');
    if (!letter) return;
    letter.classList.add('hop');
    setTimeout(() => letter.classList.remove('hop'), 260);
  });

  title.addEventListener('click', () => {
    wave();
    const [x, y] = center(title);
    burst(x, y, { count: 8 });
  });

  setTimeout(wave, 1100); // pequena "ola" quando a página abre
}

/* ───────── Adesivos ───────── */
$$('[data-cycle]').forEach((button) => {
  const options = button.dataset.cycle.split('|');
  let index = 0;
  button.addEventListener('click', () => {
    index = (index + 1) % options.length;
    button.textContent = options[index];
    pop(button, { rotate: pick([-14, 14]) });
    const [x, y] = center(button);
    burst(x, y, { count: 6 });
  });
});

const star = $('[data-star]');
star?.addEventListener('click', () => {
  const [x, y] = center(star);
  pop(star, { scale: 1.5, rotate: 180 });
  burst(x, y, { colors: ['#e7bf59', '#f8f4e9', '#e38c9a'], count: 12, shapes: ['i-star', 'i-sparkle'] });
});

/* ───────── Foto: gira ao clicar (5 cliques seguidos = modo festa) ───────── */
let partyTimer;
function party() {
  say('modo festa ativado!');
  root.classList.add('party');
  if (!reduce) {
    let rounds = 0;
    const id = setInterval(() => {
      for (let i = 0; i < 3; i++) {
        spawn(rand(0, window.innerWidth), -20, {
          color: pick(COLORS),
          shape: pick(SHAPES),
          size: rand(12, 22),
          dx: rand(-80, 80),
          dy: window.innerHeight + 60,
          rot: rand(-360, 360),
          life: rand(1800, 2800),
          fall: true
        });
      }
      if (++rounds > 38) clearInterval(id);
    }, 80);
  }
  clearTimeout(partyTimer);
  partyTimer = setTimeout(() => root.classList.remove('party'), 3500);
}

const avatar = $('[data-avatar]');
let avatarHits = [];
avatar?.addEventListener('click', () => {
  if (!reduce && avatar.animate) {
    avatar.animate(
      [
        { transform: 'perspective(700px) rotateY(0deg) scale(1)' },
        { transform: 'perspective(700px) rotateY(180deg) scale(1.12)' },
        { transform: 'perspective(700px) rotateY(360deg) scale(1)' }
      ],
      { duration: 800, easing: 'cubic-bezier(.3,1.2,.4,1)' }
    );
  }
  const [x, y] = center(avatar);
  burst(x, y, { count: 12 });

  const now = Date.now();
  avatarHits = avatarHits.filter((t) => now - t < 3000);
  avatarHits.push(now);
  if (avatarHits.length >= 5) { avatarHits = []; party(); }
});

/* ───────── Botões: brilho que segue o cursor, inclinação e onda ao clicar ───────── */
$$('.tile').forEach((tile) => {
  const setPosition = (e) => {
    const r = tile.getBoundingClientRect();
    const px = clamp((e.clientX - r.left) / r.width);
    const py = clamp((e.clientY - r.top) / r.height);
    tile.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    tile.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    if (e.pointerType === 'mouse' && !reduce) {
      tile.style.setProperty('--rx', `${((0.5 - py) * 7).toFixed(2)}deg`);
      tile.style.setProperty('--ry', `${((px - 0.5) * 9).toFixed(2)}deg`);
    }
  };

  tile.addEventListener('pointermove', setPosition);
  tile.addEventListener('pointerleave', () => {
    tile.style.removeProperty('--rx');
    tile.style.removeProperty('--ry');
  });

  tile.addEventListener('pointerdown', (e) => {
    setPosition(e);
    const box = tile.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.setProperty('--x', `${e.clientX - box.left}px`);
    ripple.style.setProperty('--y', `${e.clientY - box.top}px`);
    tile.append(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());

    const accent = getComputedStyle(tile).getPropertyValue('--accent').trim() || '#e38c9a';
    burst(e.clientX, e.clientY, { colors: [accent, accent, '#e7bf59', '#f8f4e9'], count: 7 });
  });
});

/* clique em qualquer espaço vazio também solta um confete */
document.addEventListener('pointerdown', (e) => {
  if (e.target.closest('a, button, h1')) return;
  burst(e.clientX, e.clientY, { count: 6 });
});

/* ───────── Fundo: rabiscos acompanham o mouse e a rolagem ───────── */
let moveFrame = false;
let lastMove = null;
let trailX = -999;
let trailY = -999;
let trailTime = 0;

function trail(x, y) {
  const now = performance.now();
  if (now - trailTime < 60 || Math.hypot(x - trailX, y - trailY) < 30) return;
  trailTime = now;
  trailX = x;
  trailY = y;
  spawn(x, y, {
    color: pick(COLORS),
    shape: pick(['i-sparkle', 'i-star']),
    size: rand(8, 13),
    dx: rand(-12, 12),
    dy: rand(10, 26),
    rot: rand(-90, 90),
    life: 650,
    gravity: 8
  });
}

if (!reduce) {
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    lastMove = e;
    if (moveFrame) return;
    moveFrame = true;
    requestAnimationFrame(() => {
      moveFrame = false;
      root.style.setProperty('--px', (lastMove.clientX / window.innerWidth - 0.5).toFixed(3));
      root.style.setProperty('--py', (lastMove.clientY / window.innerHeight - 0.5).toFixed(3));
      trail(lastMove.clientX, lastMove.clientY);
    });
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    root.style.setProperty('--px', '0');
    root.style.setProperty('--py', '0');
  });

  let scrollFrame = false;
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = true;
    requestAnimationFrame(() => {
      scrollFrame = false;
      const max = Math.max(1, root.scrollHeight - window.innerHeight);
      root.style.setProperty('--sy', clamp(window.scrollY / max).toFixed(3));
    });
  }, { passive: true });
}

/* ───────── Copiar e-mail ───────── */
async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* cai no método antigo abaixo */
    }
  }

  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.append(input);
  input.select();
  const copied = document.execCommand('copy');
  input.remove();
  if (!copied) throw new Error('Não foi possível copiar o texto.');
}

const copyButton = $('[data-copy-email]');
const toast = $('[data-copy-feedback]');

if (copyButton && toast) {
  let timeout;

  copyButton.addEventListener('click', async () => {
    clearTimeout(timeout);
    try {
      await copyText(copyButton.dataset.copyEmail);
      copyButton.dataset.state = 'copied';
      toast.textContent = 'E-mail copiado!';
      const [x, y] = center(copyButton);
      burst(x, y, { colors: ['#a8d5a2', '#f8f4e9', '#e7bf59'], count: 10 });
    } catch {
      copyButton.dataset.state = 'error';
      toast.textContent = 'Não consegui copiar';
    }
    toast.classList.add('show');

    timeout = setTimeout(() => {
      delete copyButton.dataset.state;
      toast.classList.remove('show');
    }, 2200);
  });
}
