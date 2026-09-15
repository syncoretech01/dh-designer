import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { animate as mAnimate, inView, scroll as mScroll, stagger as mStagger } from 'motion';

gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });

const mm = gsap.matchMedia();
const DESKTOP = '(min-width: 901px)';
const MOBILE = '(max-width: 900px)';
const EXPO = [0.16, 1, 0.3, 1];

/* ═══════════════════════════════════════════
   TEXT SPLITTING
   ═══════════════════════════════════════════ */
let heroChars = [];
let contactSplits = [];

export function splitText() {
  // Hero: characters (lines are masked by .hero__line)
  document.querySelectorAll('.hero__title .split').forEach((el) => {
    const s = new SplitText(el, { type: 'chars,words', charsClass: 'char', wordsClass: 'word' });
    heroChars.push(...s.chars);
  });
  gsap.set(heroChars, { yPercent: 115, rotate: 4 });

  // Section titles: words, masked by lines
  document.querySelectorAll('.split[data-split="words"]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines,words', mask: 'lines', linesClass: 'line', wordsClass: 'word', autoSplit: true,
      onSplit(self) {
        return gsap.from(self.words, {
          yPercent: 110, rotate: 2.5, duration: 1.3, ease: 'expo.out', stagger: 0.04,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });

  // Contact: characters
  document.querySelectorAll('.contact__title .split').forEach((el) => {
    const s = new SplitText(el, { type: 'chars,words', charsClass: 'char', wordsClass: 'word' });
    contactSplits.push(...s.chars);
  });
  gsap.from(contactSplits, {
    yPercent: 115, rotate: 4, duration: 1.3, ease: 'expo.out', stagger: 0.02,
    scrollTrigger: { trigger: '.contact__title', start: 'top 85%', once: true },
  });
}

/* ═══════════════════════════════════════════
   HERO INTRO (after preloader)
   ═══════════════════════════════════════════ */
export function heroIntro(hero3d) {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to(heroChars, { yPercent: 0, rotate: 0, duration: 1.5, stagger: 0.022 }, 0)
    .to('.hero__top', { opacity: 1, duration: 1.2 }, 0.5)
    .to('.hero__lede', { opacity: 1, y: 0, duration: 1.2 }, 0.7)
    .from('.hero__actions .btn', { y: 26, opacity: 0, duration: 1.2, stagger: 0.1 }, 0.85)
    .to('.hero__scroll', { opacity: 1, duration: 1 }, 1.2);

  // Motion.dev handles the side service list
  mAnimate('.hero__services li', { opacity: 1, x: 0 }, { delay: mStagger(0.08, { startDelay: 1.1 }), duration: 1.1, ease: EXPO });

  // Pin the hero so the 3D massing explodes fully before the page moves on.
  // The copy drifts away over the first 55% of the pin; the 3D runs the whole distance.
  mm.add(DESKTOP, () => {
    const pinTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero', start: 'top top', end: () => '+=' + Math.round(innerHeight * 1.1), pin: true, scrub: 0.5, anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => hero3d?.setScroll(self.progress),
        onToggle: (self) => hero3d?.setRunning(self.isActive),
      },
    });
    pinTl
      .to('.hero__inner', { y: -120, opacity: 0, ease: 'none', duration: 0.55 }, 0)
      .to('.hero__grain', { opacity: 0, ease: 'none', duration: 1 }, 0);
  });
  // Phones: the hero can be taller than the viewport, so no pin — the massing explodes as the hero scrolls out.
  mm.add(MOBILE, () => {
    ScrollTrigger.create({
      trigger: '#hero', start: 'top top', end: 'bottom 20%', scrub: 0.5,
      onUpdate: (self) => hero3d?.setScroll(self.progress),
      onToggle: (self) => hero3d?.setRunning(self.isActive),
    });
  });
  return tl;
}

/* ═══════════════════════════════════════════
   GENERIC REVEALS
   ═══════════════════════════════════════════ */
function reveals() {
  const items = gsap.utils.toArray('[data-reveal]').filter((el) => !el.closest('.hero'));
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });

  gsap.from('.svc', { y: 70, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.services__grid', start: 'top 82%', once: true } });
  gsap.from('.quote', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '.testi__wrap', start: 'top 85%', once: true } });
  gsap.from('.area', { x: -40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.areas__list', start: 'top 85%', once: true } });
  gsap.from('.contact .form', { y: 60, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.contact .form', start: 'top 85%', once: true } });
}

/* ═══════════════════════════════════════════
   COUNTERS (Motion)
   ═══════════════════════════════════════════ */
function counters() {
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const target = parseInt(el.dataset.counter, 10);
    inView(el, () => {
      mAnimate(0, target, { duration: 2.2, ease: EXPO, onUpdate: (v) => { el.textContent = Math.round(v); } });
    }, { amount: 0.6 });
  });
}

/* ═══════════════════════════════════════════
   MARQUEE — velocity aware
   ═══════════════════════════════════════════ */
function marquee() {
  const track = document.getElementById('marquee-1');
  const tween = gsap.to(track, { xPercent: -50, ease: 'none', duration: 26, repeat: -1 });
  let target = 1;
  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = self.getVelocity() / 900;
      target = gsap.utils.clamp(-5, 5, (v < 0 ? -1 : 1) * (1 + Math.abs(v)));
    },
  });
  gsap.ticker.add(() => {
    tween.timeScale(gsap.utils.interpolate(tween.timeScale(), target, 0.08));
    target = gsap.utils.interpolate(target, 1, 0.04);
  });
}

/* ═══════════════════════════════════════════
   STUDIO — immersive zoom
   ═══════════════════════════════════════════ */
function studioZoom() {
  const frame = document.getElementById('zoom-frame');
  const coverScale = () => Math.max(innerWidth / frame.offsetWidth, innerHeight / frame.offsetHeight) * 1.04;
  const startY = () => (innerWidth > 900 ? innerHeight * 0.21 : innerHeight * 0.17);
  const startScale = () => (innerWidth > 900 ? 0.62 : innerWidth > 600 ? 0.8 : 0.95);
  gsap.set(frame, { y: startY(), scale: startScale() });
  gsap.set('.studio__title', { y: 70, opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.studio__pin', start: 'top top', end: '+=260%', pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
  });
  tl.to('#zoom-intro', { opacity: 0, y: -60, scale: 0.94, duration: 1, ease: 'power2.in' }, 0.2)
    .fromTo(frame, { y: startY, scale: startScale, borderRadius: 18 }, { y: 0, scale: coverScale, borderRadius: 0, duration: 2.4, ease: 'power2.inOut' }, 0.3)
    .fromTo('#zoom-img', { scale: 1.3 }, { scale: 1, duration: 2.4, ease: 'power2.inOut' }, 0.3)
    .to('.studio__overlay', { opacity: 1, duration: 1 }, 1.6)
    .to('#zoom-caption', { opacity: 1, duration: 0.5 }, 2.0)
    .to('.studio__title', { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 2.05)
    .to({}, { duration: 0.6 });
}

/* ═══════════════════════════════════════════
   PROCESS — horizontal parallax scroll
   ═══════════════════════════════════════════ */
function processHorizontal() {
  mm.add(DESKTOP, () => {
    const track = document.getElementById('process-track');
    const bar = document.getElementById('process-progress');
    const dist = () => track.scrollWidth - innerWidth;

    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '#process-pin', start: 'top top', end: () => '+=' + dist() * 1.05, pin: true, scrub: 1,
        invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => { bar.style.transform = `scaleX(${self.progress})`; },
      },
    });

    gsap.utils.toArray('#process-track [data-speed]').forEach((el) => {
      const sp = parseFloat(el.dataset.speed);
      gsap.fromTo(el, { x: (1 - sp) * -320 }, {
        x: (1 - sp) * 320, ease: 'none',
        scrollTrigger: { trigger: el, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
      });
    });
    gsap.utils.toArray('.process__fig img').forEach((img) => {
      gsap.fromTo(img, { scale: 1.2, xPercent: -5 }, {
        scale: 1.05, xPercent: 5, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
      });
      gsap.from(img.parentElement, { clipPath: 'inset(0 100% 0 0)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: 'left 85%', once: true } });
    });
    gsap.from('.process__end > *', { y: 50, opacity: 0, stagger: 0.12, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.process__panel--end', containerAnimation: tween, start: 'left 80%', once: true } });
  });

  mm.add(MOBILE, () => {
    gsap.utils.toArray('.process__panel').forEach((p) => {
      gsap.from(p, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 85%', once: true } });
      const img = p.querySelector('img');
      if (img) gsap.fromTo(img, { scale: 1.2, yPercent: -6 }, { scale: 1.05, yPercent: 6, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
}

/* ═══════════════════════════════════════════
   STORY — parallax storytelling
   ═══════════════════════════════════════════ */
function storyParallax() {
  const chapters = gsap.utils.toArray('.chapter');
  const dots = gsap.utils.toArray('.story__dots span');
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.story__pin', start: 'top top', end: '+=320%', pin: true, scrub: 1, anticipatePin: 1,
      onUpdate: (self) => {
        const i = Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length));
        dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
      },
    },
  });

  // Layers drift at different depths across the whole pin
  tl.fromTo('.story__layer--bg', { yPercent: 6, scale: 1.1 }, { yPercent: -6, scale: 1.0, ease: 'none', duration: 3 }, 0)
    .fromTo('.story__layer--mid', { y: 160, rotate: 2 }, { y: -260, rotate: -2, ease: 'none', duration: 3 }, 0)
    .fromTo('.story__layer--fg', { y: 260 }, { y: -420, ease: 'none', duration: 3 }, 0);

  chapters.forEach((ch, i) => {
    const at = i;
    tl.fromTo(ch, { opacity: 0, y: 70, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }, at + 0.05);
    if (i < chapters.length - 1) tl.to(ch, { opacity: 0, y: -70, scale: 1.02, duration: 0.3, ease: 'power3.in' }, at + 0.72);
  });
}

/* ═══════════════════════════════════════════
   WHY — layer transformation stack
   ═══════════════════════════════════════════ */
function whyStack() {
  const cards = gsap.utils.toArray('.card-l');
  cards.forEach((card, i) => {
    gsap.from(card, { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 90%', once: true } });
    if (i === cards.length - 1) return;
    gsap.to(card, {
      scale: 0.9 + i * 0.015, y: -12, filter: 'brightness(0.86)', ease: 'none',
      scrollTrigger: { trigger: cards[i + 1], start: 'top 95%', end: 'top 30%', scrub: true },
    });
  });
}

/* ═══════════════════════════════════════════
   GALLERY — vertical columns slider
   ═══════════════════════════════════════════ */
function galleryColumns() {
  gsap.utils.toArray('.gallery__col').forEach((col) => {
    const dir = parseFloat(col.dataset.dir);
    gsap.fromTo(col, { yPercent: dir < 0 ? 0 : -34 }, {
      yPercent: dir < 0 ? -34 : 0, ease: 'none',
      scrollTrigger: { trigger: '#gallery-cols', start: 'top bottom', end: 'bottom top', scrub: 1.2 },
    });
  });
}

/* ═══════════════════════════════════════════
   AREAS — hover reveal image
   ═══════════════════════════════════════════ */
function areasHover() {
  const list = document.getElementById('areas-list');
  const float = document.getElementById('areas-float');
  const img = float.querySelector('img');
  const container = list.parentElement;
  const xTo = gsap.quickTo(float, 'x', { duration: 0.7, ease: 'power3.out' });
  const yTo = gsap.quickTo(float, 'y', { duration: 0.7, ease: 'power3.out' });
  const rTo = gsap.quickTo(float, 'rotate', { duration: 0.9, ease: 'power3.out' });
  let lastX = 0;

  container.addEventListener('mousemove', (e) => {
    const r = container.getBoundingClientRect();
    const x = e.clientX - r.left - float.offsetWidth / 2;
    const y = e.clientY - r.top - float.offsetHeight / 2;
    rTo(gsap.utils.clamp(-10, 10, (e.clientX - lastX) * 0.4));
    lastX = e.clientX;
    xTo(x); yTo(y);
  });
  list.querySelectorAll('.area').forEach((li) => {
    li.addEventListener('mouseenter', () => {
      img.src = li.dataset.img;
      gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1, ease: 'expo.out' });
      gsap.to(float, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
      // Motion micro-interaction on the meta text
      mAnimate(li.querySelector('.area__meta'), { x: [10, 0], opacity: [0.4, 1] }, { duration: 0.6, ease: EXPO });
    });
  });
  list.addEventListener('mouseleave', () => gsap.to(float, { opacity: 0, scale: 0.8, duration: 0.5, ease: 'power3.out', overwrite: 'auto' }));
}

/* ═══════════════════════════════════════════
   TESTIMONIALS — draggable columns slider
   ═══════════════════════════════════════════ */
function testimonials() {
  const track = document.getElementById('testi-track');
  const wrap = track.parentElement;
  const bounds = () => ({ minX: -(track.scrollWidth - wrap.clientWidth + parseFloat(getComputedStyle(wrap).paddingLeft) * 2), maxX: 0 });
  const [drag] = Draggable.create(track, {
    type: 'x', bounds: bounds(), inertia: true, edgeResistance: 0.85, dragResistance: 0.1, cursor: 'grab', activeCursor: 'grabbing',
  });
  window.addEventListener('resize', () => drag.applyBounds(bounds()));
}

/* ═══════════════════════════════════════════
   MISC PARALLAX + FOOTER + PROGRESS
   ═══════════════════════════════════════════ */
function misc(cursor) {
  gsap.to('.contact__bg', { yPercent: 25, ease: 'none', scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('#footer-big span', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'top 30%', scrub: 1 } });
  gsap.from('.footer__col', { y: 40, opacity: 0, stagger: 0.08, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.footer__grid', start: 'top 90%', once: true } });

  // Progress bar via Motion's scroll()
  const bar = document.querySelector('#progress span');
  mScroll((p) => { bar.style.transform = `scaleY(${p})`; });

  // Cursor theme on dark sections
  if (cursor) {
    ['#work', '#story', '#contact'].forEach((sel) => {
      ScrollTrigger.create({ trigger: sel, start: 'top 50%', end: 'bottom 50%', onToggle: (self) => cursor.setDark(self.isActive) });
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
}

/* ═══════════════════════════════════════════
   FORM
   ═══════════════════════════════════════════ */
function form() {
  const f = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    f.querySelectorAll('[required]').forEach((input) => {
      const ok = input.value.trim().length > 1 && (input.type !== 'email' || /.+@.+\..+/.test(input.value));
      input.closest('.field').classList.toggle('is-invalid', !ok);
      if (!ok) { valid = false; mAnimate(input.closest('.field'), { x: [0, -6, 6, -4, 4, 0] }, { duration: 0.45 }); }
    });
    if (!valid) return;
    f.classList.add('is-sent');
    mAnimate(success, { opacity: [0, 1], scale: [0.96, 1] }, { duration: 0.8, ease: EXPO });
    mAnimate(success.children, { y: [16, 0], opacity: [0, 1] }, { delay: mStagger(0.1, { startDelay: 0.2 }), duration: 0.8, ease: EXPO });
  });
}

/* ═══════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════ */
export function initScrollAnimations(cursor) {
  reveals();
  counters();
  marquee();
  studioZoom();
  processHorizontal();
  storyParallax();
  whyStack();
  galleryColumns();
  areasHover();
  testimonials();
  misc(cursor);
  form();
  ScrollTrigger.refresh();
}
