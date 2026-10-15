export function mountLab() {
  const home = document.querySelector<HTMLElement>('.lab-home');
  const viewport = document.querySelector<HTMLElement>('#lab-viewport');
  if (!home || !viewport) return;
  const panels = [...home.querySelectorAll<HTMLElement>('[data-room-panel]')];
  const map = [...home.querySelectorAll<HTMLAnchorElement>('[data-room-link]')];
  const hotspots = [...home.querySelectorAll<HTMLAnchorElement>('[data-hotspot]')];
  const motion = home.querySelector<HTMLButtonElement>('#lab-motion')!;
  const announcement = home.querySelector<HTMLElement>('#room-announcement')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let scene: ReturnType<typeof import('./lab-scene').createScene> | undefined;
  let active = Math.max(0, panels.findIndex(panel => `#${panel.id}` === location.hash));
  let paused = reduced.matches, navigation = 0;

  function arrive(token: number, focus: boolean) {
    if (token !== navigation) return;
    home!.dataset.transition = 'false';
    panels[active].inert = false;
    hotspots.forEach(link => link.inert = active !== 1);
    const heading = panels[active].querySelector<HTMLElement>('h1,h2')!;
    announcement.textContent = heading.textContent;
    if (focus) heading.focus({ preventScroll: true });
  }
  function go(index: number, updateHistory = true, instant = false, focus = true) {
    const token = ++navigation;
    active = index;
    home!.dataset.room = String(index);
    home!.dataset.transition = scene && !paused && !instant ? 'true' : 'false';
    panels.forEach((panel, i) => {
      panel.classList.toggle('is-active', i === index);
      panel.inert = i !== index;
      panel.setAttribute('aria-hidden', String(i !== index));
      if (i === index) panel.scrollTop = 0;
    });
    map.forEach(link => {
      if (link.hash === `#${panels[index].id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    hotspots.forEach(link => link.inert = index !== 1 || home!.dataset.transition === 'true');
    if (updateHistory && location.hash !== `#${panels[index].id}`) history.pushState(null, '', `#${panels[index].id}`);
    if (scene) {
      panels[index].inert = !paused && !instant;
      scene.goTo(index, instant, () => arrive(token, focus));
    } else arrive(token, focus);
  }
  function syncMotion() {
    home!.dataset.motion = paused ? 'paused' : 'active';
    motion.textContent = paused ? 'Ativar movimento' : 'Pausar movimento';
    motion.setAttribute('aria-pressed', String(paused));
    scene?.setMotion(paused);
  }
  home.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLAnchorElement>('a');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname) return;
    const index = url.hash ? panels.findIndex(panel => `#${panel.id}` === url.hash) : 0;
    if (index < 0) return;
    event.preventDefault();
    if (active !== index) go(index);
  });
  function restoreRoom() {
    const index = location.hash ? panels.findIndex(panel => `#${panel.id}` === location.hash) : 0;
    if (index >= 0 && index !== active) go(index, false);
  }
  window.addEventListener('popstate', restoreRoom);
  window.addEventListener('hashchange', restoreRoom);
  motion.addEventListener('click', () => { paused = !paused; syncMotion(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; syncMotion(); });
  home.querySelectorAll<HTMLDetailsElement>('.method-step').forEach((details, i) => details.addEventListener('toggle', () => {
    if (details.open) scene?.setMethod(i);
  }));
  home.classList.add('is-enhanced');
  document.body.classList.add('lab-experience');
  window.scrollTo(0, 0);
  syncMotion(); go(active, false, true, false);
  import('./lab-scene').then(({ createScene }) => {
    scene = createScene(viewport, paused, (positions) => positions.forEach((position, i) => {
      hotspots[i].style.left = `${position.x}px`; hotspots[i].style.top = `${position.y}px`;
      hotspots[i].style.visibility = position.visible ? 'visible' : 'hidden';
    }));
    home.dataset.render = 'webgl';
    const selected = [...home.querySelectorAll<HTMLDetailsElement>('.method-step')].findIndex(step => step.open);
    if (selected >= 0) scene.setMethod(selected);
    scene.goTo(active, true, () => arrive(navigation, false));
  }).catch(() => {
    home.dataset.render = 'static';
    home.dataset.transition = 'false';
  });
}
