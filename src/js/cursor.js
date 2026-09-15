import gsap from 'gsap';

const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

/* ─────────────────────────────────────────────
   Custom cursor: dot snaps, ring trails with lerp
   ───────────────────────────────────────────── */
export function initCursor() {
  if (isTouch) return null;

  const cursor = document.getElementById('cursor');
  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  const label = cursor.querySelector('.cursor__label');

  document.body.classList.add('no-cursor');

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const ringPos = { x: pos.x, y: pos.y };
  const dotX = gsap.quickSetter(dot, 'x', 'px');
  const dotY = gsap.quickSetter(dot, 'y', 'px');
  const ringX = gsap.quickSetter(ring, 'x', 'px');
  const ringY = gsap.quickSetter(ring, 'y', 'px');

  let visible = false;
  window.addEventListener('mousemove', (e) => {
    pos.x = e.clientX; pos.y = e.clientY;
    if (!visible) { visible = true; gsap.to(cursor, { opacity: 1, duration: 0.4 }); }
  }, { passive: true });
  gsap.set(cursor, { opacity: 0 });
  document.addEventListener('mouseleave', () => gsap.to(cursor, { opacity: 0, duration: 0.3 }));
  document.addEventListener('mouseenter', () => gsap.to(cursor, { opacity: 1, duration: 0.3 }));

  gsap.ticker.add(() => {
    dotX(pos.x); dotY(pos.y);
    ringPos.x += (pos.x - ringPos.x) * 0.16;
    ringPos.y += (pos.y - ringPos.y) * 0.16;
    ringX(ringPos.x); ringY(ringPos.y);
  });

  window.addEventListener('mousedown', () => cursor.classList.add('is-down'));
  window.addEventListener('mouseup', () => cursor.classList.remove('is-down'));

  // Hover states via delegation so dynamically-created nodes work too
  const LABELS = { drag: 'Drag', explore: 'Explore', view: 'View' };
  document.addEventListener('mouseover', (e) => {
    const labelled = e.target.closest('[data-cursor]');
    const link = e.target.closest('a, button, .area, [data-tilt]');
    cursor.classList.remove('has-label', 'is-link', 'is-minimal');
    if (labelled) {
      const mode = labelled.dataset.cursor;
      if (mode === 'hide') { cursor.classList.add('is-minimal'); return; }
      if (LABELS[mode]) { label.textContent = LABELS[mode]; cursor.classList.add('has-label'); return; }
    }
    if (link) cursor.classList.add('is-link');
  });
  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest?.('a, button, .area, [data-cursor], [data-tilt]')) {
      cursor.classList.remove('has-label', 'is-link', 'is-minimal');
    }
  });

  return {
    setDark: (dark) => cursor.classList.toggle('is-dark', dark),
  };
}

/* ─────────────────────────────────────────────
   Magnetic elements
   ───────────────────────────────────────────── */
export function initMagnetic() {
  if (isTouch) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = el.classList.contains('btn') || el.classList.contains('svc') ? 0.28 : 0.4;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength); yTo(dy * strength);
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.35)' });
    });
  });
}

/* ─────────────────────────────────────────────
   3D tilt cards
   ───────────────────────────────────────────── */
export function initTilt() {
  if (isTouch) return;
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.7, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.7, ease: 'power3.out' });
    gsap.set(el, { transformPerspective: 1000, transformStyle: 'preserve-3d' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx(-py * 10); ry(px * 12);
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { rotationX: 0, rotationY: 0, duration: 1, ease: 'elastic.out(1, 0.5)' });
    });
  });
}
