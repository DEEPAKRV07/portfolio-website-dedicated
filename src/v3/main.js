import './public.css';
import { createSeed } from './data.js';
import { ContentStore } from './store.js';
import { safeUrl } from './schema.js';
import { el, safeStorage } from './dom.js';
import { WORLDS, TYPE_WORLD, parseRoute, routeHref, recordHref } from './router.js';
import { mediaGallery } from './media.js';

const TITLES = { home: 'Inside my neural network.', projects: 'Built to solve.', skills: 'A connected toolkit.', experience: 'Learning. Building. Evolving.', education: 'The foundations.', about: 'Curiosity, in practice.', contact: 'Let’s make a connection.', section: 'More to explore.' };
const DESCRIPTIONS = {
  projects: 'Applied AI, computer vision and thoughtful software. Explore the systems, decisions and ideas behind the work.',
  skills: 'Tools become more useful when they work together. Select a node to see its context and connections.',
  experience: 'A record of hands-on engineering, research and collaboration.',
  education: 'The knowledge behind the experiments. The starting point for what comes next.',
  about: 'AI / ML engineering and software development, connected by a drive to turn ideas into useful experiences.',
  contact: 'Have a problem worth exploring? A project in mind? Start a conversation.',
  section: 'Notes, ideas and new directions from the portfolio.'
};
const app = document.querySelector('#app');
const store = new ContentStore();
let snapshot = createSeed();
let engine, studioCleanup, publicShell, sceneStage, content, dialog, route, sceneControls, branchContext;
let renderToken = 0, sceneToken = 0, lastWorld = null, pendingNode = null, lastFocus;
let navigationToken = 0;
let motion = safeStorage('portfolio.motion') !== 'off' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
let reading = false;
let quality = safeStorage('portfolio.quality') || 'auto';
const visibleRecords = () => snapshot.records.filter(r => r.status === 'published');
const recordById = id => visibleRecords().find(r => r.id === id);
function link(label, href, className = '') { return el('a', { href, class: className }, label); }
function externalLink(item) {
  const url = safeUrl(item.url);
  return url ? el('a', { href: url, target: url.startsWith('mailto:') ? undefined : '_blank', rel: 'noopener noreferrer', class: 'external-link' }, item.label || 'Open link', ' ↗') : null;
}
function notify(message) { const status = document.querySelector('#app-status'); if (status) status.textContent = message; }
function go(world, slug) { location.hash = routeHref(world, slug); }

function makeShell() {
  const nav = el('nav', { class: 'primary-nav', id: 'main-navigation', 'aria-label': 'Main navigation' },
    ...WORLDS.map(world => link(world === 'home' ? 'Index' : world[0].toUpperCase() + world.slice(1), routeHref(world), `nav-link nav-${world}`)));
  const menu = el('button', { class: 'menu-toggle', 'aria-label': 'Open navigation', 'aria-expanded': 'false', 'aria-controls': 'main-navigation', onClick: () => {
    const open = nav.classList.toggle('nav-open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  } }, 'Menu', el('span', { 'aria-hidden': 'true' }, '☰'));
  const header = el('header', { class: 'site-header' }, link('DEEPAK R V', routeHref('home'), 'wordmark'),
    el('span', { class: 'identity-caption' }, 'AI / ML ENGINEER', el('small', {}, 'SOFTWARE DEVELOPER')), nav, menu, link('Let’s talk ↗', routeHref('contact'), 'header-contact'));
  content = el('main', { id: 'main-content', tabIndex: -1 });
  sceneStage = el('div', { id: 'scene-stage', class: 'scene-stage', 'aria-label': 'Interactive 3D portfolio' });
  const qualitySelect = el('select', { id: 'quality', 'aria-label': 'Rendering quality', onChange: e => {
    quality = e.target.value; safeStorage('portfolio.quality', quality); engine?.setQuality(quality);
  } }, ...['auto', 'low', 'high'].map(q => el('option', { value: q, selected: q === quality }, `${q[0].toUpperCase() + q.slice(1)} quality`)));
  const motionButton = el('button', { 'aria-pressed': String(!motion), onClick: () => {
    motion = !motion; safeStorage('portfolio.motion', motion ? 'on' : 'off'); engine?.setMotion(motion); motionButton.setAttribute('aria-pressed', String(!motion)); motionButton.textContent = motion ? 'Reduce motion' : 'Enable motion';
  } }, motion ? 'Reduce motion' : 'Enable motion');
  const readButton = el('button', { 'aria-pressed': 'false', onClick: () => {
    reading = !reading; publicShell.classList.toggle('reading-mode', reading); readButton.setAttribute('aria-pressed', String(reading)); readButton.textContent = reading ? 'Show 3D' : 'Reading mode';
    if (reading) { engine?.dispose(); engine = null; sceneToken++; } else startScene();
  } }, 'Reading mode');
  sceneControls = el('div', { class: 'scene-toolbar', 'aria-label': 'Scene controls' },
    el('span', { class: 'scene-hint' }, el('span', { class: 'status-dot', 'aria-hidden': 'true' }), 'Drag to orbit · Select to explore'),
    el('div', { class: 'toolbar-actions' }, el('button', { onClick: () => engine?.zoom(.8), 'aria-label': 'Zoom in' }, '+'), el('button', { onClick: () => engine?.zoom(1.25), 'aria-label': 'Zoom out' }, '−'), el('button', { onClick: () => engine?.resetCamera() }, 'Reset view'), motionButton, readButton, qualitySelect));
  const footer = el('footer', { class: 'site-footer' }, el('p', {}, snapshot.profile.name.toUpperCase(), el('span', {}, 'Ideas become systems.')),
    el('div', {}, link('GitHub ↗', safeUrl(snapshot.profile.githubUrl)), link('Resume ↗', safeUrl(snapshot.profile.resumeUrl) || `${import.meta.env.BASE_URL}my_resume.pdf`), link('Portfolio Studio', '#/admin')),
    el('small', {}, '© 2026 · Made with curiosity & Three.js'));
  dialog = el('dialog', { class: 'detail-dialog', 'aria-labelledby': 'detail-title', onCancel: e => { e.preventDefault(); closeDetail(); }, onClick: e => { if (e.target === dialog) closeDetail(); } });
  publicShell = el('div', { class: 'public-shell' }, link('Skip to content', '#main-content', 'skip-link'), header, content,
    el('p', { id: 'app-status', role: 'status', class: 'app-status' }), footer, dialog);
  publicShell.querySelector('.skip-link').addEventListener('click', e => { e.preventDefault(); content.focus(); content.scrollIntoView(); });
  app.replaceChildren(publicShell);
}
function makeHero(world) {
  const hero = el('section', { class: `hero ${world === 'home' ? 'home-hero' : 'section-hero'}`, 'data-world':world });
  const number = String(Math.max(0, WORLDS.indexOf(world))).padStart(2, '0');
  const intro = el('div', { class: 'hero-copy' }, el('p', { class: 'eyebrow' }, el('span', { class: 'status-dot', 'aria-hidden': 'true' }),
    `${number} / ${world === 'home' ? 'AI / ML ENGINEER & SOFTWARE DEVELOPER' : world.toUpperCase()}`));
  if (world === 'home') {
    intro.append(el('h1', {}, 'Intelligence.', el('br'), el('span', { class: 'outline-type' }, 'Connected.')),
      el('p', { class: 'hero-description' }, 'Explore projects, skills and experience through my living 3D neural network.'),
      el('div', { class: 'hero-cta' }, link('Explore my work', '#/projects', 'button-primary'), link('About me ↗', '#/about', 'text-link')),
      el('div', { class: 'hero-footnote' }, el('span', {}, (snapshot.profile.location || '').toUpperCase()), el('span', {}, 'A PORTFOLIO IN THREE DIMENSIONS')));
  } else {
    intro.append(el('h1', {}, TITLES[world] || visibleRecords().find(r => r.type === 'section' && r.id === world)?.title || world), el('p', { class: 'hero-description' }, DESCRIPTIONS[world] || visibleRecords().find(r => r.type === 'section' && r.id === world)?.summary || 'Explore this collection and its connections.'));
    if (world === 'contact') intro.append(link('Say hello ↗', safeUrl(snapshot.profile.email ? 'mailto:' + snapshot.profile.email : snapshot.profile.emailUrl), 'button-primary'));
  }
  const rootLink = link('⌂ Main core', '#/home');
  rootLink.addEventListener('click',()=>{navigationToken++;if(route.world==='home'){engine?.select(null);engine?.resetCamera();}});
  const sceneWrap = el('div', { class: 'scene-wrap' }, el('span', { class: 'scene-coordinate', 'aria-hidden': 'true' }, `NEURAL NETWORK / ${world.toUpperCase()}`), sceneStage,
    el('div', { class: 'scene-caption' }, el('span', {}, 'CONNECTED / LIVE'), rootLink));
  branchContext=el('aside',{class:'network-context','aria-label':'Selected network branch',hidden:true});
  hero.append(intro, sceneWrap,branchContext);
  return hero;
}
function renderCards(world) {
  const records = visibleRecords().filter(r => ((TYPE_WORLD[r.type] || 'section') === world || snapshot.nodes.some(n => n.world === world && n.contentId === r.id)) && r.type !== 'category' && !(r.type === 'section' && WORLDS.includes(r.id)) && (world!=='skills'||r.type==='skill')).sort((a, b) => (a.order || 0) - (b.order || 0));
  if (world === 'home') {
    const chapters = [
      ['projects', 'Selected work', 'Applied AI · Computer vision · Web engineering'],
      ['skills', 'The toolkit', 'Technologies, methods and their connections'],
      ['experience', 'The journey', 'Research, engineering and collaboration'],
      ['education', 'Foundations', 'Learning that powers the work'],
      ...visibleRecords().filter(r => r.type === 'section' && !WORLDS.includes(r.id)).map(r => [r.id, r.title, r.summary])];
    return el('section', { class: 'home-index content-section', 'aria-labelledby': 'index-title' },
      el('div', { class: 'section-heading' }, el('div', {}, el('p', { class: 'eyebrow' }, 'FIND YOUR WAY'), el('h2', { id: 'index-title' }, 'Every connection tells a story.')), el('p', {}, 'Follow a node above, or start here.')),
      el('div', { class: 'chapter-list' }, ...chapters.map(([id, title, sub], i) =>
        el('a', { href: routeHref(id), class: 'chapter-link' }, el('span', {}, el('span', { class: 'chapter-no' }, `0${i + 1}`),
          el('span', { class: 'chapter-text' }, el('strong', {}, title), el('small', {}, sub))), el('span', { class: 'chapter-arrow', 'aria-hidden': 'true' }, '↗')))));
  }
  const body = el('div', { class: `record-grid ${world === 'experience' ? 'timeline-grid' : ''}` });
  const count = el('span', { class: 'record-count' });
  const draw = filter => {
    body.querySelectorAll('.media-gallery').forEach(gallery => gallery.disposeMedia?.());
    const found = records.filter(r => `${r.title} ${r.summary} ${(r.tags || []).join(' ')}`.toLowerCase().includes(filter.toLowerCase()));
    count.textContent = `${found.length} ${world === 'skills' ? 'technologies' : 'entries'}`;
    body.replaceChildren(...found.map((r, i) => {
      if (world === 'contact') return el('article', { class: 'contact-card' }, el('span', { class: 'record-number' }, `0${i + 1}`), el('h3', {}, r.title), el('p', {}, r.summary || r.subtitle || ''), ...(r.links || []).map(externalLink));
      return el('article', { class: `record-card type-${r.type}` },
        cardCover(r),
        el('div', { class: 'card-topline' }, el('span', { class: 'record-number' }, String(i + 1).padStart(2, '0')), el('span', {}, r.category || r.type)),
        el('h3', {}, link(r.title, recordHref(r))), el('p', { class: 'record-subtitle' }, r.subtitle || ''), el('p', { class: 'record-summary' }, r.summary || ''),
        el('div', { class: 'tags' }, ...(r.tags || []).slice(0, 5).map(t => el('span', {}, t))), link(world === 'skills' ? 'Explore connections ↗' : 'View details ↗', recordHref(r), 'card-link'));
    }));
    if (!found.length) body.append(el('p', { class: 'empty-state' }, filter ? 'No matches. Try another title or technology.' : 'There are no published entries in this collection yet.'));
  };
  draw('');
  const tools = el('div', { class: 'collection-tools' }, count);
  if (records.length > 2 && world !== 'contact') tools.append(el('label', { class: 'search-box' }, el('span', { class: 'sr-only' }, `Search ${world}`), el('input', { type: 'search', placeholder: `Search ${world}…`, onInput: e => draw(e.target.value) })));
  return el('section', { class: 'content-section', 'aria-label': `${world} collection` }, tools, body);
}
function cardCover(record) {
  const images = (record.media || []).filter(m => m.type === 'image' && m.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  const cover = images.find(m => m.id === record.coverMediaId) || images[0];
  if (!cover) return null;
  const gallery = mediaGallery([{ ...cover, caption: '' }]);
  gallery.classList.add('card-cover');
  gallery.setAttribute('aria-label', `${record.title} cover`);
  return gallery;
}
function closeDetail() {
  const selected=snapshot.records.find(r=>r.slug===route.slug||r.id===route.slug);
  const domain=route.world==='skills'&&selected?.type==='skill'?recordById(selected.category):null;
  go(route.world,domain?.slug);
}
function showSkillBranch(record){
  const domain=record.type==='category'?record:recordById(record.category);
  if(!domain)return;
  const domainNode=snapshot.nodes.find(n=>n.world==='skills'&&n.contentId===domain.id);
  if(engine?.branchId!==domainNode?.id)window.scrollTo({top:0,behavior:'instant'});
  engine?.setBranch(domainNode?.id);
  content.querySelector('.hero')?.classList.add('branch-active');
  content.querySelector('.hero')?.classList.toggle('branch-compact',engine?.nodes.size<=4);
  const count=snapshot.nodes.filter(n=>n.parentId===domainNode?.id).length;
  branchContext.hidden=false;
  branchContext.replaceChildren(el('p',{class:'eyebrow'},'IDENTITY → DOMAIN → TECHNOLOGY → APPLICATION'),el('h2',{},domain.title),el('p',{},`${count} ${count===1?'technology or capability':'technologies and capabilities'}. Select a node to inspect its documented connections.`),link('← All domains','#/skills','branch-back'));
}
function openDetail(record) {
  lastFocus = document.activeElement;
  if(route.world==='skills'&&!reading&&engine){
    showSkillBranch(record);
    if(record.type==='category'){engine?.setDetailOpen(false);engine?.select(snapshot.nodes.find(n=>n.world==='skills'&&n.contentId===record.id)?.id);document.title=`${record.title} — Deepak R V`;return;}
  }
  engine?.setDetailOpen(true);
  const links = (record.links || []).map(externalLink).filter(Boolean);
  const related = [...new Set([...(record.type==='skill'?[record.category]:[]),...(record.relatedIds || [])])].map(recordById).filter(Boolean);
  const fields = [['Organization', record.organization || record.employer], ['Role', record.role],
    ['Dates', [record.startDate, record.current ? 'Present' : record.endDate].filter(Boolean).join(' — ')],
    ['Location', record.location], ['Employment', record.employmentType], ['Qualification', record.qualification],
    ['Institution', record.institution], ['Specialization', record.specialization], ['Status', record.projectStatus], ['Collaboration', record.collaboration]].filter(([, v]) => v);
  const sections = [...(record.sections || [])];
  for (const [key, title] of [['problem', 'The problem'], ['goals', 'Goals'], ['approach', 'Approach'], ['implementation', 'Implementation'], ['results', 'Results'], ['responsibilities', 'Responsibilities'], ['achievements', 'Achievements'], ['description', 'In detail']]) {
    if (record[key] && !sections.some(s => s.content === record[key])) sections.push({ heading: title, ...(Array.isArray(record[key]) ? { bullets: record[key] } : { content: record[key] }) });
  }
  dialog.replaceChildren(el('div', { class: 'detail-topbar' }, el('span', { class: 'eyebrow' }, `${record.type.toUpperCase()} / ${record.category || 'THE DETAILS'}`),
    el('button', { class: 'close-detail', 'aria-label': 'Close details', onClick: closeDetail }, 'Close ×')),
    el('div', { class: 'detail-body' }, el('p', { class: 'eyebrow' }, record.subtitle || ''), el('h2', { id: 'detail-title' }, record.title),
      el('p', { class: 'detail-lead' }, record.summary || ''), el('div', { class: 'tags' }, ...(record.tags || []).map(t => el('span', {}, t))),
      fields.length ? el('dl', { class: 'record-facts' }, ...fields.map(([k, v]) => el('div', {}, el('dt', {}, k), el('dd', {}, v)))) : null,
      links.length ? el('div', { class: 'detail-links' }, ...links) : null, mediaGallery(record.media),
      ...sections.map(s => el('section', { class: 'detail-section' }, el('h3', {}, s.heading), s.content ? el('p', {}, s.content) : null,
        s.bullets?.length ? el('ul', {}, ...s.bullets.map(b => el('li', {}, b))) : null)),
      related.length ? el('section', { class: 'detail-section' }, el('h3', {}, 'Connected work & technologies'), el('div', { class: 'related-links' }, ...related.map(r => link(r.title + ' ↗', recordHref(r))))) : null));
  if (!dialog.open) { if(innerWidth<=800)dialog.showModal();else dialog.show(); }
  dialog.scrollTop = 0;
  const selectedNode=snapshot.nodes.find(n => n.contentId === record.id && n.world === route.world)?.id;
  if(selectedNode)engine?.focus(selectedNode);
  document.title = `${record.title} — Deepak R V`;
}
async function startScene() {
  if (reading || route?.world === 'admin') return;
  const token = ++sceneToken;
  sceneStage.replaceChildren(el('div', { class: 'scene-loading', role: 'status' }, 'Connecting the neural network…'));
  try {
    const { SceneEngine } = await import('./engine/SceneEngine.js');
    if (token !== sceneToken) return;
    sceneStage.replaceChildren();
    engine = new SceneEngine({ container: sceneStage,
      onSelect: async (id, node) => {
        const selection = ++navigationToken;
        if(id==='core'||id.endsWith('_root')) { if(route.world==='home'){engine?.select(null);engine?.resetCamera();}else go('home');return; }
        const selectedRecord=recordById(node?.contentId);
        if(route.world==='contact'&&selectedRecord?.type==='contact'){
          const url=safeUrl(selectedRecord.links?.[0]?.url);
          if(url)window.open(url,url.startsWith('mailto:')?'_self':'_blank','noopener,noreferrer');
          engine?.focus(id);return;
        }
        engine?.focus(id);
        if(motion)await new Promise(resolve=>setTimeout(resolve,480));
        if(selection!==navigationToken)return;
        const r = recordById(node?.contentId);
        if (r?.type === 'section' && !WORLDS.includes(r.id)) { go(r.id); return; }
        if (route.world === 'home') {
          const dest = node?.contentId || id;
          go(WORLDS.includes(dest) ? dest : (r ? TYPE_WORLD[r.type] || 'about' : 'about'));
        } else if (r) go(TYPE_WORLD[r.type] || 'section', r.slug || r.id);
        else if (node?.appearance?.geometry === 'core') go('home');
      },
      onStatus: ({ state, message }) => { if (state === 'error' || state === 'fallback') notify(message || '3D is unavailable. All portfolio content remains available below.'); }
    });
    engine.setData(snapshot); engine.setQuality(quality); engine.setMotion(motion); engine.setWorld(route.world);
    if (pendingNode) engine.select(pendingNode);
  } catch {
    sceneStage.replaceChildren(el('div', { class: 'scene-fallback' }, el('span', { 'aria-hidden': 'true' }, '◇'), el('h2', {}, 'The ideas are still here.'),
      el('p', {}, '3D could not start in this browser. Explore every project and connection below.'), el('button', { onClick: startScene }, 'Retry 3D')));
    notify('3D unavailable. The complete portfolio is available in the content below.');
  }
}
async function renderRoute() {
  const token = ++renderToken;
  const previous = route;
  route = parseRoute();
  if (route.world === 'admin') {
    publicShell?.querySelectorAll('.media-gallery').forEach(g => g.disposeMedia?.());
    sceneToken++; engine?.dispose(); engine = null;
    if (studioCleanup) return;
    app.replaceChildren(el('p', { class: 'app-loading', role: 'status' }, 'Opening Portfolio Studio…'));
    try {
      const { mountStudio } = await import('./studio.js');
      if (token !== renderToken) return;
      studioCleanup = await mountStudio(app, { store, snapshot, onExit: () => go('home') }) || (() => {});
    } catch (err) { app.replaceChildren(el('main', { class: 'fatal-error' }, el('h1', {}, 'Studio could not open'), el('p', {}, err.message), link('Return to portfolio', '#/home'))); }
    return;
  }
  if (studioCleanup) {
    studioCleanup(); studioCleanup = null; snapshot = await store.init(createSeed());
    if (token !== renderToken) return;
    publicShell = null; lastWorld = null;
  }
  if (!publicShell || !app.contains(publicShell)) makeShell();
  dialog.querySelectorAll('.media-gallery').forEach(gallery => gallery.disposeMedia?.());
  if (dialog.open) { dialog.close(); lastFocus?.focus?.(); }engine?.setDetailOpen(false);
  const customSection = visibleRecords().find(r => r.type === 'section' && (r.id === route.world || r.slug === route.world));
  const validWorld = WORLDS.includes(route.world) || route.world === 'section' || Boolean(customSection);
  if (!validWorld) {
    content.replaceChildren(el('section', { class: 'not-found' }, el('p', { class: 'eyebrow' }, '404 / CONNECTION NOT FOUND'), el('h1', {}, 'A little off the map.'),
      el('p', {}, 'This connection does not exist or has not been published.'), link('Back to the network', '#/home', 'button-primary')));
    lastWorld = null;
    return;
  }
  if (lastWorld !== route.world) {
    content.querySelectorAll('.media-gallery').forEach(g => g.disposeMedia?.());
    content.replaceChildren(makeHero(route.world), sceneControls, renderCards(route.world));
    publicShell.classList.toggle('on-home', route.world === 'home'); publicShell.classList.toggle('reading-mode', reading);
    for (const a of publicShell.querySelectorAll('.nav-link')) {
      if (a.hash === routeHref(route.world)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    }
    publicShell.querySelector('.primary-nav').classList.remove('nav-open');
    publicShell.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
    engine?.setWorld(route.world); lastWorld = route.world;
    if (previous) window.scrollTo({ top: 0, behavior: 'instant' });
    if (!engine) await startScene();
  }
  if (token !== renderToken) return;
  document.title = `${route.world === 'home' ? snapshot.profile.title : route.world[0].toUpperCase() + route.world.slice(1)} — ${snapshot.profile.name}`;
  if (route.slug) {
    const record = visibleRecords().find(r => (r.slug === route.slug || r.id === route.slug) && (TYPE_WORLD[r.type] || 'section') === route.world);
    if (record) { pendingNode = snapshot.nodes.find(n => n.contentId === record.id && n.world === route.world)?.id; openDetail(record); }
    else { notify('This entry is unavailable or has not been published.'); content.append(el('div', { class: 'route-error', role: 'alert' }, 'Entry not found. Explore the published entries above.')); }
  } else { pendingNode = null; engine?.select(null);engine?.setBranch(null);if(branchContext)branchContext.hidden=true;content.querySelector('.hero')?.classList.remove('branch-active','branch-compact'); if(previous?.slug && previous.world===route.world){engine?.resetCamera();window.scrollTo({top:0,behavior:'instant'});} }
}
window.addEventListener('keydown', event => {
  if(event.target.matches('input,textarea,select,[contenteditable]')||route?.world==='admin')return;
  if(event.key==='Escape'){navigationToken++;if(dialog?.open)closeDetail();else if(route?.world!=='home')go('home');else engine?.resetCamera();}
  if(event.key==='Home'){event.preventDefault();navigationToken++;if(route?.world==='home')engine?.resetCamera();else go('home');}
});
window.addEventListener('hashchange', () => { navigationToken++;renderRoute().catch(showFailure); });
window.addEventListener('popstate', () => { if (!location.hash) renderRoute().catch(showFailure); });
window.addEventListener('pagehide', () => { engine?.dispose(); studioCleanup?.(); });
window.addEventListener('pageshow', e => { if (e.persisted) { engine = null; studioCleanup = null; publicShell = null; lastWorld = null; renderRoute().catch(showFailure); } });
function showFailure(error) {
  app.replaceChildren(el('main', { class: 'fatal-error' }, el('h1', {}, 'The portfolio could not load'), el('p', {}, error.message || 'Please try again.'),
    el('button', { onClick: () => location.reload() }, 'Retry'), link('Download resume', safeUrl(snapshot.profile.resumeUrl) || `${import.meta.env.BASE_URL}my_resume.pdf`)));
}
try {
  snapshot = await store.init(snapshot); await renderRoute();
  if (store.lastError) notify('Live content is temporarily unavailable. Showing the bundled portfolio.');
} catch (error) { showFailure(error); }
