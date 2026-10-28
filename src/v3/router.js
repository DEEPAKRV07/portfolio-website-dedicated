export const WORLDS = ['home', 'about', 'projects', 'skills', 'experience', 'education', 'contact'];
export const TYPE_WORLD = { project: 'projects', skill: 'skills', category: 'skills', experience: 'experience', education: 'education', about: 'about', contact: 'contact', section: 'section' };
export function parseRoute(location = window.location, base = import.meta.env?.BASE_URL || '/') {
  let path = location.hash?.replace(/^#\/?/, '');
  if (!path && location.search) {
    const legacy = new URLSearchParams(location.search).get('p');
    if (legacy) path = legacy.replace(/~and~/g, '&');
  }
  if (!path) path = location.pathname.startsWith(base) ? location.pathname.slice(base.length) : location.pathname.replace(/^\//, '');
  try {
    const parts = (path || '').split('/').filter(Boolean).map(decodeURIComponent);
    return { world: parts[0] === 'index.html' || !parts[0] ? 'home' : parts[0], slug: parts[1] || null };
  } catch { return { world: 'not-found', slug: null }; }
}
export function routeHref(world = 'home', slug = '') {
  return `#/${encodeURIComponent(world)}${slug ? `/${encodeURIComponent(slug)}` : ''}`;
}
export function recordHref(record) { return routeHref(TYPE_WORLD[record.type] || 'section', record.slug || record.id); }
