import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BASE_URL } from '../data/portfolioData.js';

/* ============================================================
   ASSET MANAGER — GLB MODEL ENGINE & INDEXER
   ============================================================ */

export const ASSET_MANIFEST = [
  { id: 'home',       filename: 'home.glb',       path: `${BASE_URL}models/home.glb` },
  { id: 'projects',   filename: 'projects.glb',   path: `${BASE_URL}models/projects.glb` },
  { id: 'skills',     filename: 'skills.glb',     path: `${BASE_URL}models/skills.glb` },
  { id: 'experience', filename: 'experience.glb', path: `${BASE_URL}models/experience.glb` },
  { id: 'contact',    filename: 'contact.glb',    path: `${BASE_URL}models/contact.glb` },
  { id: 'education',  filename: 'education.glb',  path: `${BASE_URL}models/education.glb` },
];

export class AssetManager {
  constructor() {
    this.loader = new GLTFLoader();
    this.assets = new Map();
    this.mixers = [];
    this.isLoaded = false;
    this.loadProgress = 0;
  }

  /**
   * Load all 6 GLB models asynchronously with weighted progress tracking
   * @param {Function} onProgress - Callback receiving (ratio, statusText, currentAssetId)
   * @returns {Promise<Map<string, Object>>}
   */
  async loadAll(onProgress = null) {
    const totalAssets = ASSET_MANIFEST.length;
    let loadedCount = 0;

    const loadPromises = ASSET_MANIFEST.map((manifestItem) => {
      return new Promise((resolve) => {
        this.loader.load(
          manifestItem.path,
          (gltf) => {
            const processedAsset = this._processGLTF(manifestItem, gltf);
            this.assets.set(manifestItem.id, processedAsset);

            loadedCount++;
            const ratio = loadedCount / totalAssets;
            this.loadProgress = ratio;

            if (onProgress) {
              onProgress(
                ratio,
                `LOADING 3D ASSETS (${loadedCount}/${totalAssets}): ${manifestItem.filename}`,
                manifestItem.id
              );
            }
            resolve(processedAsset);
          },
          (event) => {
            // Optional byte-level progress calculation per file
            if (event.lengthComputable && onProgress) {
              const fileRatio = event.loaded / event.total;
              const overallRatio = (loadedCount + fileRatio) / totalAssets;
              onProgress(
                overallRatio,
                `DOWNLOADING 3D ASSETS: ${manifestItem.filename} (${Math.round(fileRatio * 100)}%)`,
                manifestItem.id
              );
            }
          },
          (error) => {
            console.error(`[GLB] Failed to load: ${manifestItem.filename}`, error);
            // Record placeholder for failed asset to prevent app crash
            this.assets.set(manifestItem.id, {
              id: manifestItem.id,
              filename: manifestItem.filename,
              error: true,
              errorMessage: error.message || 'Failed to load model file',
              scene: new THREE.Group(),
              animations: [],
              mixer: null,
              nodes: new Map(),
              nodeList: [],
              clips: new Map(),
            });

            loadedCount++;
            const ratio = loadedCount / totalAssets;
            if (onProgress) {
              onProgress(ratio, `WARNING: FAILED TO LOAD ${manifestItem.filename}`, manifestItem.id);
            }
            resolve(null);
          }
        );
      });
    });

    await Promise.all(loadPromises);
    this.isLoaded = true;
    this.printDiagnostics();
    return this.assets;
  }

  /**
   * Internal processor for loaded GLTF scenes & animations
   */
  _processGLTF(manifestItem, gltf) {
    const scene = gltf.scene;
    scene.name = `GLB_${manifestItem.id.toUpperCase()}`;

    // 1. Initialize AnimationMixer if animations exist
    const animations = gltf.animations || [];
    let mixer = null;
    if (animations.length > 0) {
      mixer = new THREE.AnimationMixer(scene);
      this.mixers.push(mixer);
    }

    // 2. Index Scene Nodes
    const nodesByName = new Map();
    const nodeList = [];

    scene.traverse((child) => {
      if (child.name) {
        nodesByName.set(child.name, child);
        nodeList.push(child);
      }
    });

    // 3. Index Animation Clips by actual Blender clip name
    const clipsByName = new Map();
    animations.forEach((clip) => {
      if (clip.name) {
        clipsByName.set(clip.name, clip);
      }
    });

    return {
      id: manifestItem.id,
      filename: manifestItem.filename,
      gltf,
      scene,
      animations,
      mixer,
      nodes: nodesByName,
      nodeList,
      clips: clipsByName,
    };
  }

  /**
   * Get an asset container by key ('home', 'projects', etc.)
   */
  getAsset(assetId) {
    return this.assets.get(assetId) || null;
  }

  /**
   * Find a specific node by name within a specific GLB or across all GLBs
   */
  getNode(nodeName, assetId = null) {
    if (assetId) {
      const asset = this.getAsset(assetId);
      return asset && asset.nodes ? asset.nodes.get(nodeName) : null;
    }

    for (const [, asset] of this.assets) {
      if (asset.nodes && asset.nodes.has(nodeName)) {
        return asset.nodes.get(nodeName);
      }
    }
    return null;
  }

  /**
   * Find all nodes matching a prefix (e.g. 'football_detail_', 'skills_')
   */
  getNodesByPrefix(prefix, assetId = null) {
    const matches = [];
    const searchAssets = assetId ? [this.getAsset(assetId)].filter(Boolean) : Array.from(this.assets.values());

    for (const asset of searchAssets) {
      if (!asset.nodes) continue;
      for (const [name, node] of asset.nodes) {
        if (name.startsWith(prefix)) {
          matches.push(node);
        }
      }
    }
    return matches;
  }

  /**
   * Advance all active animation mixers (called in main render loop)
   * @param {number} delta Seconds since last frame
   */
  update(delta) {
    for (let i = 0; i < this.mixers.length; i++) {
      this.mixers[i].update(delta);
    }
  }

  /**
   * Print comprehensive diagnostic report to developer console
   */
  printDiagnostics() {
    console.group('%c[GLB Asset Manager Diagnostics]', 'color: #00ff88; font-weight: bold;');
    let totalNodes = 0;
    let totalClips = 0;

    for (const [id, asset] of this.assets) {
      if (asset.error) {
        console.warn(`[GLB] ❌ ${asset.filename}: LOAD FAILED (${asset.errorMessage})`);
        continue;
      }

      const nodeCount = asset.nodes ? asset.nodes.size : 0;
      const clipCount = asset.animations ? asset.animations.length : 0;
      totalNodes += nodeCount;
      totalClips += clipCount;

      console.group(`[GLB] Loaded: ${asset.filename}`);
      console.log(`Nodes Indexed: ${nodeCount}`);
      console.log(`Animations Indexed: ${clipCount}`);
      console.log(`Mixer: ${asset.mixer ? 'Initialized' : 'None (Static Model)'}`);

      // Sample key node names
      const sampleNodes = Array.from(asset.nodes.keys()).slice(0, 8);
      console.log(`Sample Nodes:`, sampleNodes.join(', ') + (nodeCount > 8 ? '...' : ''));

      if (clipCount > 0) {
        const sampleClips = Array.from(asset.clips.keys()).slice(0, 5);
        console.log(`Sample Animations:`, sampleClips.join(', ') + (clipCount > 5 ? '...' : ''));
      }
      console.groupEnd();
    }

    console.log(`%c[GLB Summary] Total Assets: ${this.assets.size} | Total Nodes: ${totalNodes} | Total Animations: ${totalClips}`, 'color: #00ff88;');
    console.groupEnd();
  }
}

export const assetManager = new AssetManager();
