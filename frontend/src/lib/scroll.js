let lenis = null;

export const setLenis = (instance) => {
  lenis = instance;
};

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
  else el.scrollIntoView();
  window.history.replaceState(null, "", `#${id}`);
};

export const lockScroll = (locked) => {
  if (lenis) (locked ? lenis.stop() : lenis.start());
};