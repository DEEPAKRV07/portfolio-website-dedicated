import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** Optional models are same-origin by default; remote origins require an explicit allowlist. */
export function safeModelUrl(value, base, allowedOrigins = []) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value, base);
    const origin = new URL(base).origin;
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    if (url.origin !== origin && !allowedOrigins.includes(url.origin)) return null;
    if (!/\.(glb|gltf)$/i.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}

export class AssetRegistry {
  constructor({ base = globalThis.location?.href || 'https://localhost/', allowedOrigins = [], onStatus = () => {} } = {}) {
    this.base = base;
    this.allowedOrigins = allowedOrigins;
    this.onStatus = onStatus;
    this.entries = new Map();
    this.loaded = new Map();
    this.pending = new Map();
    this.disposed = false;
    this.loader = new GLTFLoader();
  }

  register(id, source) {
    const url = safeModelUrl(source, this.base, this.allowedOrigins);
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id) || !url) throw new Error('Model must have a valid ID and an allowed GLB/GLTF URL.');
    this.entries.set(id, url);
  }

  async load(id) {
    if (this.disposed || !this.entries.has(id)) return null;
    if (this.loaded.has(id)) return this.loaded.get(id).scene.clone(true);
    if (!this.pending.has(id)) {
      this.onStatus({ state: 'loading', message: `Loading optional model: ${id}` });
      this.pending.set(id, this.loader.loadAsync(this.entries.get(id)).then((gltf) => {
        if (this.disposed) { disposeModel(gltf.scene); return null; }
        this.loaded.set(id, gltf);
        this.onStatus({ state: 'ready', message: `Model ready: ${id}` });
        return gltf;
      }).catch(() => {
        this.onStatus({ state: 'ready', message: `Optional model ${id} unavailable; using procedural geometry.` });
        return null;
      }).finally(() => this.pending.delete(id)));
    }
    const gltf = await this.pending.get(id);
    return gltf?.scene.clone(true) || null;
  }

  dispose() {
    this.disposed = true;
    for (const gltf of this.loaded.values()) disposeModel(gltf.scene);
    this.loaded.clear();
    this.entries.clear();
    this.pending.clear();
  }
}

function disposeModel(scene) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  scene.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : object.material ? [object.material] : []) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  for (const disposable of [...geometries, ...materials, ...textures]) disposable.dispose();
}
