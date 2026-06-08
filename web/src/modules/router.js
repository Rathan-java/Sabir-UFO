// Minimal hash router. Routes are registered as { pattern, handler }.
// pattern is a string with optional :params (e.g. '/sighting/:id').

const routes = [];
let notFound = () => {};

export function route(pattern, handler) {
  routes.push({ pattern, handler });
}

export function setNotFound(handler) { notFound = handler; }

function parse(hash) {
  const clean = hash.replace(/^#/, '') || '/';
  const [path, search = ''] = clean.split('?');
  const queryParams = Object.fromEntries(new URLSearchParams(search));
  return { path, queryParams };
}

function match(pattern, path) {
  const pSeg = pattern.split('/').filter(Boolean);
  const aSeg = path.split('/').filter(Boolean);
  if (pSeg.length !== aSeg.length) return null;
  const params = {};
  for (let i = 0; i < pSeg.length; i++) {
    if (pSeg[i].startsWith(':')) params[pSeg[i].slice(1)] = decodeURIComponent(aSeg[i]);
    else if (pSeg[i] !== aSeg[i]) return null;
  }
  return params;
}

export function navigate(to) {
  if (location.hash === to) {
    // force re-render
    dispatch();
  } else {
    location.hash = to;
  }
}

export function currentPath() {
  return parse(location.hash).path;
}

function dispatch() {
  const { path, queryParams } = parse(location.hash);
  for (const r of routes) {
    const params = match(r.pattern, path);
    if (params) {
      r.handler({ params, query: queryParams });
      return;
    }
  }
  notFound();
}

export function startRouter() {
  window.addEventListener('hashchange', dispatch);
  if (!location.hash) location.hash = '#/';
  dispatch();
}
