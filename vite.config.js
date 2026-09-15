import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'gsap/Draggable', 'gsap/InertiaPlugin', 'gsap/Observer'],
          motion: ['motion', 'animejs', 'lenis'],
        },
      },
    },
  },
});
