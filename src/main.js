import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { assetManager } from './three/AssetManager.js';
import { sceneController } from './three/SceneController.js';
import {
  BASE_URL,
  MAIN_NODES_MOBILE_POSITIONS,
  MAIN_NODES,
  COMBINED_ABOUT_DATA,
  SUBNET_DEFINITIONS,
} from './data/portfolioData.js';

// Internal compatibility aliases
const combinedAboutData = COMBINED_ABOUT_DATA;
const subnetDefinitions = SUBNET_DEFINITIONS;
const mainNodesMobilePositions = MAIN_NODES_MOBILE_POSITIONS;
const mainNodes = MAIN_NODES;

/*
 * ============================================================
 * DEEPAK R V — INSIDE MY NEURAL NETWORK
 * SPRINT 1 — GLB ASSET INTEGRATION FOUNDATION
 * ============================================================
 */

/* ============================================================
   NEURAL INITIALIZATION SCREEN HANDLER & GLB PRELOADER
   ============================================================ */

const loaderEl = document.getElementById('neuralLoader');
const loaderStatusEl = document.getElementById('loaderStatus');
const loaderBarFillEl = document.getElementById('loaderBarFill');

assetManager.loadAll((ratio, statusText) => {
  const percent = Math.min(Math.round(ratio * 100), 100);
  if (loaderBarFillEl) loaderBarFillEl.style.width = `${percent}%`;
  if (loaderStatusEl) loaderStatusEl.textContent = statusText;
}).then(() => {
  sceneController.initHomeScene(scene, assetManager.getAsset('home'), camera, controls);
  sceneController.initProjectsScene(scene, assetManager.getAsset('projects'), camera);
  sceneController.initSkillsScene(scene, assetManager.getAsset('skills'), camera);
  setLayerVisibility(currentLayer);

  // Auto-frame camera from actual GLB network bounds
  const glbBounds = sceneController.computeNetworkBounds();
  let homeZ, homeY, homeTarget;
  if (glbBounds && !glbBounds.isEmpty()) {
    const center = glbBounds.getCenter(new THREE.Vector3());
    const size   = glbBounds.getSize(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z) * 0.5;
    // Distance = radius / tan(halfFOV), add 20% breathing room
    const fovRad = THREE.MathUtils.degToRad(camera.fov);
    const dist   = (radius / Math.tan(fovRad * 0.5)) * 1.20;
    homeZ = isMobileViewport() ? dist * 1.25 : dist;
    homeY = center.y + 0.8;
    homeTarget = new THREE.Vector3(center.x, center.y - 0.5, center.z);
  } else {
    homeZ = isMobileViewport() ? 18.5 : 14.0;
    homeY = 0.8;
    homeTarget = new THREE.Vector3(0, -0.3, 0);
  }
  startTransition(new THREE.Vector3(0, homeY, homeZ), homeTarget, 1200);

  if (loaderBarFillEl) loaderBarFillEl.style.width = '100%';
  if (loaderStatusEl) loaderStatusEl.textContent = 'SYSTEM ONLINE — 3D GRAPH READY';
  setTimeout(() => {
    if (loaderEl) loaderEl.classList.add('hidden');
  }, 350);
});

/* ============================================================
   SCENE & RENDERER SETUP
   ============================================================ */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(
  46,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);
camera.position.set(0, 2.2, 23.0); // Slightly higher + zoomed out to frame lifted network

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

/* ============================================================
   ENVIRONMENTAL ATMOSPHERE & LIGHTING (Rich 3D Laboratory Scene)
   ============================================================ */

// Primary neon green ambient — sets the overall neural network mood
const ambientLight = new THREE.AmbientLight(0x00ff88, 0.35);
scene.add(ambientLight);

// Directional key light (neon green)
const dirLight = new THREE.DirectionalLight(0x00ff88, 0.75);
dirLight.position.set(10, 20, 15);
scene.add(dirLight);

// Neutral white fill — ensures label text geometry is legible
// (GLB text meshes use MeshStandardMaterial and need diffuse illumination)
const fillLight = new THREE.DirectionalLight(0xffffff, 0.50);
fillLight.position.set(-8, 5, 10);
scene.add(fillLight);

// Soft back-light for depth
const backLight = new THREE.DirectionalLight(0x004422, 0.35);
backLight.position.set(0, -10, -15);
scene.add(backLight);

// Central point glow (reduced intensity — was too bright)
const pointLight = new THREE.PointLight(0x00ff88, 1.0, 55);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

/* Subdued 3D Perspective Floor Grid */
const floorGrid = new THREE.PolarGridHelper(32, 16, 8, 64, 0x00ff88, 0x004422);
floorGrid.position.set(0, -7.5, 0);
floorGrid.material.transparent = true;
floorGrid.material.opacity = 0.15;
scene.add(floorGrid);

/* Volumetric 3D Particle Cloud */
const particleCount = 450;
const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i += 3) {
  particlePos[i] = (Math.random() - 0.5) * 70;
  particlePos[i + 1] = (Math.random() - 0.5) * 45;
  particlePos[i + 2] = (Math.random() - 0.5) * 50;
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
const particleMat = new THREE.PointsMaterial({
  color: 0x00ff88,
  size: 0.14,
  transparent: true,
  opacity: 0.42,
  depthWrite: false,
});
const particleCloud = new THREE.Points(particleGeo, particleMat);
scene.add(particleCloud);

/* ============================================================
   CONTROLS (Full 360° Orbit, Pan, Zoom)
   ============================================================ */

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.panSpeed = 0.55;
controls.rotateSpeed = 0.48;
controls.zoomSpeed = 0.72;
controls.minAzimuthAngle = -Infinity;
controls.maxAzimuthAngle = Infinity;
controls.minPolarAngle = THREE.MathUtils.degToRad(15);  // No extreme top-down view
controls.maxPolarAngle = THREE.MathUtils.degToRad(155); // No extreme bottom-up view
controls.minDistance = 7;     // Cannot enter geometry
controls.maxDistance = 55;    // Cannot zoom so far network disappears
controls.target.set(0, -0.5, 0); // Orbit around network midpoint (hero at Y=0.7, dest at Y=-2.5, mid≈-0.9, target slightly above for upper-center composition)

/* ============================================================
   COLOR SYSTEM
   ============================================================ */

const COLORS = {
  bright: 0x00ff88,
  medium: 0x00cc66,
  dim: 0x004422,
  trace: 0x001a0d,
};

/* ============================================================
   VISIBILITY & LAYER ARCHITECTURE
   ============================================================ */

let currentLayer = 'MAIN'; // 'MAIN' | 'SUBNET'

function isObjectInVisibleWorld(obj) {
  if (!obj) return false;
  let current = obj;
  while (current) {
    if (current.visible === false) {
      return false;
    }
    current = current.parent;
  }
  return true;
}

function setWorldVisibility(group, visible) {
  if (!group) return;
  group.visible = visible;
}

function setWorldOpacity(group, factor) {
  setGroupVisualOpacity(group, factor);
}

/* ============================================================
   MATERIAL HELPERS
   ============================================================ */

function nodeMaterial(color, opacity = 1) {
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: opacity > 0.18,
  });
  material.userData.baseOpacity = opacity;
  return material;
}

function lineMaterial(opacity = 0.5, color = COLORS.dim) {
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  material.userData.baseOpacity = opacity;
  return material;
}

function setMaterialVisualOpacity(material, factor) {
  if (!material) return;
  const base = material.userData.baseOpacity ?? material.opacity ?? 1;
  material.opacity = base * factor;
  material.visible = material.opacity > 0.001;
}

function setGroupVisualOpacity(group, factor) {
  if (!group) return;
  group.traverse(child => {
    if (child.isMesh || child.isLine) {
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => setMaterialVisualOpacity(mat, factor));
      } else {
        setMaterialVisualOpacity(child.material, factor);
      }
    }
  });
}

/* ============================================================
   UNIFIED 3D NEURAL NODE FACTORY
   ============================================================ */

function createNeuralNodeGroup({
  nucleusRadius = 0.88,
  color = COLORS.bright,
  opacity = 0.95,
}) {
  const group = new THREE.Group();

  // 1. Inner Nucleus Mesh
  const nucleusGeo = new THREE.SphereGeometry(nucleusRadius, 32, 32);
  const nucleusMat = nodeMaterial(color, opacity);
  const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
  group.add(nucleusMesh);

  // 2. Structural Wireframe Outer Shell
  const shellGeo = new THREE.SphereGeometry(nucleusRadius * 1.24, 28, 28);
  const shellMat = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  shellMat.userData.baseOpacity = 0.32;
  const shellMesh = new THREE.Mesh(shellGeo, shellMat);
  group.add(shellMesh);

  // 3. Subtle Internal Holographic Volume Sphere (Subtle Dark Green Glass Core)
  const volumeRadius = nucleusRadius * 1.08; // ~87% of outer shell radius (nucleusRadius * 1.24)
  const volumeGeo = new THREE.SphereGeometry(volumeRadius, 32, 32);
  const volumeMat = new THREE.MeshBasicMaterial({
    color: COLORS.trace,
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
  });
  volumeMat.userData.baseOpacity = 0.36;
  const volumeMesh = new THREE.Mesh(volumeGeo, volumeMat);
  volumeMesh.userData.isInteractionTarget = false;
  group.add(volumeMesh);

  // 4. Dedicated Invisible Interaction Hitbox Sphere (1.35x outer shell radius for comfortable mobile tap accuracy)
  const hitboxRadius = nucleusRadius * 1.35;
  const hitboxGeo = new THREE.SphereGeometry(hitboxRadius, 16, 16);
  const hitboxMat = new THREE.MeshBasicMaterial({
    visible: false,
    depthWrite: false,
    transparent: true,
    opacity: 0,
  });
  const hitboxMesh = new THREE.Mesh(hitboxGeo, hitboxMat);
  hitboxMesh.userData = { isHitbox: true, targetMesh: nucleusMesh };
  group.add(hitboxMesh);

  // 5. Subtle Localized Hover Glow Halo (Electric Bloom Response)
  const glowGeo = new THREE.SphereGeometry(nucleusRadius * 1.32, 24, 24);
  const glowMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.BackSide,
  });
  glowMat.userData.baseOpacity = 0;
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.userData.isInteractionTarget = false;
  group.add(glowMesh);

  return {
    group,
    nucleusMesh,
    shellMesh,
    volumeMesh,
    hitboxMesh,
    glowMesh,
  };
}

/* ============================================================
   SOLID FOREGROUND PRESENTATION SYSTEM (Projects & Experience & About)
   ============================================================ */

const detailPanelEl = document.getElementById('detailPanel');
const panelCloseBtn = document.getElementById('panelCloseBtn');
const panelKickerEl = document.getElementById('panelKicker');
const panelTitleEl = document.getElementById('panelTitle');
const panelSubtitleEl = document.getElementById('panelSubtitle');
const panelBodyEl = document.getElementById('panelBody');
const panelTagsEl = document.getElementById('panelTags');
const panelActionsEl = document.getElementById('panelActions');

function showDetailPresentation(data) {
  if (!detailPanelEl || !data) return;

  hideSkillContextPanel();

  panelKickerEl.textContent = data.kicker || 'PRESENTATION';
  panelTitleEl.textContent = data.title || 'PRESENTATION';
  panelSubtitleEl.textContent = data.subtitle || '';

  // Render Structured Technical Sections
  panelBodyEl.innerHTML = '';
  panelBodyEl.scrollTop = 0;

  if (Array.isArray(data.sections)) {
    for (const sec of data.sections) {
      const secEl = document.createElement('section');
      secEl.className = 'research-section';

      const h3 = document.createElement('h3');
      h3.textContent = sec.heading;
      secEl.appendChild(h3);

      if (sec.content) {
        const p = document.createElement('p');
        p.textContent = sec.content;
        secEl.appendChild(p);
      }

      if (Array.isArray(sec.bullets)) {
        const ul = document.createElement('ul');
        for (const item of sec.bullets) {
          const li = document.createElement('li');
          li.textContent = item;
          ul.appendChild(li);
        }
        secEl.appendChild(ul);
      }

      panelBodyEl.appendChild(secEl);
    }
  }

  // Render Tags
  panelTagsEl.innerHTML = '';
  if (Array.isArray(data.tags)) {
    for (const tag of data.tags) {
      const tagEl = document.createElement('span');
      tagEl.className = 'panel-tag';
      tagEl.textContent = tag;
      panelTagsEl.appendChild(tagEl);
    }
  }

  // Render Actions
  panelActionsEl.innerHTML = '';
  if (Array.isArray(data.actions)) {
    for (const act of data.actions) {
      const btn = document.createElement('a');
      btn.className = `panel-btn ${act.type || 'primary'}`;
      btn.textContent = act.label;
      if (act.url) {
        btn.href = act.url;
        btn.target = act.url.startsWith('http') ? '_blank' : '_self';
        if (btn.target === '_blank') btn.rel = 'noopener noreferrer';
      }
      panelActionsEl.appendChild(btn);
    }
  }

  // Hide 5 Ambient Home Logos & Enable Focus Mode
  if (typeof ambientLogosGroup !== 'undefined') {
    ambientLogosGroup.visible = false;
  }

  document.body.classList.add('detail-panel-open');
  if (activeSubnet) {
    setWorldOpacity(activeSubnet.group, 0.12);
  }
  if (mainGraph) {
    setWorldOpacity(mainGraph, 0.04);
  }

  detailPanelEl.classList.add('active');
  detailPanelEl.setAttribute('aria-hidden', 'false');
  detailPanelEl.focus();
}

function hideDetailPresentation() {
  if (!detailPanelEl) return;

  const wasAbout = window.location.pathname.toLowerCase().endsWith('/about');

  detailPanelEl.classList.remove('active');
  detailPanelEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('detail-panel-open');

  // Restore Home ambient logos visibility if on Home scene
  if (currentLayer === 'MAIN' && typeof ambientLogosGroup !== 'undefined') {
    ambientLogosGroup.visible = true;
  }

  // Restore background graph opacity to standard layer level
  if (currentLayer === 'SUBNET' && activeSubnet) {
    setWorldOpacity(activeSubnet.group, 1.0);
    setWorldOpacity(mainGraph, 0.08);
  } else if (currentLayer === 'MAIN') {
    setWorldOpacity(mainGraph, 1.0);
  }

  // If closing detail presentation while on /about route, sync browser route back to active layer or home
  if (wasAbout) {
    const currentSubnetKey = activeSubnet ? activeSubnet.subnetId : 'home';
    updateBrowserRoute(currentSubnetKey, true);
  }
}

if (panelCloseBtn) {
  panelCloseBtn.addEventListener('click', hideDetailPresentation);
}

/* ============================================================
   SMALL CONTEXTUAL SKILL TOOLTIP PANEL SYSTEM
   ============================================================ */

const skillContextPanelEl = document.getElementById('skillContextPanel');
const skillCloseBtn = document.getElementById('skillCloseBtn');
const skillTitleEl = document.getElementById('skillTitle');
const skillSubtitleEl = document.getElementById('skillSubtitle');
const skillUsedListEl = document.getElementById('skillUsedList');
const skillTagsEl = document.getElementById('skillTags');

function showSkillContextPanel(skillData) {
  if (!skillContextPanelEl || !skillData) return;

  hideDetailPresentation();

  skillTitleEl.textContent = skillData.name || skillData.title || 'SKILL';
  skillSubtitleEl.textContent = skillData.category || 'TECHNICAL SKILL';

  skillUsedListEl.innerHTML = '';
  if (Array.isArray(skillData.usedIn)) {
    for (const proj of skillData.usedIn) {
      const itemEl = document.createElement('div');
      itemEl.className = 'skill-used-item';

      const dot = document.createElement('span');
      dot.className = 'skill-used-dot';

      const text = document.createElement('span');
      text.textContent = proj;

      itemEl.appendChild(dot);
      itemEl.appendChild(text);
      skillUsedListEl.appendChild(itemEl);
    }
  }

  skillTagsEl.innerHTML = '';
  if (Array.isArray(skillData.tags)) {
    for (const tag of skillData.tags) {
      const tagEl = document.createElement('span');
      tagEl.className = 'panel-tag';
      tagEl.textContent = tag;
      skillTagsEl.appendChild(tagEl);
    }
  }

  if (typeof ambientLogosGroup !== 'undefined') {
    ambientLogosGroup.visible = false;
  }

  skillContextPanelEl.classList.add('active');
  skillContextPanelEl.setAttribute('aria-hidden', 'false');
}

function hideSkillContextPanel() {
  if (!skillContextPanelEl) return;

  skillContextPanelEl.classList.remove('active');
  skillContextPanelEl.setAttribute('aria-hidden', 'true');

  if (currentLayer === 'MAIN' && typeof ambientLogosGroup !== 'undefined') {
    ambientLogosGroup.visible = true;
  }

  if (currentLayer === 'SUBNET' && activeSubnet) {
    setWorldOpacity(activeSubnet.group, 1.0);
    setWorldOpacity(mainGraph, 0.08);
  }
}

if (skillCloseBtn) {
  skillCloseBtn.addEventListener('click', hideSkillContextPanel);
}

/* ============================================================
   DEFENSIVE & VISIBILITY-AWARE LABEL SYSTEM
   ============================================================ */

const labels = [];
let labelMode = 'main';

function createLabel(text, type, mode = 'main', extraClass = '') {
  const element = document.createElement('div');
  element.className = `graph-label ${type} ${extraClass}`.trim();

  let labelText = '';
  if (typeof text === 'object' && text !== null) {
    labelText = text.label || text.title || text.name || JSON.stringify(text);
  } else {
    labelText = String(text ?? '');
  }
  element.textContent = labelText;

  document.body.appendChild(element);

  const label = {
    element,
    object: null,
    mode, // 'main' | 'subnet' | 'persistent'
    offset: new THREE.Vector3(0, 0.48, 0),
    baseOpacity: 1,
    hidden: false,
  };

  labels.push(label);
  return label;
}

function setLabelMode(mode) {
  labelMode = mode;
}

const labelPosTemp = new THREE.Vector3();

function updateLabels() {
  // On mobile viewports or when detail panel is active, hide all graph 3D labels to prevent visual leakage!
  if (isMobileViewport() || document.body.classList.contains('detail-panel-open') || detailPanelEl?.classList.contains('active')) {
    for (const label of labels) {
      label.element.style.opacity = '0';
      label.element.style.display = 'none';
    }
    return;
  }

  // Get skill context panel bounding box if active to prevent localized text collisions in bottom-right corner
  const isSkillPanelActive = skillContextPanelEl && skillContextPanelEl.classList.contains('active');
  const panelRect = isSkillPanelActive ? skillContextPanelEl.getBoundingClientRect() : null;

  for (const label of labels) {
    if (!label.object) continue;

    // 1. Parent Hierarchy Visibility Check
    if (!isObjectInVisibleWorld(label.object)) {
      label.element.style.opacity = '0';
      label.element.style.display = 'none';
      continue;
    }

    // Force update matrix world so label reads the exact current rendered frame position
    label.object.updateMatrixWorld(true);

    // 2. Frustum / Camera Check
    label.object.getWorldPosition(labelPosTemp);
    labelPosTemp.add(label.offset);

    labelPosTemp.project(camera);
    const inFront = labelPosTemp.z > -1 && labelPosTemp.z < 1;

    if (!inFront || label.hidden) {
      label.element.style.opacity = '0';
      label.element.style.display = 'none';
      continue;
    }

    // 3. Hardware Accelerated Screen Projection
    const x = Math.round((labelPosTemp.x * 0.5 + 0.5) * window.innerWidth);
    const y = Math.round((-labelPosTemp.y * 0.5 + 0.5) * window.innerHeight);

    label.element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;

    // 4. Panel Overlap Collision Check (Hide ONLY if label projected inside bottom-right panel rectangle)
    if (panelRect && x >= panelRect.left - 20 && x <= panelRect.right + 20 && y >= panelRect.top - 20 && y <= panelRect.bottom + 20) {
      label.element.style.opacity = '0';
      label.element.style.display = 'none';
      continue;
    }

    // 5. Layer Mode Rules
    let shouldShow = false;
    let effectiveOpacity = label.baseOpacity;

    if (label.mode === 'persistent') {
      shouldShow = true;
    } else if (label.mode === labelMode) {
      shouldShow = true;
    } else if (label.mode === 'main' && currentLayer !== 'MAIN') {
      shouldShow = true;
      effectiveOpacity = Math.min(label.baseOpacity, 0.08);
    }

    if (shouldShow) {
      label.element.style.display = 'block';
      label.element.style.opacity = String(effectiveOpacity);
    } else {
      label.element.style.opacity = '0';
      label.element.style.display = 'none';
    }
  }
}

/* ============================================================
   MAIN GRAPH TOPOLOGY (EXACTLY 5 PRIMARY DESTINATIONS IN 3D)
   ============================================================ */

const mainGraph = new THREE.Group();
mainGraph.name = 'MAIN_NEURAL_NETWORK';
scene.add(mainGraph);

/* ============================================================
   RESPONSIVE MODE & MOBILE SPATIAL COMPOSITION ENGINE
   ============================================================ */

function isMobileViewport() {
  return window.innerWidth < 768;
}

/* ============================================================
   MAIN NODE & POSITION DATA IMPORTED FROM PORTFOLIODATA.JS
   ============================================================ */

const mainNodeMap = new Map();
const mainNodeObjects = [];
const mainEdges = [];

/* ============================================================
   NEURAL CORE
   ============================================================ */

const core = new THREE.Group();
core.name = 'NEURAL_CORE';
mainGraph.add(core);

const coreNode = createNeuralNodeGroup({
  nucleusRadius: 1.18,
  torusRadius: 1.48,
  torusTube: 0.032,
  color: COLORS.bright,
  opacity: 0.95,
});
coreNode.nucleusMesh.userData = { type: 'core', id: 'core' };

coreNode.desktopOriginalPos = new THREE.Vector3(0, 0, 0);
coreNode.mobileOriginalPos = new THREE.Vector3(0, 1.8, 0);
coreNode.originalPos = isMobileViewport() ? coreNode.mobileOriginalPos.clone() : coreNode.desktopOriginalPos.clone();
coreNode.group.position.copy(coreNode.originalPos);

core.add(coreNode.group);

/* Core Outer Wireframe Sphere */
const coreWire = new THREE.Mesh(
  new THREE.SphereGeometry(1.65, 30, 30),
  new THREE.MeshBasicMaterial({
    color: COLORS.medium,
    wireframe: true,
    transparent: true,
    opacity: 0.40,
    depthWrite: false,
  })
);
coreWire.material.userData.baseOpacity = 0.40;
core.add(coreWire);

const coreLabel = createLabel('NEURAL CORE', 'core', 'main');
coreLabel.object = coreNode.nucleusMesh;
coreLabel.offset.set(0, -1.98, 0);

/* ============================================================
   PERSISTENT CORE BEACON (Universal HOME Anchor)
   ============================================================ */

const coreBeacon = new THREE.Group();
coreBeacon.name = 'CORE_NAVIGATION_BEACON';
coreBeacon.visible = false;
scene.add(coreBeacon);

const beaconNode = createNeuralNodeGroup({
  nucleusRadius: 0.48,
  torusRadius: 0.68,
  torusTube: 0.024,
  color: COLORS.bright,
  opacity: 0.95,
});
beaconNode.nucleusMesh.userData = { type: 'core', id: 'core-beacon' };
coreBeacon.add(beaconNode.group);

const beaconLabel = createLabel('MAIN CORE', 'core-home', 'persistent');
beaconLabel.object = beaconNode.nucleusMesh;
beaconLabel.offset.set(0, -0.98, 0);

function showCoreBeacon(visible) {
  coreBeacon.visible = visible;
  if (visible) {
    coreBeacon.position.set(0, 8.8, 0);
  }
}

/* ============================================================
   MAIN NODE CREATION (5 Primary Destinations)
   ============================================================ */

for (const data of mainNodes) {
  const node = createNeuralNodeGroup({
    nucleusRadius: 0.88,
    torusRadius: 0.98,
    torusTube: 0.032,
    color: COLORS.bright,
    opacity: 0.95,
  });

  const desktopPos = new THREE.Vector3(...data.position);
  const mobilePosArr = mainNodesMobilePositions[data.id] || data.position;
  const mobilePos = new THREE.Vector3(...mobilePosArr);

  const initialPos = isMobileViewport() ? mobilePos.clone() : desktopPos.clone();
  node.group.position.copy(initialPos);
  node.nucleusMesh.userData = { ...data };

  mainGraph.add(node.group);

  const label = createLabel(data.label, 'primary-core', 'main');
  label.object = node.nucleusMesh;
  label.offset.set(0, 1.35, 0);

  const nodeObj = {
    ...data,
    mesh: node.nucleusMesh,
    nucleusMesh: node.nucleusMesh,
    shellMesh: node.shellMesh,
    glowMesh: node.glowMesh,
    hitboxMesh: node.hitboxMesh,
    group: node.group,
    label,
    desktopOriginalPos: desktopPos,
    mobileOriginalPos: mobilePos,
    originalPos: initialPos.clone(),
  };
  mainNodeObjects.push(nodeObj);
  mainNodeMap.set(data.id, nodeObj);
}

/* ============================================================
   5 COMPACT SQUARE 3D AMBIENT APP ICONS (HOME SCENE ONLY!)
   With Official Standalone GitHub Invertocat Vector Asset
   ============================================================ */

const ambientLogosGroup = new THREE.Group();
ambientLogosGroup.name = 'AMBIENT_FLOATING_LOGOS';
mainGraph.add(ambientLogosGroup);

function createLogoTexture(type, imgElement = null) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 512);

  // Rounded Square App Icon Container Fill
  const radius = 64;
  ctx.beginPath();
  ctx.moveTo(32 + radius, 32);
  ctx.arcTo(480, 32, 480, 480, radius);
  ctx.arcTo(480, 480, 32, 480, radius);
  ctx.arcTo(32, 480, 32, 32, radius);
  ctx.arcTo(32, 32, 480, 32, radius);
  ctx.closePath();

  // Dark translucent glass fill
  ctx.fillStyle = 'rgba(5, 15, 10, 0.88)';
  ctx.fill();

  // Glowing green border stroke
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 14;
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 20;
  ctx.stroke();

  ctx.fillStyle = '#00ff88';
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'github') {
    if (imgElement && imgElement.complete && imgElement.naturalWidth !== 0) {
      ctx.save();
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgElement.naturalWidth || 512;
      tempCanvas.height = imgElement.naturalHeight || 512;
      const tCtx = tempCanvas.getContext('2d');

      tCtx.drawImage(imgElement, 0, 0, tempCanvas.width, tempCanvas.height);
      const imgData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imgData.data;

      // Filter out white background square pixels if present
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 210 && g > 210 && b > 210) {
          data[i + 3] = 0; // Make white/light background transparent
        }
      }
      tCtx.putImageData(imgData, 0, 0);

      // Composite source-in to tint logo mark to bright emissive green #00ff88
      tCtx.globalCompositeOperation = 'source-in';
      tCtx.fillStyle = '#00ff88';
      tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw glowing green GitHub logo onto main dark glass app icon
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 24;
      ctx.drawImage(tempCanvas, 96, 96, 320, 320);
      ctx.restore();
    } else {
      // Official GitHub Standalone Invertocat Silhouette Path
      ctx.save();
      ctx.translate(256, 245);
      ctx.scale(1.15, 1.15);
      ctx.fillStyle = '#00ff88';

      // Invertocat Head Circle & Ears
      ctx.beginPath();
      ctx.arc(0, -10, 88, 0, Math.PI * 2);
      ctx.fill();

      // Ears Cutout
      ctx.beginPath();
      ctx.moveTo(-58, -65); ctx.lineTo(-82, -122); ctx.lineTo(-24, -92); ctx.closePath();
      ctx.moveTo(58, -65);  ctx.lineTo(82, -122);  ctx.lineTo(24, -92);  ctx.closePath();
      ctx.fill();

      // Inner Body Arch Cutout
      ctx.fillStyle = 'rgba(5, 15, 10, 0.95)';
      ctx.beginPath();
      ctx.arc(0, 52, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  } else if (type === 'linkedin') {
    // Official LinkedIn [in] logo asset rendering
    ctx.font = '700 230px Deltha, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('in', 256, 245);
  } else if (type === 'email') {
    // Professional Mail / Envelope Icon
    ctx.strokeRect(140, 170, 232, 160);
    ctx.beginPath();
    ctx.moveTo(140, 170);
    ctx.lineTo(256, 260);
    ctx.lineTo(372, 170);
    ctx.stroke();
  } else if (type === 'resume') {
    // Professional Document / Resume Sheet Icon
    ctx.strokeRect(165, 130, 182, 230);
    ctx.beginPath();
    ctx.moveTo(205, 190); ctx.lineTo(307, 190);
    ctx.moveTo(205, 245); ctx.lineTo(307, 245);
    ctx.moveTo(205, 300); ctx.lineTo(270, 300);
    ctx.stroke();
  } else if (type === 'hire') {
    // Professional Person / Contact Icon
    ctx.beginPath();
    ctx.arc(256, 190, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(256, 370, 105, Math.PI * 1.15, Math.PI * 1.85);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}


const logoDataList = [
  {
    id: 'logo-resume',
    type: 'resume',
    title: 'Resume',
    basePos: new THREE.Vector3(14.8, -5.2, -4.5),
    baseRot: new THREE.Vector3(0, -0.12, 0),
    phase: 5.6,
    speedX: 0.32, speedY: 0.42, speedZ: 0.32,
    ampX: 2.4, ampY: 1.3, ampZ: 2.6,
    url: `${BASE_URL}my_resume.pdf`,
  },
  {
    id: 'logo-github',
    type: 'github',
    title: 'GitHub',
    basePos: new THREE.Vector3(-14.8, 5.2, -4.5),
    baseRot: new THREE.Vector3(0, 0.18, 0),
    phase: 1.4,
    speedX: 0.40, speedY: 0.35, speedZ: 0.25,
    ampX: 2.8, ampY: 1.5, ampZ: 3.2,
    url: 'https://github.com/DEEPAKRV07',
  },
  {
    id: 'logo-email',
    type: 'email',
    title: 'Email',
    basePos: new THREE.Vector3(-14.8, -5.2, -4.5),
    baseRot: new THREE.Vector3(0, 0.22, 0),
    phase: 2.8,
    speedX: 0.30, speedY: 0.40, speedZ: 0.35,
    ampX: 2.5, ampY: 1.4, ampZ: 2.9,
    url: 'mailto:deepakvetrivelan@gmail.com',
  },
  {
    id: 'logo-linkedin',
    type: 'linkedin',
    title: 'LinkedIn',
    basePos: new THREE.Vector3(14.8, 5.2, -4.5),
    baseRot: new THREE.Vector3(0, -0.18, 0),
    phase: 4.2,
    speedX: 0.45, speedY: 0.30, speedZ: 0.28,
    ampX: 2.6, ampY: 1.6, ampZ: 3.0,
    url: 'https://www.linkedin.com/in/deepakrv07/',
  },
];

const ambientLogoObjects = [];

for (const item of logoDataList) {
  const group = new THREE.Group();
  group.position.copy(item.basePos);
  group.rotation.setFromVector3(item.baseRot);

  // 1. Compact 3D Square Glass App Icon Geometry
  const texture = createLogoTexture(item.type);
  const boxGeo = new THREE.BoxGeometry(1.6, 1.6, 0.12);
  const boxMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.95,
  });
  boxMat.userData.baseOpacity = 0.95;

  const mesh = new THREE.Mesh(boxGeo, boxMat);
  mesh.userData = { type: 'ambient-logo', logoData: item };
  group.add(mesh);

  // 2. 3D Glowing Wireframe Rim Frame
  const wireGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.62, 1.62, 0.13));
  const wireMat = lineMaterial(0.48, COLORS.bright);
  const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
  group.add(wireMesh);

  ambientLogosGroup.add(group);

  // 3D Tracked Hover Label (Appears ONLY on hover!)
  const hoverLabel = createLabel(`◉ ${item.title}`, 'ambient-hover', 'main');
  hoverLabel.object = mesh;
  hoverLabel.offset.set(0, 1.15, 0);
  hoverLabel.hidden = true;

  ambientLogoObjects.push({
    ...item,
    group,
    mesh,
    hoverLabel,
  });
}

// Load uploaded official GitHub PNG asset from public/gitlogo.png
const gitLogoImg = new Image();
gitLogoImg.src = `${BASE_URL}gitlogo.png`;
gitLogoImg.onload = () => {
  const githubObj = ambientLogoObjects.find(item => item.type === 'github');
  if (githubObj) {
    const updatedTexture = createLogoTexture('github', gitLogoImg);
    githubObj.mesh.material.map = updatedTexture;
    githubObj.mesh.material.needsUpdate = true;
  }
};
if (gitLogoImg.complete && gitLogoImg.naturalWidth !== 0) {
  gitLogoImg.onload();
}

/* ============================================================
   DYNAMIC EDGE CREATION & UPDATING
   ============================================================ */

/* ============================================================
   PHYSICAL 3D NEURAL FILAMENT & ELECTRIC PARTICLE ARCHITECTURE
   ============================================================ */

const unitCylinderGeometry = new THREE.CylinderGeometry(0.065, 0.065, 1, 8, 1);
unitCylinderGeometry.translate(0, 0.5, 0);

const particleSolidGeometry = new THREE.SphereGeometry(0.08, 16, 16);
const particleSolidMaterial = new THREE.MeshBasicMaterial({
  color: COLORS.bright,
  transparent: false,
  opacity: 1.0,
  depthWrite: true,
});

function createEdge(source, target, parent, opacity = 0.5, color = COLORS.dim) {
  // 1. Core Tracking Line (for compatibility)
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(6);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = lineMaterial(opacity * 0.15, color);
  const line = new THREE.Line(geometry, material);
  line.frustumCulled = false;
  parent.add(line);

  // 2. PRIMARY VISIBLE 3D NEURAL FILAMENT (Continuous Translucent 3D Cylinder Mesh)
  const filamentMaterial = new THREE.MeshBasicMaterial({
    color: COLORS.medium,
    transparent: true,
    opacity: opacity * 0.50, // Slightly reduced intensity so nodes remain dominant
    depthWrite: false,
  });
  filamentMaterial.userData.baseOpacity = opacity * 0.50;
  const filamentMesh = new THREE.Mesh(unitCylinderGeometry, filamentMaterial);
  filamentMesh.matrixAutoUpdate = false;
  filamentMesh.frustumCulled = false;
  parent.add(filamentMesh);

  // 3. SINGLE SMALL SOLID OPAQUE BRIGHT GREEN ELECTRIC PARTICLE (Cloned material per edge!)
  const particleMat = particleSolidMaterial.clone();
  particleMat.userData.baseOpacity = 1.0;
  const particleMesh = new THREE.Mesh(particleSolidGeometry, particleMat);
  parent.add(particleMesh);

  return {
    line,
    filamentMesh,
    filamentMaterial,
    particleMesh,
    particleGroup: particleMesh, // Alias for animation loop pulseProgress calculation
    source,
    target,
    material,
    pulseProgress: Math.random(),
    pulseSpeed: 0.004 + Math.random() * 0.003,
  };
}

function transformCylinderToSegment(mesh, startPos, endPos) {
  const dir = new THREE.Vector3().subVectors(endPos, startPos);
  const len = dir.length();
  if (len < 0.0001) {
    mesh.visible = false;
    return;
  }
  mesh.visible = true;

  dir.normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  mesh.position.copy(startPos);
  mesh.quaternion.copy(quat);
  mesh.scale.set(1, len, 1);
  mesh.updateMatrix();
}

function updateEdge(edge) {
  if (!edge || !edge.source || !edge.target || !edge.line) return;

  const startWorld = new THREE.Vector3();
  const endWorld = new THREE.Vector3();

  edge.source.getWorldPosition(startWorld);
  edge.target.getWorldPosition(endWorld);

  const start = startWorld.clone();
  const end = endWorld.clone();

  if (edge.line.parent) {
    edge.line.parent.worldToLocal(start);
    edge.line.parent.worldToLocal(end);
  }

  // Update tracking core line
  const position = edge.line.geometry.attributes.position;
  position.setXYZ(0, start.x, start.y, start.z);
  position.setXYZ(1, end.x, end.y, end.z);
  position.needsUpdate = true;

  // Node Surface Boundary Offsets (Start at parent outer surface, end at child outer surface)
  const fullVec = new THREE.Vector3().subVectors(end, start);
  const fullDist = fullVec.length();

  if (fullDist < 0.05) {
    if (edge.filamentMesh) edge.filamentMesh.visible = false;
    if (edge.particleMesh) edge.particleMesh.visible = false;
    return;
  }

  const dir = fullVec.clone().normalize();
  const sourceRadius = edge.source.geometry?.boundingSphere?.radius || 0.88;
  const targetRadius = edge.target.geometry?.boundingSphere?.radius || 0.88;

  let offsetStart = start.clone().add(dir.clone().multiplyScalar(sourceRadius));
  let offsetEnd = end.clone().sub(dir.clone().multiplyScalar(targetRadius));

  if (offsetStart.distanceTo(offsetEnd) > fullDist || offsetStart.distanceTo(offsetEnd) < 0.05) {
    offsetStart = start;
    offsetEnd = end;
  }

  const isVisible = edge.line.visible && isObjectInVisibleWorld(edge.source) && isObjectInVisibleWorld(edge.target);
  const opacityRatio = edge.material.opacity / (edge.material.userData.baseOpacity || 1);

  // 1. Continuous Physical 3D Neural Filament (offsetStart -> offsetEnd)
  if (edge.filamentMesh) {
    edge.filamentMesh.visible = isVisible;
    if (isVisible) {
      transformCylinderToSegment(edge.filamentMesh, offsetStart, offsetEnd);
      setMaterialVisualOpacity(edge.filamentMaterial, opacityRatio);
    }
  }

  // 2. Small Solid Green Electric Particle Pulse (travels centerline from offsetStart -> offsetEnd)
  if (edge.particleMesh) {
    edge.particleMesh.visible = isVisible;
    if (isVisible) {
      const p = edge.pulseProgress;
      const particlePos = new THREE.Vector3().lerpVectors(offsetStart, offsetEnd, p);
      edge.particleMesh.position.copy(particlePos);
    }
  }
}

function updateEdges(edgeArray) {
  for (const edge of edgeArray) {
    updateEdge(edge);
  }
}

function connectMain(sourceId, targetId, opacity = 0.50) {
  const source = sourceId === 'core' ? coreNode.nucleusMesh : mainNodeMap.get(sourceId)?.mesh;
  const target = targetId === 'core' ? coreNode.nucleusMesh : mainNodeMap.get(targetId)?.mesh;
  if (source && target) {
    const edge = createEdge(source, target, mainGraph, opacity, COLORS.dim);
    mainEdges.push(edge);
  }
}

/* Core to 5 Primary Nodes Connections */
for (const data of mainNodes) {
  connectMain('core', data.id, 0.58);
}

/* Inter-Primary Nodes Ring Connections */
connectMain('about', 'skills', 0.32);
connectMain('skills', 'projects', 0.32);
connectMain('projects', 'contact', 0.32);
connectMain('contact', 'experience', 0.32);
connectMain('experience', 'about', 0.32);

/* ============================================================
   DATA MODELS IMPORTED FROM PORTFOLIODATA.JS
   ============================================================ */

/* ============================================================
   SUBNETWORK WORLDS BUILDER
   ============================================================ */

const subnetWorlds = new Map();
let activeSubnet = null;

/* ============================================================
   TOPOLOGY-AWARE DETERMINISTIC PROJECT LAYOUT ALGORITHM
   ============================================================ */

function calculateProjectsLayout(categories) {
  const slotMap = {
    'kaatchi':      new THREE.Vector3(0.0,  6.2,  0.0),  // Top Center
    'forcrux':       new THREE.Vector3(-7.8, 3.5,  0.8),  // Upper Left
    'google-maps':   new THREE.Vector3(7.8,  3.8, -0.8),  // Upper Right
    'sightmate':     new THREE.Vector3(-6.8, -4.2, -0.8), // Lower Left
    'football':      new THREE.Vector3(6.8, -4.2,  0.8),  // Lower Right
  };

  for (const cat of categories) {
    if (slotMap[cat.id]) {
      cat.position = [slotMap[cat.id].x, slotMap[cat.id].y, slotMap[cat.id].z];
    }
  }
  return categories;
}

function calculateMobileSubnetPositions(subnetId, categoryObj, index, totalCategories) {
  // Dedicated Mobile Spatial Slots for Subnetwork Categories
  const mobileSlots = {
    'projects': {
      'kaatchi':      new THREE.Vector3(-3.2,  2.2, 0.0),
      'forcrux':       new THREE.Vector3( 3.2,  2.2, 0.0),
      'sightmate':     new THREE.Vector3(-3.2, -1.8, 0.0),
      'football':      new THREE.Vector3( 3.2, -1.8, 0.0),
      'google-maps':   new THREE.Vector3( 0.0, -5.5, 0.0),
    },
    'skills': {
      'cv-category':      new THREE.Vector3(-3.4,  2.8, 0.0),
      'dl-category':      new THREE.Vector3( 3.4,  2.8, 0.0),
      'systems-category': new THREE.Vector3(-3.4, -2.5, 0.0),
      'lang-category':    new THREE.Vector3( 3.4, -2.5, 0.0),
    },
    'experience': {
      'forcrux-exp':  new THREE.Vector3(-3.2,  2.0, 0.0),
      'kaatchi-exp':  new THREE.Vector3( 3.2,  2.0, 0.0),
      'msme-exp':     new THREE.Vector3(-3.2, -2.5, 0.0),
      'quality-exp':  new THREE.Vector3( 3.2, -2.5, 0.0),
    },
    'contact': {
      'email-contact':    new THREE.Vector3( 0.0,  1.5, 0.0),
      'linkedin-contact': new THREE.Vector3(-3.2, -2.2, 0.0),
      'github-contact':   new THREE.Vector3( 3.2, -2.2, 0.0),
    },
  };

  if (mobileSlots[subnetId] && mobileSlots[subnetId][categoryObj.id]) {
    return mobileSlots[subnetId][categoryObj.id];
  }

  const col = index % 2;
  const row = Math.floor(index / 2);
  return new THREE.Vector3((col - 0.5) * 6.4, 2.0 - row * 3.8, 0.0);
}

function resolveMobileCollisions(activeNodes) {
  if (!isMobileViewport() || !Array.isArray(activeNodes)) return;
  const minDistance = 3.2;

  for (let i = 0; i < activeNodes.length; i++) {
    for (let j = i + 1; j < activeNodes.length; j++) {
      const nodeA = activeNodes[i];
      const nodeB = activeNodes[j];
      if (!nodeA.originalPos || !nodeB.originalPos) continue;

      const dist = nodeA.originalPos.distanceTo(nodeB.originalPos);
      if (dist < minDistance && dist > 0.001) {
        const overlap = (minDistance - dist) * 0.5;
        const pushDir = new THREE.Vector3().subVectors(nodeB.originalPos, nodeA.originalPos).normalize();
        nodeA.originalPos.addScaledVector(pushDir, -overlap);
        nodeB.originalPos.addScaledVector(pushDir, overlap);
        if (nodeA.group) nodeA.group.position.copy(nodeA.originalPos);
        if (nodeB.group) nodeB.group.position.copy(nodeB.originalPos);
      }
    }
  }
}

function createSubnetWorld(subnetId) {
  const definition = subnetDefinitions[subnetId];
  if (subnetId === 'projects') {
    calculateProjectsLayout(definition.categories);
  }
  const group = new THREE.Group();
  group.name = `SUBNET_${subnetId}`;
  group.visible = false;
  scene.add(group);

  const subnetCore = new THREE.Group();
  subnetCore.name = 'SUBNET_CORE';
  group.add(subnetCore);

  const coreNode = createNeuralNodeGroup({
    nucleusRadius: 0.88,
    torusRadius: 0.98,
    torusTube: 0.028,
    color: COLORS.bright,
    opacity: 0.92,
  });
  coreNode.nucleusMesh.userData = { type: 'subnet-core', subnetId };

  coreNode.desktopOriginalPos = new THREE.Vector3(0, 0, 0);
  coreNode.mobileOriginalPos = new THREE.Vector3(0, 5.2, 0);
  coreNode.originalPos = isMobileViewport() ? coreNode.mobileOriginalPos.clone() : coreNode.desktopOriginalPos.clone();
  coreNode.group.position.copy(coreNode.originalPos);

  subnetCore.add(coreNode.group);

  const subnetLabel = createLabel(definition.title, 'project-core', 'subnet');
  subnetLabel.object = coreNode.nucleusMesh;
  subnetLabel.offset.set(0, -2.10, 0);

  const subtitleLabel = createLabel(definition.subtitle, 'project-subtitle', 'subnet');
  subtitleLabel.object = coreNode.nucleusMesh;
  subtitleLabel.offset.set(0, -2.65, 0);

  const coreNodeObj = {
    mesh: coreNode.nucleusMesh,
    nucleusMesh: coreNode.nucleusMesh,
    shellMesh: coreNode.shellMesh,
    glowMesh: coreNode.glowMesh,
    hitboxMesh: coreNode.hitboxMesh,
    group: coreNode.group,
    label: subnetLabel,
    originalPos: coreNode.group.position.clone(),
  };

  const categoryNodes = new Map();
  const categories = [];
  const edges = [];

  for (let catIndex = 0; catIndex < definition.categories.length; catIndex++) {
    const category = definition.categories[catIndex];
    const node = createNeuralNodeGroup({
      nucleusRadius: 0.48,
      torusRadius: 0.62,
      torusTube: 0.024,
      color: COLORS.medium,
      opacity: 0.95,
    });

    const desktopPos = new THREE.Vector3(...category.position);
    const mobilePos = calculateMobileSubnetPositions(subnetId, category, catIndex, definition.categories.length);
    const initialPos = isMobileViewport() ? mobilePos.clone() : desktopPos.clone();
    node.group.position.copy(initialPos);

    node.nucleusMesh.userData = {
      type: 'category-node',
      id: category.id,
      subnetId,
      label: category.label,
      nodeData: category,
      glowMesh: node.glowMesh,
      shellMesh: node.shellMesh,
      nucleusMesh: node.nucleusMesh,
      hitboxMesh: node.hitboxMesh,
      group: node.group,
    };
    node.hitboxMesh.userData.targetMesh = node.nucleusMesh;

    group.add(node.group);

    const label = createLabel(category.label, 'category', 'subnet');
    label.object = node.nucleusMesh;
    label.offset.set(0, 0.72, 0);

    const categoryObj = { 
      ...category, 
      mesh: node.nucleusMesh, 
      nucleusMesh: node.nucleusMesh,
      shellMesh: node.shellMesh,
      glowMesh: node.glowMesh,
      hitboxMesh: node.hitboxMesh,
      group: node.group, 
      label,
      desktopOriginalPos: desktopPos,
      mobileOriginalPos: mobilePos,
      originalPos: initialPos.clone() 
    };
    categoryNodes.set(category.id, categoryObj);
    categories.push(categoryObj);

    edges.push(createEdge(coreNode.nucleusMesh, node.nucleusMesh, group, 0.48));

    // If this category contains individual skill nodes (for Skills subnet)
    if (Array.isArray(category.skills)) {
      for (let skillIndex = 0; skillIndex < category.skills.length; skillIndex++) {
        const skill = category.skills[skillIndex];
        const skillNode = createNeuralNodeGroup({
          nucleusRadius: 0.26,
          torusRadius: 0.36,
          torusTube: 0.018,
          color: COLORS.medium,
          opacity: 0.95,
        });

        const skillDesktopPos = new THREE.Vector3(...skill.position);
        const angleStep = 0.5;
        const startAngle = -Math.PI / 2 - ((category.skills.length - 1) * angleStep) / 2;
        const angle = startAngle + skillIndex * angleStep;
        const skillMobilePos = new THREE.Vector3(
          mobilePos.x + Math.cos(angle) * 1.8,
          mobilePos.y + Math.sin(angle) * 1.8,
          mobilePos.z
        );
        const skillInitialPos = isMobileViewport() ? skillMobilePos.clone() : skillDesktopPos.clone();
        skillNode.group.position.copy(skillInitialPos);

        const skillLabel = createLabel(skill.label, 'skill', 'subnet');
        skillLabel.object = skillNode.nucleusMesh;
        skillLabel.offset.set(0, 0.45, 0);

        const skillObj = {
          type: 'skill-node',
          id: skill.id,
          subnetId,
          label: skill.label,
          skillData: skill,
          mesh: skillNode.nucleusMesh,
          nucleusMesh: skillNode.nucleusMesh,
          shellMesh: skillNode.shellMesh,
          glowMesh: skillNode.glowMesh,
          hitboxMesh: skillNode.hitboxMesh,
          group: skillNode.group,
          label: skillLabel,
          desktopOriginalPos: skillDesktopPos,
          mobileOriginalPos: skillMobilePos,
          originalPos: skillInitialPos.clone(),
        };

        skillNode.nucleusMesh.userData = skillObj;
        skillNode.hitboxMesh.userData = { isHitbox: true, targetMesh: skillNode.nucleusMesh };
        skillNode.group.userData = skillObj;

        group.add(skillNode.group);

        edges.push(createEdge(node.nucleusMesh, skillNode.nucleusMesh, group, 0.35));
      }
    }
  }

  // Sort category nodes spatially by polar angle around origin to create clean non-crossing perimeter ring edges
  const sortedCategories = [...categories].sort((a, b) => {
    const angleA = Math.atan2(a.group.position.y, a.group.position.x);
    const angleB = Math.atan2(b.group.position.y, b.group.position.x);
    return angleA - angleB;
  });

  for (let i = 0; i < sortedCategories.length; i++) {
    const source = sortedCategories[i];
    const target = sortedCategories[(i + 1) % sortedCategories.length];
    edges.push(createEdge(source.mesh, target.mesh, group, 0.18));
  }

  return {
    subnetId,
    definition,
    group,
    core: subnetCore,
    coreNode: coreNodeObj,
    nucleus: coreNode.nucleusMesh,
    coreHitbox: coreNode.hitboxMesh,
    label: subnetLabel,
    subtitleLabel,
    categories,
    categoryMap: categoryNodes,
    edges,
  };
}

for (const subnetId of Object.keys(subnetDefinitions)) {
  subnetWorlds.set(subnetId, createSubnetWorld(subnetId));
}

/* ============================================================
   CINEMATIC 3D CAMERA TRANSITION SYSTEM
   (Instant Smooth Bezier Flight, Zero Delay, Continuous Look-At Tracking)
   ============================================================ */

let transitionState = null;

const _tempCamVec1 = new THREE.Vector3();
const _tempCamVec2 = new THREE.Vector3();
const _tempCamVec3 = new THREE.Vector3();
const _tempBezierPos = new THREE.Vector3();

function startTransition(targetPosition, targetLookAt, duration = 800) {
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const endPos = targetPosition.clone();
  const endTarget = targetLookAt.clone();

  // 3D Bezier flight control point for a subtle 3D arc without initial delay or recoil
  const flightVec = _tempCamVec2.subVectors(endPos, startPos);
  const midPoint = _tempCamVec3.addVectors(startPos, endPos).multiplyScalar(0.5);

  const upVec = new THREE.Vector3(0, 1, 0);
  const arcVec = new THREE.Vector3().crossVectors(upVec, flightVec).normalize();
  if (arcVec.lengthSq() < 0.001) arcVec.set(1, 0, 0);

  const arcMagnitude = Math.min(flightVec.length() * 0.12, 3.2);
  const controlPoint = midPoint.clone().add(arcVec.multiplyScalar(arcMagnitude));

  transitionState = {
    startPos,
    controlPoint,
    endPos,
    startTarget,
    endTarget,
    startTime: performance.now(),
    duration,
  };
}

function updateCameraTransition() {
  if (!transitionState) return;

  const now = performance.now();
  const rawProgress = Math.min((now - transitionState.startTime) / transitionState.duration, 1.0);

  // Smooth Ease-Out-Cubic Easing: Instant start (0ms delay), smooth travel, gentle landing
  const t = 1 - Math.pow(1 - rawProgress, 3);
  const oneMinusT = 1 - t;

  const currentPos = _tempBezierPos;
  currentPos.x = oneMinusT * oneMinusT * transitionState.startPos.x +
                 2 * oneMinusT * t * transitionState.controlPoint.x +
                 t * t * transitionState.endPos.x;

  currentPos.y = oneMinusT * oneMinusT * transitionState.startPos.y +
                 2 * oneMinusT * t * transitionState.controlPoint.y +
                 t * t * transitionState.endPos.y;

  currentPos.z = oneMinusT * oneMinusT * transitionState.startPos.z +
                 2 * oneMinusT * t * transitionState.controlPoint.z +
                 t * t * transitionState.endPos.z;

  camera.position.copy(currentPos);
  controls.target.lerpVectors(transitionState.startTarget, transitionState.endTarget, t);
  controls.update();

  if (rawProgress >= 1.0) {
    camera.position.copy(transitionState.endPos);
    controls.target.copy(transitionState.endTarget);
    controls.update();
    transitionState = null;
  }
}

/* ============================================================
   UI HUD UPDATES
   ============================================================ */

const modeElement = document.querySelector('[data-mode]');
const layerPathElement = document.querySelector('[data-layer-path]');
const nodeCountElement = document.querySelector('[data-node-count]');
const edgeCountElement = document.querySelector('[data-edge-count]');
const fpsElement = document.querySelector('[data-fps]');

function setMode(modeText) {
  if (modeElement) modeElement.textContent = modeText;
}

function setLayerPath(pathText) {
  if (layerPathElement) layerPathElement.textContent = pathText;
}

function updateCounters(nodeCount, edgeCount) {
  if (nodeCountElement) nodeCountElement.textContent = nodeCount;
  if (edgeCountElement) edgeCountElement.textContent = edgeCount;
}

/* ============================================================
   CLIENT-SIDE ROUTING & BROWSER HISTORY API
   ============================================================ */

const ROUTES = {
  home: { path: '/portfolio-website-dedicated/', title: 'DEEPAK R V — Neural Network' },
  about: { path: '/portfolio-website-dedicated/about', title: 'DEEPAK R V — About' },
  skills: { path: '/portfolio-website-dedicated/skills', title: 'DEEPAK R V — Skills' },
  projects: { path: '/portfolio-website-dedicated/projects', title: 'DEEPAK R V — Projects' },
  experience: { path: '/portfolio-website-dedicated/experience', title: 'DEEPAK R V — Experience' },
  contact: { path: '/portfolio-website-dedicated/contact', title: 'DEEPAK R V — Contact' },
};

const mobileChapterIndicatorEl = document.getElementById('mobileChapterIndicator');

const MOBILE_CHAPTER_MAP = {
  home: 'CHAPTER 01 / OVERVIEW',
  about: 'CHAPTER 02 / PROFILE & IDENTITY',
  skills: 'CHAPTER 03 / CAPABILITIES',
  projects: 'CHAPTER 04 / CASE STUDIES',
  experience: 'CHAPTER 05 / CAREER MILESTONES',
  contact: 'CHAPTER 06 / CONNECTION HUB',
};

function updateMobileChapter(routeKey) {
  if (!mobileChapterIndicatorEl) return;
  const chapterText = MOBILE_CHAPTER_MAP[routeKey] || MOBILE_CHAPTER_MAP.home;
  const span = mobileChapterIndicatorEl.querySelector('span');
  if (span) span.textContent = chapterText;
  mobileChapterIndicatorEl.style.display = isMobileViewport() ? 'inline-flex' : 'none';
}

function updateBrowserRoute(routeKey, isPush = true) {
  const route = ROUTES[routeKey] || ROUTES.home;
  document.title = route.title;

  updateMobileChapter(routeKey);

  const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/portfolio-website-dedicated';
  const targetPath = route.path.toLowerCase().replace(/\/$/, '') || '/portfolio-website-dedicated';

  if (currentPath !== targetPath) {
    if (isPush) {
      history.pushState({ routeKey }, route.title, route.path);
    } else {
      history.replaceState({ routeKey }, route.title, route.path);
    }
  }
}

/* ============================================================
   LAYER CONTROL FUNCTIONS (ACTIVE-LAYER ISOLATION)
   ============================================================ */

function setLayerVisibility(layerName) {
  currentLayer = layerName;

  if (layerName === 'MAIN') {
    setWorldVisibility(mainGraph, false);
    setWorldOpacity(mainGraph, 0.0);
    setWorldOpacity(core, 0.0);

    sceneController.setVisible(true);

    /* 5 AMBIENT 3D FLOATING LOGOS EXIST ONLY ON HOME! */
    ambientLogosGroup.visible = true;

    for (const world of subnetWorlds.values()) {
      setWorldVisibility(world.group, false);
      setWorldOpacity(world.group, 0);
    }

    setLabelMode('main');
    showCoreBeacon(false);
  } else if (layerName === 'SUBNET') {
    /* STRICT ACTIVE-LAYER ISOLATION: Hide Home network completely in subnets! */
    setWorldVisibility(mainGraph, false);
    setWorldOpacity(mainGraph, 0.0);
    setWorldOpacity(core, 0.0);

    sceneController.setVisible(false);
    ambientLogosGroup.visible = false;

    for (const world of subnetWorlds.values()) {
      const isCurrent = world === activeSubnet;
      setWorldVisibility(world.group, isCurrent);
      setWorldOpacity(world.group, isCurrent ? 1.0 : 0.0);
    }

    setLabelMode('subnet');
    showCoreBeacon(false);
  }
}

function enterSubnet(subnetId, isPush = true) {
  const world = subnetWorlds.get(subnetId);
  if (!world) return;

  activeSubnet = world;
  hideDetailPresentation();
  hideSkillContextPanel();

  setLayerVisibility('SUBNET');

  document.body.classList.add('project-mode');
  document.body.classList.remove('detail-mode');

  setMode(world.definition.title);
  setLayerPath(`NEURAL NETWORK / ${world.definition.title}`);
  const subnetZ = isMobileViewport() ? 24.5 : 18.5;
  const subnetY = isMobileViewport() ? 0.8 : 1.2;
  startTransition(new THREE.Vector3(0, subnetY, subnetZ), new THREE.Vector3(0, 0, 0), 850);
  updateBrowserRoute(subnetId, isPush);
}

function returnToCore(isPush = true) {
  sceneController.setActiveWorld('home');
  activeSubnet = null;
  hideDetailPresentation();
  hideSkillContextPanel();

  setLayerVisibility('MAIN');

  document.body.classList.remove('project-mode');
  document.body.classList.remove('detail-mode');

  setMode('OVERVIEW');
  setLayerPath('NEURAL NETWORK / OVERVIEW');
  updateCounters(mainNodeObjects.length + 1, mainEdges.length);

  const homeZ = isMobileViewport() ? 18.5 : 13.5;
  const homeY = isMobileViewport() ? 0.6 : 0.4;
  startTransition(new THREE.Vector3(0, homeY, homeZ), new THREE.Vector3(0, -0.2, 0), 900);
  updateBrowserRoute('home', isPush);
}

function exitLayer() {
  const isDetailOpen = document.body.classList.contains('detail-panel-open') || detailPanelEl?.classList.contains('active');
  const isSkillOpen = skillContextPanelEl?.classList.contains('active');

  if (isDetailOpen || isSkillOpen) {
    hideDetailPresentation();
    hideSkillContextPanel();
    return;
  }

  if (currentLayer === 'SUBNET') {
    returnToCore();
  }
}

/* ============================================================
   RAYCASTING & POINTER INTERACTION
   ============================================================ */

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const pointerDown = new THREE.Vector2();
let pointerMoved = false;

let touchStartTime = 0;

function updatePointer(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function getPointerObject() {
  raycaster.setFromCamera(pointer, camera);

  /* 1. Subnet Layer Active Skill Nodes (for Skills Subnet) */
  if (currentLayer === 'SUBNET' && activeSubnet) {
    const skillMeshes = [];
    activeSubnet.group.traverse(child => {
      if (child.isMesh && (child.userData.isHitbox || child.userData.type === 'skill-node')) {
        if (child.userData.type === 'skill-node' || (child.userData.targetMesh && child.userData.targetMesh.userData.type === 'skill-node')) {
          skillMeshes.push(child);
        }
      }
    });

    const skillHits = raycaster.intersectObjects(skillMeshes, false);
    if (skillHits.length) {
      const targetObj = skillHits[0].object.userData.targetMesh || skillHits[0].object;
      return { type: 'skill-node', object: targetObj };
    }
  }

  /* 2. Subnet Layer Active Category / Destination Nodes (Projects, Experience, Contact, Skills categories) */
  if (currentLayer === 'SUBNET' && activeSubnet) {
    const categoryTargets = [];
    for (const node of activeSubnet.categories) {
      if (node.hitboxMesh) categoryTargets.push(node.hitboxMesh);
      if (node.mesh) categoryTargets.push(node.mesh);
    }

    const hits = raycaster.intersectObjects(categoryTargets, false);
    if (hits.length) {
      const targetObj = hits[0].object.userData.targetMesh || hits[0].object;
      return { type: 'category-node', object: targetObj };
    }
  }

  /* 3. Universal Neural Core & Central Core Node Anchor */
  const coreTargets = [];
  if (currentLayer === 'MAIN') {
    if (coreNode.hitboxMesh) coreTargets.push(coreNode.hitboxMesh);
    if (coreNode.nucleusMesh) coreTargets.push(coreNode.nucleusMesh);
    if (beaconNode.hitboxMesh) coreTargets.push(beaconNode.hitboxMesh);
    if (beaconNode.nucleusMesh) coreTargets.push(beaconNode.nucleusMesh);
  } else if (currentLayer === 'SUBNET' && activeSubnet) {
    if (activeSubnet.coreHitbox) coreTargets.push(activeSubnet.coreHitbox);
    if (activeSubnet.nucleus) coreTargets.push(activeSubnet.nucleus);
  }

  const coreHit = raycaster.intersectObjects(coreTargets, false)[0];
  if (coreHit) {
    const targetObj = coreHit.object.userData.targetMesh || coreHit.object;
    return { type: 'core', object: targetObj };
  }

  /* 4. 3D Ambient Logo Objects Raycast (ONLY IN HOME MAIN LAYER) */
  if (currentLayer === 'MAIN' && ambientLogosGroup.visible) {
    const logoHits = raycaster.intersectObjects(
      ambientLogoObjects.map(item => item.mesh),
      false
    );
    if (logoHits.length) {
      return { type: 'ambient-logo', object: logoHits[0].object };
    }
  }

  /* 5. Main Homepage Authored GLB Scene Raycast Target */
  if (currentLayer === 'MAIN') {
    const glbTargets = sceneController.getRaycastTargets();
    if (glbTargets.length) {
      const hits = raycaster.intersectObjects(glbTargets, false);
      if (hits.length) {
        const hitObj = hits[0].object;
        const destId = hitObj.userData.destId || hitObj.userData.id;
        if (destId) {
          return { type: 'glb-home-node', object: hitObj, destId };
        }
      }
    }
  }

  return null;
}

renderer.domElement.addEventListener('pointerdown', event => {
  pointerDown.set(event.clientX, event.clientY);
  pointerMoved = false;
  touchStartTime = performance.now();
});

renderer.domElement.addEventListener('pointermove', event => {
  updatePointer(event);
  const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
  if (distance > 8) {
    pointerMoved = true;
  }
});

renderer.domElement.addEventListener('contextmenu', event => {
  event.preventDefault();
});

renderer.domElement.addEventListener('click', event => {
  if (pointerMoved || (touchStartTime > 0 && performance.now() - touchStartTime > 500)) return;

  updatePointer(event);
  const hit = getPointerObject();
  if (!hit) return;

  if (hit.type === 'core') {
    returnToCore();
    return;
  }

  if (hit.type === 'ambient-logo') {
    const logoData = hit.object.userData.logoData;
    if (logoData && logoData.url) {
      window.open(logoData.url, logoData.url.startsWith('http') ? '_blank' : '_self');
    }
    return;
  }

  if (hit.type === 'glb-home-node') {
    const destId = hit.destId;
    if (hit.object.userData.world === 'skills' || sceneController.activeWorld === 'skills') {
      // Clicked a skill node inside skills.glb world
      let foundSkillData = null;
      if (SUBNET_DEFINITIONS.skills?.categories) {
        for (const cat of SUBNET_DEFINITIONS.skills.categories) {
          if (cat.skills) {
            const match = cat.skills.find(s => s.id === destId || s.id.includes(destId) || s.name.toLowerCase().includes(destId.toLowerCase()));
            if (match) { foundSkillData = match; break; }
          }
        }
      }
      if (foundSkillData) {
        showSkillContextPanel(foundSkillData);
      }
      return;
    }

    if (hit.object.userData.world === 'projects' || sceneController.activeWorld === 'projects') {
      const projectCategory = SUBNET_DEFINITIONS.projects?.categories?.find(c => c.id === destId || c.id.includes(destId));
      if (projectCategory) {
        showDetailPresentation(projectCategory);
      } else {
        const fallbackObj = SUBNET_DEFINITIONS.projects?.categories?.[0];
        if (fallbackObj) showDetailPresentation(fallbackObj);
      }
      return;
    }

    if (destId === 'about') {
      showDetailPresentation(combinedAboutData);
      updateBrowserRoute('about', true);
    } else if (destId === 'core') {
      returnToCore();
    } else {
      enterSubnet(destId);
    }
    return;
  }

  if (hit.type === 'category-node') {
    const categoryObj = activeSubnet.categories.find(node =>
      node.mesh === hit.object ||
      node.hitboxMesh === hit.object ||
      (node.mesh && node.mesh.userData && hit.object.userData && node.mesh.userData.id === hit.object.userData.id)
    );
    if (categoryObj) {
      const nodeData = categoryObj.nodeData || categoryObj;
      if (nodeData.actionUrl) {
        window.open(
          nodeData.actionUrl,
          nodeData.actionUrl.startsWith('http') ? '_blank' : '_self'
        );
      } else if (activeSubnet.subnetId === 'skills') {
        return; // Category nodes in Skills are structural grouping anchors ONLY!
      } else {
        showDetailPresentation(nodeData);
      }
    }
    return;
  }

  if (hit.type === 'skill-node') {
    const skillData = hit.object.userData.skillData;
    if (skillData) {
      showSkillContextPanel(skillData);
    }
    return;
  }
});

/* Hover Scaling Effect for Nodes and Ambient Logos with 3D Tracked Hover Tooltip */
const tempScale = new THREE.Vector3();
let currentHoveredMesh = null;

function updateHover() {

  const hit = getPointerObject();
  currentHoveredMesh = hit ? hit.object : null;

  if (ambientLogosGroup.visible && !document.body.classList.contains('detail-panel-open')) {
    for (const item of ambientLogoObjects) {
      const isHovered = hit?.type === 'ambient-logo' && hit.object === item.mesh;
      const targetScale = isHovered ? 1.15 : 1.0;
      tempScale.set(targetScale, targetScale, targetScale);
      item.group.scale.lerp(tempScale, 0.16);

      // Show 3D-tracked Deltha hover label ONLY on hover!
      if (item.hoverLabel) {
        item.hoverLabel.hidden = !isHovered;
      }
    }
  } else {
    for (const item of ambientLogoObjects) {
      if (item.hoverLabel) item.hoverLabel.hidden = true;
    }
  }

  if (currentLayer === 'MAIN' && hit?.type === 'glb-home-node') {
    sceneController.setHoveredNode(hit.destId);
    updateNavChipsState(currentLayer === 'MAIN' ? 'core' : (activeSubnet?.subnetId || 'core'), hit.destId);
  } else {
    sceneController.setHoveredNode(null);
    updateNavChipsState(currentLayer === 'MAIN' ? 'core' : (activeSubnet?.subnetId || 'core'), null);
  }

  renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
}

/* ============================================================
   REDUCED MOTION & CINEMATIC ATMOSPHERIC DEPTH
   ============================================================ */

const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = prefersReducedMotionQuery.matches;
prefersReducedMotionQuery.addEventListener('change', event => {
  prefersReducedMotion = event.matches;
});

function animateAmbientDepthAndBreathing(currentTime) {
  // (Burst engine disabled)

  const t = currentTime * 0.001;
  const isReduced = prefersReducedMotion;

  const activeNodes = [];
  if (currentLayer === 'MAIN') {
    if (coreNode) activeNodes.push(coreNode);
    for (const item of mainNodeObjects) activeNodes.push(item);
  } else if (currentLayer === 'SUBNET' && activeSubnet) {
    if (activeSubnet.coreNode) activeNodes.push(activeSubnet.coreNode);
    for (const category of activeSubnet.categories) activeNodes.push(category);
    activeSubnet.group.traverse(child => {
      if (child.userData && child.userData.type === 'skill-node') {
        activeNodes.push(child.userData);
      }
    });
  }

  const camDir = new THREE.Vector3();
  const liftOffset = new THREE.Vector3();

  for (let i = 0; i < activeNodes.length; i++) {
    const node = activeNodes[i];
    if (!node.originalPos || !node.group) continue;

    const isHovered = currentHoveredMesh && (
      node.mesh === currentHoveredMesh ||
      node.hitboxMesh === currentHoveredMesh ||
      node.nucleusMesh === currentHoveredMesh ||
      (node.mesh && node.mesh.userData && currentHoveredMesh.userData && node.mesh.userData.id === currentHoveredMesh.userData.id)
    );

    /* 1. Controlled Hover Lift towards Camera (0.20 units lift, originalPos remains untouched) */
    const targetLift = isHovered ? 0.20 : 0.0;
    node.hoverLiftAmount = THREE.MathUtils.lerp(node.hoverLiftAmount || 0, targetLift, 0.18);

    camDir.subVectors(camera.position, node.originalPos).normalize();
    liftOffset.copy(camDir).multiplyScalar(node.hoverLiftAmount);

    /* 2. Ambient Micro-Motion (Sinusoidal Breathing relative to canonical originalPos) */
    if (!isReduced) {
      const phase = i * 0.85;
      const ambientY = Math.sin(t * 0.75 + phase) * 0.08;
      const ambientX = Math.cos(t * 0.55 + phase) * 0.04;
      node.group.position.x = node.originalPos.x + ambientX + liftOffset.x;
      node.group.position.y = node.originalPos.y + ambientY + liftOffset.y;
      node.group.position.z = node.originalPos.z + liftOffset.z;
    } else {
      node.group.position.copy(node.originalPos).add(liftOffset);
    }

    /* 3. Distance-Based Atmospheric Depth Falloff */
    const distToCam = camera.position.distanceTo(node.group.position);
    const depthFactor = THREE.MathUtils.clamp(1.0 - (distToCam - 20) / 75, 0.75, 1.0);

    const shellMesh = node.shellMesh;
    const nucleusMesh = node.nucleusMesh || node.mesh;

    if (!isHovered) {
      if (shellMesh && shellMesh.material) {
        const baseShellOpacity = shellMesh.material.userData.baseOpacity || 0.32;
        shellMesh.material.userData.currentBaseOpacity = baseShellOpacity * depthFactor;
      }
      if (nucleusMesh && nucleusMesh.material) {
        const baseNucleusOpacity = nucleusMesh.material.userData.baseOpacity || 0.95;
        nucleusMesh.material.userData.currentBaseOpacity = baseNucleusOpacity * depthFactor;
      }
    }
  }
}

function animateHoverEffects() {
  const activeNodes = [];

  if (currentLayer === 'MAIN') {
    if (coreNode) activeNodes.push(coreNode);
    for (const item of mainNodeObjects) activeNodes.push(item);
  } else if (currentLayer === 'SUBNET' && activeSubnet) {
    if (activeSubnet.coreNode) activeNodes.push(activeSubnet.coreNode);
    for (const category of activeSubnet.categories) activeNodes.push(category);
    activeSubnet.group.traverse(child => {
      if (child.userData && child.userData.type === 'skill-node') {
        activeNodes.push(child.userData);
      }
    });
  }

  for (const node of activeNodes) {
    const isHovered = currentHoveredMesh && (
      node.mesh === currentHoveredMesh ||
      node.hitboxMesh === currentHoveredMesh ||
      node.nucleusMesh === currentHoveredMesh ||
      (node.mesh && node.mesh.userData && currentHoveredMesh.userData && node.mesh.userData.id === currentHoveredMesh.userData.id)
    );

    const glowMesh = node.glowMesh;
    const shellMesh = node.shellMesh;
    const nucleusMesh = node.nucleusMesh || node.mesh;

    /* Smooth Hover Scale Pop (1.08x scale swell) */
    const targetScale = isHovered ? 1.08 : 1.00;
    if (node.group && node.group.scale) {
      const curScale = node.group.scale.x;
      const nextScale = THREE.MathUtils.lerp(curScale, targetScale, 0.18);
      node.group.scale.set(nextScale, nextScale, nextScale);
    }

    if (glowMesh && glowMesh.material) {
      const targetGlowOpacity = isHovered ? 0.38 : 0.0;
      glowMesh.material.opacity = THREE.MathUtils.lerp(glowMesh.material.opacity, targetGlowOpacity, 0.18);
    }

    if (shellMesh && shellMesh.material) {
      const baseShellOpacity = shellMesh.material.userData.currentBaseOpacity || shellMesh.material.userData.baseOpacity || 0.32;
      const targetShellOpacity = isHovered ? 0.85 : baseShellOpacity;
      shellMesh.material.opacity = THREE.MathUtils.lerp(shellMesh.material.opacity, targetShellOpacity, 0.18);
    }

    if (nucleusMesh && nucleusMesh.material) {
      const baseNucleusOpacity = nucleusMesh.material.userData.currentBaseOpacity || nucleusMesh.material.userData.baseOpacity || 0.95;
      const targetNucleusOpacity = isHovered ? 1.0 : baseNucleusOpacity;
      nucleusMesh.material.opacity = THREE.MathUtils.lerp(nucleusMesh.material.opacity, targetNucleusOpacity, 0.18);
    }

    if (node.label && node.label.element) {
      if (isHovered) {
        node.label.element.style.color = '#ffffff';
        node.label.element.style.textShadow = '0 0 18px rgba(0, 255, 136, 0.85)';
      } else {
        node.label.element.style.color = '';
        node.label.element.style.textShadow = '';
      }
    }
  }
}

/* ============================================================
   KEYBOARD NAVIGATION & CAMERA RESET CONTROL
   ============================================================ */

window.addEventListener('keydown', event => {
  const isDetailOpen = document.body.classList.contains('detail-panel-open');

  if (isDetailOpen && panelBodyEl) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      panelBodyEl.scrollBy({ top: 100, behavior: 'smooth' });
      return;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      panelBodyEl.scrollBy({ top: -100, behavior: 'smooth' });
      return;
    } else if (event.key === 'PageDown') {
      event.preventDefault();
      panelBodyEl.scrollBy({ top: 350, behavior: 'smooth' });
      return;
    } else if (event.key === 'PageUp') {
      event.preventDefault();
      panelBodyEl.scrollBy({ top: -350, behavior: 'smooth' });
      return;
    } else if (event.key === 'Home') {
      event.preventDefault();
      panelBodyEl.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    } else if (event.key === 'End') {
      event.preventDefault();
      panelBodyEl.scrollTo({ top: panelBodyEl.scrollHeight, behavior: 'smooth' });
      return;
    }
  }

  if (event.key === 'c' || event.key === 'C') {
    // CAMERA RESET KEY 'C'
    startTransition(new THREE.Vector3(0, 1.2, 30), new THREE.Vector3(0, 0, 0), 850);
    return;
  }

  if (event.key === 'Escape') {
    exitLayer();
  } else if (event.key === 'Home' && !isDetailOpen) {
    returnToCore();
  }
});

/* ============================================================
   STRICT SIGNAL PARTICLES (Travel strictly along connection edges)
   ============================================================ */

const signalGeometry = new THREE.SphereGeometry(0.075, 12, 12);
const signalMaterial = nodeMaterial(COLORS.bright, 0.95);
const signals = [];

function createSignal(edge) {
  const mesh = new THREE.Mesh(signalGeometry, signalMaterial);
  mesh.visible = false;
  scene.add(mesh);
  return { mesh, edge, progress: Math.random(), speed: 0.004 + Math.random() * 0.006 };
}

for (let i = 0; i < 24; i++) {
  const edge = mainEdges[i % mainEdges.length];
  if (edge) signals.push(createSignal(edge));
}

function updateSignals() {
  const start = new THREE.Vector3();
  const end = new THREE.Vector3();

  for (const signal of signals) {
    if (!signal.edge || !signal.edge.source || !signal.edge.target) {
      signal.mesh.visible = false;
      continue;
    }

    if (!isObjectInVisibleWorld(signal.edge.source) || !isObjectInVisibleWorld(signal.edge.target)) {
      signal.mesh.visible = false;
      continue;
    }

    signal.progress += signal.speed;
    if (signal.progress > 1) signal.progress = 0;

    signal.edge.source.getWorldPosition(start);
    signal.edge.target.getWorldPosition(end);

    signal.mesh.position.lerpVectors(start, end, signal.progress);
    signal.mesh.visible = true;
  }
}

/* ============================================================
   MAIN ANIMATION LOOP
   ============================================================ */

let frameCount = 0;
let fpsTimer = performance.now();
const mainClock = new THREE.Clock();

function animate(currentTime) {
  requestAnimationFrame(animate);

  const delta = mainClock.getDelta();
  assetManager.update(delta);
  // Pass camera so SceneController can billboard labels toward it each frame
  sceneController.updateIdleMotion(currentTime, delta, camera);

  if (isMobileViewport()) {
    renderer.domElement.style.display = 'none';
    renderMobileExperience();
    return; // Completely bypass desktop 3D graph processing on mobile
  }

  renderer.domElement.style.display = 'block';

  /* Core Rotation */
  coreWire.rotation.y += 0.002;

  /* Ambient Particle Drift */
  particleCloud.rotation.y += 0.0005;

  /* Organic 3D Multi-Axis Floating Motion for 5 Ambient Square App Icons */
  if (ambientLogosGroup.visible) {
    const t = currentTime * 0.001;
    for (const item of ambientLogoObjects) {
      let rawX = item.basePos.x + Math.sin(t * item.speedX + item.phase) * item.ampX + Math.cos(t * 0.45 + item.phase) * 1.2;
      let rawY = item.basePos.y + Math.sin(t * item.speedY + item.phase) * item.ampY + Math.sin(t * 0.35 + item.phase) * 0.8;
      let rawZ = item.basePos.z + Math.cos(t * item.speedZ + item.phase) * item.ampZ; // Forward / Backward Z drift!

      // Central Exclusion Zone: Ensure distance from origin stays outside central network radius (> 12.0)
      const dist2D = Math.hypot(rawX, rawY);
      if (dist2D < 12.0) {
        const factor = 12.0 / (dist2D || 1);
        rawX *= factor;
        rawY *= factor;
      }

      item.group.position.set(rawX, rawY, rawZ);
      item.group.rotation.x = Math.sin(t * 0.35 + item.phase) * 0.15;
      item.group.rotation.y = item.baseRot.y + Math.sin(t * 0.5 + item.phase) * 0.25;
      item.group.rotation.z = Math.cos(t * 0.25 + item.phase) * 0.08;
    }
  }

  animateAmbientDepthAndBreathing(currentTime);
  updateCameraTransition();
  controls.update();

  /* Continuous Travelling Electric Particle Pulse Motion */
  for (const edge of mainEdges) {
    if (edge.particleGroup) {
      edge.pulseProgress += edge.pulseSpeed;
      if (edge.pulseProgress > 1) edge.pulseProgress = 0;
    }
  }
  if (activeSubnet) {
    for (const edge of activeSubnet.edges) {
      if (edge.particleGroup) {
        edge.pulseProgress += edge.pulseSpeed;
        if (edge.pulseProgress > 1) edge.pulseProgress = 0;
      }
    }
  }

  /* Dynamic 3D Edge Updating */
  updateEdges(mainEdges);
  if (activeSubnet) {
    updateEdges(activeSubnet.edges);
  }

  updateSignals();
  updateHover();
  animateHoverEffects();
  updateLabels();

  renderer.render(scene, camera);

  /* FPS Counter */
  frameCount++;
  if (currentTime - fpsTimer >= 1000) {
    if (fpsElement) {
      fpsElement.textContent = Math.round((frameCount * 1000) / (currentTime - fpsTimer));
    }
    frameCount = 0;
    fpsTimer = currentTime;
  }
}

/* ============================================================
   SEPARATE MOBILE DOM PRESENTATION ENGINE (< 768px)
   ============================================================ */

let mobileExperienceInitialized = false;

function renderMobileExperience() {
  if (mobileExperienceInitialized) return;
  const mApp = document.getElementById('mobileApp');
  if (!mApp) return;
  mobileExperienceInitialized = true;

  // 1. Populate Skills
  const mCv = document.getElementById('mCvSkills');
  const mDl = document.getElementById('mDlSkills');
  const mSys = document.getElementById('mSystemsSkills');
  const mLang = document.getElementById('mLangSkills');

  const cvSkills = ['YOLOv8', 'ByteTrack', 'OpenCV', 'Fast-SCNN'];
  const dlSkills = ['PyTorch', 'TensorFlow Lite', 'Google ML Kit', 'K-Means'];
  const sysSkills = ['Playwright & Chromium', 'SQLite Master DB', 'ThreadPoolExecutor', 'Pandas & Data Pipelines'];
  const langSkills = ['Python', 'Flutter / Dart', 'Next.js / TypeScript', 'Git & GitHub'];

  if (mCv && mCv.children.length === 0) {
    mCv.innerHTML = cvSkills.map(s => `<span class="m-skill-badge">${s}</span>`).join('');
    mDl.innerHTML = dlSkills.map(s => `<span class="m-skill-badge">${s}</span>`).join('');
    mSys.innerHTML = sysSkills.map(s => `<span class="m-skill-badge">${s}</span>`).join('');
    mLang.innerHTML = langSkills.map(s => `<span class="m-skill-badge">${s}</span>`).join('');
  }

  // 2. Populate Projects
  const mProjList = document.getElementById('mProjectsList');
  if (mProjList && mProjList.children.length === 0) {
    const projDefs = subnetDefinitions.projects.categories;
    mProjList.innerHTML = projDefs.map((p, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      const actionBtn = p.actions && p.actions.length ?
        `<a class="m-proj-btn" href="${p.actions[0].url}" target="_blank" rel="noopener noreferrer">${p.actions[0].label} ↗</a>` : '';

      return `
        <article class="m-project-card">
          <div class="m-proj-num">${num} / ${p.kicker || 'CASE STUDY'}</div>
          <h3 class="m-proj-title">${p.title || p.label}</h3>
          <div class="m-proj-subtitle">${p.subtitle || ''}</div>
          
          ${p.sections.map(sec => `
            <div class="m-proj-sec-title">${sec.heading}</div>
            ${sec.content ? `<p class="m-dim-text">${sec.content}</p>` : ''}
            ${sec.bullets ? `<ul class="m-list">${sec.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
          `).join('')}

          <div class="m-proj-tags-container">
            ${(p.tags || []).map(t => `<span class="m-skill-badge">${t}</span>`).join('')}
          </div>
          ${actionBtn}
        </article>
      `;
    }).join('');
  }

  // 3. Populate Experience
  const mExpList = document.getElementById('mExpList');
  if (mExpList && mExpList.children.length === 0) {
    const expDefs = subnetDefinitions.experience.categories;
    mExpList.innerHTML = expDefs.map((e, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      const actionBtn = e.actions && e.actions.length ?
        `<a class="m-proj-btn" href="${e.actions[0].url}" target="_blank" rel="noopener noreferrer">${e.actions[0].label} ↗</a>` : '';

      return `
        <article class="m-project-card">
          <div class="m-proj-num">${num} / ${e.kicker || 'EXPERIENCE'}</div>
          <h3 class="m-proj-title">${e.title}</h3>
          <div class="m-proj-subtitle">${e.subtitle || ''}</div>

          ${e.sections.map(sec => `
            <div class="m-proj-sec-title">${sec.heading}</div>
            ${sec.content ? `<p class="m-dim-text">${sec.content}</p>` : ''}
            ${sec.bullets ? `<ul class="m-list">${sec.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
          `).join('')}

          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:12px;">
            ${(e.tags || []).map(t => `<span class="m-skill-badge" style="font-size:10px;">${t}</span>`).join('')}
          </div>
          ${actionBtn}
        </article>
      `;
    }).join('');
  }

  // 4. Mobile Hamburger Drawer Toggle & Touch Navigation Handlers
  const mHamburgerBtn = document.getElementById('mHamburgerBtn');
  const mNavDrawer = document.getElementById('mNavDrawer');
  const mNavBackdrop = document.getElementById('mNavBackdrop');
  const mDrawerCloseBtn = document.getElementById('mDrawerCloseBtn');

  function closeMobileDrawer() {
    if (mHamburgerBtn) {
      mHamburgerBtn.classList.remove('open');
      mHamburgerBtn.setAttribute('aria-expanded', 'false');
    }
    if (mNavDrawer) mNavDrawer.classList.remove('open');
    if (mNavBackdrop) mNavBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function openMobileDrawer() {
    if (mHamburgerBtn) {
      mHamburgerBtn.classList.add('open');
      mHamburgerBtn.setAttribute('aria-expanded', 'true');
    }
    if (mNavDrawer) mNavDrawer.classList.add('open');
    if (mNavBackdrop) mNavBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  if (mHamburgerBtn) {
    mHamburgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = mNavDrawer && mNavDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (mDrawerCloseBtn) mDrawerCloseBtn.addEventListener('click', closeMobileDrawer);
  if (mNavBackdrop) mNavBackdrop.addEventListener('click', closeMobileDrawer);

  const navBtns = document.querySelectorAll('.m-nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileDrawer();

      const route = btn.dataset.mRoute;
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (route === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateBrowserRoute('home', true);
      } else {
        const secId = `mSection${route.charAt(0).toUpperCase() + route.slice(1)}`;
        const targetSec = document.getElementById(secId);
        if (targetSec) {
          const headerOffset = 72;
          const elementPosition = targetSec.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
        updateBrowserRoute(route, true);
      }
    });
  });
}

/* ============================================================
   INITIALIZATION, ROUTING & RESIZE HANDLERS
   ============================================================ */

window.addEventListener('popstate', () => {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');

  if (path.endsWith('/about')) {
    returnToCore(false);
    showDetailPresentation(combinedAboutData);
    updateBrowserRoute('about', false);
  } else if (path.endsWith('/skills')) {
    enterSubnet('skills', false);
  } else if (path.endsWith('/projects')) {
    enterSubnet('projects', false);
  } else if (path.endsWith('/experience')) {
    enterSubnet('experience', false);
  } else if (path.endsWith('/contact')) {
    enterSubnet('contact', false);
  } else {
    hideDetailPresentation();
    hideSkillContextPanel();
    returnToCore(false);
  }
});

function initRouteFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const redirectedPath = params.get('p');
  let path = window.location.pathname;

  if (redirectedPath) {
    path = `/portfolio-website-dedicated/${redirectedPath}`.replace(/\/+/g, '/');
    history.replaceState(null, '', path);
  }

  const normalizedPath = path.toLowerCase().replace(/\/$/, '');

  if (normalizedPath.endsWith('/about')) {
    showDetailPresentation(combinedAboutData);
    updateBrowserRoute('about', false);
  } else if (normalizedPath.endsWith('/skills')) {
    enterSubnet('skills', false);
  } else if (normalizedPath.endsWith('/projects')) {
    enterSubnet('projects', false);
  } else if (normalizedPath.endsWith('/experience')) {
    enterSubnet('experience', false);
  } else if (normalizedPath.endsWith('/contact')) {
    enterSubnet('contact', false);
  } else {
    setLayerVisibility('MAIN');
    setMode('OVERVIEW');
    setLayerPath('NEURAL NETWORK / OVERVIEW');
    updateCounters(mainNodeObjects.length + 1, mainEdges.length);
    updateBrowserRoute('home', false);
  }
}

initRouteFromUrl();

function updateResponsiveLayout() {
  const isMobile = isMobileViewport();
  if (isMobile) {
    renderer.domElement.style.display = 'none';
    renderMobileExperience();
  } else {
    renderer.domElement.style.display = 'block';
  }
}

window.addEventListener('resize', () => {
  if (!isMobileViewport()) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  updateResponsiveLayout();
});

// Run initial layout check
requestAnimationFrame(animate);
/* ============================================================
   CONSOLIDATED NETWORK CONTROL & QUICK NAVIGATION LISTENERS
   ============================================================ */

const navChips = document.querySelectorAll('.nav-chip[data-node-route]');

function updateNavChipsState(activeRoute, hoveredRoute = null) {
  navChips.forEach(chip => {
    const route = chip.dataset.nodeRoute;
    if (activeRoute && (route === activeRoute || (activeRoute === 'MAIN' && route === 'core'))) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
    if (hoveredRoute && (route === hoveredRoute || (hoveredRoute === 'core' && route === 'core'))) {
      chip.classList.add('node-hovered');
    } else {
      chip.classList.remove('node-hovered');
    }
  });
}

navChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const route = chip.dataset.nodeRoute;
    if (route === 'core' || route === 'home') {
      returnToCore();
    } else if (route === 'about') {
      showDetailPresentation(combinedAboutData);
      updateBrowserRoute('about', true);
    } else {
      enterSubnet(route);
    }
  });

  chip.addEventListener('mouseenter', () => {
    const route = chip.dataset.nodeRoute;
    sceneController.setHoveredNode(route);
  });

  chip.addEventListener('mouseleave', () => {
    sceneController.setHoveredNode(null);
  });
});
