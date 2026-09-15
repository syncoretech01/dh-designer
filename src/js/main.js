import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lenis, bindAnchors } from './smooth.js';
import { initCursor, initMagnetic, initTilt } from './cursor.js';
import { runPreloader } from './preloader.js';
import { initHero3D } from './hero3d.js';
import { initNav } from './nav.js';
import { initSlider3D } from './slider3d.js';
import { splitText, heroIntro, initScrollAnimations } from './animations.js';

gsap.registerPlugin(ScrollTrigger);

document.body.classList.add('is-loading');
window.scrollTo(0, 0);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const cursor = initCursor();
const nav = initNav();
lenis.stop();

// Three.js warms up behind the preloader so the first frame is ready
const hero3d = initHero3D(document.getElementById('hero-canvas'));

async function boot() {
  await Promise.all([document.fonts.ready, runPreloader()]);

  document.body.classList.remove('is-loading');
  lenis.start();

  splitText();
  hero3d.assemble();
  heroIntro(hero3d);
  nav.show();

  initMagnetic();
  initTilt();
  initSlider3D();
  initScrollAnimations(cursor);
  bindAnchors(() => nav.close());

  window.addEventListener('load', () => ScrollTrigger.refresh());
  setTimeout(() => ScrollTrigger.refresh(), 1200);
}

boot();
