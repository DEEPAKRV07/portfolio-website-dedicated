import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../src/v3/data.js';
import { migrateSnapshot, normalize, publishedSnapshot, safeUrl, validateSnapshot } from '../src/v3/schema.js';
import { ContentStore } from '../src/v3/store.js';

const memory = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
};
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
const ownerId = '11111111-1111-4111-8111-111111111111';
const ownerSession = { access_token: 'owner-token', refresh_token: 'refresh-token', expires_at: 9999999999 };
const configured = options => new ContentStore({ url: 'https://portfolio.supabase.co', anonKey: 'public-anon-key', storage: memory(), ...options });
const changed = () => {
  const seed = createSeed();
  seed.records.find(record => record.id === 'sightmate').summary = 'Edited project summary.';
  return seed;
};

test('seed is deterministic, valid, and keeps all core public content', () => {
  const seed = createSeed();
  assert.deepEqual(seed, createSeed());
  assert.deepEqual(validateSnapshot(seed), { valid: true, errors: [] });
  assert.deepEqual(validateSnapshot(publishedSnapshot(seed)), { valid: true, errors: [] });
  assert.equal(seed.records.filter(record => record.type === 'project').length, 6);
  assert.equal(seed.records.find(record => record.id === 'education-degree').grade, '7.99 / 10');
  assert.equal(seed.records.find(record => record.id === 'boa-xr-exp').startDate, '2026-09');
  assert.equal(seed.records.find(record => record.id === 'forcrux-exp').role, 'Frontend Developer');
  assert.ok(seed.records.find(record => record.id === 'punch-hero').sections.some(section => section.content?.includes('No public APK')));
  assert.equal(seed.records.find(record => record.id === 'kaatchi-exp').status, 'archived');
});

test('publication removes draft/archived records, hidden nodes, and broken relationships', () => {
  const seed = createSeed();
  seed.records.find(record => record.id === 'sightmate').status = 'draft';
  seed.nodes.find(node => node.id === 'opencv').visible = false;
  const result = publishedSnapshot(seed);
  assert.ok(!result.records.some(record => record.id === 'sightmate' || record.id === 'kaatchi-exp'));
  assert.ok(!result.nodes.some(node => node.contentId === 'sightmate' || node.id === 'opencv'));
  assert.ok(result.records.every(record => !record.relatedIds.includes('sightmate')));
  assert.equal(validateSnapshot(result).valid, true);
});

test('schema detects duplicate IDs/slugs, dangling edges, and cyclic parents', () => {
  const seed = createSeed();
  seed.records[1].slug = seed.records[0].slug;
  seed.nodes[1].id = seed.nodes[0].id;
  seed.edges[0].target = 'missing-node';
  seed.nodes.find(node => node.id === 'yolov8').parentId = 'bytetrack';
  seed.nodes.find(node => node.id === 'bytetrack').parentId = 'yolov8';
  const result = validateSnapshot(seed);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes('duplicate slug')));
  assert.ok(result.errors.some(error => error.includes('duplicate ID')));
  assert.ok(result.errors.some(error => error.includes('endpoints')));
  assert.ok(result.errors.some(error => error.includes('cyclic')));
});

test('schema rejects invalid positions, cross-world edges, unsupported presets and dates', () => {
  const seed = createSeed();
  seed.nodes[0].layout = { mode: 'manual', position: [NaN, 0, 0] };
  seed.nodes[1].appearance.geometry = 'execute-script';
  seed.edges[0].target = 'yolov8';
  seed.records.find(record => record.id === 'boa-xr-exp').startDate = '2026-13';
  const result = validateSnapshot(seed);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes('position')));
  assert.ok(result.errors.some(error => error.includes('geometry')));
  assert.ok(result.errors.some(error => error.includes('one world')));
  assert.ok(result.errors.some(error => error.includes('startDate')));
});

test('safe URLs allow intended destinations and reject dangerous protocols and traversal', () => {
  for (const url of ['https://github.com/DEEPAKRV07', 'mailto:deepakvetrivelan@gmail.com', 'tel:+917845210074', '/portfolio/my_resume.pdf', 'my_resume.pdf']) assert.equal(safeUrl(url), url);
  for (const url of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html;base64,AAAA', 'vbscript:foo', '//evil.test', 'https://owner:password@example.com', '../secrets', '/%2e%2e/secrets', '/%5cevil', 'https://a.test/\nfoo', 'file:///C:/secret', 'blob:https://a.test/x']) assert.equal(safeUrl(url), '', url);
  assert.equal(safeUrl('https://images.test/a.svg', { media: true }), '');
  assert.equal(safeUrl('data:image/svg+xml;base64,AAAA', { media: true }), '');
  assert.equal(safeUrl('data:image/png;base64,AAAA', { media: true }), '');
  assert.equal(safeUrl('local-media:example-123', {media:true}), 'local-media:example-123');
});

test('import migrates a V2 envelope while preserving specialized fields', () => {
  const current = createSeed();
  const v2 = { schemaVersion: 2, profile: current.profile, content: current.records, scene: { nodes: current.nodes, edges: current.edges, layouts: current.settings.layouts } };
  const result = migrateSnapshot(v2);
  assert.equal(result.schemaVersion, 3);
  assert.equal(result.records.find(record => record.id === 'education-degree').institution, 'S.A. Engineering College');
  assert.equal(validateSnapshot(result).valid, true);
  assert.throws(() => migrateSnapshot({ ...current, schemaVersion: 999 }), /Unsupported/);
  assert.throws(() => migrateSnapshot({ ...current, records: 'not an array' }), /array/);
});

test('prototype-pollution keys and non-JSON values are rejected', () => {
  const seed = createSeed();
  seed.profile = JSON.parse('{"name":"Deepak","title":"Engineer","summary":"","__proto__":{"polluted":true}}');
  assert.equal(validateSnapshot(seed).valid, false);
  assert.throws(() => migrateSnapshot(seed), /unsafe key/);
  assert.equal({}.polluted, undefined);
  const nonJSON = createSeed();
  nonJSON.profile.callback = () => {};
  assert.equal(validateSnapshot(nonJSON).valid, false);
});

test('local drafts survive reload and publication/history can be restored', async () => {
  const storage = memory();
  const store = new ContentStore({ storage, development: true });
  await store.init(createSeed());
  await store.saveDraft(changed());
  const reload = new ContentStore({ storage, development: true });
  await reload.init(createSeed());
  assert.equal(reload.getDraft().records.find(record => record.id === 'sightmate').summary, 'Edited project summary.');
  const publication = await reload.publish(reload.getDraft());
  assert.ok(!publication.records.some(record => record.status !== 'published'));
  const versions = await reload.getHistory();
  assert.equal(versions.length, 1);
  await reload.saveDraft(createSeed());
  await reload.restoreVersion(versions[0].id);
  assert.equal(reload.getDraft().records.find(record => record.id === 'sightmate').summary, 'Edited project summary.');
  assert.equal((await new ContentStore({ storage, development: true }).init(createSeed())).records.find(record => record.id === 'sightmate').summary, 'Edited project summary.');
});

test('production ignores browser publications and forbids public publishing without backend', async () => {
  const storage = memory();
  const dev = new ContentStore({ storage, development: true });
  await dev.init(createSeed());
  await dev.publish(changed());
  const production = new ContentStore({ storage, development: false });
  const publicDocument = await production.init(createSeed());
  assert.notEqual(publicDocument.records.find(record => record.id === 'sightmate').summary, 'Edited project summary.');
  assert.equal(production.getCapabilities().canPublish, false);
  await assert.rejects(production.publish(changed()), /requires a configured backend/);
});

test('storage quota failures preserve the last published document in memory', async () => {
  const storage = memory();
  const store = new ContentStore({ storage, development: true });
  await store.init(createSeed());
  await store.publish(createSeed());
  const before = store.getPublished();
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  await assert.rejects(store.publish(changed()), /storage is full/);
  assert.deepEqual(store.getPublished(), before);
});

test('malformed local JSON recovers to bundled content with an explicit error', async () => {
  const storage = memory();
  storage.setItem('deepak-portfolio-v3:draft', '{broken');
  const store = new ContentStore({ storage });
  const published = await store.init(createSeed());
  assert.equal(validateSnapshot(published).valid, true);
  assert.match(store.lastError, /could not be read/);
});

test('remote public read never consults local publications; failures return bundled fallback', async () => {
  const storage = memory();
  storage.setItem('deepak-portfolio-v3:published', JSON.stringify(changed()));
  const store = configured({ storage, fetch: async () => { throw new Error('offline'); } });
  const result = await store.init(createSeed());
  assert.notEqual(result.records.find(record => record.id === 'sightmate').summary, 'Edited project summary.');
  assert.match(store.lastError, /bundled portfolio/);
  const invalidRemote = configured({ fetch: async () => json([{ snapshot: { schemaVersion: 999 } }]) });
  assert.equal(validateSnapshot(await invalidRemote.init(createSeed())).valid, true);
  assert.match(invalidRemote.lastError, /Unsupported schema/);
});

test('remote saves and publishing require an authenticated owner before network writes', async () => {
  let writes = 0;
  const store = configured({ fetch: async (_url, options) => { if (options.method !== 'GET') writes++; return json([]); } });
  await store.init(createSeed());
  await assert.rejects(store.saveDraft(changed()), /authorized owner/);
  await assert.rejects(store.publish(changed()), /authorized owner/);
  assert.equal(writes, 0);
  assert.equal(store.getCapabilities().canEdit, false);
});

test('remote owner login, draft save, atomic publish request, history and rollback', async () => {
  const requests = [];
  const versionId = '22222222-2222-4222-8222-222222222222';
  const store = configured({ fetch: async (url, options) => {
    requests.push({ url, ...options });
    if (url.includes('/auth/v1/token')) return json(ownerSession);
    if (url.endsWith('/auth/v1/user')) return json({ id: ownerId, email: 'owner@example.com' });
    if (url.includes('/portfolio_owners')) return json([{ user_id: ownerId }]);
    if (url.includes('/portfolio_versions?id=')) return json([{ snapshot: changed() }]);
    if (url.includes('/portfolio_versions?')) return json([{ id: versionId, created_at: '2026-10-20T00:00:00Z', label: 'Published test' }]);
    if (url.includes('/portfolio_drafts') && options.method === 'GET') return json([{ snapshot: changed() }]);
    if (url.includes('/portfolio_public')) return json([{ snapshot: publishedSnapshot(createSeed()) }]);
    return new Response(null, { status: 204 });
  } });
  await store.init(createSeed());
  await store.signIn('owner@example.com', 'test-password');
  assert.equal(store.authenticated, true);
  assert.equal(store.getDraft().records.find(record => record.id === 'sightmate').summary, 'Edited project summary.');
  await store.saveDraft(changed());
  await store.publish(changed());
  const publish = requests.find(request => request.url.endsWith('/rpc/publish_portfolio'));
  assert.equal(publish.headers.Authorization, 'Bearer owner-token');
  const body = JSON.parse(publish.body);
  assert.ok(body.draft_document.records.some(record => record.status === 'archived'));
  assert.ok(body.public_document.records.every(record => record.status === 'published'));
  assert.equal((await store.getHistory())[0].id, versionId);
  await store.restoreVersion(versionId);
  await store.signOut();
  assert.equal(store.authenticated, false);
});

test('authenticated non-owner login is rejected and session is cleared', async () => {
  const store = configured({ fetch: async url => {
    if (url.includes('/auth/v1/token')) return json(ownerSession);
    if (url.endsWith('/auth/v1/user')) return json({ id: ownerId });
    if (url.includes('/portfolio_owners')) return json([]);
    return new Response(null, { status: 204 });
  } });
  await assert.rejects(store.signIn('visitor@example.com', 'password'), /not an authorized/);
  assert.equal(store.authenticated, false);
  assert.equal(store.session, null);
});

test('server authorization rejection clears owner session without mutating public snapshot', async () => {
  const store = configured({ fetch: async () => json({ message: 'RLS denied' }, 403) });
  await store.init(createSeed());
  store.session = ownerSession;
  store.user = { id: ownerId };
  const before = store.getPublished();
  await assert.rejects(store.publish(changed()), /403/);
  assert.equal(store.authenticated, false);
  assert.deepEqual(store.getPublished(), before);
});

test('publishable keys are sent only as apikey; privileged keys are refused', async () => {
  const store = configured({ anonKey: 'sb_publishable_example', fetch: async (_url, options) => {
    assert.equal(options.headers.apikey, 'sb_publishable_example');
    assert.equal(options.headers.Authorization, undefined);
    return json([]);
  } });
  await store.init(createSeed());
  assert.throws(() => configured({ anonKey: 'sb_secret_example' }), /must never/);
  const jwt = `a.${Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')}.b`;
  assert.throws(() => configured({ anonKey: jwt }), /service-role/);
});

test('import/export round trip and unsupported uploads fail clearly', async () => {
  const store = new ContentStore({ storage: memory() });
  await store.init(createSeed());
  assert.deepEqual(store.importSnapshot(store.exportSnapshot()), normalize(createSeed()));
  assert.throws(() => store.importSnapshot('not json'), /valid JSON/);
  await assert.rejects(store.uploadMedia({ type: 'image/svg+xml', size: 100 }), /SVG/);
  await assert.rejects(store.uploadMedia({ type: 'video/mp4', size: 25 * 1024 * 1024 }), /20 MB/);
  await assert.rejects(store.uploadMedia({ type: 'video/mp4', size: 100 }), /authorized owner/);
});


test('original section identities and authored keys survive the directed layer correction',()=>{
 const seed=createSeed();const home=seed.nodes.filter(n=>n.world==='home');
 assert.deepEqual(home.map(n=>n.id).sort(),['about','contact','core','education','experience','projects','skills']);
 for(const id of ['education','experience','skills'])assert.ok(seed.edges.some(e=>e.source===id&&e.target==='core'&&e.directed));
 for(const id of ['about','projects','contact'])assert.ok(seed.edges.some(e=>e.source==='core'&&e.target===id&&e.directed));
 for(const world of ['projects','skills','experience','education','contact'])assert.ok(seed.nodes.some(n=>n.id===`${world}_root`&&n.world===world));
 assert.ok(seed.nodes.some(n=>n.id==='contact_email'&&n.appearance.legacyNode==='contact_email'));
 assert.ok(seed.nodes.some(n=>n.id==='yolov8'&&n.parentId==='cv-category'));
});
