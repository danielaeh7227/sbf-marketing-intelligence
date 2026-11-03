import { useState, useEffect } from './html.js';

// Hash routes: #/<page> or #/<page>/<id>, e.g. #/create/e1, #/know/harbourline, #/learn/p1
export const PAGES = ['overview', 'know', 'plan', 'create', 'approve', 'learn', 'ads', 'settings'];

export function parseHash(hash = location.hash) {
  const [page, id] = hash.replace(/^#\/?/, '').split('/');
  return { page: PAGES.includes(page) ? page : 'overview', id: id || '' };
}

export function navigate(path) {
  const target = '#/' + path;
  if (location.hash === target) dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = target;
}

export function useRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const on = () => setRoute(parseHash());
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return route;
}
