import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';

/* ─────────────────────────────────────────────
   Hero 3D — an abstract architectural massing.
   Assembles from an exploded state on load, drifts
   with the pointer, and explodes again on scroll.
   ───────────────────────────────────────────── */
const PALETTE = {
  ivory: 0xf1ebe0,
  sand: 0xdccdb3,
  clay: 0xb8674a,
  brass: 0xc9a86a,
  ink: 0x1f1a17,
  glass: 0xf8f4ee,
};

// [w, h, d], [x, y, z], color, rounded?
const VOLUMES = [
  [[5.4, 0.22, 3.4], [0, -2.1, 0], 'sand'],
  [[3.2, 1.6, 2.6], [-0.7, -1.2, 0], 'ivory'],
  [[2.3, 1.3, 2.2], [1.5, -1.35, 0.35], 'clay'],
  [[3.7, 1.25, 2.4], [0.25, 0.25, -0.25], 'ivory'],
  [[4.4, 0.12, 2.9], [0.4, 0.98, -0.1], 'brass'],
  [[2.1, 0.95, 1.8], [-1.55, 1.55, 0.45], 'ink'],
  [[1.45, 1.15, 1.45], [1.25, 1.65, 0.05], 'sand'],
  [[0.34, 3.6, 0.34], [-2.45, -0.4, 1.0], 'ink'],
  [[0.9, 0.05, 1.2], [1.6, -0.6, 1.55], 'brass'],
  [[1.7, 0.45, 0.35], [0.9, -1.6, 1.55], 'glass'],
  [[0.6, 0.6, 0.6], [2.75, -1.75, -0.6], 'ivory'],
  [[0.12, 1.2, 1.9], [2.68, -0.95, 0.3], 'brass'],
  [[2.6, 0.05, 0.05], [0.2, 2.25, 0.5], 'brass'],
];

// Small "furniture" satellites
const SATELLITES = [
  [0.32, [-3.4, 1.6, -1.2], 'clay', 'sphere'],
  [0.26, [3.6, 2.1, 0.8], 'brass', 'box'],
  [0.4, [3.4, -0.2, 2.2], 'ivory', 'box'],
  [0.2, [-3.2, -1.9, 2.4], 'ink', 'sphere'],
  [0.3, [-2.6, 2.6, 1.6], 'sand', 'box'],
  [0.18, [2.2, 3.0, -1.4], 'clay', 'sphere'],
  [0.24, [-0.6, 3.1, 1.9], 'brass', 'sphere'],
];

export function initHero3D(canvas) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 1.2, 16);
  camera.lookAt(0, 0, 0);

  // Lights
  scene.add(new THREE.HemisphereLight(0xfff7ec, 0xd8c8ae, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(6, 9, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(innerWidth < 900 ? 1024 : 2048, innerWidth < 900 ? 1024 : 2048);
  key.shadow.camera.left = key.shadow.camera.bottom = -9;
  key.shadow.camera.right = key.shadow.camera.top = 9;
  key.shadow.camera.near = 1; key.shadow.camera.far = 40;
  key.shadow.bias = -0.0005; key.shadow.radius = 6;
  scene.add(key);
  const warm = new THREE.PointLight(0xb8674a, 18, 24, 2);
  warm.position.set(-5, -1, 5);
  scene.add(warm);
  const cool = new THREE.PointLight(0xdfe7ea, 10, 24, 2);
  cool.position.set(4, 4, -6);
  scene.add(cool);

  // Floor for shadows only
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.25;
  floor.receiveShadow = true;
  scene.add(floor);

  // Group
  const group = new THREE.Group();
  scene.add(group);

  const materials = {};
  const mat = (name) => {
    if (materials[name]) return materials[name];
    const m = new THREE.MeshPhysicalMaterial({
      color: PALETTE[name],
      roughness: name === 'brass' ? 0.28 : name === 'glass' ? 0.1 : 0.62,
      metalness: name === 'brass' ? 0.85 : 0,
      clearcoat: name === 'glass' ? 1 : 0.15,
      clearcoatRoughness: 0.3,
      transmission: name === 'glass' ? 0.6 : 0,
      thickness: name === 'glass' ? 0.5 : 0,
      envMapIntensity: name === 'brass' ? 1.4 : 0.55,
    });
    materials[name] = m;
    return m;
  };
  const edgeMat = new THREE.LineBasicMaterial({ color: PALETTE.ink, transparent: true, opacity: 0.18 });

  const pieces = [];
  const center = new THREE.Vector3(0, 0, 0);
  const rand = (a, b) => a + Math.random() * (b - a);

  const addPiece = (mesh, basePos, isSatellite = false) => {
    mesh.position.copy(basePos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    const dir = basePos.clone().sub(center);
    if (dir.length() < 0.001) dir.set(0, 1, 0);
    dir.normalize();
    const explodeDist = isSatellite ? rand(2.2, 3.6) : rand(2.8, 5);
    const explode = basePos.clone().add(dir.multiplyScalar(explodeDist)).add(new THREE.Vector3(rand(-1.2, 1.2), rand(-0.8, 1.6), rand(-1.5, 1.5)));
    const rot = new THREE.Vector3(rand(-1.4, 1.4), rand(-1.6, 1.6), rand(-0.8, 0.8));
    pieces.push({ mesh, base: basePos.clone(), explode, rot, spin: rand(-1, 1), phase: Math.random() * Math.PI * 2, bob: isSatellite ? rand(0.12, 0.28) : rand(0.02, 0.06) });
  };

  VOLUMES.forEach(([size, pos, color]) => {
    const geo = new THREE.BoxGeometry(...size);
    const mesh = new THREE.Mesh(geo, mat(color));
    if (color !== 'glass') {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
      mesh.add(edges);
    }
    addPiece(mesh, new THREE.Vector3(...pos));
  });

  SATELLITES.forEach(([size, pos, color, kind]) => {
    const geo = kind === 'sphere' ? new THREE.SphereGeometry(size, 32, 32) : new THREE.BoxGeometry(size, size, size);
    const mesh = new THREE.Mesh(geo, mat(color));
    addPiece(mesh, new THREE.Vector3(...pos), true);
  });

  // Dust particles
  const pCount = 260;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = rand(-9, 9); pPos[i * 3 + 1] = rand(-4, 6); pPos[i * 3 + 2] = rand(-6, 4);
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: PALETTE.clay, size: 0.035, transparent: true, opacity: 0.5, sizeAttenuation: true }));
  scene.add(particles);

  // State
  const state = { intro: 1, introRot: -1.9, scroll: 0, flush: false, mouseX: 0, mouseY: 0, tx: 0, ty: 0, running: true };

  const resize = () => {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const wide = w / h > 1.05;
    const vw = Math.tan((camera.fov / 2) * Math.PI / 180) * camera.position.z * 2 * camera.aspect; // visible width at z=0
    group.position.x = wide ? vw * 0.24 : 0;
    group.position.y = wide ? -0.35 : 1.55;
    const s = wide ? gsap.utils.clamp(0.55, 0.8, vw / 22) : gsap.utils.clamp(0.3, 0.42, w / 1000);
    group.scale.setScalar(s);
    floor.position.x = group.position.x;
    floor.position.y = -2.25 * s + group.position.y;
  };
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    state.mouseX = (e.clientX / innerWidth) * 2 - 1;
    state.mouseY = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  const tmp = new THREE.Vector3();
  const clock = new THREE.Clock();
  const ease = (t) => 1 - Math.pow(1 - t, 2);

  const render = () => {
    if (!state.running && state.intro === 0 && !state.flush) return;
    state.flush = false;
    const t = clock.getElapsedTime();
    // Fully exploded exactly when the pinned hero scroll completes
    const f = Math.min(1, state.intro + ease(state.scroll));

    pieces.forEach((p) => {
      tmp.copy(p.base).lerp(p.explode, f);
      tmp.y += Math.sin(t * 0.9 + p.phase) * (p.bob + f * 0.22);
      tmp.x += Math.cos(t * 0.6 + p.phase) * f * 0.14;
      p.mesh.position.copy(tmp);
      p.mesh.rotation.set(p.rot.x * f + t * 0.08 * p.spin * f, p.rot.y * f + (p.bob > 0.1 ? t * 0.25 : 0) + t * 0.12 * p.spin * f, p.rot.z * f);
      // Pieces shrink as they disperse so the end state reads as drifting away, not looming
      const sc = 1 - 0.32 * f;
      p.mesh.scale.setScalar(sc);
    });

    state.tx += ((state.mouseX * 0.35) - state.tx) * 0.04;
    state.ty += ((state.mouseY * 0.18) - state.ty) * 0.04;
    group.rotation.y = -0.55 + state.introRot + state.tx + Math.sin(t * 0.25) * 0.06 + state.scroll * 1.4;
    group.rotation.x = 0.12 + state.ty;
    group.position.z = -state.scroll * 3;

    particles.rotation.y = t * 0.02;
    particles.position.y = Math.sin(t * 0.3) * 0.2 - state.scroll * 2;

    renderer.render(scene, camera);
  };

  gsap.ticker.add(render);

  return {
    assemble() {
      if (prefersReduced) { state.intro = 0; state.introRot = 0; return; }
      gsap.to(state, { intro: 0, duration: 2.6, ease: 'expo.out' });
      gsap.to(state, { introRot: 0, duration: 3, ease: 'expo.out' });
    },
    setScroll(p) { state.scroll = p; },
    setRunning(v) { state.running = v; if (!v) state.flush = true; }, // always paint the final state before pausing
  };
}
