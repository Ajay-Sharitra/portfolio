(() => {
  const DEFAULTS = {
    out: 0.4,
    in: 1,
  };
  const KEY_VEIL = 'veil';
  const KEY_BACK = 'back';
  const root = document.documentElement;

  if (!root.hasAttribute('data-not-found')) {
    try {
      sessionStorage.setItem(KEY_BACK, location.href);
    } catch {}
  }

  const params = { ...DEFAULTS };

  const page = (href) => new URL(href, location.href).pathname;
  let nav = null;
  try {
    nav = performance.getEntriesByType('navigation')[0];
  } catch {}
  const isNavigate = !nav || nav.type === 'navigate';

  let veilIn = false;
  try {
    veilIn = sessionStorage.getItem(KEY_VEIL) === location.pathname && isNavigate;
    sessionStorage.removeItem(KEY_VEIL);
  } catch {}
  if (veilIn) root.classList.add('veil-in', 'veil-on');

  let entered = false;

  function swapIn() {
    const { gsap } = window;
    document.querySelectorAll('[data-swap]').forEach((el) => {
      let inner = el.querySelector(':scope > .ui-in');
      if (!inner) {
        inner = document.createElement('span');
        inner.className = 'ui-in';
        while (el.firstChild) inner.appendChild(el.firstChild);
        el.appendChild(inner);
      }
      el.classList.add('ui-mask');
      gsap.set(inner, { yPercent: 110 });
      gsap.fromTo(inner, { yPercent: 110 }, {
        yPercent: 0,
        duration: 1.5,
        ease: 'expo.out',
        onComplete: () => el.classList.remove('ui-mask'),
      });
    });
  }

  function enter() {
    if (entered) return;
    entered = true;
    if (veilIn) {
      swapIn();
      const veil = document.querySelector('[data-veil]');
      window.gsap.fromTo(veil, { opacity: 1 }, {
        opacity: 0,
        duration: params.in,
        ease: 'power2.out',
        onComplete: () => root.classList.remove('veil-on'),
      });
      root.classList.remove('veil-in');
    }
  }

  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    if (leaving) {
      clearTimeout(leaving.timer);
      window.gsap.set(document.querySelector('[data-veil]'), { opacity: 0 });
      root.classList.remove('veil-on');
      leaving = null;
    }
    enter();
  });

  let leaving = null;

  function go(link, key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch {}
    location.href = link.href;
  }

  const path = (href) => new URL(href, location.href).pathname.replace(/index\.html$/, '');

  document.addEventListener('click', (e) => {
    const link = e.target.closest('.menu a[href], a[data-home], a[data-back]');
    if (!link || link.hasAttribute('data-stub') || e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const url = new URL(link.href, location.href);
    const home = link.hasAttribute('data-home') || link.hasAttribute('data-back');
    if (home && path(link.href) === path(location.href)) {
      e.preventDefault();
      return;
    }
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    if (leaving || !window.gsap) return;
    const pills = [...document.querySelectorAll('.menu .pill')];
    pills.forEach((p) => p.classList.toggle('is-active', p === link || (home && path(p.href) === path(link.href))));
    root.classList.add('veil-on');
    window.gsap.fromTo(document.querySelector('[data-veil]'), { opacity: 0 }, {
      opacity: 1,
      duration: params.out,
      ease: 'none',
      onComplete: () => go(link, KEY_VEIL, page(link.href)),
    });
    leaving = { timer: 0 };
  });

  window.pageTransition = {
    params,
    enter,
    get arrivingByVeil() {
      return veilIn;
    },
  };
})();
