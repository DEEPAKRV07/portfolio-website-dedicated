import { el } from './dom.js';
import { safeUrl } from './schema.js';
import { createMediaResolver } from './localMedia.js';
export function mediaGallery(items = []) {
  const resolver = createMediaResolver();
  const visible = [...items].filter(m => m.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  const section = el('section', { class: 'media-gallery', 'aria-label': 'Project media' });
  section.disposeMedia = () => resolver.dispose();
  for (const item of visible) {
    const url = safeUrl(item.url || item.src || item.path, { media: true });
    if (!url) continue;
    const figure = el('figure', { class: 'media-item' });
    let resolvedUrl;
    const failure = () => figure.replaceChildren(el('p', { class: 'media-error' }, 'This media could not be loaded.'), ...(resolvedUrl ? [el('a', { href: resolvedUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Open original ↗')] : []));
    let media;
    if (item.type === 'image') media = el('img', { alt: item.alt || item.title || '', loading: 'lazy', decoding: 'async', onError: failure });
    else if (item.type === 'video') media = el('video', { controls: true, playsInline: true, preload: 'metadata', onError: failure });
    else media = el('a', { class: 'document-link', target: '_blank', rel: 'noopener noreferrer' }, item.title || 'Open document', ' ↗');
    figure.append(media);
    resolver.resolve(url).then(resolved => { resolvedUrl = resolved; media[item.type === 'document' ? 'href' : 'src'] = resolved; }).catch(failure);
    const poster = safeUrl(item.poster, { media: true });
    if (item.type === 'video' && poster) resolver.resolve(poster).then(resolved => { media.poster = resolved; }).catch(() => {});
    if (item.caption) figure.append(el('figcaption', {}, item.caption));
    section.append(figure);
  }
  return section;
}
