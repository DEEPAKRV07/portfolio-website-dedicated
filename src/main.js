import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/*
 * ============================================================
 * DEEPAK R V — INSIDE MY NEURAL NETWORK
 * SPRINT — RESTORE THE ORIGINAL RANDOM 3D BURST + RECONSTRUCT + SQUARE AMBIENT APP ICONS
 * ============================================================
 */

/* ============================================================
   NEURAL INITIALIZATION SCREEN HANDLER
   ============================================================ */

const loaderEl = document.getElementById('neuralLoader');
const loaderStatusEl = document.getElementById('loaderStatus');
const loaderBarFillEl = document.getElementById('loaderBarFill');

let loadProgress = 0;
const loadInterval = setInterval(() => {
  loadProgress += 15;
  if (loaderBarFillEl) loaderBarFillEl.style.width = `${Math.min(loadProgress, 90)}%`;

  if (loadProgress === 30 && loaderStatusEl) {
    loaderStatusEl.textContent = 'CONSTRUCTING COMPUTATIONAL GRAPH...';
  } else if (loadProgress === 60 && loaderStatusEl) {
    loaderStatusEl.textContent = 'CONNECTING NEURAL NODES...';
  } else if (loadProgress >= 90 && loaderStatusEl) {
    loaderStatusEl.textContent = 'SYSTEM ONLINE';
  }

  if (loadProgress >= 100) {
    clearInterval(loadInterval);
    if (loaderBarFillEl) loaderBarFillEl.style.width = '100%';
    setTimeout(() => {
      if (loaderEl) loaderEl.classList.add('hidden');
    }, 280);
  }
}, 45);

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
camera.position.set(0, 1.2, 30);

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

const ambientLight = new THREE.AmbientLight(0x00ff88, 0.35);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0x00ff88, 0.85);
dirLight.position.set(10, 20, 15);
scene.add(dirLight);

const pointLight = new THREE.PointLight(0x00ff88, 1.6, 60);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

/* Subdued 3D Perspective Floor Grid */
const floorGrid = new THREE.PolarGridHelper(32, 16, 8, 64, 0x00ff88, 0x004422);
floorGrid.position.set(0, -11.5, 0);
floorGrid.material.transparent = true;
floorGrid.material.opacity = 0.22; // Subdued grounding floor
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
controls.minPolarAngle = THREE.MathUtils.degToRad(8);
controls.maxPolarAngle = THREE.MathUtils.degToRad(172);
controls.minDistance = 6;
controls.maxDistance = 75;
controls.target.set(0, 0, 0);

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
  // If full-screen detail presentation is open, hide all graph labels to prevent visual collisions!
  if (document.body.classList.contains('detail-panel-open') || detailPanelEl?.classList.contains('active')) {
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

const mainNodes = [
  { id: 'about', label: 'ABOUT', type: 'primary', position: [0.0, 7.8, 1.8] },
  { id: 'skills', label: 'SKILLS', type: 'primary', position: [-9.2, 3.8, -1.2] },
  { id: 'experience', label: 'EXPERIENCE', type: 'primary', position: [9.2, 3.8, 1.2] },
  { id: 'projects', label: 'PROJECTS', type: 'primary', position: [-6.8, -5.2, -1.8] },
  { id: 'contact', label: 'CONTACT', type: 'primary', position: [6.8, -5.2, 0.8] },
];

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
coreNode.originalPos = coreNode.group.position.clone();
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

  node.group.position.set(...data.position);
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
    originalPos: node.group.position.clone(),
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

const BASE_URL = import.meta.env.BASE_URL || '/';

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

  // 3. SINGLE SMALL SOLID OPAQUE BRIGHT GREEN ELECTRIC PARTICLE (No translucent halo layer!)
  const particleMesh = new THREE.Mesh(particleSolidGeometry, particleSolidMaterial);
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
   ONE COMBINED ABOUT PRESENTATION DATA (RESUME PDF CTA HERE ONLY)
   ============================================================ */

const combinedAboutData = {
  kicker: 'PROFILE & CAPABILITIES',
  title: 'DEEPAK R V',
  subtitle: 'AI / ML ENGINEER & SOFTWARE DEVELOPER',
  sections: [
    {
      heading: 'PROFESSIONAL SUMMARY',
      content: 'B.E. Computer Science & Engineering (AIML Specialization) graduate specializing in real-time Computer Vision, Deep Learning, spatial decision reasoning, automated lead data engineering, and full-stack web platforms. Proven experience designing object detection and tracking pipelines (YOLOv8, ByteTrack), spatial navigation systems (SightMate), production data harvesting platforms (Google Maps Lead Intelligence), and design-system-driven web applications (FORCRUX, Kaatchi Media).',
    },
    {
      heading: 'CORE TECHNICAL FOCUS',
      bullets: [
        'Computer Vision & Tracking — YOLOv8, ByteTrack, OpenCV, Fast-SCNN, Optical Flow, K-Means Clustering',
        'Deep Learning & Edge AI — TensorFlow Lite, PyTorch, Google ML Kit OCR, Model Quantization, Spatial Decision Fusion',
        'Data Engineering & Automation — Python, Playwright, SQLite Master DB, ThreadPoolExecutor Concurrency, Pandas',
        'Full-Stack & Web Engineering — Next.js, React, TypeScript, GSAP Motion Design, Responsive CSS3/HTML5, Payload CMS',
      ],
    },
    {
      heading: 'CAREER MILESTONES',
      bullets: [
        'Lead Frontend Engineer & Design Systems — FORCRUX Studio Platform',
        'Software Developer Intern / Frontend Developer — Kaatchi Media (kaatchimedia.com)',
        'Embedded Systems Intern — MSME Technology Development Centre (MSME TDC)',
        'Digital Media Contributor — Quality Threads',
      ],
    },
    {
      heading: 'EDUCATION & QUALIFICATIONS',
      content: 'Bachelor of Engineering (B.E.) in Computer Science and Engineering (AI/ML Specialization) — S.A. Engineering College, Chennai (2022–2026) | CGPA: 8.1 / 10.',
    },
    {
      heading: 'CONTACT & SOCIAL CHANNELS',
      bullets: [
        'Email: deepakvetrivelan@gmail.com',
        'LinkedIn: linkedin.com/in/deepakrv07/',
        'GitHub: github.com/DEEPAKRV07',
      ],
    },
  ],
  tags: ['AI/ML Engineer', 'Computer Vision', 'B.E. CSE (AIML)', 'YOLOv8', 'Playwright', 'Next.js', 'PyTorch', 'SQLite'],
  actions: [
    { label: 'VIEW RESUME PDF', type: 'primary', url: `${BASE_URL}my_resume.pdf` },
  ],
};

/* ============================================================
   SUBNETWORK DEFINITIONS (DETERMINISTIC 3D LAYOUT FOR SKILLS)
   ============================================================ */

const subnetDefinitions = {
  skills: {
    id: 'skills',
    title: 'SKILLS & TECHNOLOGIES',
    subtitle: 'COMPUTATIONAL KNOWLEDGE GRAPH',
    categories: [
      {
        id: 'cv-category',
        label: 'COMPUTER VISION',
        position: [-6.8, 3.8, 1.8],
        skills: [
          { id: 'yolov8', label: 'YOLOv8', position: [-9.8, 5.5, 2.5], name: 'YOLOv8', category: 'Computer Vision', usedIn: ['SightMate', 'Football Analysis System'], tags: ['Object Detection', 'Real-Time Vision'] },
          { id: 'bytetrack', label: 'ByteTrack', position: [-9.2, 2.2, 0.8], name: 'ByteTrack', category: 'Computer Vision', usedIn: ['Football Analysis System'], tags: ['Multi-Object Tracking', 'Re-ID'] },
          { id: 'opencv', label: 'OpenCV', position: [-5.2, 6.2, 3.2], name: 'OpenCV', category: 'Computer Vision', usedIn: ['SightMate', 'Football Analysis System', 'MSME Center'], tags: ['Image Geometry', 'Frame Processing'] },
          { id: 'fast-scnn', label: 'Fast-SCNN', position: [-10.5, 3.6, -1.0], name: 'Fast-SCNN', category: 'Computer Vision', usedIn: ['SightMate'], tags: ['Semantic Segmentation', 'Real-Time'] },
        ],
      },
      {
        id: 'dl-category',
        label: 'DEEP LEARNING & AI',
        position: [6.8, 3.8, -1.8],
        skills: [
          { id: 'pytorch', label: 'PyTorch', position: [5.2, 6.2, -3.2], name: 'PyTorch', category: 'Deep Learning & AI', usedIn: ['Football Analysis System', 'Custom Vision Models'], tags: ['Model Training', 'Neural Networks'] },
          { id: 'tensorflow', label: 'TensorFlow', position: [9.8, 5.5, -2.5], name: 'TensorFlow Lite', category: 'Deep Learning & AI', usedIn: ['SightMate (TFLite)'], tags: ['On-Device Inference', 'TFLite'] },
          { id: 'ml-kit', label: 'ML Kit', position: [4.2, 2.0, 2.2], name: 'Google ML Kit', category: 'Deep Learning & AI', usedIn: ['SightMate (OCR & Translation)'], tags: ['Text Recognition', 'On-Device AI'] },
          { id: 'kmeans', label: 'K-Means', position: [9.2, 2.2, -0.8], name: 'K-Means Clustering', category: 'Deep Learning & AI', usedIn: ['Football Analysis System'], tags: ['Color Clustering', 'Team Assignment'] },
        ],
      },
      {
        id: 'systems-category',
        label: 'SYSTEMS & DEPLOYMENT',
        position: [-6.8, -3.8, -1.8],
        skills: [
          { id: 'playwright', label: 'Playwright', position: [-9.8, -5.5, -2.5], name: 'Playwright & Chromium', category: 'Systems & Deployment', usedIn: ['Google Maps Lead Platform'], tags: ['Browser Automation', 'Scraping'] },
          { id: 'sqlite', label: 'SQLite', position: [-9.2, -2.2, -0.8], name: 'SQLite Master DB', category: 'Systems & Deployment', usedIn: ['Google Maps Lead Platform', 'FORCRUX'], tags: ['Stateful Queue', 'Item Checkpoints'] },
          { id: 'concurrency', label: 'Concurrency', position: [-5.2, -6.2, -3.2], name: 'ThreadPoolExecutor', category: 'Systems & Deployment', usedIn: ['Google Maps Lead Platform'], tags: ['Multithreading', 'Parallel Crawling'] },
          { id: 'pandas', label: 'Pandas', position: [-4.2, -2.0, 2.2], name: 'Pandas & Data Pipelines', category: 'Systems & Deployment', usedIn: ['Google Maps Lead Platform', 'Football Analysis'], tags: ['Data Processing', 'Analytics'] },
        ],
      },
      {
        id: 'lang-category',
        label: 'LANGUAGES & TOOLS',
        position: [6.8, -3.8, 1.8],
        skills: [
          { id: 'python', label: 'Python', position: [9.8, -5.5, 2.5], name: 'Python', category: 'Languages & Tools', usedIn: ['Google Maps Platform', 'SightMate', 'Football Analysis'], tags: ['Core Language', 'AI/ML Engineering'] },
          { id: 'flutter', label: 'Flutter / Dart', position: [5.2, -6.2, 3.2], name: 'Flutter / Dart', category: 'Languages & Tools', usedIn: ['SightMate Mobile App'], tags: ['Cross-Platform UI', 'Mobile Apps'] },
          { id: 'nextjs', label: 'Next.js / TS', position: [9.2, -2.2, 0.8], name: 'Next.js, React & TS', category: 'Languages & Tools', usedIn: ['FORCRUX Studio Platform'], tags: ['Frontend Engineering', 'GSAP'] },
          { id: 'git', label: 'Git & GitHub', position: [4.2, -2.0, -2.2], name: 'Git & GitHub', category: 'Languages & Tools', usedIn: ['All Projects & Workflows'], tags: ['Version Control', 'DevOps'] },
        ],
      },
    ],
  },

  projects: {
    id: 'projects',
    title: 'ENGINEERING PROJECTS',
    subtitle: 'APPLIED AI, VISION & DATA SYSTEMS',
    categories: [
      {
        id: 'forcrux',
        label: 'FORCRUX',
        position: [-7.5, 3.8, 1.2],
        kicker: 'PRIVATE PROJECT / CASE STUDY',
        title: 'FORCRUX',
        subtitle: 'Premium Digital Engineering & Technology Studio Platform',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'FORCRUX is a premium digital engineering and technology studio platform designed to present the company’s software services, team, portfolio, case studies, and client conversion pipelines through an interactive digital web experience.',
          },
          {
            heading: 'MY ROLE & RESPONSIBILITIES',
            content: 'Lead Frontend Engineer & Design Systems Contributor. Engineered the component-based Next.js architecture, responsive virtual-camera composition, centralized GSAP motion design engine, video streaming optimization, and administrative Control OS direction.',
          },
          {
            heading: 'TECHNICAL ARCHITECTURE',
            content: 'Full-stack platform built with Next.js App Router, React, TypeScript, Payload CMS v3, and PostgreSQL. Features CMS-decoupled section providers, custom GSAP motion tokens, responsive viewport-specific video framing, and integer-pixel GPU compositing.',
          },
          {
            heading: 'KEY CONTRIBUTIONS & METRICS',
            bullets: [
              'Centralized GSAP Motion Engine with performance budgets & ScrollTrigger reveals',
              'Hero Video Payload Optimization: 7.43 MB → 1.98 MB WebM (73% reduction) & 3.50 MB MP4 fallback with faststart streaming',
              'Virtual Camera Composition: Responsive framing across 8 viewport classes from mobile to ultrawide',
              'Testimonial System: Seamless infinite circular carousel with touch-swipe, keyboard controls, and IntersectionObserver navigation visibility',
            ],
          },
          {
            heading: 'TECHNOLOGY STACK',
            bullets: [
              'Next.js & React — Component Architecture & App Router',
              'TypeScript — Strict Type Safety & System Interfaces',
              'GSAP & ScrollTrigger — Centralized Motion Design System',
              'Payload CMS v3 & PostgreSQL — Content & Data Management',
              'WebM / MP4 / WebP — GPU-Accelerated Responsive Streaming',
            ],
          },
        ],
        tags: ['Next.js', 'React', 'TypeScript', 'GSAP', 'Payload CMS', 'PostgreSQL', 'Design Systems', 'Private Case Study'],
        actions: [],
      },

      {
        id: 'google-maps',
        label: 'GOOGLE MAPS PLATFORM',
        position: [7.5, 3.8, -1.2],
        kicker: 'DATA ENGINEERING & AUTOMATION',
        title: 'Google Maps Lead Intelligence Platform',
        subtitle: 'Production-Grade Automated Discovery & Contact Enrichment Pipeline',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'A production-grade Python/Playwright platform that automates multi-category, multi-location business discovery from Google Maps, enriches leads through concurrent website crawling, validates data, persists state in SQLite, and ranks prospects using contactability scoring.',
          },
          {
            heading: 'SYSTEM ARCHITECTURE',
            content: 'Multi-stage data pipeline: Round-robin multi-category scheduler → Playwright Google Maps harvesting → SQLite master database & item-level queue engine → ThreadPoolExecutor multithreaded website contact crawler → Data validation & normalization → Lead scoring (A+ to D) → FORCRUX AI digital-gap analyzer → HTML/Excel dashboards & CRM exporters.',
          },
          {
            heading: 'MEASURED VALIDATION METRICS & RESULTS',
            bullets: [
              '50 Scheduled Search Tasks across 10 Categories & 5 Geographic Locations',
              '242 Harvested Leads with 97.5% Phone, 82.2% Website & 54.1% Email Coverage',
              '2.51× Measured Website-Enrichment Speedup via ThreadPoolExecutor parallel workers',
              '0 Extraction Failures with SQLite item-level resume state recovery',
            ],
          },
          {
            heading: 'KEY FEATURES & CAPABILITIES',
            bullets: [
              'Multi-Category Interleaved Round-Robin Scheduler',
              'SQLite Item-Level Resume System (Category → Location → Business Index)',
              'Persistent Work Queues & Duplicate URL Filtering',
              'Multithreaded Email, Social (FB, IG, LinkedIn, WhatsApp) & Form Crawling',
              'Contactability Lead Prioritization Scoring (A+ to D)',
              'FORCRUX AI Website Digital-Gap & Sales Pitch Analysis',
              'Standalone Dark HTML & Excel Dashboards + HubSpot/Zoho/Salesforce CSV Exporters',
            ],
          },
          {
            heading: 'TECHNOLOGY STACK',
            bullets: [
              'Python — Pipeline Automation & Business Logic',
              'Playwright & Chromium — Headless Browser Automation',
              'SQLite — Persistent Master Database & Stateful Work Queue',
              'ThreadPoolExecutor — Parallel Concurrent Website Enrichment',
              'Pandas — Data Processing & Multi-Format Reporting',
              'AI Engine — Digital Gap Analysis & Pitch Recommendation',
            ],
          },
        ],
        tags: ['Python', 'Playwright', 'SQLite', 'Pandas', 'ThreadPoolExecutor', 'Data Engineering', 'Lead Generation', 'CRM Automation'],
        actions: [
          { label: 'VIEW GITHUB REPO', type: 'primary', url: 'https://github.com/DEEPAKRV07/Google-Maps-Lead-Generator' },
        ],
      },

      {
        id: 'sightmate',
        label: 'SIGHTMATE',
        position: [-6.2, -4.5, -1.2],
        kicker: 'AI ASSISTIVE VISION PLATFORM',
        title: 'SightMate — AI Navigation Assistant',
        subtitle: 'Mobile Vision, Spatial Reasoning & Spoken Accessibility System',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'SightMate is an AI-powered mobile assistive application built in Flutter to help visually impaired users perceive their surroundings through real-time camera-based vision, spatial danger fusion, OCR text reading, voice commands, and spoken guidance.',
          },
          {
            heading: 'SYSTEM ARCHITECTURE',
            content: 'On-device mobile processing pipeline using TensorFlow Lite. Camera frames are processed concurrently by YOLOv8 for bounding-box object detection and Fast-SCNN for semantic scene segmentation. The Navigation Fusion Service evaluates Left/Center/Right danger regions to produce actionable guidance.',
          },
          {
            heading: 'KEY FEATURES & CAPABILITIES',
            bullets: [
              'On-Device YOLOv8 Object Detection & Bounding-Box Identification',
              'Fast-SCNN Semantic Scene & Traversable Path Segmentation',
              'Navigation Decision Fusion Engine (Move Left / Move Right / Path Clear / Obstacle Ahead)',
              'Google ML Kit OCR Spoken Text Reader with Duplicate Suppression',
              'Voice Command Controller for Hands-Free Navigation',
              'Touch-Based 6-Dot Braille Input Keyboard',
              'Google ML Kit Speech Translation Module',
              'Spoken Battery, Time, Date & Location Telemetry Feedback',
            ],
          },
          {
            heading: 'TECHNOLOGY STACK',
            bullets: [
              'Flutter & Dart — Cross-Platform Mobile Application Framework',
              'YOLOv8 & TensorFlow Lite — On-Device Object Detection Inference',
              'Fast-SCNN — Real-Time Semantic Scene Segmentation',
              'Google ML Kit — OCR Text Recognition & Language Translation',
              'Speech-to-Text & Text-to-Speech — Voice Control & Audio Guidance',
            ],
          },
        ],
        tags: ['Flutter', 'Dart', 'YOLOv8', 'TensorFlow Lite', 'Fast-SCNN', 'Google ML Kit', 'Computer Vision', 'Accessibility'],
        actions: [
          { label: 'VIEW GITHUB REPO', type: 'primary', url: 'https://github.com/DEEPAKRV07/SightMate-AI-Assistant' },
        ],
      },

      {
        id: 'football',
        label: 'FOOTBALL ANALYSIS',
        position: [6.2, -4.5, 1.2],
        kicker: 'COMPUTER VISION & SPORTS ANALYTICS',
        title: 'Football Match Video Analysis System',
        subtitle: 'End-to-End Deep Learning & Spatial Video Analytics Pipeline',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'Computer vision pipeline for automated football match video analysis, identifying players, referees, and the ball, maintaining tracking IDs across frames, compensating for camera motion, classifying team jersey colors, and calculating spatial match metrics.',
          },
          {
            heading: 'SYSTEM PIPELINE ARCHITECTURE',
            content: 'Video Frames → YOLOv8 Object Detection → ByteTrack Multi-Object Tracking → Optical Flow Camera Motion Compensation → Planar Homography View Transformation → Ball Position Interpolation → K-Means Team Jersey Classification → Speed, Distance & Possession Analytics → OpenCV Overlay Video Generation.',
          },
          {
            heading: 'DOCUMENTED MODEL PERFORMANCE METRICS',
            bullets: [
              'Precision: 0.95 (95% detection accuracy)',
              'Recall: 0.75 (75% object retrieval)',
              'mAP@50: 0.81 (Mean Average Precision at 0.5 IoU threshold)',
              'mAP@50-95: 0.58 (Mean Average Precision across IoU thresholds)',
              '4 Trained Football Classes: Ball, Player, Goalkeeper, Referee',
            ],
          },
          {
            heading: 'KEY FEATURES & CAPABILITIES',
            bullets: [
              'YOLOv8 & ByteTrack Multi-Object Player & Ball Tracking',
              'Optical Flow Camera-Motion Compensation for True Movement Metrics',
              'Planar Homography View Transformation to Top-Down 2D Pitch Representation',
              'Linear Ball Trajectory Interpolation for Missing Detection Handling',
              'K-Means Color Clustering for Automatic Team Jersey Assignment',
              'Player Speed Estimation & Total Distance Travelled Metrics',
              'Player-Ball Assignment & Team Possession Percentage Calculation',
              'OpenCV Video Output with Visual Radar Overlays & Player Statistics',
            ],
          },
          {
            heading: 'TECHNOLOGY STACK',
            bullets: [
              'Python — Pipeline Logic & Analytics Engine',
              'YOLOv8 — Deep Learning Object Detection',
              'ByteTrack — Persistent Multi-Object Tracking',
              'OpenCV — Optical Flow, Homography & Video Annotation',
              'K-Means & Scikit-Learn — Jersey Color Team Classification',
              'Pandas & NumPy — Spatial Positional & Trajectory Analytics',
            ],
          },
        ],
        tags: ['Python', 'YOLOv8', 'ByteTrack', 'OpenCV', 'K-Means', 'Optical Flow', 'Pandas', 'Sports Analytics'],
        actions: [
          { label: 'VIEW GITHUB REPO', type: 'primary', url: 'https://github.com/DEEPAKRV07/Football-Analysis-System' },
        ],
      },

      {
        id: 'kaatchi',
        label: 'KAATCHI MEDIA',
        position: [0.0, 6.8, 0.5],
        kicker: 'MEDIA PORTFOLIO & WEB ENGINEERING',
        title: 'Kaatchi Media',
        subtitle: 'Official Media & Photography Portfolio Platform',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'Official digital media portfolio platform for Kaatchi Media (kaatchimedia.com), presenting professional photography collections, media production capabilities, client testimonials, and contact lead workflows through a cinematic dark visual interface.',
          },
          {
            heading: 'MY ROLE & RESPONSIBILITIES',
            content: 'Software Developer Intern / Frontend Web Developer. Engineered the modular JavaScript architecture, responsive UI design across desktop/mobile viewports, photography gallery system, fullscreen lightbox presentation, portfolio filtering, and Web3Forms contact integration.',
          },
          {
            heading: 'KEY FEATURES & IMPLEMENTATION',
            bullets: [
              'Modular ES JavaScript Architecture (navigation, galleries, lightbox, filtering, contact)',
              'Responsive Photography Collections (Professionals, Behind the Scenes, My Favorites)',
              'Interactive Portfolio Category Filtering',
              'Fullscreen Image Lightbox with Touch & Keyboard Navigation',
              'IntersectionObserver Reveal Animations & Photography Page Entrance Transitions',
              'Responsive Testimonial Carousel with Desktop Arrows & Mobile Touch Swipe',
              'Web3Forms Asynchronous Client Contact & Lead Submission Integration',
            ],
          },
          {
            heading: 'TECHNOLOGY STACK',
            bullets: [
              'HTML5 & CSS3 — Responsive Layouts, CSS Grid & Flexbox',
              'JavaScript ES6+ — Modular ES Architecture & DOM APIs',
              'IntersectionObserver — Reveal Animations & Navigation Visibility',
              'Web3Forms — Asynchronous Form Validation & Lead Capture',
              'Git & GitHub — Feature Branch Workflow & Production Deployment',
            ],
          },
        ],
        tags: ['HTML5', 'CSS3', 'JavaScript ES6+', 'Responsive UX', 'Web3Forms', 'Photography Galleries', 'Live Site'],
        actions: [
          { label: 'VISIT LIVE WEBSITE', type: 'primary', url: 'https://kaatchimedia.com/' },
        ],
      },
    ],
  },

  experience: {
    id: 'experience',
    title: 'EXPERIENCE & CAREER',
    subtitle: 'ENGINEERING MEMORY PATH',
    categories: [
      {
        id: 'forcrux-exp',
        label: 'FORCRUX',
        position: [-5.2, 2.8, 2.5],
        kicker: 'CAREER MILESTONE',
        title: 'Lead Frontend Engineer & Design Systems',
        subtitle: 'FORCRUX Technology Studio Platform',
        sections: [
          {
            heading: 'ROLE & RESPONSIBILITIES',
            content: 'Led the frontend component architecture, responsive virtual-camera framing system, GSAP motion design engine, video payload compression, and administrative Control OS direction.',
          },
          {
            heading: 'ENGINEERING CONTRIBUTIONS',
            bullets: [
              'Built component-based Next.js App Router architecture with Payload CMS v3 & PostgreSQL',
              'Created centralized GSAP Motion Design System with ScrollTrigger reveals & performance budgets',
              'Reduced hero video payload from 7.43 MB to 1.98 MB WebM (73% reduction) & 3.50 MB MP4 fallback',
              'Engineered virtual camera framing across 8 viewport classes from mobile to ultrawide',
            ],
          },
        ],
        tags: ['Next.js', 'React', 'TypeScript', 'GSAP', 'Payload CMS', 'PostgreSQL', 'Design Systems'],
        actions: [],
      },
      {
        id: 'kaatchi-exp',
        label: 'KAATCHI MEDIA',
        position: [-1.4, 5.2, -2.5],
        kicker: 'CAREER MILESTONE',
        title: 'Software Developer Intern / Frontend Developer',
        subtitle: 'Kaatchi Media (kaatchimedia.com)',
        sections: [
          {
            heading: 'ROLE & RESPONSIBILITIES',
            content: 'Developed and productionized the official Kaatchi Media digital portfolio website (kaatchimedia.com), building a modular JavaScript architecture, responsive UI design across desktop/mobile viewports, photography gallery systems, and contact workflows.',
          },
          {
            heading: 'ENGINEERING CONTRIBUTIONS',
            bullets: [
              'Modularized frontend architecture with ES JavaScript modules & reusable component loaders',
              'Engineered responsive photography galleries (Professionals, BTS, My Favorites) with fullscreen lightbox',
              'Built responsive testimonial carousel supporting desktop controls & mobile touch swipe',
              'Integrated Web3Forms for client-side form validation and asynchronous lead submission',
            ],
          },
        ],
        tags: ['HTML5', 'CSS3', 'JavaScript ES6+', 'Responsive UX', 'Web3Forms', 'Git Workflow'],
        actions: [
          { label: 'VISIT LIVE WEBSITE', type: 'primary', url: 'https://kaatchimedia.com/' },
        ],
      },
      {
        id: 'msme-exp',
        label: 'MSME CENTER',
        position: [3.8, 3.0, 2.2],
        kicker: 'CAREER MILESTONE',
        title: 'Embedded Systems Intern',
        subtitle: 'MSME Technology Development Centre (Aug 2024 – Sep 2024)',
        sections: [
          {
            heading: 'ROLE & RESPONSIBILITIES',
            content: 'Embedded Systems Intern at MSME Technology Development Centre (MSME TDC), Guindy, Chennai (Aug 2024 – Sep 2024). Prototyped, configured, and benchmarked embedded hardware circuits, microcontrollers, sensor interfaces, and IoT telemetry architectures using Arduino and Raspberry Pi platform systems.',
          },
          {
            heading: 'ENGINEERING CONTRIBUTIONS',
            bullets: [
              'Embedded system hardware prototyping & sensor interfacing using Arduino & Raspberry Pi',
              'IoT telemetry data acquisition, wireless sensor integration & microcontroller circuit design',
              'Real-time sensor signal processing, hardware I/O debugging & firmware scripting',
              'Hardware-level latency measurement, circuit testing & power optimization',
            ],
          },
        ],
        tags: ['Embedded Systems', 'Arduino', 'Raspberry Pi', 'Sensors', 'IoT', 'Microcontrollers'],
        actions: [],
      },
      {
        id: 'quality-exp',
        label: 'QUALITY THREADS',
        position: [6.2, -2.2, -2.2],
        kicker: 'CAREER MILESTONE',
        title: 'Digital Media Collaboration',
        subtitle: 'Quality Threads',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'Worked with a team on two small school-clothing deals, handling the digital media and social-media side of the work.',
          },
          {
            heading: 'MY CONTRIBUTION',
            bullets: [
              'Small business collaboration on two school-clothing deals',
              'Handled digital media assets & social-media promotion',
              'Created visual content for clothing presentation',
              'Supported digital channel communication',
            ],
          },
        ],
        tags: ['Digital Media', 'Social Media', 'Content Creation', 'Small Business Collaboration'],
        actions: [],
      },
    ],
  },

  contact: {
    id: 'contact',
    title: 'CONTACT & CONNECT',
    subtitle: 'NETWORK TRANSMISSION GATEWAY',
    categories: [
      {
        id: 'email',
        label: 'EMAIL',
        position: [-5.2, 2.5, 2.0],
        actionUrl: 'mailto:deepakvetrivelan@gmail.com',
      },
      {
        id: 'github',
        label: 'GITHUB',
        position: [-1.4, 4.8, -2.0],
        actionUrl: 'https://github.com/DEEPAKRV07',
      },
      {
        id: 'linkedin',
        label: 'LINKEDIN',
        position: [2.8, 3.2, 2.0],
        actionUrl: 'https://www.linkedin.com/in/deepakrv07/',
      },
      {
        id: 'resume',
        label: 'RESUME',
        position: [6.2, -2.0, -2.0],
        actionUrl: `${BASE_URL}my_resume.pdf`,
      },
    ],
  },
};

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
    'kaatchi':      new THREE.Vector3(0.0,  6.8,  0.5),  // Top Center
    'forcrux':       new THREE.Vector3(-7.5, 3.8,  1.2),  // Upper Left
    'google-maps':   new THREE.Vector3(7.5,  3.8, -1.2),  // Upper Right
    'sightmate':     new THREE.Vector3(-6.2, -4.5, -1.2), // Lower Left
    'football':      new THREE.Vector3(6.2, -4.5,  1.2),  // Lower Right
  };

  for (const cat of categories) {
    if (slotMap[cat.id]) {
      cat.position = [slotMap[cat.id].x, slotMap[cat.id].y, slotMap[cat.id].z];
    }
  }
  return categories;
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

  for (const category of definition.categories) {
    const node = createNeuralNodeGroup({
      nucleusRadius: 0.48,
      torusRadius: 0.62,
      torusTube: 0.024,
      color: COLORS.medium,
      opacity: 0.95,
    });

    node.group.position.set(...category.position);
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
      originalPos: node.group.position.clone() 
    };
    categoryNodes.set(category.id, categoryObj);
    categories.push(categoryObj);

    edges.push(createEdge(coreNode.nucleusMesh, node.nucleusMesh, group, 0.48));

    // If this category contains individual skill nodes (for Skills subnet)
    if (Array.isArray(category.skills)) {
      for (const skill of category.skills) {
        const skillNode = createNeuralNodeGroup({
          nucleusRadius: 0.26,
          torusRadius: 0.36,
          torusTube: 0.018,
          color: COLORS.medium,
          opacity: 0.95,
        });

        skillNode.group.position.set(...skill.position);

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
          originalPos: skillNode.group.position.clone(),
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

function updateBrowserRoute(routeKey, isPush = true) {
  const route = ROUTES[routeKey] || ROUTES.home;
  document.title = route.title;

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
    setWorldVisibility(mainGraph, true);
    setWorldOpacity(mainGraph, 1.0);
    setWorldOpacity(core, 1.0);

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

    ambientLogosGroup.visible = false;

    for (const world of subnetWorlds.values()) {
      const isCurrent = world === activeSubnet;
      setWorldVisibility(world.group, isCurrent);
      setWorldOpacity(world.group, isCurrent ? 1.0 : 0.0);
    }

    setLabelMode('subnet');
    showCoreBeacon(false); // Remove redundant MAIN CORE floating node in subnets!
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
  updateCounters(world.categories.length + 1, world.edges.length);

  startTransition(new THREE.Vector3(0, 1.2, 18.5), new THREE.Vector3(0, 0, 0), 850);
  updateBrowserRoute(subnetId, isPush);
}

function returnToCore(isPush = true) {
  activeSubnet = null;
  hideDetailPresentation();
  hideSkillContextPanel();

  setLayerVisibility('MAIN');

  document.body.classList.remove('project-mode');
  document.body.classList.remove('detail-mode');

  setMode('OVERVIEW');
  setLayerPath('NEURAL NETWORK / OVERVIEW');
  updateCounters(mainNodeObjects.length + 1, mainEdges.length);

  startTransition(new THREE.Vector3(0, 1.2, 30), new THREE.Vector3(0, 0, 0), 900);
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
   CANONICAL GLOBAL 3D BURST & RECONSTRUCT ENGINE
   ============================================================ */

let isBurstActive = false;
const burstVelocities = new Map();

const burstBtn = document.getElementById('burstBtn');
const reconstructBtn = document.getElementById('reconstructBtn');

function getActiveNetworkNodes() {
  const activeNodes = [];

  if (currentLayer === 'MAIN') {
    for (const item of mainNodeObjects) {
      if (item.group) activeNodes.push(item.group);
    }
  } else if (currentLayer === 'SUBNET' && activeSubnet) {
    activeSubnet.group.traverse(child => {
      if (child.isGroup && child.parent === activeSubnet.group) {
        activeNodes.push(child);
      }
    });
  }

  return activeNodes;
}

function triggerBurstNetwork() {
  if (isBurstActive) return;
  if (document.body.classList.contains('detail-panel-open')) return;

  isBurstActive = true;
  burstVelocities.clear();

  const targets = getActiveNetworkNodes();
  for (const nodeGroup of targets) {
    // Generate organic 3D random velocity vector (X, Y, Z) across broad environment
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.42,
      (Math.random() - 0.5) * 0.42,
      (Math.random() - 0.5) * 0.42
    );
    const rotVelocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.08,
      (Math.random() - 0.5) * 0.08,
      (Math.random() - 0.5) * 0.08
    );

    burstVelocities.set(nodeGroup, {
      velocity,
      rotVelocity,
      startPos: nodeGroup.position.clone(),
      startRot: nodeGroup.rotation.clone(),
    });
  }

  setMode('NETWORK BURST');
}

function triggerReconstructNetwork() {
  if (!isBurstActive && burstVelocities.size === 0) return;
  isBurstActive = false;
}

if (burstBtn) burstBtn.addEventListener('click', triggerBurstNetwork);
if (reconstructBtn) reconstructBtn.addEventListener('click', triggerReconstructNetwork);

function animateBurstState() {
  if (isBurstActive) {
    // Continuous random 3D travel through environment during burst state
    for (const [obj, data] of burstVelocities.entries()) {
      obj.position.add(data.velocity);
      obj.rotation.x += data.rotVelocity.x;
      obj.rotation.y += data.rotVelocity.y;
    }
  } else if (burstVelocities.size > 0) {
    // Reconstruct state: Smoothly lerp scattered nodes back to original positions
    let allRestored = true;
    for (const [obj, data] of burstVelocities.entries()) {
      obj.position.lerp(data.startPos, 0.12);
      obj.rotation.x = THREE.MathUtils.lerp(obj.rotation.x, data.startRot.x, 0.12);
      obj.rotation.y = THREE.MathUtils.lerp(obj.rotation.y, data.startRot.y, 0.12);
      obj.rotation.z = THREE.MathUtils.lerp(obj.rotation.z, data.startRot.z, 0.12);

      if (obj.position.distanceTo(data.startPos) > 0.05) {
        allRestored = false;
      }
    }

    if (allRestored) {
      for (const [obj, data] of burstVelocities.entries()) {
        obj.position.copy(data.startPos);
        obj.rotation.copy(data.startRot);
      }
      burstVelocities.clear();

      if (currentLayer === 'MAIN') {
        setMode('OVERVIEW');
      } else if (activeSubnet) {
        setMode(activeSubnet.definition.title);
      }
    }
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

  /* 5. Main Homepage Layer (5 Primary Destination Nodes) */
  if (currentLayer === 'MAIN') {
    const mainTargets = [];
    for (const node of mainNodeObjects) {
      if (node.hitboxMesh) mainTargets.push(node.hitboxMesh);
      if (node.mesh) mainTargets.push(node.mesh);
    }
    const hits = raycaster.intersectObjects(mainTargets, false);
    if (hits.length) {
      const targetObj = hits[0].object.userData.targetMesh || hits[0].object;
      return { type: 'main', object: targetObj };
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

  if (hit.type === 'main') {
    const node = mainNodeObjects.find(item => item.mesh === hit.object || item.hitboxMesh === hit.object || (item.mesh && item.mesh.userData && hit.object.userData && item.mesh.userData.id === hit.object.userData.id));
    if (node) {
      if (node.id === 'about') {
        showDetailPresentation(combinedAboutData);
        updateBrowserRoute('about', true);
      } else {
        enterSubnet(node.id);
      }
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
  if (isBurstActive) {
    currentHoveredMesh = null;
    renderer.domElement.style.cursor = 'grab';
    return;
  }

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

  if (coreBeacon.visible) {
    const beaconActive = hit?.type === 'core';
    const beaconScale = beaconActive ? 1.18 : 1.0;
    tempScale.set(beaconScale, beaconScale, beaconScale);
    coreBeacon.scale.lerp(tempScale, 0.16);
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
  if (isBurstActive || burstVelocities.size > 0) return;

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
      panelBodyEl.scrollTop += 60;
      return;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      panelBodyEl.scrollTop -= 60;
      return;
    } else if (event.key === 'PageDown') {
      event.preventDefault();
      panelBodyEl.scrollTop += 320;
      return;
    } else if (event.key === 'PageUp') {
      event.preventDefault();
      panelBodyEl.scrollTop -= 320;
      return;
    } else if (event.key === 'Home') {
      event.preventDefault();
      panelBodyEl.scrollTop = 0;
      return;
    } else if (event.key === 'End') {
      event.preventDefault();
      panelBodyEl.scrollTop = panelBodyEl.scrollHeight;
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

function animate(currentTime) {
  requestAnimationFrame(animate);

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
  animateBurstState();
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

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(animate);