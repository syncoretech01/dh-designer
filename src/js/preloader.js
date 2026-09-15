import { animate, createTimeline, stagger, svg, utils } from 'animejs';
import gsap from 'gsap';

/* ─────────────────────────────────────────────
   Preloader — anime.js drives the intro sequence,
   GSAP handles the curtain exit. Resolves when done.
   ───────────────────────────────────────────── */
export function runPreloader() {
  return new Promise((resolve) => {
    const root = document.getElementById('preloader');
    const countEl = document.getElementById('pl-count');
    const bar = document.getElementById('pl-bar');
    const words = root.querySelectorAll('.preloader__word');
    const counter = { n: 0 };

    // Logo line-draw
    const drawables = svg.createDrawable('.pl-path');
    animate(drawables, {
      draw: ['0 0', '0 1'],
      ease: 'inOutCubic',
      duration: 1600,
      delay: stagger(180),
    });

    // Counter 0 → 100
    animate(counter, {
      n: 100,
      modifier: utils.round(0),
      duration: 2400,
      ease: 'inOutQuart',
      onUpdate: () => { countEl.textContent = String(Math.round(counter.n)).padStart(2, '0'); },
    });

    // Progress bar
    animate(bar, { scaleX: [0, 1], duration: 2400, ease: 'inOutQuart' });

    // Rotating words
    const tl = createTimeline({ defaults: { ease: 'outExpo', duration: 700 } });
    words.forEach((w, i) => {
      const at = i * 720;
      tl.add(w, { translateY: ['110%', '0%'], translateX: '-50%', opacity: [0, 1] }, at);
      if (i < words.length - 1) tl.add(w, { translateY: ['0%', '-110%'], translateX: '-50%', opacity: [1, 0], ease: 'inExpo', duration: 500 }, at + 620);
    });

    // Exit
    const exit = gsap.timeline({ delay: 2.75, onComplete: () => { root.remove(); resolve(); } });
    exit
      .to(root.querySelector('.preloader__inner'), { yPercent: -12, opacity: 0, duration: 0.7, ease: 'power3.in' })
      .to('.preloader__panel--l', { xPercent: -100, duration: 1.2, ease: 'expo.inOut' }, '-=0.15')
      .to('.preloader__panel--r', { xPercent: 100, duration: 1.2, ease: 'expo.inOut' }, '<')
      .add(() => resolve(), '-=0.75'); // start the hero intro while panels are still opening
  });
}
