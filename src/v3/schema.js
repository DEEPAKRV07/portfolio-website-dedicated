/** Versioned, executable-code-free portfolio document contract. */
export const SCHEMA_VERSION = 3;
export const RECORD_TYPES = ['project', 'experience', 'skill', 'category', 'education', 'about', 'contact', 'section'];
export const GEOMETRIES = ['neural-core', 'neural-node', 'neural-cluster', 'neural-chip', 'core', 'portal', 'monolith', 'chip', 'tower', 'archive', 'beacon'];
export const MATERIALS = ['titanium', 'glass', 'emissive'];
export const LAYOUTS = ['network', 'radial', 'hierarchical', 'timeline', 'force', 'manual'];
export const MAX_MEDIA_BYTES = 20 * 1024 * 1024;
export const MEDIA_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf'];
const ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLOR = /^#[a-f0-9]{6}$/i;
const clone = value => JSON.parse(JSON.stringify(value));
const array = value => Array.isArray(value) ? value : [];
const object = value => value && typeof value === 'object' && !Array.isArray(value);

/**
 * Accept only browser navigation/media protocols we intentionally render.
 * No protocol-relative URLs, credentials, control characters, SVG, script/data HTML,
 * blob URLs (cannot survive a reload), or traversal outside the deployed base path.
 */
export function safeUrl(value, options = {}) {
  if (typeof value !== 'string' || !value || value.length > (options.media ? 4_300_000 : 4000)) return '';
  if (value !== value.trim() || /[\u0000-\u0020\u007f\\]/.test(value)) return '';
  if (options.media && /^local-media:[a-zA-Z0-9-]{1,100}$/.test(value)) return value;
  if (/^(?:data|blob|javascript|vbscript|file):/i.test(value) || /^\/\//.test(value)) return '';
  if (!options.media && /^mailto:[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+$/i.test(value)) return value;
  if (!options.media && /^tel:\+?[\d()-]+$/.test(value)) return value;
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (url.username || url.password || !url.hostname || (options.media && /\.svg(?:$|[?#])/i.test(url.pathname))) return '';
      return value;
    } catch { return ''; }
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('#')) return '';
  try {
    const decoded = decodeURIComponent(value);
    if (/[\\\u0000-\u0020\u007f]/.test(decoded) || decoded.startsWith('//') || decoded.split(/[/?#]/).includes('..')) return '';
    if (options.media && /\.svg(?:$|[?#])/i.test(decoded)) return '';
    return /^(?:\/|\.\.?(?:\/)|[A-Za-z0-9_-])/.test(value) ? value : '';
  } catch { return ''; }
}

/** Fill optional fields without concealing invalid explicit values. */
export function normalize(input) {
  if (!object(input)) throw new Error('The portfolio document must be a JSON object.');
  const snapshot = clone(input);
  snapshot.schemaVersion ??= SCHEMA_VERSION;
  snapshot.profile ??= { name: '', title: '', summary: '' };
  snapshot.records = array(snapshot.records).map((record, index) => ({
    subtitle: '', summary: '', sections: [], tags: [], links: [], media: [], relatedIds: [],
    status: 'draft', order: index, ...record,
  }));
  snapshot.nodes = array(snapshot.nodes).map(node => ({
    label: '', parentId: null, visible: true, ...node,
    layout: { mode: 'auto', position: null, ...node.layout },
    appearance: { geometry: 'chip', material: 'titanium', color: '#65f5bb', size: 1, labelVisible: true, ...node.appearance },
    animation: { entrance: 'rise', hover: 'glow', duration: 0.7, ...node.animation },
  }));
  snapshot.edges = array(snapshot.edges).map(edge => ({ style: 'line', directed: false, ...edge }));
  snapshot.settings = { ...snapshot.settings, layouts: { ...snapshot.settings?.layouts } };
  return snapshot;
}

/** Supported imports: V1/V2 content+scene envelopes, or prior records/nodes documents. */
export function migrateSnapshot(input) {
  if (!object(input)) throw new Error('Import must contain a portfolio object.');
  const version = input.schemaVersion ?? input.version ?? 1;
  if (![1, 2, 3].includes(version)) throw new Error(`Unsupported schema version ${version}.`);
  const migrated = clone(input);
  for (const [key, fallback] of [['records', 'content'], ['nodes', null], ['edges', null]]) {
    const value = migrated[key] ?? (fallback ? migrated[fallback] : migrated.scene?.[key]);
    if (value !== undefined && !Array.isArray(value)) throw new Error(`${key} must be an array.`);
  }
  if (version < 3) {
    migrated.records ??= migrated.content ?? [];
    migrated.nodes ??= migrated.scene?.nodes ?? [];
    migrated.edges ??= migrated.scene?.edges ?? [];
    migrated.settings ??= { layouts: migrated.scene?.layouts ?? {} };
    migrated.records = array(migrated.records).map(record => ({
      ...record,
      slug: record.slug ?? String(record.id ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      links: record.links ?? record.actions ?? [],
      status: record.status ?? (record.published === false ? 'draft' : 'published'),
    }));
    migrated.nodes = array(migrated.nodes).map(node => ({
      ...node,
      world: node.world ?? node.section ?? 'home',
      layout: node.layout ?? { mode: node.position ? 'manual' : 'auto', position: node.position ?? null },
      appearance: {
        ...node.appearance,
        geometry: node.appearance?.geometry ?? node.appearance?.geometryPreset ?? 'chip',
        material: node.appearance?.material ?? node.appearance?.materialPreset ?? 'titanium',
      },
    }));
    delete migrated.content;
    delete migrated.scene;
    delete migrated.version;
  }
  migrated.schemaVersion = SCHEMA_VERSION;
  const result = normalize(migrated);
  const validation = validateSnapshot(result);
  if (!validation.valid) throw new Error(`Invalid portfolio import:\n${validation.errors.join('\n')}`);
  return result;
}

export function validateSnapshot(snapshot) {
  const errors = [];
  const fail = message => { if (errors.length < 100) errors.push(message); };
  if (!object(snapshot)) return { valid: false, errors: ['Portfolio must be an object.'] };
  // Walk before consumers can merge imported objects. No special keys or executable values.
  const seen = new WeakSet();
  function walk(value, path = 'portfolio', depth = 0) {
    if (depth > 20) { fail(`${path}: nesting exceeds 20 levels.`); return; }
    if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint' || value === undefined) {
      fail(`${path}: must contain JSON values only.`); return;
    }
    if (typeof value === 'number' && !Number.isFinite(value)) fail(`${path}: numbers must be finite.`);
    if (value && typeof value === 'object') {
      if (seen.has(value)) { fail(`${path}: circular references are not supported.`); return; }
      seen.add(value);
      for (const [key, child] of Object.entries(value)) {
        if (['__proto__', 'prototype', 'constructor'].includes(key)) fail(`${path}: unsafe key ${key}.`);
        else walk(child, `${path}.${key}`, depth + 1);
      }
      seen.delete(value);
    }
  }
  walk(snapshot);
  if (snapshot.schemaVersion !== SCHEMA_VERSION) fail(`Expected schemaVersion ${SCHEMA_VERSION}.`);
  const text = (value, path, required = false, max = 20000) => {
    if (typeof value !== 'string' || value.length > max || (required && !value.trim())) fail(`${path}: ${required ? 'non-empty ' : ''}text required (max ${max}).`);
  };
  if (!object(snapshot.profile)) fail('Profile is required.');
  else {
    text(snapshot.profile.name, 'Profile name', true, 200);
    text(snapshot.profile.title, 'Profile title', true, 400);
    text(snapshot.profile.summary, 'Profile summary');
    for (const field of ['resumeUrl', 'emailUrl', 'githubUrl', 'linkedinUrl']) {
      if (snapshot.profile[field] && !safeUrl(snapshot.profile[field])) fail(`Profile ${field}: unsafe URL.`);
    }
  }
  for (const key of ['records', 'nodes', 'edges']) {
    if (!Array.isArray(snapshot[key])) fail(`${key} must be an array.`);
    if (array(snapshot[key]).length > (key === 'edges' ? 4000 : 1000)) fail(`${key} exceeds the supported limit.`);
  }
  const records = array(snapshot.records), nodes = array(snapshot.nodes), edges = array(snapshot.edges);
  function unique(items, label) {
    const ids = new Set();
    for (const item of items) {
      if (!object(item) || !ID.test(item.id ?? '')) { fail(`${label}: valid stable ID required.`); continue; }
      if (ids.has(item.id)) fail(`${label}: duplicate ID ${item.id}.`);
      ids.add(item.id);
    }
    return ids;
  }
  const recordIds = unique(records, 'Record'), nodeIds = unique(nodes, 'Node');
  unique(edges, 'Edge');
  const slugs = new Set();
  for (const record of records) {
    if (!object(record)) continue;
    const at = `Record ${record.id}`;
    if (!RECORD_TYPES.includes(record.type)) fail(`${at}: unknown content type.`);
    if (!SLUG.test(record.slug ?? '') || record.slug.length > 120) fail(`${at}: lowercase URL slug required.`);
    if (slugs.has(record.slug)) fail(`${at}: duplicate slug ${record.slug}.`);
    slugs.add(record.slug);
    text(record.title, `${at} title`, true, 300);
    text(record.subtitle ?? '', `${at} subtitle`, false, 1000);
    text(record.summary ?? '', `${at} summary`);
    if (!['draft', 'published', 'archived'].includes(record.status)) fail(`${at}: invalid status.`);
    if (!Number.isFinite(record.order)) fail(`${at}: finite order required.`);
    for (const key of ['sections', 'tags', 'links', 'media', 'relatedIds']) if (!Array.isArray(record[key])) fail(`${at}: ${key} must be an array.`);
    for (const section of array(record.sections)) {
      if (!object(section)) { fail(`${at}: invalid section.`); continue; }
      text(section.heading ?? '', `${at} section heading`, false, 300);
      if (section.content !== undefined) text(section.content, `${at} section content`);
      if (section.bullets !== undefined && !Array.isArray(section.bullets)) fail(`${at}: section bullets must be an array.`);
      for (const bullet of array(section.bullets)) text(bullet, `${at} bullet`, false, 4000);
    }
    for (const tag of array(record.tags)) text(tag, `${at} tag`, false, 120);
    for (const link of array(record.links)) {
      if (!object(link) || !safeUrl(link.url)) fail(`${at}: unsafe or missing link URL.`);
      else text(link.label, `${at} link label`, true, 200);
    }
    const mediaIds = unique(array(record.media), `${at} media`);
    for (const media of array(record.media)) {
      if (!object(media)) continue;
      if (!['image', 'video', 'document'].includes(media.type)) fail(`${at}: unsupported media type.`);
      if (!safeUrl(media.url, { media: true })) fail(`${at}: unsafe media URL.`);
      if (media.poster && !safeUrl(media.poster, { media: true })) fail(`${at}: unsafe poster URL.`);
      if (media.alt !== undefined) text(media.alt, `${at} media alt`, false, 1000);
      if (media.caption !== undefined) text(media.caption, `${at} media caption`, false, 2000);
    }
    if (record.coverMediaId && !mediaIds.has(record.coverMediaId)) fail(`${at}: cover media is missing.`);
    for (const id of array(record.relatedIds)) if (!recordIds.has(id) || id === record.id) fail(`${at}: invalid related record ${id}.`);
    for (const key of ['startDate', 'endDate']) if (record[key]) {
      const value = record[key];
      const syntax = /^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/.test(value);
      const calendar = syntax && (value.length !== 10 || new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value);
      if (!syntax || !calendar) fail(`${at}: invalid ${key}.`);
    }
    if (record.startDate && record.endDate && record.startDate > record.endDate) fail(`${at}: end date precedes start date.`);
    if (record.current && record.endDate) fail(`${at}: current roles cannot also have an end date.`);
  }
  const worlds = new Set(['home', 'about', 'projects', 'skills', 'experience', 'education', 'contact']);
  for (const record of records) if (record?.type === 'section') { worlds.add(record.id); worlds.add(record.slug); }
  const byNode = new Map(nodes.filter(object).map(node => [node.id, node]));
  for (const node of nodes) {
    if (!object(node)) continue;
    const at = `Node ${node.id}`;
    if (!recordIds.has(node.contentId)) fail(`${at}: content ${node.contentId} is missing.`);
    if (!worlds.has(node.world)) fail(`${at}: world ${node.world} is missing.`);
    text(node.label ?? '', `${at} label`, false, 300);
    if (node.parentId && (!nodeIds.has(node.parentId) || node.parentId === node.id)) fail(`${at}: invalid parent.`);
    if (node.parentId && byNode.get(node.parentId)?.world !== node.world) fail(`${at}: parent must belong to the same world.`);
    const chain = new Set([node.id]);
    let parent = node.parentId;
    while (parent && byNode.has(parent)) {
      if (chain.has(parent)) { fail(`${at}: cyclic parent relationship.`); break; }
      chain.add(parent);
      parent = byNode.get(parent).parentId;
    }
    if (!['auto', 'manual'].includes(node.layout?.mode)) fail(`${at}: invalid layout mode.`);
    const position = node.layout?.position;
    if (position !== null && position !== undefined && (!Array.isArray(position) || position.length !== 3 || position.some(value => !Number.isFinite(value) || Math.abs(value) > 1000))) fail(`${at}: position must contain three finite coordinates within ±1000.`);
    if (node.layout?.mode === 'manual' && !Array.isArray(position)) fail(`${at}: manual layout requires a position.`);
    if (!GEOMETRIES.includes(node.appearance?.geometry)) fail(`${at}: unknown geometry preset.`);
    if (!MATERIALS.includes(node.appearance?.material)) fail(`${at}: unknown material preset.`);
    if (!COLOR.test(node.appearance?.color ?? '')) fail(`${at}: six-digit hex color required.`);
    if (!Number.isFinite(node.appearance?.size) || node.appearance.size < 0.2 || node.appearance.size > 5) fail(`${at}: size must be 0.2–5.`);
    if (typeof node.appearance?.labelVisible !== 'boolean' || typeof node.visible !== 'boolean') fail(`${at}: visibility must be boolean.`);
    if (node.appearance?.labelPosition && !['above', 'below'].includes(node.appearance.labelPosition)) fail(`${at}: label position must be above/below.`);
    if (!Number.isFinite(node.animation?.duration) || node.animation.duration < 0.1 || node.animation.duration > 3) fail(`${at}: animation duration must be 0.1–3 seconds.`);
    if (!['rise', 'scale', 'fade', 'none'].includes(node.animation?.entrance)) fail(`${at}: unknown entrance preset.`);
    if (!['glow', 'lift', 'none'].includes(node.animation?.hover)) fail(`${at}: unknown hover preset.`);
    if(node.world==='skills'&&node.graphRole&&node.graphRole!=='identity'&&(!node.parentId||!edges.some(e=>e.source===node.parentId&&e.target===node.id)))fail(`${at}: a connected semantic parent is required.`);
  }
  for (const edge of edges) {
    if (!object(edge)) continue;
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target) || edge.source === edge.target) fail(`Edge ${edge.id}: distinct existing endpoints required.`);
    if (byNode.get(edge.source)?.world !== byNode.get(edge.target)?.world) fail(`Edge ${edge.id}: endpoints must belong to one world.`);
    if (!['line', 'tube', 'ribbon'].includes(edge.style)) fail(`Edge ${edge.id}: unknown style.`);
    if (typeof edge.directed !== 'boolean') fail(`Edge ${edge.id}: directed must be boolean.`);
    const source=byNode.get(edge.source),target=byNode.get(edge.target);
    if(source?.world==='skills'&&source.graphRole&&target?.graphRole){
      const parent=target.parentId===source.id;
      const evidence=source.graphRole==='technology'&&target.graphRole==='evidence'&&records.find(r=>r.id===source.contentId)?.relatedIds?.includes(target.contentId);
      if(!edge.directed||!((parent&&['domain','contains','applied-in'].includes(edge.relationship))||(evidence&&edge.relationship==='applied-in')))fail(`Edge ${edge.id}: a documented, directed Skills relationship is required.`);
    }
  }
  if (!object(snapshot.settings?.layouts)) fail('Settings layouts must be an object.');
  else for (const [world, layout] of Object.entries(snapshot.settings.layouts)) {
    if (!worlds.has(world) || !LAYOUTS.includes(layout)) fail(`Invalid layout ${layout} for ${world}.`);
  }
  return { valid: !errors.length, errors };
}

/** Draft/archived content and orphaned relationships never reach the public renderer. */
export function publishedSnapshot(snapshot) {
  const publicSnapshot = clone(snapshot);
  publicSnapshot.records = publicSnapshot.records.filter(record => record.status === 'published');
  const ids = new Set(publicSnapshot.records.map(record => record.id));
  publicSnapshot.records.forEach(record => { record.relatedIds = record.relatedIds.filter(id => ids.has(id)); });
  const hiddenWorlds = new Set(snapshot.records.filter(record => record.type === 'section' && record.status !== 'published').flatMap(record => [record.id, record.slug]));
  publicSnapshot.nodes = publicSnapshot.nodes.filter(node => node.visible && ids.has(node.contentId) && !hiddenWorlds.has(node.world));
  let previousCount;
  do {
    previousCount=publicSnapshot.nodes.length;
    const present=new Set(publicSnapshot.nodes.map(n=>n.id));
    publicSnapshot.nodes=publicSnapshot.nodes.filter(n=>n.world!=='skills'||!n.graphRole||n.graphRole==='identity'||present.has(n.parentId));
  }while(publicSnapshot.nodes.length!==previousCount);
  const nodeIds = new Set(publicSnapshot.nodes.map(node => node.id));
  publicSnapshot.nodes.forEach(node => { if (!nodeIds.has(node.parentId)) node.parentId = null; });
  publicSnapshot.edges = publicSnapshot.edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  for (const world of hiddenWorlds) delete publicSnapshot.settings.layouts[world];
  return publicSnapshot;
}
