import { startClock } from './clock.js';
import { cloneDefaults, OVERLAY } from './config.js';
import { meta, PRELOADER_TILES, SLIDES } from './data.js';
import { EASE_HIDE, EASE_SHOW, EASE_ZOOM, Gallery, SPHERE } from './gallery.js';
import { bezier } from './ease.js';
import { Renderer } from './gl.js';
import { loadBytes, maskUI, Preloader, revealUI, shouldPreload } from './preloader.js';
import { SlideScroll } from './scroll.js';
import { Ruler } from './ruler.js';
import { playOnClicks, SwitchSound } from './sound.js';
import { Stepper } from './stepper.js';
import { ScrubText, splitChars } from './text.js';
import { CURSOR, OPEN, Work } from './work.js';
import { knockoutPills } from './knockout.js';
import { prefetchPage } from './prefetch.js';
import { SEGMENTS as OPEN_SEGMENTS } from './project-open.js';
import { isMobile } from './mobile.js';

const { gsap } = window;
const COUNT = SLIDES.length;
const mod = (n) => ((n % COUNT) + COUNT) % COUNT;

const params = cloneDefaults();
const MEDIA_WAIT = 3000;

document.querySelectorAll('[data-stub]').forEach((el) => {
  el.addEventListener('click', (e) => e.preventDefault());
});

knockoutPills([...document.querySelectorAll('.menu .pill')]);

const preload = shouldPreload();
const loadRoot = document.querySelector('[data-load]');
const uiInners = preload ? maskUI([...document.querySelectorAll('[data-ui], [data-stepper]')]) : [];
if (!preload) loadRoot.remove();

const clockEl = document.querySelector('[data-clock]');
startClock(clockEl.querySelector('.ui-in') || clockEl);

const textsRoot = document.querySelector('[data-texts]');

function line(className, text) {
  const outer = document.createElement('span');
  outer.className = `line ${className}`;
  const mid = document.createElement('span');
  mid.className = 'line-mid';
  outer.appendChild(mid);
  if (text === null) return { outer, mid };
  const inner = document.createElement('span');
  inner.className = 'line-inner';
  inner.textContent = text;
  mid.appendChild(inner);
  return { outer, mid, inner };
}

function block(tag, className, top) {
  const el = document.createElement(tag);
  el.className = `blend ${className}`;
  el.style.setProperty('--y', top);
  textsRoot.appendChild(el);
  return el;
}

function buildTexts() {
  return SLIDES.map((slide, index) => {
    const text = new ScrubText(index, COUNT);
    text.titleMids = [];
    text.lineMids = [];

    const title = block('h2', 'slide-title', slide.layout.title);
    slide.title.forEach((value) => {
      const { outer, mid } = line('title-line', null);
      title.appendChild(outer);
      text.addTitleLine(splitChars(mid, value, 'PP Neue Montreal'));
      text.titleMids.push(mid);
    });

    const l = line('', meta(slide));
    block('p', 'slide-meta', slide.layout.meta).appendChild(l.outer);
    text.addLine(l.inner);
    text.lineMids.push(l.mid);

    return text;
  });
}

const INTRO = { from: 140, duration: 1.5, ease: 'expo.out' };
function introReveal(text, titleDelay = 0.1) {
  const { from, duration, ease } = INTRO;
  gsap.fromTo(text.lineMids, { yPercent: from }, { yPercent: 0, duration, ease, stagger: 0.05 });
  gsap.fromTo(text.titleMids, { yPercent: from }, { yPercent: 0, duration, ease, stagger: 0.04, delay: titleDelay });
}

function hideTexts(text, onComplete) {
  gsap.to([...text.lineMids, ...text.titleMids], { yPercent: -110, duration: 0.7, ease: EASE_HIDE, overwrite: true, onComplete });
}

function showTexts(text) {
  gsap.fromTo(text.lineMids, { yPercent: 110 }, { yPercent: 0, duration: 1.4, ease: EASE_SHOW, stagger: 0.05, delay: 0.8, overwrite: true });
  gsap.fromTo(
    text.titleMids,
    { yPercent: 110 },
    { yPercent: 0, duration: 1.4, ease: EASE_SHOW, stagger: 0.04, delay: 0.8, overwrite: true },
  );
}

function loadMedia(slide, src = slide.media.src) {
  const { media } = slide;
  const item = { width: media.width, height: media.height, zoom: slide.zoom, uploaded: false, isVideo: media.type === 'video' };

  if (item.isVideo) {
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    video.src = src;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    item.el = video;
    video.addEventListener('loadeddata', () => (item.still = stillFrame(video)), { once: true });
    item.ready = new Promise((resolve) => {
      if (video.readyState >= 2) resolve();
      else video.addEventListener('loadeddata', resolve, { once: true });
    });
  } else {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    item.el = img;
    item.ready = img.decode().catch(() => {});
  }
  return item;
}

function loadTile(src) {
  const item = { width: 1440, height: 900, zoom: 1, uploaded: false, isVideo: false };
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  item.el = img;
  item.ready = img.decode().catch(() => {});
  return item;
}

function stillFrame(video) {
  const k = Math.min(1, 1280 / video.videoWidth);
  const c = document.createElement('canvas');
  c.width = Math.round(video.videoWidth * k);
  c.height = Math.round(video.videoHeight * k);
  c.getContext('2d').drawImage(video, 0, 0, c.width, c.height);
  return c;
}

function play(item) {
  if (!item.isVideo) return;
  const p = item.el.play();
  if (p && p.catch) p.catch(() => {});
}

function pauseAndRewind(item) {
  if (!item.isVideo) return;
  item.el.pause();
  try {
    item.el.currentTime = 0;
  } catch {}
}

class Transition {
  constructor(media) {
    this.media = media;
    this.from = 0;
    this.to = null;
    this.progress = 0;
    this.active = new Set([0]);
  }

  playOnly(index) {
    this.active = new Set([index]);
    this.media.forEach((m, i) => (i === index ? play(m) : pauseAndRewind(m)));
  }

  update(position) {
    const base = Math.floor(position);
    this.from = mod(base);
    this.progress = position - base;
    this.to = this.progress > 0 ? mod(base + 1) : null;

    const active = new Set([this.from]);
    if (this.to !== null) active.add(this.to);
    active.forEach((i) => {
      if (this.active.has(i)) return;
      const m = this.media[i];
      if (m.isVideo) {
        try {
          m.el.currentTime = 0;
        } catch {}
      }
      play(m);
    });
    this.active.forEach((i) => !active.has(i) && pauseAndRewind(this.media[i]));
    this.active = active;
  }

  get output() {
    const from = this.media[this.from];
    const next = this.to !== null ? this.media[this.to] : from;
    const to = next.uploaded ? next : from;
    return { from, to, progress: this.progress };
  }
}

function initCursor() {
  const el = document.querySelector('[data-cursor]');
  const x = gsap.quickTo(el, 'x', { duration: CURSOR.duration, ease: CURSOR.ease });
  const y = gsap.quickTo(el, 'y', { duration: CURSOR.duration, ease: CURSOR.ease });
  const scaleX = gsap.quickTo(el, 'scaleX', { duration: 0.4, ease: 'power3' });
  const scaleY = gsap.quickTo(el, 'scaleY', { duration: 0.4, ease: 'power3' });
  const scale = (v) => (scaleX(v), scaleY(v));
  gsap.set(el, { scaleX: 0, scaleY: 0, xPercent: -50, yPercent: -50 });

  const cursor = { enabled: true, hover: false };
  let placed = false;
  let overUi = false;
  window.addEventListener('mousemove', (e) => {
    const offset = el.classList.contains('cursor--pill') ? CURSOR.offset : 0;
    const px = e.clientX + offset;
    const py = e.clientY + offset;
    if (placed) {
      x(px);
      y(py);
    } else {
      placed = true;
      gsap.set(el, { x: px, y: py });
    }
    overUi = Boolean(e.target.closest('[data-ui]'));
    scale(overUi || !(cursor.enabled || cursor.hover) ? 0 : 1);
  });
  document.documentElement.addEventListener('mouseleave', () => scale(0));
  cursor.setEnabled = (on) => {
    cursor.enabled = on;
    if (!on && !cursor.hover) scale(0);
  };
  cursor.setPill = (on) => {
    el.classList.toggle('cursor--pill', on);
    gsap.set(el, { xPercent: on ? 0 : -50, yPercent: on ? 0 : -50 });
  };
  cursor.setHover = (on) => {
    cursor.hover = on;
    if (placed) scale((on || cursor.enabled) && !overUi ? 1 : 0);
  };
  return cursor;
}

function maskOf(el) {
  let inner = el.querySelector(':scope > .ui-in');
  if (!inner) {
    inner = document.createElement('span');
    inner.className = 'ui-in';
    while (el.firstChild) inner.appendChild(el.firstChild);
    el.appendChild(inner);
  }
  el.classList.add('ui-mask');
  return inner;
}

async function boot() {
  const canvas = document.querySelector('[data-gl]');
  const renderer = new Renderer(canvas, { overlay: OVERLAY });
  renderer.setParams(params.transition);

  let preloader = null;
  const orbitModule = isMobile() ? null : import('./orbit.js');
  if (preload && orbitModule) orbitModule.then((module) => module.buildLogo()).catch(() => {});
  let srcs = SLIDES.map((s) => s.media.src);
  const workPages = SLIDES.filter((s) => s.work).map((s) => s.work);
  let tiles = [];
  if (preload) {
    preloader = new Preloader({ root: loadRoot, renderer, media: null, overlay: OVERLAY });
    const loaded = await loadBytes([...srcs, ...(isMobile() ? [] : PRELOADER_TILES)],(p) => preloader.setProgress(p));
    srcs = loaded.slice(0, srcs.length);
    tiles = loaded.slice(srcs.length).map(loadTile);
  }
  const media = SLIDES.map((s, i) => loadMedia(s, srcs[i]));
  const displacement = new Image();
  displacement.src = 'assets/textures/distortion-noise.jpg';

  await document.fonts.ready;
  const texts = buildTexts();
  gsap.set([...texts[0].lineMids, ...texts[0].titleMids], { yPercent: INTRO.from });
  texts.forEach((t) => t.update(0));
  const cursor = initCursor();

  const scroll = new SlideScroll(params.scroll, COUNT);
  const transition = new Transition(media);
  const gallery = new Gallery({
    renderer,
    media,
    slides: SLIDES,
    params: params.gallery,
    zoomParams: params.zoom,
    hoverParams: params.hover,
    overlay: OVERLAY,
    labelsRoot: document.querySelector('[data-gallery]'),
  });
  const stepper = new Stepper(document.querySelector('[data-stepper]'), COUNT, params.stepper);
  const stepperEl = document.querySelector('[data-stepper]');
  const rulerEl = document.querySelector('[data-ruler]');
  const ruler = new Ruler(rulerEl, COUNT);
  const sound = new SwitchSound(params.sound);
  playOnClicks(sound);
  let shown = 0;
  const step = (index) => {
    stepper.set(index);
    if (index !== shown) sound.play();
    shown = index;
  };
  gsap.set(maskOf(rulerEl), { yPercent: 110 });

  const pgnLeft = stepperEl.querySelector('[data-stepper-current]');
  const pgnMiddle = stepperEl.querySelector('[data-stepper-steps]');
  const pgnRight = stepperEl.querySelector('[data-stepper-count]');
  [pgnLeft, pgnRight].forEach((el) => {
    const mask = document.createElement('span');
    mask.className = 'pgn-mask';
    el.parentElement.insertBefore(mask, el);
    mask.appendChild(el);
  });
  function pgn(action) {
    const [left, middle, right] = [pgnLeft, pgnMiddle, pgnRight];
    const show = action === 'show';
    const tween = show ? { duration: 1.5, ease: 'expo.out' } : EXIT_UI;
    if (show) {
      gsap.set(left, { xPercent: -110 });
      gsap.set(right, { xPercent: 110 });
      gsap.set(middle, { scaleX: 0 });
    }
    gsap.to(left, { xPercent: show ? 0 : -110, ...tween, overwrite: true });
    gsap.to(right, { xPercent: show ? 0 : 110, ...tween, overwrite: true });
    gsap.to(middle, { scaleX: show ? 1 : 0, ...tween, overwrite: true });
  }
  const arrive = { extra: 0 };
  const EXIT_UI = { duration: 0.9, ease: bezier(0.64, 0, 0.12, 1) };

  let busy = false;
  let queuedView = null;
  const view = {
    mode: 'slider',
    flat: true,
    get busy() {
      return busy;
    },
    set busy(value) {
      busy = value;
      if (value || !queuedView) return;
      const mode = queuedView;
      queuedView = null;
      gsap.delayedCall(0, () => setView(mode));
    },
  };
  let pendingView = null;

  (preload ? media : [media[0]]).forEach(play);
  await Promise.race([
    Promise.all([displacement.decode().catch(() => {}), ...(preload ? [...media, ...tiles].map((m) => m.ready) : [media[0].ready])]),
    new Promise((resolve) => setTimeout(resolve, MEDIA_WAIT)),
  ]);
  prefetchPage('profile');
  const workPictures = [];
  const preloadPicture = (src) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    workPictures.push(img);
    return img.decode().catch(() => {});
  };
  Promise.all(workPages.map((w) => preloadPicture(w.cover.src))).then(async () => {
    const seen = new Set(workPages.map((w) => w.cover.src));
    for (const w of workPages) {
      for (const m of w.media) {
        if (!m.src || seen.has(m.src)) continue;
        seen.add(m.src);
        await preloadPicture(m.src);
      }
    }
  });
  renderer.setDisplacement(displacement);
  const workHeader = [...document.querySelectorAll('[data-ui]')].filter((el) => !el.matches('[data-view], .view-switch'));
  const work = new Work({
    root: document.querySelector('[data-work]'),
    renderer,
    overlay: OVERLAY,
    header: workHeader,
  });
  work.preloaded = workPictures;
  media.forEach((m) => m.ready.then(() => !m.isVideo && renderer.upload(m)));
  tiles.forEach((m) => renderer.upload(m));
  texts.forEach((t) => t.update(scroll.position));

  const orbitCanvas = document.querySelector('[data-orbit]');
  let orbit = null;
  let MORPH = null;
  let RINGS = null;
  let orbitOpening = false;
  let orbitHide = false;
  let orbitPromise = null;
  const orbitReady = () => {
    if (!orbitPromise) {
      orbitPromise = (orbitModule || new Promise(() => {})).then((module) => {
        MORPH = module.MORPH;
        RINGS = module.RINGS;
        const pictures = SLIDES.flatMap((s, i) =>
          s.work ? [s.work.cover, ...s.work.media].map((p) => ({ src: p.src.replace(/\/([^/]+)$/, '/orbit/$1'), slide: i, width: 1280, height: 796 })) : [],
        );
        orbit = new module.Orbit({ canvas: orbitCanvas, media, pictures, overlay: OVERLAY, dividerBox: () => gallery.dividerBox() });
        orbit.onHover = (card) => cursor.setHover(Boolean(card));
        return orbit;
      });
    }
    return orbitPromise;
  };
  const warmOrbit = () => orbitReady().then((o) => !o.active && o.prepare());
  if (preload && orbitModule) await warmOrbit().catch(() => {});

  if (preload && isMobile()) {
    transition.playOnly(0);
    gsap.set(canvas, { opacity: 1 });
    loadRoot.style.pointerEvents = 'none';
    gsap.to(loadRoot, {
      opacity: 0,
      duration: window.pageTransition.params.in,
      ease: 'power2.out',
      onComplete: () => loadRoot.remove(),
    });
    introReveal(texts[0], 0);
    revealUI(uiInners, 0);
  } else if (preload) {
    view.busy = true;
    scroll.enabled = false;
    cursor.setEnabled(false);
    preloader.media = media;
    preloader.tiles = tiles;
    media.forEach(play);
    gsap.ticker.tick();
    gsap.set(canvas, { opacity: 1 });
    preloader.play(() => {
      transition.playOnly(0);
      view.busy = false;
      const mode = pendingView;
      pendingView = null;
      if (mode) setView(mode);
    });
    gsap.delayedCall(3.2, () => introReveal(texts[0]));
    revealUI(uiInners, 3.8);
    gsap.delayedCall(4, () => {
      scroll.enabled = true;
      cursor.setEnabled(true);
    });
  } else {
    const byVeil = window.pageTransition.arrivingByVeil;
    play(media[0]);
    gsap.set(canvas, { opacity: 1 });
    if (byVeil) {
      gsap.set(arrive, { extra: 0.15 });
      gsap.set([...texts[0].lineMids, ...texts[0].titleMids], { yPercent: INTRO.from });
      gsap.set(pgnLeft, { xPercent: -110 });
      gsap.set(pgnRight, { xPercent: 110 });
      gsap.set(pgnMiddle, { scaleX: 0 });
    }
    const afterFrames = (n, fn) => (n ? requestAnimationFrame(() => afterFrames(n - 1, fn)) : fn());
    afterFrames(3, () => {
      window.pageTransition.enter();
      if (orbitModule) gsap.delayedCall(1.5, () => warmOrbit().catch(() => {}));
      if (!byVeil) return;
      introReveal(texts[0], 0);
      gsap.to(arrive, { extra: 0, duration: 1.3, ease: 'expo.out' });
      pgn('show');
    });
  }

  window.addEventListener('resize', () => {
    renderer.resize();
    if (orbit) orbit.resize();
    gallery.layout();
    work.layout();
    if (preloader && preloader.active) preloader.layout();
  });

  const sliderTexts = document.querySelectorAll('.slide-title, .slide-meta');
  const switchButtons = document.querySelectorAll('[data-view]');

  function markSwitch(mode) {
    const shown = queuedView || mode;
    switchButtons.forEach((b) => {
      const on = b.dataset.view === shown;
      b.classList.toggle('is-active', on);
      if (on) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
  }

  async function setView(mode) {
    if (preloader && preloader.active) {
      pendingView = mode;
      markSwitch(mode);
      return;
    }
    if (view.busy) {
      if (work.isOpen) return;
      queuedView = mode;
      markSwitch(mode);
      return;
    }
    if (mode === view.mode) return;
    if (mode === 'orbit' || view.mode === 'orbit') {
      view.busy = true;
      await orbitReady();
      if (mode === 'orbit') toOrbit(view.mode);
      else fromOrbit(mode);
      return;
    }
    view.mode = mode;
    view.busy = true;
    markSwitch(mode);

    if (mode === 'gallery') {
      scroll.enabled = false;
      const index = Math.round(scroll.target);
      scroll.jump(index);
      transition.update(index);
      cursor.setEnabled(false);
      const text = texts[mod(index)];
      hideTexts(text, () => {
        gsap.set(sliderTexts, { autoAlpha: 0 });
        gsap.set([...text.lineMids, ...text.titleMids], { yPercent: 0 });
      });
      swapBottom(stepperEl, rulerEl);
      media.forEach(play);
      gallery.zoomOut(index, () => {
        gallery.enabled = true;
        view.busy = false;
      });
    } else {
      const index = gallery.zoomIn(() => {
        transition.update(index);
        transition.playOnly(mod(index));
        scroll.enabled = true;
        cursor.setEnabled(true);
        view.busy = false;
      });
      scroll.jump(index);
      texts.forEach((t) => t.update(index));
      const text = texts[mod(index)];
      gsap.set([...text.lineMids, ...text.titleMids], { yPercent: 110 });
      gsap.set(sliderTexts, { autoAlpha: 1 });
      showTexts(text);
      swapBottom(rulerEl, stepperEl);
    }
  }

  function sliderCards(centre) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const list = [{ slide: centre, rect: { x: 0, y: 0, w: W, h: H }, zoom: SLIDES[centre].zoom, overlay: OVERLAY.opacity }];
    [-1, 1, -2, 2].forEach((k) => {
      const cx = Math.sign(k) * (3 * Math.abs(k) + 1) * gallery.slot;
      const rect = { x: W / 2 + cx - gallery.cardW / 2, y: (H - gallery.cardH) / 2, w: gallery.cardW, h: gallery.cardH };
      list.push({ slide: mod(centre + k), rect, zoom: 1, overlay: 0 });
    });
    return list;
  }

  function galleryCards(centre) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    return gallery
      .cards()
      .map(({ i, key, rect: [cx, cy, w, h] }) => ({ key, slide: i, rect: { x: W / 2 + cx - w / 2, y: H / 2 - cy - h / 2, w, h }, zoom: 1, overlay: 0 }))
      .sort((a, b) => (b.key === centre) - (a.key === centre));
  }

  function toOrbit(from) {
    view.mode = 'orbit';
    markSwitch('orbit');
    cursor.setPill(true);
    let sources;
    let centre;
    let duration;
    if (from === 'slider') {
      scroll.enabled = false;
      const index = Math.round(scroll.target);
      scroll.jump(index);
      transition.update(index);
      cursor.setEnabled(false);
      const text = texts[mod(index)];
      hideTexts(text, () => {
        gsap.set(sliderTexts, { autoAlpha: 0 });
        gsap.set([...text.lineMids, ...text.titleMids], { yPercent: 0 });
      });
      hideBottom(stepperEl);
      centre = mod(index);
      sources = sliderCards(centre);
      duration = MORPH.long;
    } else {
      gallery.enabled = false;
      gallery.isDragging = false;
      gallery.hideLabels();
      hideBottom(rulerEl);
      const index = Math.round(gallery.position);
      centre = mod(index);
      sources = galleryCards(index);
      duration = params.zoom.duration;
    }
    orbit.resize();
    orbitHide = false;
    gsap.set(orbitCanvas, { opacity: 1 });
    orbit.morphIn({
      sources,
      centre,
      duration,
      sphere: -SPHERE.gallery,
      divider: from === 'gallery',
      onComplete: () => (view.busy = false),
    });
    view.flat = false;
    gallery.visible = false;
  }

  function fromOrbit(to) {
    view.mode = to;
    markSwitch(to);
    cursor.setPill(false);
    const card = orbit.nearestCard();
    const index = card.slide;
    let targets;
    let duration;
    if (to === 'slider') {
      gallery.resetZoom();
      scroll.jump(index);
      texts.forEach((t) => t.update(index));
      const text = texts[index];
      gsap.set([...text.lineMids, ...text.titleMids], { yPercent: 110 });
      gsap.set(sliderTexts, { autoAlpha: 1 });
      showTexts(text);
      showBottom(stepperEl);
      targets = sliderCards(index);
      duration = params.zoom.duration;
    } else {
      gallery.showAt(index);
      showBottom(rulerEl);
      targets = galleryCards(index);
      duration = params.zoom.duration;
    }
    orbit.morphOut({
      targets,
      centre: card,
      duration,
      wipe: OPEN,
      sphere: SPHERE.slider,
      divider: to === 'gallery',
      onComplete: () => {
        orbit.leave();
        if (to === 'slider') {
          transition.playOnly(index);
          transition.update(index);
          const m = media[index];
          if (m.isVideo && m.el.readyState >= 2) {
            renderer.upload(m);
            m.lastTime = m.el.currentTime;
          }
          scroll.enabled = true;
          cursor.setEnabled(true);
        } else {
          gallery.enabled = true;
        }
        view.flat = true;
        orbitHide = true;
        view.busy = false;
      },
    });
  }

  function swapBottom(out, inEl) {
    hideBottom(out);
    showBottom(inEl);
  }

  function hideBottom(el) {
    gsap.to(maskOf(el), { yPercent: -110, duration: 0.7, ease: EASE_HIDE, overwrite: true });
  }

  function showBottom(inEl) {
    const inner = maskOf(inEl);
    gsap.fromTo(
      inner,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 1.4,
        ease: EASE_SHOW,
        delay: 0.8,
        overwrite: true,
        onComplete: () => gsap.getProperty(inner, 'yPercent') === 0 && inEl.classList.remove('ui-mask'),
      },
    );
  }

  switchButtons.forEach((b) =>
    b.addEventListener('click', (e) => {
      e.preventDefault();
      setView(b.dataset.view);
    }),
  );

  const bottomOf = { slider: [stepperEl], gallery: [rulerEl], orbit: [] };
  const workHidden = () => [document.querySelector('.view-switch'), ...bottomOf[view.mode]];
  function hiddenInners() {
    return workHidden().map(maskOf);
  }

  function hideForWork(text) {
    gsap.to([...hiddenInners(), ...(text ? [...text.lineMids, ...text.titleMids] : [])], {
      yPercent: -110,
      duration: 0.7,
      ease: EASE_HIDE,
      overwrite: true,
    });
  }

  function showHome(text) {
    if (text) gsap.set(sliderTexts, { autoAlpha: 1 });
    gsap.fromTo(
      [...hiddenInners(), ...(text ? text.lineMids : [])],
      { yPercent: 120 },
      {
        yPercent: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.05,
        overwrite: true,
        onComplete: () =>
          workHidden().forEach((el) => {
            const inner = el.querySelector(':scope > .ui-in');
            if (inner && gsap.getProperty(inner, 'yPercent') === 0) el.classList.remove('ui-mask');
          }),
      },
    );
    if (text) {
      gsap.fromTo(
        text.titleMids,
        { yPercent: 120 },
        { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.04, delay: 0.1, overwrite: true },
      );
    }
    view.busy = false;
    if (view.mode === 'gallery') {
      gallery.enabled = true;
    } else if (view.mode === 'orbit') {
      orbit.close();
    } else {
      scroll.enabled = true;
      cursor.setEnabled(true);
    }
  }

  function openWork(index) {
    scroll.enabled = false;
    scroll.jump(index);
    transition.update(index);
    transition.playOnly(mod(index));
    cursor.setEnabled(false);
    hideForWork(texts[mod(index)]);
    work.open(SLIDES[mod(index)], media[mod(index)]);
  }

  work.onPictureClick = () => sound.play();

  work.onCloseStart = (old) => {
    if (!old.isVideo) return;
    try {
      old.el.currentTime = 0;
    } catch {}
    play(old);
  };

  work.onCloseSettle = (source) => {
    if (source.kind !== 'slide' || !gallery.opening) return;
    gallery.opening.reveal = true;
    gallery.revealDivider();
  };

  work.onClosed = (source) => {
    if (source.kind === 'orbit') {
      orbitOpening = false;
      showHome(null);
      return;
    }
    if (source.kind === 'slide') {
      const revealed = gallery.opening && gallery.opening.reveal;
      gallery.opening = null;
      if (!revealed) gallery.revealDivider();
      showHome(null);
      return;
    }
    const index = Math.round(scroll.target);
    view.mode = 'slider';
    markSwitch('slider');
    transition.update(index);
    transition.playOnly(mod(index));
    showHome(texts[mod(index)]);
  };

  function openFromOrbit(card) {
    const i = card.slide;
    const m = card.picture === null ? media[i] : orbitPicture(card);
    const start = orbit.cardRect(card);
    const overlay = 1 - orbit.cardFade(card);
    if (m.isVideo) {
      if (!orbit.live.has(i)) {
        try {
          m.el.currentTime = 0;
        } catch {}
      }
      play(m);
      if (m.el.readyState >= 2) renderer.upload(m);
    }
    orbit.enabled = false;
    cursor.setHover(false);
    hideForWork(null);
    work
      .open(SLIDES[i], m, {
        kind: 'orbit',
        start,
        overlay,
        fit: { w: RINGS.cardAspect, h: 1 },
        spread: { duration: params.zoom.duration, ease: EASE_ZOOM },
      })
      .then(() => {
        orbit.open(card);
        orbitOpening = true;
      });
  }

  const orbitPictures = new Map();
  function orbitPicture(card) {
    const img = orbit.pictureTextures[card.picture].still.image;
    if (!(img instanceof HTMLImageElement)) return { width: 1, height: 1, isVideo: false, uploaded: false };
    if (!orbitPictures.has(card.picture)) {
      const picture = { el: img, width: img.naturalWidth, height: img.naturalHeight, isVideo: false };
      renderer.upload(picture);
      const gl = renderer.gl;
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      orbitPictures.set(card.picture, picture);
    }
    return orbitPictures.get(card.picture);
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-ui], [data-work]')) return;
    if (view.mode === 'orbit') {
      const card = orbit && orbit.hovered;
      if (view.busy || work.isOpen || !card || !SLIDES[card.slide].work) return;
      view.busy = true;
      sound.play();
      openFromOrbit(card);
      return;
    }
    if (view.mode !== 'slider' || view.busy || work.isOpen) return;
    const index = Math.round(scroll.target);
    if (!SLIDES[mod(index)].work) return;
    view.busy = true;
    sound.play();
    openWork(index);
  });

  gallery.onOpen = (index) => {
    if (view.mode !== 'gallery' || view.busy || work.isOpen || !SLIDES[mod(index)].work) return false;
    view.busy = true;
    sound.play();
    gallery.enabled = false;
    hideForWork(null);
    work
      .open(SLIDES[mod(index)], media[mod(index)], {
        kind: 'slide',
        get start() {
          return gallery.cardRect(index);
        },
        spread: { duration: params.zoom.duration, ease: EASE_ZOOM },
      })
      .then(() => (gallery.opening = { index, spread: 0 }));
    return true;
  };

  function syncGalleryVideos() {
    const visible = new Set(gallery.visibleMedia());
    media.forEach((m) => {
      if (!m.isVideo) return;
      if (visible.has(m)) {
        if (m.el.paused) play(m);
      } else if (!m.el.paused) {
        m.el.pause();
      }
    });
    return visible;
  }

  function uploadVideo(m) {
    if (!m || !m.isVideo || m.el.readyState < 2) return;
    if (m.uploaded && m.el.currentTime === m.lastTime) return;
    m.lastTime = m.el.currentTime;
    renderer.upload(m);
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(now - last, 100);
    last = now;

    scroll.update();
    gallery.update(dt);
    work.update(dt);

    if (work.isOpen) {
      const t = work.transition;
      if (t && orbitOpening) {
        renderer.clear(true);
        orbit.update(dt);
        orbit.fade = 1 - t.spread;
        t.startClip = orbit.surfaceClip(orbit.opened, OPEN_SEGMENTS);
        t.oldZoom = orbit.cardZoom(orbit.opened);
        orbit.render();
      } else {
        renderer.clear();
      }
      if (t && gallery.opening) {
        gallery.opening.spread = t.spread;
        gallery.visibleMedia().forEach(uploadVideo);
        gallery.render(now);
      }
      const old = work.oldMedia;
      if (old) uploadVideo(old);
      else media.forEach((m) => m.isVideo && !m.el.paused && m.el.pause());
      work.renderCanvas();
    } else if (preloader && preloader.active) {
      renderer.clear();
      media.forEach(uploadVideo);
      preloader.render();
      stepper.set(0);
    } else if (!view.flat) {
      renderer.clear(true);
    } else if (gallery.visible) {
      renderer.clear();
      if (view.mode === 'gallery') syncGalleryVideos();
      gallery.visibleMedia().forEach(uploadVideo);
      gallery.render(now);
      step(mod(Math.round(gallery.position)));
      ruler.update(gallery.position);
    } else {
      renderer.clear();
      const raw = scroll.position;
      texts.forEach((t) => t.update(raw));
      transition.update(raw);
      uploadVideo(media[transition.from]);
      if (transition.to !== null) uploadVideo(media[transition.to]);
      renderer.render({ ...transition.output, extra: arrive.extra });
      step(mod(Math.round(raw)));
    }
    if (orbitHide && view.flat) {
      gsap.set(orbitCanvas, { opacity: 0 });
      orbitHide = false;
    }
    if (orbit && orbit.active && !work.isOpen) {
      orbit.update(dt);
      orbit.render();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

boot();
