import gsap from 'gsap';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer);

/* ─────────────────────────────────────────────
   3D coverflow slider — infinite, draggable, auto
   ───────────────────────────────────────────── */
export function initSlider3D() {
  const root = document.getElementById('slider3d');
  if (!root) return;
  const slides = [...root.querySelectorAll('.slide')];
  const n = slides.length;
  const titleEl = document.getElementById('slide-title');
  const catEl = document.getElementById('slide-cat');
  const curEl = document.getElementById('slide-cur');
  document.getElementById('slide-total').textContent = String(n).padStart(2, '0');

  const state = { pos: 0 }; // continuous index
  let activeIndex = 0;
  let autoTimer = null;
  let dragging = false;

  const layout = () => {
    const w = slides[0].offsetWidth;
    const spacing = Math.min(w * 0.72, innerWidth * 0.3);
    slides.forEach((s, i) => {
      let off = (i - state.pos) % n;
      if (off > n / 2) off -= n;
      if (off < -n / 2) off += n;
      const abs = Math.abs(off);
      const x = off * spacing;
      const z = -abs * 260;
      const ry = gsap.utils.clamp(-45, 45, -off * 32);
      const scale = Math.max(0.6, 1 - abs * 0.09);
      const opacity = abs > 2.6 ? 0 : 1 - Math.max(0, abs - 1.6) * 0.8;
      s.style.transform = `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${ry}deg) scale(${scale})`;
      s.style.opacity = opacity;
      s.style.zIndex = String(100 - Math.round(abs * 10));
      s.classList.toggle('is-active', abs < 0.5);
    });
  };

  const setCaption = (i) => {
    const s = slides[i];
    gsap.timeline()
      .to([titleEl, catEl], { yPercent: 40, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.04 })
      .add(() => { titleEl.textContent = s.dataset.title; catEl.textContent = s.dataset.cat; curEl.textContent = String(i + 1).padStart(2, '0'); })
      .fromTo([titleEl, catEl], { yPercent: -40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.06 });
  };

  const goTo = (target, dur = 1.2) => {
    gsap.to(state, { pos: target, duration: dur, ease: 'expo.out', onUpdate: layout, overwrite: true });
    const idx = ((Math.round(target) % n) + n) % n;
    if (idx !== activeIndex) { activeIndex = idx; setCaption(idx); }
  };
  const next = () => goTo(Math.round(state.pos) + 1);
  const prev = () => goTo(Math.round(state.pos) - 1);

  const startAuto = () => { stopAuto(); autoTimer = setInterval(next, 5200); };
  const stopAuto = () => { if (autoTimer) clearInterval(autoTimer); autoTimer = null; };

  document.getElementById('slider-next').addEventListener('click', () => { next(); startAuto(); });
  document.getElementById('slider-prev').addEventListener('click', () => { prev(); startAuto(); });

  // Drag
  let startPos = 0;
  Observer.create({
    target: root,
    type: 'pointer,touch',
    dragMinimum: 3,
    onPress: () => { stopAuto(); startPos = state.pos; gsap.killTweensOf(state); },
    onDrag: (self) => {
      dragging = true;
      state.pos = startPos - (self.x - self.startX) / (slides[0].offsetWidth * 0.85);
      layout();
    },
    onDragEnd: (self) => {
      const velocity = -self.velocityX / 2500;
      goTo(Math.round(state.pos + velocity));
      setTimeout(() => { dragging = false; }, 50);
      startAuto();
    },
    onRelease: () => { if (!dragging) startAuto(); },
  });

  // Click a side slide to focus it
  slides.forEach((s, i) => s.addEventListener('click', () => {
    if (dragging) return;
    let off = (i - state.pos) % n;
    if (off > n / 2) off -= n;
    if (off < -n / 2) off += n;
    if (Math.abs(off) > 0.5) { goTo(Math.round(state.pos + off)); startAuto(); }
  }));

  window.addEventListener('resize', layout);
  layout();
  startAuto();

  // Pause when off screen
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? startAuto() : stopAuto()), { threshold: 0.2 });
  io.observe(root);
}
