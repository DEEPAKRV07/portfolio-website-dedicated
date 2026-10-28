import './studio.css';
import { SceneEngine } from './engine/SceneEngine.js';
import { syncSkillRelationships } from './skillsGraph.js';
import { safeUrl, validateSnapshot } from './schema.js';
import { createMediaResolver } from './localMedia.js';

const TYPES = [
  ['project', 'Projects', '◈'], ['experience', 'Experience', '↗'], ['skill', 'Skills', '⌘'],
  ['category', 'Categories', '⊞'], ['education', 'Education', '▤'], ['about', 'About', '◎'],
  ['contact', 'Contact', '↗'], ['section', 'Custom sections', '▧'],
];
const WORLDS = ['home', 'about', 'projects', 'skills', 'experience', 'education', 'contact'];
const GEOMETRIES = ['neural-core', 'neural-node', 'neural-cluster', 'neural-chip', 'core', 'portal', 'monolith', 'chip', 'tower', 'archive', 'beacon'];
const MATERIALS = ['titanium', 'glass', 'emissive'];
const clone = (value) => JSON.parse(JSON.stringify(value));
const escape = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const id = (prefix) => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled';
const human = (value) => value ? value[0].toUpperCase() + value.slice(1) : '';
const selected = (a, b) => a === b ? ' selected' : '';
const options = (values, value) => values.map((item) => {
  const [key, label] = Array.isArray(item) ? item : [item, human(item)];
  return `<option value="${escape(key)}"${selected(key, value)}>${escape(label)}</option>`;
}).join('');
const button = (action, label, extra = '', className = '') => `<button type="button" class="studio-button ${className}" data-action="${action}" ${extra}>${label}</button>`;
const field = (label, name, value, opts = {}) => {
  const attrs = `${opts.scope ? `data-scope="${opts.scope}"` : ''} data-field="${name}" ${opts.index != null ? `data-index="${opts.index}"` : ''}`;
  const inputId = `studio-${opts.scope || 'record'}-${name}-${opts.index ?? ''}`;
  let control;
  if (opts.options) control = `<select id="${inputId}" ${attrs}>${options(opts.options, value)}</select>`;
  else if (opts.area) control = `<textarea id="${inputId}" ${attrs} rows="${opts.rows || 3}" maxlength="${opts.max || 12000}">${escape(value)}</textarea>`;
  else if (opts.type === 'checkbox') control = `<input id="${inputId}" type="checkbox" ${attrs} ${value ? 'checked' : ''}>`;
  else control = `<input id="${inputId}" type="${opts.type || 'text'}" ${attrs} value="${escape(value ?? '')}" ${opts.required ? 'required' : ''} ${opts.min != null ? `min="${opts.min}"` : ''} ${opts.max != null ? `max="${opts.max}"` : ''} ${opts.step != null ? `step="${opts.step}"` : ''} ${opts.placeholder ? `placeholder="${escape(opts.placeholder)}"` : ''} ${opts.type !== 'number' && opts.type !== 'color' ? `maxlength="${opts.maxLength || 240}"` : ''}>`;
  return `<div class="studio-field ${opts.wide ? 'studio-wide' : ''} ${opts.type === 'checkbox' ? 'studio-check' : ''}"><label for="${inputId}">${escape(label)}</label>${control}${opts.hint ? `<small>${escape(opts.hint)}</small>` : ''}</div>`;
};

/** The editor and the public portfolio share the same content snapshot and scene engine. */
export async function mountStudio(container, { store, snapshot, onExit = () => {} }) {
  let data = clone(store.getDraft?.() || snapshot);
  let currentType = 'project';
  let selectedId = data.records.find((record) => record.type === currentType)?.id || null;
  let mode = 'content';
  let tab = 'details';
  let query = '';
  let statusFilter = 'all';
  let world = 'projects';
  let nodeId = data.nodes.find((node) => node.world === world)?.id || null;
  let engine = null;
  const mediaResolver = createMediaResolver();
  const hydrateMedia = () => { container.querySelectorAll('[data-media-source]').forEach(element => { const source = safeUrl(element.dataset.mediaSource, { media: true }); if (source) mediaResolver.resolve(source).then(url => { if (element.isConnected) element.src = url; }).catch(() => { element.alt = 'Media missing from this browser. Reattach the file.'; }); }); };
  const mediaObserver = new MutationObserver(hydrateMedia);
  mediaObserver.observe(container, { childList: true, subtree: true });
  let disposed = false;
  let dirty = false;
  let revision = 0;
  let saveTimer;
  let saving = Promise.resolve();
  let dialog = null;
  let toastTimer;
  let undoStack = [];
  let redoStack = [];
  let capabilities = store.getCapabilities();

  container.classList.add('portfolio-studio');
  function record() { return data.records.find((item) => item.id === selectedId); }
  function node() { return data.nodes.find((item) => item.id === nodeId); }
  function worlds() { return [...new Set([...WORLDS, ...data.nodes.map((item) => item.world), ...data.records.filter(r => r.type === 'section').map(r => r.id)])]; }
  function notify(message, error = false) {
    if (disposed) return;
    let el = container.querySelector('.studio-toast');
    if (!el) { el = document.createElement('div'); el.className = 'studio-toast'; el.setAttribute('role', 'status'); container.append(el); }
    el.textContent = message;
    el.classList.toggle('is-error', error);
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, error ? 10000 : 5000);
  }
  function status(message) {
    const el = container.querySelector('[data-save-state]');
    if (el) el.textContent = message;
  }
  function historyButtons() {
    const undo = container.querySelector('[data-action="undo"]');
    const redo = container.querySelector('[data-action="redo"]');
    if (undo) undo.disabled = !undoStack.length;
    if (redo) redo.disabled = !redoStack.length;
  }
  function changed(change, { render = false, scene = true } = {}) {
    undoStack.push(captureEdit());
    if (undoStack.length > 60) undoStack.shift();
    redoStack = [];
    change();
    syncSkillRelationships(data);
    revision++;
    dirty = true;
    status('Unsaved changes');
    historyButtons();
    if (scene && engine) engine.setData(data);
    if (render) renderWorkspace();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => save(false), 1500);
  }
  function captureEdit() {
    return { data: clone(data), selectedId, currentType, mode, tab, world, nodeId, query, statusFilter };
  }
  async function save(explicit = true) {
    clearTimeout(saveTimer);
    const saveRevision = revision;
    const toSave = clone(data);
    status('Saving draft…');
    saving = saving.catch(() => {}).then(() => store.saveDraft(toSave));
    try {
      await saving;
      if (disposed) return;
      if (saveRevision === revision) { dirty = false; status('Draft saved'); }
      if (explicit) notify('Draft saved. Publish when you are ready to update the portfolio.');
      return true;
    } catch (error) {
      status('Draft not saved');
      notify(error.message || 'Could not save this draft. Export a backup and try again.', true);
      return false;
    }
  }
  function renderShell() {
    engine?.dispose();
    engine = null;
    capabilities = store.getCapabilities();
    if (capabilities.mode === 'supabase' && !capabilities.authenticated) { renderLogin(); return; }
    if (!capabilities.canEdit) { container.innerHTML = `<main class="studio-login"><div class="studio-login-card"><p class="studio-eyebrow">PORTFOLIO STUDIO</p><h1>Owner workspace</h1><p>Cloud editing is not configured for this deployment. Run the local development workspace to edit drafts, or configure Supabase authentication and publishing.</p>${button('exit', 'Back to portfolio')}</div></main>`; return; }
    container.innerHTML = `
      <header class="studio-topbar">
        <a class="studio-brand" href="#/admin" aria-label="Portfolio Studio"><span class="studio-mark">D<span>·</span></span><span>PORTFOLIO <b>STUDIO</b><small>CONTENT & SCENE WORKSPACE</small></span></a>
        <div class="studio-save-indicator"><i></i><span data-save-state>${dirty ? 'Unsaved changes' : 'Draft workspace'}</span></div>
        <div class="studio-toolbar">
          ${button('undo', '↶', 'aria-label="Undo last edit" title="Undo (Ctrl+Z)"')}
          ${button('redo', '↷', 'aria-label="Redo last edit" title="Redo (Ctrl+Shift+Z)"')}
          ${button('save', 'Save draft')}
          ${button('publish', 'Publish <span aria-hidden="true">↗</span>', '', 'studio-primary')}
          ${button('exit', 'View portfolio', '', 'studio-quiet')}
        </div>
      </header>
      <div class="studio-layout">
        <aside class="studio-sidebar" aria-label="Studio navigation">
          <p class="studio-eyebrow">WORKSPACE</p>
          <button type="button" class="studio-nav ${mode === 'content' ? 'active' : ''}" data-action="content"><span>▤</span> Content library <i>${data.records.length}</i></button>
          <button type="button" class="studio-nav ${mode === 'graph' ? 'active' : ''}" data-action="graph"><span>⌘</span> Scene & connections <i>${data.nodes.length}</i></button>
          <button type="button" class="studio-nav ${mode === 'profile' ? 'active' : ''}" data-action="profile"><span>◎</span> Identity & profile</button>
          <p class="studio-eyebrow studio-collection-heading">COLLECTIONS</p>
          <div class="studio-collections">${TYPES.map(([type, label, icon]) => `<button type="button" class="studio-nav ${mode === 'content' && currentType === type ? 'active' : ''}" data-action="collection" data-type="${type}"><span>${icon}</span>${label}<i>${data.records.filter((r) => r.type === type).length}</i></button>`).join('')}</div>
          <div class="studio-sidebar-bottom">
            ${button('versions', '◷ &nbsp; Version history', '', 'studio-full studio-quiet')}
            <div class="studio-backups">${button('export', 'Export backup', '', 'studio-quiet')}${button('import', 'Import', '', 'studio-quiet')}</div>
            <div class="studio-mode-label"><span>${capabilities.mode === 'supabase' ? '● CONNECTED WORKSPACE' : '◌ LOCAL WORKSPACE'}</span><p>${capabilities.mode === 'supabase' ? 'Owner session · changes sync through Supabase.' : 'Saved in this browser. Local publishing does not update the hosted website.'}</p></div>
            ${capabilities.authenticated ? button('logout', 'Sign out', '', 'studio-full studio-quiet') : ''}
          </div>
        </aside>
        <main class="studio-workspace" id="studio-workspace"></main>
      </div>
      <input type="file" accept="application/json,.json" data-import-file hidden>
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf" multiple data-media-file hidden>
      <div class="studio-toast" role="status" hidden></div>`;
    historyButtons();
    renderWorkspace();
  }
  function renderLogin() {
    container.innerHTML = `<div class="studio-login"><div class="studio-login-card"><span class="studio-mark">D<span>·</span></span><p class="studio-eyebrow">PORTFOLIO STUDIO</p><h1>Your creative<br>control room.</h1><p>Sign in with the authorized owner account to manage your published portfolio.</p><form data-login-form><label for="studio-email">Email</label><input id="studio-email" name="email" type="email" autocomplete="username" required><label for="studio-password">Password</label><input id="studio-password" name="password" type="password" autocomplete="current-password" required minlength="6"><button class="studio-button studio-primary" type="submit">Sign in to Studio ↗</button></form><p class="studio-login-feedback" role="status"></p>${button('exit', '← Back to portfolio', '', 'studio-quiet')}<small>Only accounts authorized by the database access policy can change content.</small></div></div>`;
  }
  function renderWorkspace() {
    const main = container.querySelector('.studio-workspace');
    if (!main) return;
    engine?.dispose();
    engine = null;
    container.querySelectorAll('.studio-sidebar .studio-nav').forEach((item) => {
      const action = item.dataset.action;
      item.classList.toggle('active', action === mode || (action === 'collection' && mode === 'content' && item.dataset.type === currentType));
    });
    if (mode === 'graph') { renderGraph(main); return; }
    if (mode === 'profile') { renderProfile(main); return; }
    const records = filteredRecords();
    if (!selectedId || !data.records.some((item) => item.id === selectedId && item.type === currentType)) selectedId = records[0]?.id || null;
    main.innerHTML = `<div class="studio-page-heading"><div><p class="studio-eyebrow">CURATE YOUR PORTFOLIO</p><h1>${TYPES.find(([type]) => type === currentType)[1]}<span>${data.records.filter((r) => r.type === currentType).length}</span></h1><p>Shape the stories behind your work.</p></div>${button('new', '+ New ' + currentType, '', 'studio-primary')}</div>
      <div class="studio-content-grid">
        <section class="studio-records" aria-label="Content collection">
          <label class="studio-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Find a ${currentType}…" aria-label="Search collection" value="${escape(query)}" data-search></label>
          <label class="studio-filter"><span>Status</span><select data-status-filter>${options([['all', 'All records'], ['published', 'Published'], ['draft', 'Draft'], ['archived', 'Archived']], statusFilter)}</select></label>
          <div class="studio-record-list" data-record-list>${renderRecordList(records)}</div>
          <p class="studio-list-note">Changes are saved as drafts.<br>Publish to update the portfolio.</p>
        </section>
        <section class="studio-editor" aria-label="Record editor">${renderRecord()}</section>
      </div>`;
  }
  function filteredRecords() {
    return data.records.filter((r) => r.type === currentType && (statusFilter === 'all' || r.status === statusFilter) && `${r.title} ${r.subtitle} ${(r.tags || []).join(' ')}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  function renderRecordList(records = filteredRecords()) {
    return records.length ? records.map((item, index) => `<button type="button" class="studio-record ${selectedId === item.id ? 'selected' : ''}" data-action="select-record" data-id="${escape(item.id)}"><span class="studio-record-number">${String(index + 1).padStart(2, '0')}</span><span><strong>${escape(item.title)}</strong><small>${escape(item.subtitle || item.summary?.slice(0, 65) || human(item.type))}</small><em class="studio-badge ${item.status}">${escape(item.status)}</em></span><span class="studio-record-arrow" aria-hidden="true">↗</span></button>`).join('') : `<div class="studio-empty"><span>◈</span><h3>No matching records</h3><p>Create a ${currentType} or change your search.</p></div>`;
  }
  function refreshRecordList() {
    const list = container.querySelector('[data-record-list]');
    if (list) list.innerHTML = renderRecordList();
  }
  function renderRecord() {
    const item = record();
    if (!item) return `<div class="studio-empty studio-empty-large"><span>＋</span><h2>A new story starts here.</h2><p>Add your first ${currentType} to the collection.</p>${button('new', 'Create ' + currentType, '', 'studio-primary')}</div>`;
    return `<div class="studio-editor-heading"><div><p class="studio-eyebrow">${escape(item.type)} / ${escape(item.status)}</p><h2 data-record-title>${escape(item.title)}</h2></div><div class="studio-record-actions">${button('record-up', '↑', 'aria-label="Move record earlier" title="Move earlier"')}${button('record-down', '↓', 'aria-label="Move record later" title="Move later"')}${button('duplicate', 'Duplicate')}${button(item.status === 'archived' ? 'restore-record' : 'archive', item.status === 'archived' ? 'Restore' : 'Archive')}${button('delete-record', 'Delete', '', 'studio-danger')}</div></div>
      <div class="studio-tabs" role="tablist" aria-label="Record editing sections">${[['details', 'Details'], ['media', `Media (${item.media?.length || 0})`], ['relations', 'Relations & scene']].map(([key, label]) => `<button type="button" role="tab" aria-selected="${tab === key}" class="${tab === key ? 'active' : ''}" data-action="tab" data-tab="${key}">${label}</button>`).join('')}</div>
      <div class="studio-form-body" role="tabpanel">${tab === 'media' ? renderMedia(item) : tab === 'relations' ? renderRelations(item) : renderDetails(item)}</div>`;
  }
  function renderDetails(item) {
    let specialized = '';
    const textFields = {
      project: [['role', 'Your role'], ['year', 'Year'], ['organization', 'Organization / client']],
      experience: [['role', 'Role'], ['organization', 'Company / organization'], ['location', 'Location'], ['startDate', 'Start date'], ['endDate', 'End date (YYYY-MM or blank)']],
      skill: [['category', 'Category'], ['proficiency', 'Proficiency / focus']],
      category: [],
      education: [['qualification', 'Degree / qualification'], ['institution', 'Institution'], ['location', 'Location'], ['startDate', 'Start date'], ['endDate', 'End date'], ['grade', 'Grade / result']],
      about: [['role', 'Headline'], ['location', 'Location']],
      contact: [['contactType', 'Channel / contact type']],
      section: [],
    };
    specialized = (textFields[item.type] || []).map(([key, label]) => field(label, key, item[key],key==='category'&&item.type==='skill'?{options:[['','Choose a domain'],...data.records.filter(r=>r.type==='category').map(r=>[r.id,r.title])]}:{})).join('');
    return `<div class="studio-fields">${field('Title', 'title', item.title, { required: true, wide: true, maxLength: 160 })}${field('Subtitle', 'subtitle', item.subtitle, { wide: true })}${field('URL slug', 'slug', item.slug, { required: true, hint: 'Stable, lowercase URL identifier.' })}${field('Publication status', 'status', item.status, { options: ['published', 'draft', 'archived'] })}${field('Summary', 'summary', item.summary, { area: true, wide: true, rows: 5 })}${specialized}${field('Tags / technologies', 'tags', (item.tags || []).join(', '), { wide: true, maxLength: 1000, hint: 'Separate tags with commas.' })}${field('Featured record', 'featured', item.featured, { type: 'checkbox' })}${item.type === 'experience' ? field('Current role', 'current', item.current, { type: 'checkbox' }) + field('Employment type', 'employmentType', item.employmentType || '') : ''}${item.type === 'project' ? field('Project status', 'projectStatus', item.projectStatus || '') : ''}</div>
      <div class="studio-section-heading"><div><h3>Story sections</h3><p>Build a readable case study with text and bullet points.</p></div>${button('add-section', '+ Section')}</div>
      <div class="studio-structured">${(item.sections || []).map((section, index) => `<div class="studio-subcard"><div class="studio-subcard-heading"><span>SECTION ${String(index + 1).padStart(2, '0')}</span><div>${button('section-up', '↑', `data-index="${index}" aria-label="Move section earlier"`)}${button('section-down', '↓', `data-index="${index}" aria-label="Move section later"`)}${button('remove-section', 'Remove', `data-index="${index}"`, 'studio-quiet')}</div></div>${field('Heading', 'heading', section.heading, { scope: 'section', index })}${field('Content', 'content', section.content, { scope: 'section', index, area: true, rows: 4 })}${field('Bullet points', 'bullets', (section.bullets || []).join('\n'), { scope: 'section', index, area: true, hint: 'One bullet per line.' })}</div>`).join('') || '<p class="studio-hint">No sections yet. Add context, outcomes, or implementation details.</p>'}</div>
      <div class="studio-section-heading"><div><h3>Links & resources</h3><p>Live websites, repositories, demos, and documents.</p></div>${button('add-link', '+ Link')}</div>
      ${(item.links || []).map((link, index) => `<div class="studio-link-row">${field('Label', 'label', link.label, { scope: 'link', index })}${field('URL', 'url', link.url, { scope: 'link', index, placeholder: 'https://…', maxLength: 2048 })}${button('remove-link', '×', `data-index="${index}" aria-label="Remove link ${index + 1}"`, 'studio-quiet')}</div>`).join('') || '<p class="studio-hint">Add a destination visitors can explore.</p>'}`;
  }
  function renderMedia(item) {
    return `<div class="studio-section-heading"><div><h3>Media library</h3><p>Images, video, and documents that bring this story to life.</p></div>${button('upload', '↑ Upload files', '', 'studio-primary')}</div>
      <p class="studio-hint">${escape(capabilities.storageMessage || 'JPEG, PNG, WebP, GIF, MP4, WebM, and PDF. Upload limits depend on workspace storage.')}</p>
      <div class="studio-media-add"><label for="studio-new-media-type">Media type</label><select id="studio-new-media-type" data-new-media-type>${options(['image', 'video', 'document'], 'image')}</select><label for="studio-new-media-url">Media URL</label><input id="studio-new-media-url" type="url" placeholder="https://example.com/image.webp" data-new-media-url>${button('add-media-url', '+ Attach URL')}</div>
      <div class="studio-media-grid">${(item.media || []).map((media, index) => {
        const url = safeUrl(media.url, { media: true });
        const cover = item.coverMediaId === media.id || (!item.coverMediaId && index === 0);
        return `<article class="studio-media-card"><div class="studio-media-preview">${media.type === 'image' && url ? `<img data-media-source="${escape(url)}" alt="${escape(media.alt || '')}" loading="lazy">` : `<span>${media.type === 'video' ? '▷' : '▤'}</span><small>${escape(media.type)}</small>`}${cover ? '<b>COVER</b>' : ''}</div><div class="studio-media-fields">${field('Accessible description', 'alt', media.alt, { scope: 'media', index })}${field('Caption', 'caption', media.caption, { scope: 'media', index })}${media.type === 'video' ? field('Poster image URL', 'poster', media.poster || '', { scope: 'media', index, maxLength: 2048 }) : ''}${field('Media title', 'title', media.title || media.name || '', { scope: 'media', index })}${field('Show media', 'visible', media.visible !== false, { scope: 'media', index, type: 'checkbox' })}${field('Source URL', 'url', media.url?.startsWith('data:') ? '' : media.url, { scope: 'media', index, placeholder: media.url?.startsWith('data:') ? 'Uploaded file stored in this browser' : 'https://…', maxLength: 2048 })}<div class="studio-media-actions">${button('cover-media', cover ? '✓ Cover' : 'Set cover', `data-index="${index}" ${media.type !== 'image' ? 'disabled' : ''}`, cover ? 'studio-accent' : '')}${button('media-up', '↑', `data-index="${index}" aria-label="Move media earlier"`)}${button('media-down', '↓', `data-index="${index}" aria-label="Move media later"`)}${button('remove-media', 'Remove', `data-index="${index}"`, 'studio-quiet')}</div></div></article>`;
      }).join('') || '<div class="studio-empty"><span>▧</span><h3>Your story, in pictures.</h3><p>Upload media or attach a hosted file URL.</p></div>'}</div>`;
  }
  function renderRelations(item) {
    const related = data.records.filter((r) => (item.relatedIds || []).includes(r.id));
    const available = data.records.filter((r) => r.id !== item.id && !(item.relatedIds || []).includes(r.id) && r.status !== 'archived');
    const nodes = data.nodes.filter((n) => n.contentId === item.id);
    return `<div class="studio-section-heading"><div><h3>Connected content</h3><p>Associate skills, projects, experience, and related stories.</p></div></div><div class="studio-inline-controls"><label for="studio-related-record">Related record</label><select id="studio-related-record" data-related-record>${options(available.map((r) => [r.id, `${human(r.type)} · ${r.title}`]), '')}</select>${button('add-relation', '+ Connect', available.length ? '' : 'disabled')}</div><div class="studio-related-list">${related.map((r) => `<div><span><small>${escape(r.type)}</small><strong>${escape(r.title)}</strong></span>${button('remove-relation', '×', `data-id="${escape(r.id)}" aria-label="Remove relation to ${escape(r.title)}"`, 'studio-quiet')}</div>`).join('') || '<p class="studio-hint">No related records. Connect a skill to show the technology behind a project.</p>'}</div><div class="studio-section-heading"><div><h3>Scene presence</h3><p>Each node places this record inside an explorable world.</p></div>${button('add-record-node', '+ Create node')}</div>${nodes.map((n) => `<div class="studio-node-summary"><span><small>${escape(n.world)} WORLD</small><strong>${escape(n.label)}</strong></span><em>${n.visible === false ? 'Hidden' : 'Visible'}</em>${button('open-node', 'Edit in scene ↗', `data-id="${escape(n.id)}"`)}</div>`).join('') || '<p class="studio-hint">This record has no scene node. It remains available in the content collection.</p>'}`;
  }
  function renderProfile(main) {
    const profile = data.profile || {};
    main.innerHTML = `<div class="studio-page-heading"><div><p class="studio-eyebrow">THE PERSON BEHIND THE WORK</p><h1>Identity & profile</h1><p>Your introduction, contact details, and resume.</p></div></div><section class="studio-profile-card"><div class="studio-fields">${field('Display name', 'name', profile.name, { scope: 'profile', required: true, wide: true })}${field('Professional headline', 'title', profile.title, { scope: 'profile', wide: true })}${field('Short introduction', 'summary', profile.summary, { scope: 'profile', area: true, wide: true, rows: 5 })}${field('Email', 'email', profile.email, { scope: 'profile', type: 'email' })}${field('Location', 'location', profile.location, { scope: 'profile' })}${field('GitHub URL', 'githubUrl', profile.githubUrl, { scope: 'profile' })}${field('LinkedIn URL', 'linkedinUrl', profile.linkedinUrl, { scope: 'profile' })}${field('Resume URL', 'resumeUrl', profile.resumeUrl, { scope: 'profile', wide: true, hint: 'Use a PDF URL or an existing public asset path.' })}</div></section>`;
  }
  function renderGraph(main) {
    if (!nodeId || !data.nodes.some((n) => n.id === nodeId && n.world === world)) nodeId = data.nodes.find((n) => n.world === world)?.id || null;
    main.innerHTML = `<div class="studio-page-heading"><div><p class="studio-eyebrow">DESIGN YOUR CONSTELLATION</p><h1>Scene & connections</h1><p>Arrange the same world your visitors explore.</p></div>${button('add-node', '+ Add node', '', 'studio-primary')}</div>
      <div class="studio-scene-toolbar"><label for="studio-world">World</label><select id="studio-world" data-world>${options(worlds(), world)}</select><label for="studio-layout">Layout</label><select id="studio-layout" data-layout>${options(['network', 'radial', 'hierarchical', 'timeline', 'force', 'manual'], data.settings.layouts[world] || 'radial')}</select>${button('recalculate', 'Recalculate')}${button('reset-layout', 'Reset positions')}${button('reset-camera', 'Frame scene')}</div>
      <div class="studio-graph-grid"><section class="studio-scene-panel" aria-label="Interactive scene preview"><div class="studio-scene-canvas"></div><div class="studio-scene-caption"><span><i></i> LIVE SCENE PREVIEW</span><p data-scene-status>Loading scene…</p><small>Drag a node to place it. Drag empty space to orbit. Scroll to zoom.</small></div><div class="studio-scene-nodes"><label for="studio-node-picker">Selected node</label><select id="studio-node-picker" data-node-picker><option value="">Choose a node</option>${options(data.nodes.filter((n) => n.world === world).map((n) => [n.id, n.label || n.id]), nodeId)}</select></div></section><aside class="studio-node-inspector" aria-label="Scene node inspector">${renderNode()}</aside></div>`;
    try {
      engine = new SceneEngine({
        container: main.querySelector('.studio-scene-canvas'),
        editable: true,
        onSelect: (nextId) => { nodeId = nextId; refreshNodeInspector(); },
        onStatus: ({ message }) => { const el = container.querySelector('[data-scene-status]'); if (el) el.textContent = message; },
        onMove: (nextId, position) => {
          changed(() => {
            const moved = data.nodes.find((n) => n.id === nextId);
            if (moved) moved.layout = { mode: 'manual', position: position.map((v) => Math.round(v * 100) / 100) };
            nodeId = nextId;
          });
          refreshNodeInspector();
        },
      });
      engine.setData(data);
      engine.setWorld(world);
      if (nodeId) selectPreviewNode();
    } catch (error) {
      main.querySelector('[data-scene-status]').textContent = `Scene preview unavailable: ${error.message}. You can still edit all positions and connections below.`;
    }
  }
  function refreshNodeInspector() {
    const inspector = container.querySelector('.studio-node-inspector');
    if (inspector) inspector.innerHTML = renderNode();
    const picker = container.querySelector('[data-node-picker]');
    if (picker) picker.value = nodeId || '';
    selectPreviewNode();
  }
  function selectPreviewNode(){
    const item=node();
    if(item?.world==='skills'){
      const parent=data.nodes.find(n=>n.id===item.parentId);
      const domain=item.graphRole==='domain'?item:item.graphRole==='technology'?parent:data.nodes.find(n=>n.id===parent?.parentId);
      engine?.setBranch(domain?.graphRole==='domain'?domain.id:null);
    }
    engine?.select(nodeId);
  }
  function renderNode() {
    const item = node();
    if (!item) return `<div class="studio-empty"><span>⌘</span><h3>Select a node</h3><p>Choose an object in the preview or add a node to this world.</p></div>`;
    const positions = item.layout?.position || [0, 0, 0];
    const attached = data.edges.filter((edge) => edge.source === item.id || edge.target === item.id);
    const peerNodes = data.nodes.filter((n) => n.id !== item.id && n.world === item.world);
    return `<div class="studio-inspector-title"><p class="studio-eyebrow">NODE INSPECTOR</p><h2>${escape(item.label)}</h2><code>${escape(item.id)}</code></div><div class="studio-node-form">
      ${field('Label', 'label', item.label, { scope: 'node', required: true })}
      ${field('Content record', 'contentId', item.contentId, { scope: 'node', options: data.records.map((r) => [r.id, r.title]) })}
      <div class="studio-fields">${field('World', 'world', item.world, { scope: 'node', options: worlds() })}${field('Parent node', 'parentId', item.parentId || '', { scope: 'node', options: [['', 'No parent'], ...peerNodes.map((n) => [n.id, `${n.world} · ${n.label}`])] })}</div>
      <h3>Position</h3>
      ${item.world==='home'?`<div class="studio-fields">${field('Network layer', 'networkLayer', item.networkLayer??2, {scope:'node',options:[['0','Input'],['1','Hidden / synthesis'],['2','Output']]})}${field('Order within layer','networkOrder',item.networkOrder??0,{scope:'node',type:'number',min:0,max:999,step:1})}</div><p class="studio-hint">Automatic Home positions follow these layers. Connections and destinations remain editable below.</p>`:''}
      ${field('Placement', 'layout.mode', item.layout?.mode || 'auto', { scope: 'node', options: [['auto', 'Automatic layout'], ['manual', 'Manual override']] })}
      <div class="studio-coordinates">${['X', 'Y', 'Z'].map((axis, i) => field(axis, `position.${i}`, positions[i], { scope: 'node', type: 'number', min: -100, max: 100, step: 0.1 })).join('')}</div><p class="studio-hint">${item.layout?.mode === 'manual' ? 'Manual coordinates override automatic layout.' : 'Automatic layout controls placement. Editing coordinates creates an override.'}</p>
      <h3>Appearance</h3><div class="studio-fields">${field('Geometry', 'appearance.geometry', item.appearance?.geometry || 'monolith', { scope: 'node', options: GEOMETRIES })}${field('Material', 'appearance.material', item.appearance?.material || 'titanium', { scope: 'node', options: MATERIALS })}${field('Accent color', 'appearance.color', item.appearance?.color || '#76f4ca', { scope: 'node', type: 'color' })}${field('Scale', 'appearance.size', item.appearance?.size || 1, { scope: 'node', type: 'number', min: 0.3, max: 4, step: 0.1 })}${field('Show label', 'appearance.labelVisible', item.appearance?.labelVisible !== false, { scope: 'node', type: 'checkbox' })}${field('Visible in scene', 'visible', item.visible !== false, { scope: 'node', type: 'checkbox' })}${field('Label position', 'appearance.labelPosition', item.appearance?.labelPosition || 'above', { scope: 'node', options: ['above', 'below'] })}</div>
      <h3>Motion</h3><div class="studio-fields">${field('Entrance', 'animation.entrance', item.animation?.entrance || 'rise', { scope: 'node', options: ['rise', 'fade', 'scale', 'none'] })}${field('Hover', 'animation.hover', item.animation?.hover || 'glow', { scope: 'node', options: ['glow', 'lift', 'none'] })}${field('Duration (seconds)', 'animation.duration', item.animation?.duration ?? 0.7, { scope: 'node', type: 'number', min: 0.1, max: 3, step: 0.1 })}</div>
      <div class="studio-section-heading"><div><h3>Connections <small>${attached.length}</small></h3></div>${button('add-edge', '+ Edge')}</div>
      ${attached.map((edge) => `<div class="studio-edge-card"><div class="studio-subcard-heading"><span>${escape(edge.id.slice(0, 18))}</span>${button('remove-edge', '×', `data-id="${escape(edge.id)}" aria-label="Delete connection"`, 'studio-quiet')}</div>${field('From', 'source', edge.source, { scope: 'edge', index: data.edges.indexOf(edge), options: data.nodes.filter(n => n.world === item.world).map((n) => [n.id, n.label]) })}${field('To', 'target', edge.target, { scope: 'edge', index: data.edges.indexOf(edge), options: data.nodes.filter(n => n.world === item.world).map((n) => [n.id, n.label]) })}<div class="studio-fields">${field('Style', 'style', edge.style || 'line', { scope: 'edge', index: data.edges.indexOf(edge), options: ['line', 'tube', 'ribbon'] })}${field('Directed', 'directed', edge.directed, { scope: 'edge', index: data.edges.indexOf(edge), type: 'checkbox' })}</div></div>`).join('') || '<p class="studio-hint">No connected edges yet.</p>'}
      ${button('delete-node', 'Remove node', '', 'studio-danger studio-full')}
      </div>`;
  }
  function showDialog(title, body, actions = []) {
    closeDialog();
    dialog = document.createElement('dialog');
    dialog.className = 'studio-dialog';
    dialog.setAttribute('aria-labelledby', 'studio-dialog-title');
    dialog.innerHTML = `<div class="studio-dialog-heading"><h2 id="studio-dialog-title">${escape(title)}</h2>${button('close-dialog', '×', 'aria-label="Close dialog"', 'studio-quiet')}</div><div class="studio-dialog-body">${body}</div><div class="studio-dialog-actions">${button('close-dialog', 'Cancel')}${actions.map(({ action, label, primary = false }) => button(action, label, '', primary ? 'studio-primary' : '')).join('')}</div>`;
    container.append(dialog);
    const openedDialog = dialog;
    dialog.addEventListener('close', () => { openedDialog.remove(); if (dialog === openedDialog) dialog = null; });
    dialog.showModal();
  }
  function closeDialog() { if (dialog) { dialog.close(); dialog?.remove(); dialog = null; } }
  function newRecord(type = currentType) {
    const item = { id: id(type), slug: '', type, title: `Untitled ${type}`, subtitle: '', summary: '', sections: [], tags: [], links: [], media: [], relatedIds: [], status: 'draft', order: data.records.filter((r) => r.type === type).length };
    item.slug = `${slugify(item.title)}-${item.id.slice(-6)}`;
    changed(() => { data.records.push(item); selectedId = item.id; currentType = type; mode = 'content'; tab = 'details'; query = ''; statusFilter = 'all'; }, { render: true });
    container.querySelector('[data-field="title"]')?.focus();
  }
  function addNode(contentId, nodeWorld = world) {
    const content = data.records.find((r) => r.id === contentId);
    if (!content) throw new Error('Choose an existing content record first.');
    const item = {
      id: id('node'), contentId, world: nodeWorld, label: content.title, parentId: null,
      layout: { mode: 'auto', position: null },
      appearance: { geometry: content.type === 'skill' ? 'neural-chip' : content.type === 'section' ? 'neural-core' : 'neural-node', material: 'titanium', color: '#76f4ca', size: 1, labelVisible: true, labelPosition: 'below' },
      animation: { entrance: 'rise', hover: 'glow', duration: 0.7 }, visible: true,
    };
    if(nodeWorld==='skills'&&['skill','category'].includes(content.type)){
      const parent=data.nodes.find(n=>n.world==='skills'&&(content.type==='category'?n.graphRole==='identity':n.graphRole==='domain'&&n.contentId===content.category));
      if(!parent)throw new Error('Choose a domain in the skill Details before creating its scene node.');
      item.graphRole=content.type==='category'?'domain':'technology';item.parentId=parent.id;
    }
    changed(() => { data.nodes.push(item); nodeId = item.id; }, { render: true });
    return item;
  }
  function moveArray(array, index, delta) {
    const target = index + delta;
    if (target < 0 || target >= array.length) return;
    [array[index], array[target]] = [array[target], array[index]];
  }
  function removeSceneNodes(ids){
    const removed=new Set(ids);let count;
    do{count=removed.size;for(const n of data.nodes)if(['domain','technology'].includes(n.graphRole)&&removed.has(n.parentId))removed.add(n.id);}while(removed.size!==count);
    data.nodes=data.nodes.filter(n=>!removed.has(n.id));
    for(const n of data.nodes)if(removed.has(n.parentId))n.parentId=null;
    data.edges=data.edges.filter(e=>!removed.has(e.source)&&!removed.has(e.target));
  }
  function changeField(target) {
    if (!target.checkValidity()) { target.reportValidity(); return; }
    const key = target.dataset.field;
    const scope = target.dataset.scope || 'record';
    const index = Number(target.dataset.index);
    let value = target.type === 'checkbox' ? target.checked : target.type === 'number' ? Number(target.value) : target.value;
    if(key==='networkLayer')value=Number(value);
    if ((key === 'url' || key === 'resumeUrl' || key === 'githubUrl' || key === 'linkedinUrl' || key === 'poster') && value && !safeUrl(value, { media: scope === 'media' })) {
      target.setCustomValidity('Use an https URL, a valid contact link, or a safe local asset path.');
      target.reportValidity();
      target.addEventListener('input', () => target.setCustomValidity(''), { once: true });
      return;
    }
    if (scope === 'record' && key === 'slug') {
      value = slugify(value);
      if (data.records.some((r) => r.id !== selectedId && r.slug === value)) { notify('That URL slug is already in use. Choose a unique slug.', true); return; }
      target.value = value;
    }
    if (scope === 'edge') {
      const edge = data.edges[index];
      if ((key === 'source' && value === edge.target) || (key === 'target' && value === edge.source)) { notify('A connection needs two different nodes.', true); target.value = edge[key]; return; }
    }
    changed(() => {
      let item = scope === 'profile' ? (data.profile ||= {}) : scope === 'node' ? node() : scope === 'edge' ? data.edges[index] : scope === 'section' ? record().sections[index] : scope === 'link' ? record().links[index] : scope === 'media' ? record().media[index] : record();
      if (!item) return;
      if (key === 'tags') value = [...new Set(value.split(',').map((tag) => tag.trim()).filter(Boolean))];
      if (key === 'bullets') value = value.split('\n').map((bullet) => bullet.trim()).filter(Boolean);
      if (key.startsWith('position.')) {
        item.layout = { mode: 'manual', position: [...(item.layout?.position || [0, 0, 0])] };
        item.layout.position[Number(key.split('.')[1])] = value;
      } else if (key.includes('.')) {
        const [parent, child] = key.split('.');
        item[parent] ||= {};
        item[parent][child] = value;
        if (key === 'layout.mode') item.layout.position = value === 'auto' ? null : item.layout.position || [0, 0, 0];
      } else item[key] = key === 'parentId' && !value ? null : value;
      if(scope==='node'&&key==='parentId'&&item.graphRole==='technology'){
        const parent=data.nodes.find(n=>n.id===value&&n.graphRole==='domain');
        if(parent)data.records.find(r=>r.id===item.contentId).category=parent.contentId;
      }
      if (scope === 'media' && key === 'url') item.name = value.split('/').pop();
    });
    if (scope === 'record') {
      refreshRecordList();
      const heading = container.querySelector('[data-record-title]');
      if (heading && key === 'title') heading.textContent = value;
    }
    if (scope === 'node' && (key === 'world' || key === 'layout.mode' || key.startsWith('position.'))) {
      if (key === 'world') { world = value; renderWorkspace(); } else refreshNodeInspector();
    }
  }
  async function handleAction(action, target) {
    const index = Number(target.dataset.index);
    const item = record();
    switch (action) {
      case 'exit': if (dirty && !(await save())) break; onExit(); break;
      case 'content': mode = 'content'; renderWorkspace(); break;
      case 'graph': mode = 'graph'; renderWorkspace(); break;
      case 'profile': mode = 'profile'; renderWorkspace(); break;
      case 'collection': currentType = target.dataset.type; mode = 'content'; selectedId = null; query = ''; statusFilter = 'all'; tab = 'details'; renderWorkspace(); break;
      case 'select-record': selectedId = target.dataset.id; tab = 'details'; refreshRecordList(); container.querySelector('.studio-editor').innerHTML = renderRecord(); break;
      case 'tab': tab = target.dataset.tab; container.querySelector('.studio-editor').innerHTML = renderRecord(); break;
      case 'new': newRecord(); break;
      case 'duplicate': {
        const copy = clone(item); copy.id = id(item.type); copy.title = `${item.title} (copy)`; copy.slug = `${item.slug}-copy-${copy.id.slice(-6)}`; copy.status = 'draft'; copy.order = data.records.filter((r) => r.type === currentType).length;
        changed(() => { data.records.push(copy); selectedId = copy.id; }, { render: true }); break;
      }
      case 'archive': changed(() => { item.status = 'archived'; }, { render: true }); break;
      case 'restore-record': changed(() => { item.status = 'draft'; }, { render: true }); break;
      case 'delete-record': showDialog('Delete this record?', `<p><strong>${escape(item.title)}</strong> and its scene nodes will be removed from this draft. Related connections will be cleaned up. You can undo this change before leaving Studio.</p>`, [{ action: 'confirm-delete-record', label: 'Delete record' }]); break;
      case 'confirm-delete-record': {
        const removedNodes = data.nodes.filter((n) => n.contentId === selectedId || (item.type === 'section' && n.world === selectedId)).map((n) => n.id);
        closeDialog();
        changed(() => {
          data.records = data.records.filter((r) => r.id !== selectedId).map((r) => ({ ...r, relatedIds: (r.relatedIds || []).filter((relation) => relation !== selectedId) }));
          removeSceneNodes(removedNodes);
          data.edges = data.edges.filter((e) => !removedNodes.includes(e.source) && !removedNodes.includes(e.target));
          if (item.type === 'section') { delete data.settings.layouts[selectedId]; if (world === selectedId) world = 'home'; }
          selectedId = null;
        }, { render: true }); break;
      }
      case 'record-up':
      case 'record-down': {
        const collection = data.records.filter((r) => r.type === currentType).sort((a, b) => (a.order || 0) - (b.order || 0));
        changed(() => { moveArray(collection, collection.indexOf(item), action === 'record-up' ? -1 : 1); collection.forEach((r, i) => { r.order = i; }); }, { render: true }); break;
      }
      case 'add-section': changed(() => { item.sections.push({ heading: 'New section', content: '', bullets: [] }); }, { render: true }); break;
      case 'remove-section': changed(() => { item.sections.splice(index, 1); }, { render: true }); break;
      case 'section-up':
      case 'section-down': changed(() => moveArray(item.sections, index, action === 'section-up' ? -1 : 1), { render: true }); break;
      case 'add-link': changed(() => { item.links.push({ label: 'Website', url: '' }); }, { render: true }); break;
      case 'remove-link': changed(() => { item.links.splice(index, 1); }, { render: true }); break;
      case 'upload': container.querySelector('[data-media-file]').click(); break;
      case 'add-media-url': {
        const input = container.querySelector('[data-new-media-url]');
        const url = safeUrl(input.value.trim(), { media: true });
        if (!url || !input.value.trim()) throw new Error('Enter a valid media URL.');
        const type = container.querySelector('[data-new-media-type]').value;
        changed(() => { item.media.push({ id: id('media'), type, url, name: url.split('/').pop(), caption: '', alt: '', order: item.media.length }); }, { render: true });
        break;
      }
      case 'cover-media': changed(() => { item.coverMediaId = item.media[index].id; }, { render: true }); break;
      case 'remove-media': changed(() => { const removed = item.media.splice(index, 1)[0]; if (item.coverMediaId === removed.id) item.coverMediaId = item.media.find((m) => m.type === 'image')?.id || null; item.media.forEach((m, i) => { m.order = i; }); }, { render: true }); break;
      case 'media-up':
      case 'media-down': changed(() => { moveArray(item.media, index, action === 'media-up' ? -1 : 1); item.media.forEach((m, i) => { m.order = i; }); }, { render: true }); break;
      case 'add-relation': {
        const relatedId = container.querySelector('[data-related-record]').value;
        if (relatedId) changed(() => { item.relatedIds ||= []; if (!item.relatedIds.includes(relatedId)) item.relatedIds.push(relatedId); }, { render: true });
        break;
      }
      case 'remove-relation': changed(() => { item.relatedIds = item.relatedIds.filter((r) => r !== target.dataset.id); }, { render: true }); break;
      case 'add-record-node': addNode(item.id, item.type === 'section' ? item.id : item.type === 'project' ? 'projects' : item.type === 'skill' || item.type === 'category' ? 'skills' : WORLDS.includes(item.type) ? item.type : 'about'); break;
      case 'open-node': nodeId = target.dataset.id; world = node().world; mode = 'graph'; renderWorkspace(); break;
      case 'add-node': showDialog('Add a scene node', `<p>Place an existing content record inside the <strong>${escape(world)}</strong> world.</p><label for="studio-node-content">Content record</label><select id="studio-node-content" data-new-node-content>${options(data.records.filter((r) => r.status !== 'archived').map((r) => [r.id, `${human(r.type)} · ${r.title}`]), '')}</select>`, [{ action: 'confirm-add-node', label: 'Create node', primary: true }]); break;
      case 'confirm-add-node': { const contentId = container.querySelector('[data-new-node-content]').value; closeDialog(); addNode(contentId); break; }
      case 'delete-node': {
        const removing = nodeId;
        if(node().graphRole==='identity')throw new Error('The identity node is required. Edit its label or appearance instead.');
        changed(() => { removeSceneNodes([removing]); nodeId = null; }, { render: true }); break;
      }
      case 'add-edge': {
        const peers = data.nodes.filter((n) => n.id !== nodeId && n.world === world);
        if (!peers.length) throw new Error('Add at least two nodes to connect this world.');
        showDialog('Create a connection', `<p>Connect <strong>${escape(node().label)}</strong> to another node.</p><label for="studio-edge-target">Destination</label><select id="studio-edge-target" data-new-edge-target>${options(peers.map((n) => [n.id, n.label]), '')}</select>`, [{ action: 'confirm-add-edge', label: 'Create connection', primary: true }]); break;
      }
      case 'confirm-add-edge': {
        const targetId = container.querySelector('[data-new-edge-target]').value;
        if (data.edges.some((e) => (e.source === nodeId && e.target === targetId) || (!e.directed && e.source === targetId && e.target === nodeId))) throw new Error('These nodes are already connected.');
        if(world==='skills'&&node().graphRole){
          const source=node(),targetNode=data.nodes.find(n=>n.id===targetId);
          const parent=(source.graphRole==='identity'&&targetNode.graphRole==='domain')||(source.graphRole==='domain'&&targetNode.graphRole==='technology');
          const application=source.graphRole==='technology'&&targetNode.graphRole==='evidence';
          if(!parent&&!application)throw new Error('Skills connections follow identity → domain → technology → applied project. Choose endpoints with those roles.');
          closeDialog();changed(()=>{if(parent){targetNode.parentId=source.id;if(targetNode.graphRole==='technology')data.records.find(r=>r.id===targetNode.contentId).category=source.contentId;}else{const r=data.records.find(r=>r.id===source.contentId);if(!r.relatedIds.includes(targetNode.contentId))r.relatedIds.push(targetNode.contentId);}});refreshNodeInspector();break;
        }
        closeDialog();
        changed(() => { data.edges.push({ id: id('edge'), source: nodeId, target: targetId, style: 'line', directed: false }); });
        refreshNodeInspector(); break;
      }
      case 'remove-edge': {
        const edge=data.edges.find(e=>e.id===target.dataset.id);
        if(['domain','contains'].includes(edge?.relationship))throw new Error('This parent connection is required. Change the domain or parent instead.');
        changed(()=>{if(edge?.relationship==='applied-in'){const source=data.nodes.find(n=>n.id===edge.source),destination=data.nodes.find(n=>n.id===edge.target),record=data.records.find(r=>r.id===source.contentId);record.relatedIds=record.relatedIds.filter(id=>id!==destination.contentId);}data.edges=data.edges.filter(e=>e.id!==target.dataset.id);});refreshNodeInspector();break;
      }
      case 'recalculate': engine?.setData(data); notify('Automatic layout recalculated. Manual overrides are retained.'); break;
      case 'reset-layout': changed(() => { data.nodes.filter((n) => n.world === world).forEach((n) => { n.layout = { mode: 'auto', position: null }; }); }, { render: true }); break;
      case 'reset-camera': engine?.resetCamera(); break;
      case 'undo':
      case 'redo': {
        const source = action === 'undo' ? undoStack : redoStack;
        const destination = action === 'undo' ? redoStack : undoStack;
        if (!source.length) break;
        destination.push(captureEdit());
        ({ data, selectedId, currentType, mode, tab, world, nodeId, query, statusFilter } = source.pop());
        revision++; dirty = true;
        renderWorkspace(); historyButtons(); status('Unsaved changes');
        clearTimeout(saveTimer); saveTimer = setTimeout(() => save(false), 1500); break;
      }
      case 'save': await save(); break;
      case 'publish': {
        const result = validateSnapshot(data);
        const errors = result?.errors || (Array.isArray(result) ? result : []);
        if (result?.valid === false || errors.length) { showDialog('Resolve validation issues', `<p>Your published portfolio has not changed.</p><ul>${errors.map((e) => `<li>${escape(typeof e === 'string' ? e : e.message || JSON.stringify(e))}</li>`).join('')}</ul>`); break; }
        if (!capabilities.canPublish) throw new Error('Publishing is unavailable. Sign in as the owner of a configured Supabase workspace.');
        showDialog(capabilities.mode === 'supabase' ? 'Publish your portfolio?' : 'Publish to this browser?', `<p>${capabilities.mode === 'supabase' ? 'This makes the current draft available to visitors.' : 'This updates the portfolio preview stored in this browser. It does not deploy content to the hosted website.'}</p><div class="studio-publish-stats"><span><strong>${data.records.filter((r) => r.status === 'published').length}</strong> public records</span><span><strong>${data.nodes.length}</strong> scene nodes</span><span><strong>${data.edges.length}</strong> connections</span></div><p>Draft and archived records remain hidden. A version snapshot will be saved for recovery.</p>`, [{ action: 'confirm-publish', label: capabilities.mode === 'supabase' ? 'Publish portfolio' : 'Publish locally', primary: true }]);
        break;
      }
      case 'confirm-publish': {
        clearTimeout(saveTimer); await saving.catch(() => {});
        const published = await store.publish(clone(data));
        if (published) data = clone(store.getDraft?.() || published);
        dirty = false; revision++; closeDialog(); status('Published successfully'); notify(capabilities.mode === 'supabase' ? 'Portfolio published. Visitors can now see the latest version.' : 'Published locally. Open the portfolio to preview the saved version.'); break;
      }
      case 'versions': {
        const versions = await store.getHistory();
        showDialog('Version history', `<p>Restore a previous snapshot into your draft, review it, and publish when ready.</p><div class="studio-version-list">${versions.map((version) => `<div><span><strong>${escape(version.label || 'Published snapshot')}</strong><small>${escape(new Date(version.createdAt).toLocaleString())}</small></span>${button('restore-version', 'Restore draft', `data-id="${escape(version.id)}"`)}</div>`).join('') || '<p class="studio-hint">No versions yet. Publish a snapshot to create a recovery point.</p>'}</div>`); break;
      }
      case 'restore-version': {
        const restored = await store.restoreVersion(target.dataset.id);
        closeDialog(); changed(() => { data = clone(restored); selectedId = null; }, { render: true }); notify('Version restored into your draft. Review and publish to update the portfolio.'); break;
      }
      case 'export': {
        const blob = new Blob([store.exportSnapshot(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = `portfolio-v3-${new Date().toISOString().slice(0, 10)}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        notify('Portfolio backup exported.'); break;
      }
      case 'import': container.querySelector('[data-import-file]').click(); break;
      case 'confirm-import': {
        const imported = dialog._snapshot;
        closeDialog(); changed(() => { data = imported; selectedId = null; }, { render: true }); notify('Backup imported as a draft. Review before publishing.'); break;
      }
      case 'logout': await save(false); await store.signOut(); renderShell(); break;
      case 'close-dialog': closeDialog(); break;
      default: break;
    }
  }
  const clickHandler = (event) => {
    const target = event.target.closest('[data-action]');
    if (!target || !container.contains(target) || target.disabled) return;
    event.preventDefault();
    target.disabled = true;
    Promise.resolve(handleAction(target.dataset.action, target)).catch((error) => notify(error.message || 'The action could not be completed.', true)).finally(() => { if (target.isConnected) target.disabled = false; historyButtons(); });
  };
  const inputHandler = (event) => {
    if (event.target.matches('[data-search]')) { query = event.target.value; refreshRecordList(); }
  };
  const changeHandler = async (event) => {
    const target = event.target;
    try {
      if (target.matches('[data-field]')) changeField(target);
      else if (target.matches('[data-status-filter]')) { statusFilter = target.value; refreshRecordList(); }
      else if (target.matches('[data-world]')) { world = target.value; nodeId = null; renderWorkspace(); }
      else if (target.matches('[data-layout]')) { changed(() => { data.settings.layouts[world] = target.value; }); }
      else if (target.matches('[data-node-picker]')) { nodeId = target.value; refreshNodeInspector(); }
      else if (target.matches('[data-import-file]') && target.files[0]) {
        if (target.files[0].size > 10 * 1024 * 1024) throw new Error('Backup is larger than 10 MB. Use a smaller JSON export.');
        const imported = store.importSnapshot(await target.files[0].text());
        showDialog('Import this portfolio backup?', `<p>This replaces the current draft with <strong>${imported.records.length} records</strong> and <strong>${imported.nodes.length} scene nodes</strong>. The published portfolio stays unchanged until you publish. The import can be undone.</p>`, [{ action: 'confirm-import', label: 'Import as draft', primary: true }]);
        dialog._snapshot = clone(imported); target.value = '';
      } else if (target.matches('[data-media-file]') && target.files.length) {
        const ownerId = selectedId;
        const files = [...target.files]; target.value = '';
        notify(`Uploading ${files.length} ${files.length === 1 ? 'file' : 'files'}…`);
        let added = 0;
        const failures = [];
        for (const file of files) {
          try {
            const media = await store.uploadMedia(file);
            const owner = data.records.find((r) => r.id === ownerId);
            if (!owner) throw new Error('The record no longer exists.');
            changed(() => { media.order = owner.media.length; owner.media.push(media); if (!owner.coverMediaId && media.type === 'image') owner.coverMediaId = media.id; }, { scene: false });
            added++;
          } catch (error) { failures.push(`${file.name}: ${error.message}`); }
        }
        renderWorkspace();
        notify(`${added} ${added === 1 ? 'file' : 'files'} attached.${failures.length ? ` ${failures.join(' ')}` : ''}`, failures.length > 0);
      }
    } catch (error) { notify(error.message || 'This change could not be applied.', true); }
  };
  const submitHandler = async (event) => {
    if (!event.target.matches('[data-login-form]')) return;
    event.preventDefault();
    const form = event.target;
    const feedback = container.querySelector('.studio-login-feedback');
    const submit = form.querySelector('button');
    submit.disabled = true; feedback.textContent = 'Signing in…';
    try {
      await store.signIn(form.elements.email.value.trim(), form.elements.password.value);
      data = clone(store.getDraft() || snapshot);
      renderShell();
    } catch (error) { feedback.textContent = error.message || 'Sign-in failed. Please check your account and try again.'; submit.disabled = false; }
  };
  const keyHandler = (event) => {
    const activeTab = event.target.closest('[role="tab"]');
    if (activeTab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const tabs = [...container.querySelectorAll('[role="tab"]')];
      const index = tabs.indexOf(activeTab);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      const name = tabs[next].dataset.tab;
      tabs[next].click(); container.querySelector(`[data-tab="${name}"]`)?.focus();
      return;
    }
    if (!(event.ctrlKey || event.metaKey)) return;
    if (event.key.toLowerCase() === 's') { event.preventDefault(); save(); }
    if (event.key.toLowerCase() === 'z' && !event.target.matches('input,textarea,[contenteditable]')) {
      event.preventDefault(); handleAction(event.shiftKey ? 'redo' : 'undo', { dataset: {} }).catch((error) => notify(error.message, true));
    }
  };
  const beforeUnload = (event) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
  container.addEventListener('click', clickHandler);
  container.addEventListener('input', inputHandler);
  container.addEventListener('change', changeHandler);
  container.addEventListener('submit', submitHandler);
  document.addEventListener('keydown', keyHandler);
  window.addEventListener('beforeunload', beforeUnload);
  renderShell();
  return () => {
    disposed = true;
    mediaObserver.disconnect(); mediaResolver.dispose();
    clearTimeout(saveTimer); clearTimeout(toastTimer);
    engine?.dispose(); closeDialog();
    container.removeEventListener('click', clickHandler);
    container.removeEventListener('input', inputHandler);
    container.removeEventListener('change', changeHandler);
    container.removeEventListener('submit', submitHandler);
    document.removeEventListener('keydown', keyHandler);
    window.removeEventListener('beforeunload', beforeUnload);
    container.classList.remove('portfolio-studio');
    container.replaceChildren();
  };
}
