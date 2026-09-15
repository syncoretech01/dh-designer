# DH Designer — Website

Interior design, home staging & property setup · Colorado Springs, CO · 720-244-4110

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # serves the production build
```

## Stack

- **Vite** — dev server & bundler
- **Three.js** — hero architectural massing (assembles on load, explodes on scroll, follows the pointer)
- **GSAP** + ScrollTrigger / SplitText / Draggable / Inertia / Observer — scroll choreography, text reveals, 3D slider, draggable testimonials
- **Lenis** — smooth scrolling
- **Motion** — counters, scroll progress, form & micro-interactions
- **Anime.js** — preloader sequence and menu staggers

## Structure

```
index.html            all markup
src/css/base.css      design tokens, reset, typography, cursor, preloader, header, menu
src/css/components.css buttons, service cards, 3D slider, stack cards, quotes, form
src/css/sections.css  hero, studio zoom, process, work, story, why, gallery, areas, testimonials, contact, footer
src/js/main.js        boot sequence
src/js/smooth.js      Lenis + ScrollTrigger sync, anchor scrolling
src/js/cursor.js      custom cursor, magnetic elements, 3D tilt
src/js/preloader.js   Anime.js intro
src/js/hero3d.js      Three.js scene
src/js/nav.js         header + fullscreen menu
src/js/slider3d.js    coverflow slider
src/js/animations.js  all scroll-driven sections
```
