import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GeometryFactory } from './GeometryFactory.js';
import { AssetRegistry } from './AssetRegistry.js';
import { LegacyNeuralAssets } from './LegacyNeuralAssets.js';
import { calculateLayout, layoutBounds } from './layout.js';
import { createConnection } from './connections.js';
import { relationshipPath, skillPositions } from '../skillsGraph.js';
import { computationPositions, computationPath, isLayered } from '../computationGraph.js';
import { THEME } from '../theme.js';
import './engine.css';

const EMPTY = { nodes: [], edges: [], records: [], settings: {} };
const ease = (value) => 1 - Math.pow(1 - Math.min(1, Math.max(0, value)), 3);
const samePosition = (first, second) => first?.every((value, axis) => Math.abs(value - second[axis]) < 0.00001);
const DIRECTIONS = {
  home: [0.06, 0.05, 1.4], projects: [0.08, 0.04, 1.4], skills: [0, 0.02, 1.4],
  experience: [0.08, 0.08, 1.4], education: [0.06, 0.08, 1.4], contact: [0.05, 0.03, 1.4],
};

/**
 * A shared renderer for the public portfolio and Studio. It contains no content
 * editing, routing, persistence or HTML detail-panel logic.
 *
 * onSelect(id, node): user click/tap/keyboard activation only.
 * onMove(id, [x,y,z]): one commit at the end of an editor drag.
 * onStatus({ state, message }): actual ready/loading/fallback states.
 */
export class SceneEngine {
  constructor({ container, onSelect = () => {}, onStatus = () => {}, editable = false, onMove = () => {} }) {
    if (!container?.appendChild) throw new Error('SceneEngine requires a DOM container.');
    this.container = container;
    this.onSelect = onSelect; this.onStatus = onStatus; this.onMove = onMove;
    this.editable = editable;
    this.snapshot = EMPTY;
    this.world = 'home';
    this.nodes = new Map(); this.edges = new Map(); this.labels = new Map();
    this.positions = new Map(); this.cameraStates = new Map();
    this.factory = new GeometryFactory();
    this.assets = new AssetRegistry({ onStatus: (status) => this.status(status) });
    this.legacyAssets = new LegacyNeuralAssets();
    this.selectedId = null; this.hoveredId = null;
    this.quality = 'auto'; this.autoDpr = 1.5; this.frameSamples = [];
    this.motionRequested = true; this.visible = true; this.disposed = false;
    this.media = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
    this.motion = !this.media?.matches;
    this.listeners = [];
    this.clock = 0; this.lastFrameTime = 0; this.frameCount = 0;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.vector = new THREE.Vector3();
    this.container.classList.add('v3-scene-host');
    this.labelLayer = document.createElement('div');
    this.labelLayer.className = 'v3-scene-labels';
    this.labelLeaders = document.createElementNS('http://www.w3.org/2000/svg','svg');
    this.labelLeaders.setAttribute('class','v3-label-leaders');this.labelLeaders.setAttribute('aria-hidden','true');
    this.labelLayer.append(this.labelLeaders);
    this.layerGuides=['01 INPUT','02 HIDDEN / SYNTHESIS','03 OUTPUT'].map(text=>{const guide=document.createElement('span');guide.className='v3-layer-guide';guide.textContent=text;guide.hidden=true;this.labelLayer.append(guide);return guide;});
    this.labelLayer.setAttribute('role', 'group');
    this.labelLayer.setAttribute('aria-label', editable ? 'Scene nodes. Select a node or drag geometry to move it.' : 'Explore portfolio scene');
    this.legend = document.createElement('div');
    this.legend.className = 'v3-scene-legend';
    this.legend.innerHTML = editable ? '<b>Scene editor</b> Drag node · orbit empty space · scroll to zoom' : '<b>Live environment</b> Drag to orbit · select a node';
    this.container.append(this.labelLayer, this.legend);
    this.navigationActive = editable;
    this.navigationButton = document.createElement('button');
    this.navigationButton.className = 'v3-navigation-toggle';
    this.navigationButton.type = 'button';
    this.navigationButton.textContent = editable ? 'Exit 3D gestures' : 'Enable 3D gestures';
    this.navigationButton.setAttribute('aria-pressed', String(editable));
    this.navigationButton.addEventListener('click', () => this.setNavigation(!this.navigationActive));
    this.container.append(this.navigationButton);
    try {
      this.initializeRenderer();
    } catch {
      this.fallback = document.createElement('div');
      this.fallback.className = 'v3-scene-fallback';
      const message = document.createElement('p');
      message.textContent = '3D rendering is unavailable in this browser. Explore every section using the accessible scene links.';
      this.fallback.append(message);
      this.container.prepend(this.fallback);
      this.container.classList.add('is-fallback');
      this.renderer?.dispose();
      this.renderer?.domElement.remove();
      this.renderer = null;
      this.navigationButton.disabled=true;
      this.status({ state: 'fallback', message: 'WebGL unavailable. Accessible portfolio navigation remains available.' });
    }
    this.onVisibility = () => { if (document.hidden) this.stop(); else { this.lastFrameTime = 0; this.invalidate(); } };
    this.listen(document, 'visibilitychange', this.onVisibility);
    this.onReducedMotion = () => this.setMotion(this.motionRequested);
    if (this.media?.addEventListener) this.listen(this.media, 'change', this.onReducedMotion);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    if (globalThis.IntersectionObserver) {
      this.intersectionObserver = new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
        if (!this.visible) this.stop();
        else { this.lastFrameTime = 0; this.invalidate(); }
      }, { rootMargin: '100px' });
      this.intersectionObserver.observe(container);
    }
    this.resize();
  }

  status(status) {
    queueMicrotask(() => { if (!this.disposed) this.onStatus(status); });
  }

  listen(target, name, listener, options) {
    target.addEventListener(name, listener, options);
    this.listeners.push(() => target.removeEventListener(name, listener, options));
  }

  initializeRenderer() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(THEME.background, 0.016);
    this.camera = new THREE.PerspectiveCamera(39, 1, 0.1, 180);
    this.camera.position.set(9, 12, 22);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor('#07100d', 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.13;
    const canvas = this.renderer.domElement;
    canvas.className = 'v3-scene-canvas';
    canvas.setAttribute('aria-label', 'Interactive 3D portfolio. Mouse drag to orbit; Alt + wheel to zoom. Enable 3D gestures for touch orbit and pinch. Otherwise swipe or scroll the page.');
    canvas.setAttribute('role', 'img');
    canvas.tabIndex = 0;
    this.container.prepend(canvas);
    this.controls = new OrbitControls(this.camera, canvas);
    this.setNavigation(this.navigationActive);
    // OrbitControls prevents wheel defaults only when zoom is enabled. Gate it
    // before its bubble handler; ordinary wheel events retain native scrolling.
    this.listen(canvas, 'wheel', event => { this.controls.enableZoom = this.navigationActive || event.altKey; }, { capture: true, passive: true });
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.rotateSpeed = 0.48;
    this.controls.zoomSpeed = 0.65;
    this.controls.enablePan = true;
    this.controls.minPolarAngle = 0.22;
    this.controls.maxPolarAngle = Math.PI * 0.62;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 65;
    this.controls.addEventListener('change', () => this.invalidate());
    this.controls.addEventListener('start', () => { this.cameraTransition = null; this.invalidate(); });

    this.scene.add(new THREE.HemisphereLight('#b7f3d7', '#172a25', 1.55));
    const key = new THREE.DirectionalLight('#e4fff0', 4.4);
    key.castShadow = true; key.shadow.mapSize.set(1024,1024); key.shadow.camera.left=-22;key.shadow.camera.right=22;key.shadow.camera.top=22;key.shadow.camera.bottom=-22;key.shadow.bias=-.001;
    key.position.set(-7, 11, 8);
    const fill = new THREE.DirectionalLight('#37b8bb', 2.8);
    fill.position.set(7, 2, -6);
    const warm = new THREE.DirectionalLight('#e0ae79', 1.7);
    warm.position.set(4, 6, 7);
    this.scene.add(key, fill, warm);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const environment = new RoomEnvironment();
    this.environmentTexture = pmrem.fromScene(environment, 0.02);
    this.scene.environment = this.environmentTexture.texture;
    environment.dispose(); pmrem.dispose();
    this.environment = this.factory.environment();
    this.scene.add(this.environment.group);
    this.graphGroup = new THREE.Group();
    this.scene.add(this.graphGroup);

    this.listen(canvas, 'pointerdown', (event) => this.pointerDown(event), { capture: true });
    this.listen(canvas, 'pointermove', (event) => this.pointerMove(event));
    this.listen(canvas, 'pointerup', (event) => this.pointerUp(event));
    this.listen(canvas, 'pointercancel', () => this.cancelDrag());
    this.listen(canvas, 'pointerleave', () => { if (!this.drag) this.hover(null); });
    this.listen(canvas, 'keydown', (event) => this.keyDown(event));
    this.listen(canvas, 'webglcontextlost', (event) => {
      event.preventDefault();
      this.stop();
      this.contextLost = true;
      this.status({ state: 'fallback', message: 'Graphics context paused. Navigation and content are still available.' });
    });
    this.listen(canvas, 'webglcontextrestored', () => {
      this.contextLost = false;
      this.invalidate();
      this.status({ state: 'ready', message: '3D environment restored.' });
    });
    this.status({ state: 'ready', message: 'Procedural environment ready.' });
  }

  setData(snapshot) {
    if (this.disposed) return;
    this.snapshot = snapshot || EMPTY;
    this.reconcile();
  }

  setWorld(world) {
    if (this.disposed || !world || this.world === world) return;
    // A navigation focus is transient; never restore it as a world's overview.
    if (this.camera && this.controls && !this.selectedId) this.cameraStates.set(this.world, { position: this.camera.position.clone(), target: this.controls.target.clone() });
    this.world = world;
    if(!this.editable)this.setNavigation(false);
    this.branchId=null;
    this.selectedId = null;
    this.hoveredId = null;
    this.reconcile();
    const restored = this.cameraStates.get(world);
    if (restored && this.renderer) this.moveCamera(restored.position, restored.target);
    else this.resetCamera();
  }

  reconcile() {
    let visibleNodes = (this.snapshot.nodes || []).filter((node) => node.world === this.world && node.visible !== false);
    if(this.world==='skills'&&visibleNodes.some(n=>n.graphRole==='domain')){
      if(this.branchId){
        const ids=new Set(visibleNodes.filter(n=>n.graphRole==='identity'||n.id===this.branchId||n.parentId===this.branchId).map(n=>n.id));
        for(const edge of this.snapshot.edges)if(edge.relationship==='applied-in'&&ids.has(edge.source))ids.add(edge.target);
        visibleNodes=visibleNodes.filter(n=>ids.has(n.id));
      }else visibleNodes=visibleNodes.filter(n=>n.graphRole!=='evidence');
    }
    const ids = new Set(visibleNodes.map((node) => node.id));
    const records = new Map((this.snapshot.records || []).map((record) => [record.id, record]));
    const edges = (this.snapshot.edges || []).filter((edge) => ids.has(edge.source) && ids.has(edge.target));
    const strategy = this.snapshot.settings?.layouts?.[this.world] || (['experience', 'education'].includes(this.world) ? 'timeline' : 'radial');
    const positions = calculateLayout(visibleNodes, edges, strategy);
    this.layered = isLayered(visibleNodes) && strategy === 'network';
    if(this.layered)for(const [id,position] of computationPositions(visibleNodes,this.width<600))positions.set(id,position);
    if(this.world==='skills'&&strategy==='network')for(const [id,position]of skillPositions(visibleNodes,edges,this.branchId,this.width<600))positions.set(id,position);
    const firstBuild = !this.nodes.size;
    const changed = new Set();
    for (const [id, entry] of this.nodes) {
      if (!ids.has(id)) {
        entry.authored?.dispose();
        entry.dispose?.();
        this.labels.get(id)?._leader?.remove();this.labels.get(id)?.remove();
        this.nodes.delete(id); this.labels.delete(id); changed.add(id);
      }
    }
    for (const node of visibleNodes) {
      const record = records.get(node.contentId) || {};
      const fingerprint = JSON.stringify([node.appearance, record.type]);
      let entry = this.nodes.get(node.id);
      if (!entry || fingerprint !== entry.fingerprint) {
        entry?.authored?.dispose();
        entry?.dispose?.();
        entry = this.renderer ? this.factory.createNode(node, record) : { radius: 1, labelHeight: 1.5, size: 1 };
        entry.node = node; entry.record = record; entry.fingerprint = fingerprint;
        entry.created = this.clock + (this.layered ? (node.networkLayer || 0) * .35 : 0); entry.introComplete = false;
        if (entry.group) this.graphGroup.add(entry.group);
        this.nodes.set(node.id, entry); changed.add(node.id);
        if (node.appearance?.assetId) this.applyAsset(node.id, node.appearance.assetId, entry);
        if (entry.nucleus && node.appearance?.legacyWorld) this.applyLegacyNode(node, entry);
      } else { entry.node = node; entry.record = record; }
      if (!samePosition(this.positions.get(node.id), positions.get(node.id))) changed.add(node.id);
      entry.position = positions.get(node.id);
      entry.compactBranch=this.world==='skills'&&Boolean(this.branchId)&&this.width<600;
      entry.layeredCompact=this.layered&&this.width<600;
      entry.group?.position.fromArray(entry.position);
      this.ensureLabel(node, record, entry);
    }
    this.positions = positions;
    this.visibleNodes = visibleNodes;
    this.syncEdges(edges, changed);
    if (this.renderer) {
      this.environment.group.visible = true;
      if (firstBuild) this.resetCamera(true);
      this.select(this.selectedId);
    }
    this.legend.hidden = !visibleNodes.length;
    this.invalidate();
  }

  ensureLabel(node, record, entry) {
    let label = this.labels.get(node.id);
    if (!label) {
      label = document.createElement('button');
      label.type = 'button';
      label.className = this.renderer ? 'v3-scene-label is-entering' : 'v3-scene-label';
      label._leader=document.createElementNS('http://www.w3.org/2000/svg','line');this.labelLeaders.append(label._leader);
      label.dataset.nodeId = node.id;
      label.addEventListener('click', (event) => { event.stopPropagation(); this.activate(node.id); });
      // Touch hover can move a projected label before its synthetic click.
      label.addEventListener('pointerup', event => { if(event.pointerType==='touch'){event.preventDefault();event.stopPropagation();this.activate(node.id);} });
      label.addEventListener('pointerenter', () => this.hover(node.id));
      label.addEventListener('pointerleave', () => this.hover(null));
      label.addEventListener('focus', () => { this.focusedLabel = node.id; this.hover(node.id); this.invalidate(); });
      label.addEventListener('blur', () => { this.focusedLabel = null; this.hover(null); });
      label.addEventListener('keydown', (event) => {
        if (this.editable && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) && event.altKey) {
          event.preventDefault();
          const position = [...this.positions.get(node.id)];
          const step = event.shiftKey ? 1 : 0.25;
          if (event.key === 'ArrowLeft') position[0] -= step;
          if (event.key === 'ArrowRight') position[0] += step;
          if (event.key === 'ArrowUp') position[2] -= step;
          if (event.key === 'ArrowDown') position[2] += step;
          this.updateNodePosition(node.id, position);
          this.onMove(node.id, position);
        }
      });
      this.labelLayer.append(label);
      this.labels.set(node.id, label);
    }
    label.textContent = node.label || record.title || node.id;
    label.setAttribute('aria-label', `${this.editable ? 'Select' : 'Explore'} ${node.label || record.title || node.id}`);
    label.setAttribute('aria-pressed', String(this.selectedId === node.id));
    label.classList.toggle('is-core', ['core','neural-core'].includes(entry.geometry));
    label.hidden = node.appearance?.labelVisible === false;
    if(label.hidden)label._leader.style.display='none';
    entry.labelWidth = Math.min(this.width < 600 ? 120 : 164, Math.max(entry.geometry==='neural-core'?112:88, label.textContent.length * 6 + 30));
  }

  syncEdges(edges, changed) {
    if (!this.renderer) return;
    const ids = new Set(edges.map((edge) => edge.id));
    for (const [id, entry] of this.edges) {
      if (!ids.has(id)) { entry.dispose(); this.edges.delete(id); }
    }
    for (const edge of edges) {
      const signature = JSON.stringify(edge);
      const current = this.edges.get(edge.id);
      if (current && current.signature === signature && !changed.has(edge.source) && !changed.has(edge.target)) continue;
      current?.dispose();
      this.edges.delete(edge.id);
      const source = this.nodes.get(edge.source), target = this.nodes.get(edge.target);
      if (!source || !target) continue;
      const entry = createConnection(edge, source, target, this.factory);
      if (entry) { entry.signature = signature; this.graphGroup.add(entry.group); this.edges.set(edge.id, entry); }
    }
  }

  updateNodePosition(id, position) {
    const entry = this.nodes.get(id);
    if (!entry || !Array.isArray(position) || position.length !== 3 || !position.every(Number.isFinite)) return;
    const next = position.map((value) => THREE.MathUtils.clamp(value, -100, 100));
    this.positions.set(id, next);
    entry.position = next;
    entry.group?.position.fromArray(next);
    this.syncEdges((this.snapshot.edges || []).filter((edge) => this.nodes.has(edge.source) && this.nodes.has(edge.target)), new Set([id]));
    this.select(this.selectedId);
    this.invalidate();
  }

  setBranch(id) {
    const branch=this.snapshot.nodes.find(n=>n.id===id&&n.world==='skills'&&n.graphRole==='domain');
    const next=branch?.id||null;
    if(this.world!=='skills'||this.branchId===next)return;
    this.branchId=next;this.selectedId=null;this.hoveredId=null;this.focusedLabel=null;this.reconcile();this.resetCamera();
  }

  select(id) {
    this.selectedId = this.nodes.has(id) ? id : null;
    this.relatedNodes=this.layered?computationPath([...this.edges.values()].map(e=>e.edge),this.selectedId):relationshipPath(this.visibleNodes||[],[...this.edges.values()].map(e=>e.edge),this.selectedId);
    for (const [nodeId, entry] of this.nodes) {
      if (entry.selection) entry.selection.visible = nodeId === this.selectedId;
      const label = this.labels.get(nodeId);
      label?.classList.toggle('is-selected', nodeId === this.selectedId);
      label?.setAttribute('aria-pressed', String(nodeId === this.selectedId));
      const related=this.relatedNodes.has(nodeId);
      label?.classList.toggle('is-related',related);
      label?.classList.toggle('is-subdued',Boolean(this.selectedId&&!related));
    }
    this.highlightEdges();
    this.invalidate();
  }

  activate(id) {
    const entry = this.nodes.get(id);
    if (!entry) return;
    this.select(id);
    this.onSelect(id, entry.node);
  }

  hover(id) {
    if (this.hoveredId === id) return;
    this.hoveredId = id;
    for (const [nodeId, entry] of this.nodes) {
      if (entry.highlight) entry.highlight.visible = nodeId === id && entry.node.animation?.hover !== 'none';
    }
    if (this.renderer) this.renderer.domElement.style.cursor = id ? this.editable ? 'move' : 'pointer' : 'grab';
    this.highlightEdges();
    this.invalidate();
  }

  highlightEdges() {
    for (const entry of this.edges.values()) {
      const path=this.selectedId&&this.relatedNodes?.has(entry.edge.source)&&this.relatedNodes?.has(entry.edge.target);
      const hover=this.hoveredId&&(entry.edge.source===this.hoveredId||entry.edge.target===this.hoveredId);
      entry.highlight(Boolean(path||hover),Boolean(this.selectedId&&!path&&!hover));
      if(entry.edge.relationship==='applied-in'&&this.nodes.get(this.selectedId)?.node.graphRole==='domain')entry.material.opacity=.38;
    }
  }

  hit(event) {
    if (!this.renderer) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const objects = [...this.nodes.values()].filter(entry=>entry.introComplete&&!entry.assetPending&&entry.group.visible).map((entry) => entry.group);
    return this.raycaster.intersectObjects(objects, true).find((intersection) => intersection.object.visible && intersection.object.userData.nodeId)?.object.userData.nodeId || null;
  }

  pointerDown(event) {
    if (event.button !== 0) return;
    this.controls.enabled = event.pointerType !== 'touch' || this.navigationActive;
    this.pointerStart = { x: event.clientX, y: event.clientY, id: this.hit(event), pointerId: event.pointerId };
    this.cameraTransition = null;
    if (this.editable && this.pointerStart.id) {
      const entry = this.nodes.get(this.pointerStart.id);
      this.drag = { id: this.pointerStart.id, initial: [...entry.position], moved: false };
      const normal = this.camera.getWorldDirection(new THREE.Vector3());
      this.drag.plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, entry.group.position);
      const point = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.drag.plane, point);
      this.drag.offset = entry.group.position.clone().sub(point);
      this.controls.enabled = false;
      this.renderer.domElement.setPointerCapture(event.pointerId);
      event.stopImmediatePropagation();
      this.select(this.drag.id);
    }
  }

  pointerMove(event) {
    if (this.drag) {
      this.hit(event);
      const point = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.drag.plane, point)) {
        point.add(this.drag.offset);
        const distance = Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y);
        if (distance > 4) this.drag.moved = true;
        if (this.drag.moved) this.updateNodePosition(this.drag.id, point.toArray());
      }
    } else if (event.pointerType !== 'touch' && !event.buttons) this.hover(this.hit(event));
  }

  pointerUp(event) {
    const start = this.pointerStart;
    if (this.drag) {
      const { id, moved } = this.drag;
      this.drag = null;
      this.controls.enabled = true;
      if (this.renderer.domElement.hasPointerCapture(event.pointerId)) this.renderer.domElement.releasePointerCapture(event.pointerId);
      if (moved) this.onMove(id, [...this.positions.get(id)]);
      else this.activate(id);
    } else if (start && start.pointerId === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 6) {
      const id = this.hit(event);
      if (id && id === start.id) this.activate(id);
    }
    this.pointerStart = null;
  }

  cancelDrag() {
    if (this.drag) this.updateNodePosition(this.drag.id, this.drag.initial);
    this.drag = null; this.pointerStart = null;
    if (this.controls) this.controls.enabled = true;
  }

  keyDown(event) {
    if (event.key === 'Escape') this.setNavigation(false);
    if (event.key.toLowerCase() === 'c' || event.key.toLowerCase() === 'r') { event.preventDefault(); this.resetCamera(); }
    if (event.key === 'Escape') { this.cancelDrag(); this.select(null); }
    const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (direction) {
      event.preventDefault();
      const offset = this.camera.position.clone().sub(this.controls.target);
      offset.applyAxisAngle(THREE.Object3D.DEFAULT_UP, direction * 0.15);
      this.camera.position.copy(this.controls.target).add(offset);
      this.controls.update(); this.invalidate();
    }
    if (['+', '=', '-', '_'].includes(event.key)) {
      event.preventDefault();
      const factor = ['+', '='].includes(event.key) ? 0.88 : 1.12;
      this.camera.position.sub(this.controls.target).multiplyScalar(factor).add(this.controls.target);
      this.controls.update(); this.invalidate();
    }
  }

  resetCamera(immediate = false) {
    // A hidden mount has no usable aspect ratio. Frame when ResizeObserver
    // reports its real size instead of creating an enormous 1px-view camera.
    if (!this.renderer || this.width<=1 || this.height<=1) return;
    const bounds = layoutBounds(this.positions, this.visibleNodes || []);
    // Connection curves are part of the scene bounds, including mobile's
    // outside routing lanes. Node centers alone clipped their control arcs.
    const minimum=new THREE.Vector3().fromArray(bounds.center).addScaledVector(new THREE.Vector3().fromArray(bounds.size),-.5);
    const maximum=new THREE.Vector3().fromArray(bounds.center).addScaledVector(new THREE.Vector3().fromArray(bounds.size),.5);
    for(const edge of this.edges.values())for(const point of edge.curve.getPoints(40)){minimum.min(point);maximum.max(point);}
    if(this.world==='skills'&&this.branchId&&this.width<600){
      const half=Math.max(8,Math.abs(minimum.x),Math.abs(maximum.x));minimum.x=-half;maximum.x=half;
    }
    bounds.center=minimum.clone().add(maximum).multiplyScalar(.5).toArray();bounds.size=maximum.clone().sub(minimum).toArray();
    const target = new THREE.Vector3().fromArray(bounds.center);
    target.y += 0.25;
    const direction = new THREE.Vector3().fromArray(DIRECTIONS[this.world] || DIRECTIONS.projects).normalize();
    if (this.width < 600) direction.x *= 0.35;
    direction.normalize();
    const right = new THREE.Vector3().crossVectors(THREE.Object3D.DEFAULT_UP, direction).normalize();
    const up = new THREE.Vector3().crossVectors(direction, right).normalize();
    let halfWidth = 0, halfHeight = 0, halfDepth = 0;
    for (const x of [-0.5, 0.5]) for (const y of [-0.5, 0.5]) for (const z of [-0.5, 0.5]) {
      const corner = new THREE.Vector3(x * bounds.size[0], y * bounds.size[1], z * bounds.size[2]);
      halfWidth = Math.max(halfWidth, Math.abs(corner.dot(right)));
      halfHeight = Math.max(halfHeight, Math.abs(corner.dot(up)));
      halfDepth = Math.max(halfDepth, Math.abs(corner.dot(direction)));
    }
    const tangent = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const availableWidth=this.detailOpen&&this.width>800?this.width*.6:this.width;
    if(availableWidth!==this.width)this.camera.setViewOffset(this.width,this.height,(this.width-availableWidth)/2,0,this.width,this.height);else this.camera.clearViewOffset();
    const distance = Math.max(halfWidth / (tangent * availableWidth/this.height), halfHeight / tangent) * 1.2 + halfDepth;
    this.overviewDistance=Math.max(9,distance);
    // Maintain legibility at the farther camera distances required by phones.
    this.scene.fog.density=.28/this.overviewDistance;
    const position = target.clone().addScaledVector(direction, Math.max(9, distance));
    this.controls.maxDistance = Math.max(45, distance * 2.2);
    this.controls.minDistance = Math.min(5, distance * 0.3);
    this.camera.far = Math.max(180, distance * 4);
    this.camera.updateProjectionMatrix();
    this.moveCamera(position, target, immediate);
  }

  focus(id) {
    const entry = this.nodes.get(id);
    if (!entry || !this.renderer) return;
    this.select(id);
    if(this.world==='skills'&&this.branchId){this.resetCamera();return;}
    const target = new THREE.Vector3().fromArray(this.positions.get(id));
    const direction = this.camera.position.clone().sub(this.controls.target).normalize();
    // Retain neighboring context; reserve space for a desktop details panel.
    const distance=Math.max(11,entry.radius*8);
    const frameTarget=target.clone();
    if(!this.editable && this.width>800)frameTarget.x+=distance*.15;
    this.moveCamera(frameTarget.clone().addScaledVector(direction,distance),frameTarget);
  }

  setDetailOpen(open){if(this.detailOpen===open)return;this.detailOpen=open;if(this.world==='skills')this.resetCamera();}

  setNavigation(active) {
    this.navigationActive = Boolean(active);
    this.navigationButton?.setAttribute('aria-pressed', String(this.navigationActive));
    if(this.navigationButton)this.navigationButton.textContent = this.navigationActive ? 'Exit 3D gestures' : 'Enable 3D gestures';
    if(this.controls){this.controls.enabled=true;this.controls.enableZoom=this.navigationActive;}
    if(this.renderer)this.renderer.domElement.style.touchAction=this.navigationActive?'none':'pan-y';
  }

  zoom(factor) {
    if(!this.renderer)return;
    const distance=THREE.MathUtils.clamp(this.camera.position.distanceTo(this.controls.target)*factor,this.controls.minDistance,this.controls.maxDistance);
    const direction=this.camera.position.clone().sub(this.controls.target).normalize();
    this.moveCamera(this.controls.target.clone().addScaledVector(direction,distance),this.controls.target.clone());
  }

  moveCamera(position, target, immediate = false) {
    if (!this.motion || immediate) {
      this.camera.position.copy(position); this.controls.target.copy(target);
      this.controls.update(); this.cameraTransition = null;
    } else {
      this.cameraTransition = {
        from: this.camera.position.clone(), to: position.clone(),
        targetFrom: this.controls.target.clone(), targetTo: target.clone(), start: this.clock, duration: 0.85,
      };
    }
    this.invalidate();
  }

  setQuality(quality) {
    this.quality = ['auto', 'low', 'high'].includes(quality) ? quality : 'auto';
    this.applyQuality(); this.invalidate();
  }

  applyQuality() {
    if (!this.renderer) return;
    const mobile = this.width < 650;
    this.renderer.shadowMap.enabled = !mobile && this.quality !== 'low';
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    const cap = this.quality === 'low' ? 1 : this.quality === 'high' ? 2 : Math.min(mobile ? 1.25 : 1.6, this.autoDpr);
    const dpr = Math.min(globalThis.devicePixelRatio || 1, cap);
    if (this.renderer.getPixelRatio() !== dpr) this.renderer.setPixelRatio(dpr);
    this.environment.particles.visible = this.quality !== 'low' && !mobile;
  }

  setMotion(enabled) {
    this.motionRequested = Boolean(enabled);
    this.motion = this.motionRequested && !this.media?.matches;
    if(this.controls)this.controls.enableDamping=this.motion;
    if (!this.motion && this.cameraTransition) this.moveCamera(this.cameraTransition.to, this.cameraTransition.targetTo, true);
    this.invalidate();
  }

  resize() {
    if (this.disposed) return;
    const oldWidth = this.width || 0;
    const oldHeight = this.height || 0;
    this.width = Math.max(1, this.container.clientWidth);
    this.height = Math.max(1, this.container.clientHeight);
    if (this.renderer) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.applyQuality();
      this.renderer.setSize(this.width, this.height, false);
      if((this.world==='skills'||this.layered)&&oldWidth&&((oldWidth<600)!==(this.width<600)))this.reconcile();
      if (this.positions.size && (Math.abs(oldWidth - this.width) > 40 || Math.abs(oldHeight - this.height) > 40)) { this.cameraStates.clear(); this.resetCamera(true); }
    }
    this.invalidate();
  }

  invalidate() {
    if (this.frame || this.disposed || !this.renderer || document.hidden || !this.visible || this.contextLost) return;
    this.frame = requestAnimationFrame((time) => this.render(time));
  }

  stop() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  render(time) {
    this.frame = null;
    if (this.disposed || document.hidden || !this.visible || this.contextLost || this.width<=1 || this.height<=1) return;
    const elapsed = this.lastFrameTime ? (time - this.lastFrameTime) / 1000 : 1 / 60;
    const delta = Math.min(0.06, elapsed);
    // Entrance and camera durations are wall time, even on a slow GPU.
    // Keep only continuous rotation increments capped to avoid abrupt spins.
    this.lastFrameTime = time; this.clock += elapsed; this.frameCount += 1;
    let animating = false;
    if (this.cameraTransition) {
      const transition = this.cameraTransition;
      const progress = (this.clock - transition.start) / transition.duration;
      this.camera.position.lerpVectors(transition.from, transition.to, ease(progress));
      this.controls.target.lerpVectors(transition.targetFrom, transition.targetTo, ease(progress));
      if (progress >= 1) this.cameraTransition = null;
      animating = true;
    }
    for (const [id, entry] of this.nodes) {
      const animation = entry.node.animation || {};
      const duration = THREE.MathUtils.clamp(Number(animation.duration) || 0.8, 0.1, 3);
      const progress = !this.motion || animation.entrance === 'none' ? 1 : Math.max(0,Math.min(1, (this.clock - entry.created) / duration));
      const entrance = ease(progress);
      const selected = id === this.selectedId || id === this.hoveredId;
      const lift = selected && animation.hover === 'lift' ? 0.12 : 0;
      entry.group.position.fromArray(entry.position);
      if (animation.entrance === 'rise' && progress < 1) entry.group.position.y -= (1 - entrance) * 0.6;
      entry.group.position.y += lift;
      const reveal = progress < 1 && animation.entrance !== 'rise' ? 0.78 + 0.22 * entrance : 1;
      entry.group.scale.setScalar(entry.size * reveal);
      entry.group.visible = !this.layered || progress > 0;
      if (progress < 1) animating = true;
      entry.introComplete = progress === 1;
      if(entry.authored){
        if(!this.motion && entry.authored.mixer.time<entry.authored.duration) entry.authored.mixer.setTime(entry.authored.duration);
        else if(entry.authored.mixer.time<entry.authored.duration){entry.authored.mixer.update(elapsed);animating=true;}
        entry.introComplete &&= entry.authored.mixer.time>=entry.authored.duration;
      }
      if (this.motion) for (const rotor of entry.rotors) rotor.object.rotation[rotor.axis] += delta * rotor.speed;
    }
    if (this.motion) {
      for (const edge of this.edges.values()) if (edge.pulse.visible) edge.curve.getPoint((this.clock * 0.16 - edge.flowLevel*.22 + 1) % 1, edge.pulse.position);
      this.environment.particles.rotation.y += delta * 0.006;
    }
    for(const edge of this.edges.values())edge.group.visible=!this.layered||(!this.nodes.get(edge.edge.source)?.assetPending&&this.nodes.get(edge.edge.target)?.group.visible);
    this.controls.update();
    this.scene.updateMatrixWorld();
    // The camera is not a child of scene. Project DOM labels with the same
    // current matrix the renderer will use, including a single reduced frame.
    this.camera.updateMatrixWorld();
    this.updateLabels();
    this.renderer.render(this.scene, this.camera);
    if (this.quality === 'auto' && this.motion && elapsed < 0.25) {
      this.frameSamples.push(elapsed);
      if (this.frameSamples.length >= 120) {
        const average = this.frameSamples.reduce((sum, value) => sum + value, 0) / this.frameSamples.length;
        if (average > 0.028 && this.autoDpr > 1) { this.autoDpr = Math.max(1, this.autoDpr - 0.25); this.applyQuality(); }
        this.measuredFps = Math.round(1 / average);
        this.frameSamples.length = 0;
      }
    }
    if (this.motion || animating || this.cameraTransition) this.invalidate();
  }

  updateLabels() {
    const occupied = [];
    this.layerGuides.forEach((guide,layer)=>{
      const entries=[...this.nodes.values()].filter(e=>e.node.networkLayer===layer);
      guide.hidden=!this.layered||!entries.length;
      if(guide.hidden)return;
      const x=entries.reduce((sum,e)=>sum+e.position[0],0)/entries.length;
      const y=Math.max(...entries.map(e=>e.position[1]+e.radius));
      this.vector.set(x,y,0).project(this.camera);
      const px=(this.vector.x+1)*this.width/2,py=(1-this.vector.y)*this.height/2-30;
      guide.style.left=`${Math.max(78,Math.min(this.width-78,px))}px`;
      guide.style.top=`${Math.max(44,py)}px`;
    });
    const skillsOverview=this.world==='skills'&&!this.branchId;
    if(!this.editable)this.legend.textContent=this.navigationActive?'3D gestures on · drag / pinch · exit to scroll':this.layered?'Input → hidden synthesis → output · select to explore':this.world==='skills'?(this.branchId?'Identity → domain → technologies → applied projects':'Select a domain to trace technologies and projects'):'Drag with mouse · Alt + wheel to zoom · swipe to scroll';
    const entries = [...this.nodes.entries()].sort(([a], [b]) => {
      // Pointer/focus state must never reorder layout: moving a button beneath
      // the pointer creates an enter/leave loop and makes tapping unreliable.
      const rank = (id) => this.nodes.get(id).node.parentId===null ? 2 : this.nodes.get(id).record.type==='category' ? 1 : 0;
      return rank(b) - rank(a);
    });
    for (const [id, entry] of entries) {
      const label = this.labels.get(id);
      if (!label || label.hidden) continue;
      label.classList.toggle('is-entering', Boolean(entry.assetPending || !entry.introComplete));
      this.vector.copy(entry.group.position);
      const below=entry.node.appearance?.labelPosition==='below';
      const beside=entry.compactBranch&&['identity','domain'].includes(entry.node.graphRole);
      if(beside)this.vector.x+=entry.radius+.1;else this.vector.y += (below?-1:1)*(entry.radius+.1);
      this.vector.project(this.camera);
      const behind = this.vector.z > 1 || this.vector.z < -1 || Math.abs(this.vector.x)>1.08 || Math.abs(this.vector.y)>1.08 || (skillsOverview&&entry.record.type==='skill'&&id!==this.hoveredId&&id!==this.focusedLabel);
      const width = entry.labelWidth;
      const height = label.offsetHeight || 30;
      const anchorX = (this.vector.x + 1) * this.width / 2+(beside?width/2+8:0);
      const anchorY = (1 - this.vector.y) * this.height / 2+(beside?0:(below?1:-1)*(height/2+5));
      let chosen = null;
      const shifts = [0, -30, 30, -60, 60, -90, 90, -120, 120];
      for (const shift of shifts) {
        const x = THREE.MathUtils.clamp(anchorX - width / 2, 9, Math.max(9, this.width - width - 9));
        const y = THREE.MathUtils.clamp(anchorY - height / 2 + shift, 8, Math.max(8, this.height - height - 40));
        const candidate = { x, y, width, height };
        if (!occupied.some((other) => x < other.x + other.width + 6 && x + width + 6 > other.x && y < other.y + other.height + 5 && y + height + 5 > other.y)) { chosen = candidate; break; }
      }
      if (!chosen) {
        // Alternate horizontal lanes before suppressing a crowded label.
        for (const factor of [-1, 1]) {
          const x = THREE.MathUtils.clamp(anchorX - width / 2 + factor * (width + 12), 9, Math.max(9, this.width - width - 9));
          const y = THREE.MathUtils.clamp(anchorY, 8, Math.max(8, this.height - height - 40));
          if (!occupied.some((other) => x < other.x + other.width + 6 && x + width + 6 > other.x && y < other.y + other.height + 5 && y + height + 5 > other.y)) {
            chosen = { x, y, width, height }; break;
          }
        }
      }
      if(!chosen&&entry.node.graphRole==='domain'){
        const candidates=[];
        for(const x of [9,Math.max(9,this.width-width-9)])for(let y=8;y<=this.height-height-40;y+=5){
          if(!occupied.some(o=>x<o.x+o.width+6&&x+width+6>o.x&&y<o.y+o.height+5&&y+height+5>o.y))candidates.push({x,y,width,height});
        }
        candidates.sort((a,b)=>Math.hypot(a.x+width/2-anchorX,a.y+height/2-anchorY)-Math.hypot(b.x+width/2-anchorX,b.y+height/2-anchorY));chosen=candidates[0]||null;
      }
      const hidden = behind || !chosen;
      label.dataset.occlusion=behind?'outside-view':!chosen?'collision':'';
      label.classList.toggle('is-occluded', hidden && id !== this.focusedLabel);
      if (!chosen) chosen = { x: THREE.MathUtils.clamp(anchorX - width / 2, 8, this.width - width - 8), y: 14, width, height };
      label.style.width = `${width}px`;
      label.style.transform = `translate3d(${Math.round(chosen.x)}px,${Math.round(chosen.y)}px,0)`;
      const leader=label._leader;
      const displaced=Math.hypot(chosen.x+width/2-anchorX,chosen.y+height/2-anchorY)>20;
      leader.style.display=!hidden && displaced && entry.introComplete && !entry.assetPending?'':'none';
      leader.setAttribute('x1',anchorX);leader.setAttribute('y1',anchorY);
      leader.setAttribute('x2',chosen.x+width/2);leader.setAttribute('y2',chosen.y+height/2);
      if (!hidden) occupied.push(chosen);
    }
  }

  registerAsset(id, source) { this.assets.register(id, source); }

  async applyAsset(nodeId, assetId, expectedEntry) {
    const model = await this.assets.load(assetId);
    if (!model || this.disposed || this.nodes.get(nodeId) !== expectedEntry) return;
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const extent = Math.max(size.x, size.y, size.z);
    if (!Number.isFinite(extent) || extent <= 0) return;
    model.position.sub(bounds.getCenter(new THREE.Vector3()));
    const wrapper = new THREE.Group();
    wrapper.add(model);
    wrapper.scale.setScalar(2 / extent);
    for (const child of [...expectedEntry.group.children]) child.visible = false;
    expectedEntry.group.add(wrapper);
    wrapper.traverse((child) => { if (child.isMesh) child.userData.nodeId = nodeId; });
    this.select(this.selectedId);
    this.invalidate();
  }

  async applyLegacyNode(node, entry) {
    entry.assetPending = true;
    const authored = await this.legacyAssets.node(node.appearance.legacyWorld, node.appearance.legacyNode);
    if(this.disposed || this.nodes.get(node.id)!==entry){authored?.dispose();return;}
    entry.assetPending=false;
    if(authored){
      entry.nucleus.clear();entry.nucleus.add(authored.wrapper);entry.authored=authored;entry.created=this.clock;
      authored.wrapper.traverse(object=>{if(object.isMesh)object.userData.nodeId=node.id;});
      if(!this.motion) authored.mixer.setTime(authored.duration);
    }
    this.invalidate();
  }

  stats() {
    return {
      world: this.world, nodes: this.nodes.size, edges: this.edges.size, quality: this.quality,
      dpr: this.renderer?.getPixelRatio() || 0, fps: this.measuredFps || null,
      frames: this.frameCount, drawCalls: this.renderer?.info.render.calls || 0,
      triangles: this.renderer?.info.render.triangles || 0,
      geometries: this.renderer?.info.memory.geometries || 0, textures: this.renderer?.info.memory.textures || 0,
      motion: this.motion, paused: document.hidden || !this.visible, webgl: Boolean(this.renderer),
    };
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.resizeObserver?.disconnect(); this.intersectionObserver?.disconnect();
    for (const remove of this.listeners) remove();
    this.listeners.length = 0;
    this.controls?.dispose();
    for (const edge of this.edges.values()) edge.dispose();
    for (const entry of this.nodes.values()) { entry.authored?.dispose(); entry.dispose?.(); }
    this.environment?.group.traverse(child => { if (child.isInstancedMesh) child.dispose(); });
    this.edges.clear(); this.nodes.clear(); this.labels.clear();
    this.assets.dispose();
    this.legacyAssets.dispose();
    this.environmentTexture?.dispose();
    this.factory.dispose();
    this.scene?.clear();
    if (this.renderer) {
      this.renderer.renderLists.dispose();
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer.domElement.remove();
    }
    this.labelLayer.remove(); this.legend.remove(); this.navigationButton.remove(); this.fallback?.remove();
    this.container.classList.remove('v3-scene-host', 'is-fallback');
    this.cameraStates.clear(); this.positions.clear();
  }
}
