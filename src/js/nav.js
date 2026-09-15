import gsap from 'gsap';
import { animate, stagger } from 'animejs';
import { lenis } from './smooth.js';

/* ─────────────────────────────────────────────
   Header + fullscreen menu
   ───────────────────────────────────────────── */
export function initNav() {
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const bg = menu.querySelector('.menu__bg');
  const links = menu.querySelectorAll('.menu__link span');
  const eyebrows = menu.querySelectorAll('.menu__eyebrow');
  const blocks = menu.querySelectorAll('.menu__block');
  const image = menu.querySelector('.menu__image');
  let open = false;
  let busy = false;

  // Scrolled state
  lenis.on('scroll', ({ scroll }) => {
    header.classList.toggle('is-scrolled', scroll > 80);
  });

  const openMenu = () => {
    if (busy) return; busy = true; open = true;
    menu.classList.add('is-open');
    burger.classList.add('is-active');
    burger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    lenis.stop();

    gsap.to(bg, { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'expo.inOut' });
    animate(links, { translateY: ['110%', '0%'], duration: 1100, delay: stagger(70, { start: 350 }), ease: 'outExpo' });
    animate(eyebrows, { opacity: [0, 1], translateY: [10, 0], duration: 700, delay: stagger(80, { start: 500 }), ease: 'outCubic' });
    animate(blocks, { opacity: [0, 1], translateY: [24, 0], duration: 900, delay: stagger(90, { start: 650 }), ease: 'outExpo' });
    animate(image, { opacity: [0, 1], scale: [0.94, 1], duration: 1100, delay: 800, ease: 'outExpo', onComplete: () => { busy = false; } });
  };

  const closeMenu = () => {
    if (busy || !open) return; busy = true; open = false;
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    animate(links, { translateY: ['0%', '-110%'], duration: 600, delay: stagger(40), ease: 'inExpo' });
    animate([...eyebrows, ...blocks, image], { opacity: 0, duration: 350, ease: 'outQuad' });
    gsap.to(bg, {
      clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut', delay: 0.25,
      onComplete: () => {
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        links.forEach((l) => (l.style.transform = 'translateY(110%)'));
        lenis.start();
        busy = false;
      },
    });
  };

  burger.addEventListener('click', () => (open ? closeMenu() : openMenu()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) closeMenu(); });

  return {
    show: () => gsap.to(header, { y: 0, duration: 1.4, ease: 'expo.out', delay: 0.3 }),
    close: () => { if (open) setTimeout(closeMenu, 60); },
    isOpen: () => open,
  };
}
