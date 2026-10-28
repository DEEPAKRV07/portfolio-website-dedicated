import { MAX_MEDIA_BYTES, MEDIA_MIMES, migrateSnapshot, publishedSnapshot, validateSnapshot } from './schema.js';
import { saveLocalMedia } from './localMedia.js';

const clone = value => JSON.parse(JSON.stringify(value));
const uuid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const KEY = 'deepak-portfolio-v3';
const MAX_IMPORT_BYTES = 8 * 1024 * 1024;
const getStorage = () => { try { return globalThis.localStorage; } catch { return null; } };

/**
 * Full-snapshot persistence with two deliberately distinct modes:
 * - Local browser workspace: reload-safe drafts, history, dev-only publication.
 * - Supabase: public read + authenticated owner writes, atomic publication/history.
 * Supabase RLS is the authorization boundary; UI state is never authorization.
 */
export class ContentStore {
  constructor(options = {}) {
    const env = import.meta.env ?? {};
    this.url = (options.url ?? env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
    this.anonKey = options.anonKey ?? env.VITE_SUPABASE_ANON_KEY ?? '';
    if (this.anonKey.startsWith('sb_secret_')) throw new Error('A secret Supabase key must never be used in a browser build.');
    try {
      const payload = JSON.parse(globalThis.atob(this.anonKey.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/') ?? ''));
      if (payload.role === 'service_role') throw new Error('A service-role key must never be used in a browser build.');
    } catch (error) {
      if (error.message?.includes('service-role')) throw error;
    }
    this.remoteConfigured = Boolean(this.url && this.anonKey);
    if (this.remoteConfigured && !/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(this.url)) throw new Error('Supabase URL must be an HTTPS origin.');
    // An explicit option is useful for test harnesses and is never read from URL/localStorage.
    this.development = options.development ?? Boolean(env.DEV);
    this.storage = options.storage ?? getStorage();
    this.fetch = options.fetch ?? globalThis.fetch?.bind(globalThis);
    this.clock = options.clock ?? (() => new Date());
    this.key = options.storageKey ?? KEY;
    this.mode = this.remoteConfigured ? 'supabase' : 'local';
    this.session = null;
    this.user = null;
    this.draft = null;
    this.published = null;
    this.seed = null;
    this.lastError = '';
    this.listeners = new Set();
  }

  get authenticated() { return Boolean(this.session?.access_token && this.user); }

  getCapabilities() {
    return {
      mode: this.mode, remoteConfigured: this.remoteConfigured, authenticated: this.authenticated,
      canEdit: this.remoteConfigured ? this.authenticated : this.development,
      canPublish: this.remoteConfigured ? this.authenticated : this.development,
      canUpload: this.remoteConfigured ? this.authenticated : this.development,
      storageMessage: this.remoteConfigured
        ? (this.authenticated ? 'Owner session active. Drafts and publications are stored in Supabase.' : 'Public portfolio from Supabase. Sign in as the configured owner to edit.')
        : (this.development ? 'Browser workspace. Drafts and preview publications stay in this browser; export JSON for backup. A backend is required to update other visitors.' : 'Owner editing requires a configured backend. The published portfolio remains available.'),
    };
  }

  subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  emit() { this.listeners.forEach(listener => listener(this.getCapabilities())); }

  validate(snapshot) {
    const result = validateSnapshot(snapshot);
    if (!result.valid) throw new Error(`Portfolio validation failed:\n${result.errors.join('\n')}`);
    return clone(snapshot);
  }

  readLocal(name, fallback = null) {
    try {
      const raw = this.storage?.getItem(`${this.key}:${name}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      this.lastError = `The saved browser ${name} could not be read. The bundled portfolio is still available.`;
      return fallback;
    }
  }

  writeLocal(name, value) {
    if (!this.storage) throw new Error('Browser storage is unavailable. Export your draft as JSON before leaving.');
    try { this.storage.setItem(`${this.key}:${name}`, JSON.stringify(value)); }
    catch { throw new Error('Browser storage is full or unavailable. Remove large media or export your draft as JSON.'); }
  }

  async init(seed) {
    this.seed = this.validate(seed);
    this.published = publishedSnapshot(seed);
    this.draft = clone(seed);
    if (this.remoteConfigured) {
      try {
        const rows = await this.request('/rest/v1/portfolio_public?id=eq.portfolio&select=snapshot', { anonymous: true });
        if (rows[0]?.snapshot) {
          const snapshot = migrateSnapshot(rows[0].snapshot);
          this.published = publishedSnapshot(snapshot);
          this.draft = clone(snapshot);
        }
      } catch (error) {
        this.lastError = `Live content is unavailable; showing the bundled portfolio. ${error.message}`;
      }
      // Never read a browser workspace into the remote public site.
    } else {
      try {
        const localDraft = this.readLocal('draft');
        if (localDraft) this.draft = migrateSnapshot(localDraft);
      } catch (error) { this.lastError = `Saved draft is invalid: ${error.message}`; }
      // A malicious/stale localStorage value cannot replace production content.
      if (this.development) {
        try {
          const localPublic = this.readLocal('published');
          if (localPublic) this.published = publishedSnapshot(migrateSnapshot(localPublic));
        } catch (error) { this.lastError = `Saved preview is invalid: ${error.message}`; }
      }
    }
    return clone(this.published);
  }

  getDraft() { return clone(this.draft ?? this.seed); }
  getPublished() { return clone(this.published ?? this.seed); }

  async saveDraft(snapshot) {
    if (!this.getCapabilities().canEdit) throw new Error('Sign in as the authorized owner, or use the local development workspace. Public editing is disabled.');
    const valid = this.validate(snapshot);
    if (this.remoteConfigured) {
      await this.requireOwner();
      await this.request('/rest/v1/portfolio_drafts?on_conflict=id', {
        method: 'POST', owner: true, headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: { id: 'portfolio', snapshot: valid, updated_at: this.clock().toISOString() },
      });
    } else this.writeLocal('draft', valid);
    this.draft = valid;
    return clone(valid);
  }

  async publish(snapshot) {
    const valid = this.validate(snapshot);
    if (this.remoteConfigured && valid.records.some(record => record.media.some(media => [media.url, media.poster].some(url => url?.startsWith('local-media:'))))) throw new Error('Upload local media to cloud storage before publishing to visitors.');
    const publicDocument = publishedSnapshot(valid);
    // Validate after filtering too: e.g. published nodes cannot reference hidden sections.
    this.validate(publicDocument);
    if (this.remoteConfigured) {
      await this.requireOwner();
      await this.request('/rest/v1/rpc/publish_portfolio', {
        method: 'POST', owner: true, body: { draft_document: valid, public_document: publicDocument },
      });
    } else {
      if (!this.development) throw new Error('Public publishing requires a configured backend. This production site supports browser drafts and JSON export only.');
      const history = this.readLocal('history', []);
      const version = { id: uuid(), createdAt: this.clock().toISOString(), label: `Published ${this.clock().toLocaleString()}`, snapshot: valid };
      // One envelope is used as a small transaction journal: history first, then draft,
      // then public pointer. Any quota error leaves the last public snapshot intact.
      this.writeLocal('history', [version, ...history].slice(0, 30));
      this.writeLocal('draft', valid);
      this.writeLocal('published', publicDocument);
    }
    this.draft = valid;
    this.published = publicDocument;
    this.emit();
    return clone(publicDocument);
  }

  async history() {
    if (!this.remoteConfigured) return clone(this.readLocal('history', []));
    await this.requireOwner();
    const rows = await this.request('/rest/v1/portfolio_versions?select=id,created_at,label&order=created_at.desc&limit=30', { owner: true });
    return rows.map(row => ({ id: row.id, createdAt: row.created_at, label: row.label }));
  }
  getHistory() { return this.history(); }

  async restore(versionId) {
    let snapshot;
    if (this.remoteConfigured) {
      await this.requireOwner();
      if (!/^[0-9a-f-]{36}$/i.test(versionId)) throw new Error('Invalid version ID.');
      const rows = await this.request(`/rest/v1/portfolio_versions?id=eq.${encodeURIComponent(versionId)}&select=snapshot`, { owner: true });
      snapshot = rows[0]?.snapshot;
    } else snapshot = this.readLocal('history', []).find(version => version.id === versionId)?.snapshot;
    if (!snapshot) throw new Error('This saved version is no longer available.');
    return this.saveDraft(migrateSnapshot(snapshot));
  }
  restoreVersion(id) { return this.restore(id); }

  exportSnapshot(snapshot = this.getDraft()) {
    return JSON.stringify(this.validate(snapshot), null, 2);
  }

  importSnapshot(json) {
    if (typeof json !== 'string' || new TextEncoder().encode(json).length > MAX_IMPORT_BYTES) throw new Error('Import must be a JSON file under 8 MB.');
    let parsed;
    try { parsed = JSON.parse(json); } catch { throw new Error('Import is not valid JSON.'); }
    return migrateSnapshot(parsed);
  }

  async request(path, options = {}) {
    if (!this.fetch) throw new Error('Network requests are unavailable.');
    if (options.owner && !this.authenticated) throw new Error('Sign in as the owner to make changes.');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await this.fetch(`${this.url}${path}`, {
        method: options.method ?? 'GET', signal: controller.signal,
        headers: {
          apikey: this.anonKey,
          ...((!options.anonymous && this.session?.access_token)
            ? { Authorization: `Bearer ${this.session.access_token}` }
            : this.anonKey.startsWith('sb_publishable_') ? {} : { Authorization: `Bearer ${this.anonKey}` }),
          ...(options.raw ? {} : { 'Content-Type': 'application/json' }),
          ...options.headers,
        },
        ...(options.body !== undefined ? { body: options.raw ? options.body : JSON.stringify(options.body) } : {}),
      });
      if (!response.ok) {
        let detail = '';
        try {
          const error = await response.json();
          detail = error.msg ?? error.message ?? error.error_description ?? error.error ?? '';
        } catch { /* Avoid rendering arbitrary response HTML. */ }
        if ([401, 403].includes(response.status) && options.owner) {
          this.session = null;
          this.user = null;
          this.emit();
        }
        throw new Error(detail ? `Request failed (${response.status}): ${String(detail).slice(0, 300)}` : `Request failed (${response.status}).`);
      }
      if (response.status === 204 || response.headers?.get('content-length') === '0') return null;
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The content service timed out. Try again.');
      throw error;
    } finally { clearTimeout(timeout); }
  }

  async signIn(email, password) {
    if (!this.remoteConfigured) throw new Error('Configure Supabase before signing in. Local editing does not use a password.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) throw new Error('Enter your owner email and password.');
    const session = await this.request('/auth/v1/token?grant_type=password', { method: 'POST', anonymous: true, body: { email, password } });
    if (!session?.access_token) throw new Error('The service did not return a valid session.');
    this.session = { ...session, expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in };
    try {
      const user = await this.request('/auth/v1/user');
      if (!user?.id || !/^[0-9a-f-]{36}$/i.test(user.id)) throw new Error('The service returned an invalid user.');
      const owners = await this.request(`/rest/v1/portfolio_owners?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`);
      if (!owners.some(owner => owner.user_id === user.id)) throw new Error('This account is not an authorized portfolio owner.');
      this.user = user;
      const drafts = await this.request('/rest/v1/portfolio_drafts?id=eq.portfolio&select=snapshot', { owner: true });
      if (drafts[0]?.snapshot) this.draft = migrateSnapshot(drafts[0].snapshot);
      this.emit();
      return clone(user);
    } catch (error) {
      await this.request('/auth/v1/logout', { method: 'POST' }).catch(() => {});
      this.session = null;
      this.user = null;
      this.emit();
      throw error;
    }
  }

  async requireOwner() {
    if (!this.authenticated) throw new Error('Sign in as the authorized owner before saving or publishing.');
    if (this.session.expires_at && this.session.expires_at < Date.now() / 1000 + 30) {
      try {
        const session = await this.request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', anonymous: true, body: { refresh_token: this.session.refresh_token } });
        if (!session?.access_token) throw new Error('Session expired.');
        this.session = { ...session, expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in };
      } catch {
        this.session = null;
        this.user = null;
        this.emit();
        throw new Error('Your session expired. Sign in again; the open editor still contains your unsaved changes.');
      }
    }
  }

  async signOut() {
    if (this.session) {
      try { await this.request('/auth/v1/logout', { method: 'POST' }); }
      finally { this.session = null; this.user = null; this.draft = clone(this.published ?? this.seed); this.emit(); }
    }
  }

  async uploadMedia(file) {
    if (!file || !MEDIA_MIMES.includes(file.type)) throw new Error('Supported media: JPEG, PNG, WebP, GIF, MP4, WebM, and PDF. SVG and executable files are not allowed.');
    if (!Number.isFinite(file.size) || file.size < 1 || file.size > MAX_MEDIA_BYTES) throw new Error('Choose a non-empty media file no larger than 20 MB.');
    if (!this.getCapabilities().canUpload) throw new Error('Media upload requires the authorized owner or local development workspace.');
    let url;
    const id = uuid();
    const name = String(file.name ?? 'media').replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100);
    if (this.remoteConfigured) {
      await this.requireOwner();
      const path = `${this.user.id}/${id}-${name}`;
      await this.request(`/storage/v1/object/portfolio-media/${path}`, {
        method: 'POST', owner: true, raw: true, body: file,
        headers: { 'Content-Type': file.type, 'x-upsert': 'false' },
      });
      url = `${this.url}/storage/v1/object/public/portfolio-media/${path}`;
    } else {
      url = await saveLocalMedia(id, file);
    }
    return { id, type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document', url, name, alt: '', caption: '', order: 0 };
  }
}
