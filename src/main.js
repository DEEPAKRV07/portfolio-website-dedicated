import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

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
  torusRadius = 0.98,
  torusTube = 0.032,
  color = COLORS.bright,
  opacity = 0.95,
}) {
  const group = new THREE.Group();

  // 1. Inner Nucleus Mesh
  const nucleusGeo = new THREE.SphereGeometry(nucleusRadius, 32, 32);
  const nucleusMat = nodeMaterial(color, opacity);
  const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
  nucleusMesh.userData = { visualRadius: nucleusRadius * 1.15 };
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

  // 3. 3D Torus Structural Ring
  const ringGeo = new THREE.TorusGeometry(torusRadius, torusTube, 8, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: COLORS.medium,
    transparent: true,
    opacity: 0.50,
    depthWrite: false,
  });
  ringMat.userData.baseOpacity = 0.50;
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  group.add(ringMesh);

  return {
    group,
    nucleusMesh,
    shellMesh,
    ringMesh,
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

function updateLabels() {
  // If detail presentation is open, hide all graph labels to prevent visual collisions!
  if (document.body.classList.contains('detail-panel-open')) {
    for (const label of labels) {
      label.element.style.opacity = '0';
      label.element.style.display = 'none';
    }
    return;
  }

  const position = new THREE.Vector3();

  for (const label of labels) {
    if (!label.object) continue;

    // 1. Parent Hierarchy Visibility Check
    if (!isObjectInVisibleWorld(label.object)) {
      label.element.style.opacity = '0';
      label.element.style.display = 'none';
      continue;
    }

    // 2. Frustum / Camera Check
    label.object.getWorldPosition(position);
    position.add(label.offset);

    const projected = position.clone().project(camera);
    const inFront = projected.z > -1 && projected.z < 1;

    if (!inFront || label.hidden) {
      label.element.style.opacity = '0';
      label.element.style.display = 'none';
      continue;
    }

    // 3. Screen Projection
    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

    label.element.style.left = `${x}px`;
    label.element.style.top = `${y}px`;

    // 4. Layer Mode Rules
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

/* Extra Core Ring Rotations */
const coreRingB = coreNode.ringMesh.clone();
coreRingB.rotation.set(Math.PI / 2, 0, 0);
core.add(coreRingB);

const coreRingC = coreNode.ringMesh.clone();
coreRingC.rotation.set(0, Math.PI / 2, 0);
core.add(coreRingC);

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

  const nodeObj = { ...data, mesh: node.nucleusMesh, group: node.group, label, originalPos: node.group.position.clone() };
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
    basePos: new THREE.Vector3(0.0, 13.8, -6.5), // Positioned high above ABOUT for clear separation
    baseRot: new THREE.Vector3(0, 0, 0),
    phase: 0.0,
    speedX: 0.35, speedY: 0.45, speedZ: 0.30,
    ampX: 2.2, ampY: 1.2, ampZ: 2.8,
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
    url: 'mailto:deepakrv07@gmail.com',
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
    url: 'https://linkedin.com/in/deepak-r-v',
  },
  {
    id: 'logo-hire',
    type: 'hire',
    title: 'Hire Me',
    basePos: new THREE.Vector3(14.8, -5.2, -4.5),
    baseRot: new THREE.Vector3(0, -0.12, 0),
    phase: 5.6,
    speedX: 0.32, speedY: 0.42, speedZ: 0.32,
    ampX: 2.4, ampY: 1.3, ampZ: 2.6,
    url: 'mailto:deepakrv07@gmail.com',
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
   DYNAMIC 3D NEURAL CABLE & ELECTRIC PULSE ARCHITECTURE
   ============================================================ */

/* Reusable 3D Cable Unit Geometry (cylinder centered along +Z axis from 0,0,0 to 0,0,1) */
const unitCylinderGeo = new THREE.CylinderGeometry(0.055, 0.055, 1, 8, 1);
unitCylinderGeo.translate(0, 0.5, 0); // Shift origin to base
unitCylinderGeo.rotateX(Math.PI / 2); // Orient along +Z axis

const unitGlowCylinderGeo = new THREE.CylinderGeometry(0.088, 0.088, 1, 8, 1);
unitGlowCylinderGeo.translate(0, 0.5, 0);
unitGlowCylinderGeo.rotateX(Math.PI / 2);

const cableMaterial = new THREE.MeshBasicMaterial({
  color: COLORS.medium,
  transparent: true,
  opacity: 0.65,
  depthWrite: false,
});
cableMaterial.userData.baseOpacity = 0.65;

const cableGlowMaterial = new THREE.MeshBasicMaterial({
  color: COLORS.bright,
  transparent: true,
  opacity: 0.95,
  depthWrite: false,
});
cableGlowMaterial.userData.baseOpacity = 0.95;

const pulseCoreGeometry = new THREE.SphereGeometry(0.08, 12, 12);
const pulseCoreMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.98, depthWrite: false });

const pulseHaloGeometry = new THREE.SphereGeometry(0.18, 12, 12);
const pulseHaloMaterial = new THREE.MeshBasicMaterial({ color: COLORS.bright, transparent: true, opacity: 0.75, depthWrite: false });

function alignCylinderBetweenPoints(mesh, start, end, radiusScale = 1.0) {
  const dir = new THREE.Vector3().subVectors(end, start);
  const dist = dir.length();

  if (dist < 0.0001) {
    mesh.visible = false;
    return;
  }

  mesh.position.copy(start);
  mesh.lookAt(end);
  mesh.scale.set(radiusScale, radiusScale, dist);
  mesh.visible = true;
}

function getNodeWorldCenterAndRadius(node) {
  if (!node) return { center: new THREE.Vector3(), radius: 0.85 };
  const center = new THREE.Vector3();
  node.getWorldPosition(center);

  let radius = 0.85;
  if (node.userData && typeof node.userData.visualRadius === 'number') {
    radius = node.userData.visualRadius;
  }

  const worldScale = new THREE.Vector3();
  node.getWorldScale(worldScale);
  const avgScale = (Math.abs(worldScale.x) + Math.abs(worldScale.y) + Math.abs(worldScale.z)) / 3;
  radius *= avgScale > 0.001 ? avgScale : 1.0;

  return { center, radius };
}

function calculateSurfaceEndpoints(sourceObj, targetObj, parentGroup) {
  const { center: sCenter, radius: sRadius } = getNodeWorldCenterAndRadius(sourceObj);
  const { center: tCenter, radius: tRadius } = getNodeWorldCenterAndRadius(targetObj);

  const dir = new THREE.Vector3().subVectors(tCenter, sCenter);
  const dist = dir.length();

  if (dist < 0.001) {
    const localStart = sCenter.clone();
    const localEnd = tCenter.clone();
    if (parentGroup) {
      parentGroup.worldToLocal(localStart);
      parentGroup.worldToLocal(localEnd);
    }
    return { start: localStart, end: localEnd, distance: 0 };
  }

  dir.normalize();

  // Offset start and end vectors to the actual visual surface of each node sphere
  const startWorld = sCenter.clone().add(dir.clone().multiplyScalar(Math.min(sRadius, dist * 0.4)));
  const endWorld = tCenter.clone().sub(dir.clone().multiplyScalar(Math.min(tRadius, dist * 0.4)));

  const startLocal = startWorld.clone();
  const endLocal = endWorld.clone();

  if (parentGroup) {
    parentGroup.worldToLocal(startLocal);
    parentGroup.worldToLocal(endLocal);
  }

  return { start: startLocal, end: endLocal, distance: startWorld.distanceTo(endWorld) };
}

function createEdge(source, target, parent, opacity = 0.5, color = COLORS.dim) {
  // 1. Core Line (for base tracking & opacity inheritance)
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(6);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = lineMaterial(opacity * 0.1, color);
  const line = new THREE.Line(geometry, material);
  line.frustumCulled = false;
  line.visible = false; // Hide 1px line so ONLY the 3D tube is visible!
  parent.add(line);

  // 2. LAYER A: Permanent True 3D Neural Cable Mesh (3D Cylinder Geometry)
  const cableMat = cableMaterial.clone();
  cableMat.userData.baseOpacity = opacity * 0.75;
  const cableMesh = new THREE.Mesh(unitCylinderGeo, cableMat);
  cableMesh.frustumCulled = false;
  parent.add(cableMesh);

  // 3. LOCALIZED GLOW: High-intensity 3D cable glow section attached to travelling pulse
  const glowMat = cableGlowMaterial.clone();
  glowMat.userData.baseOpacity = opacity * 0.95;
  const glowMesh = new THREE.Mesh(unitGlowCylinderGeo, glowMat);
  glowMesh.frustumCulled = false;
  parent.add(glowMesh);

  // 4. LAYER B: Separate Travelling Electric Pulse Object (Bright white core + green halo)
  const pulseGroup = new THREE.Group();
  const coreMesh = new THREE.Mesh(pulseCoreGeometry, pulseCoreMaterial);
  const haloMesh = new THREE.Mesh(pulseHaloGeometry, pulseHaloMaterial);
  pulseGroup.add(coreMesh);
  pulseGroup.add(haloMesh);
  parent.add(pulseGroup);

  return {
    line,
    cableMesh,
    cableMat,
    glowMesh,
    glowMat,
    pulseGroup,
    source,
    target,
    material,
    pulseProgress: Math.random(),
    pulseSpeed: 0.005 + Math.random() * 0.004,
  };
}

function updateEdge(edge) {
  if (!edge || !edge.source || !edge.target || !edge.line) return;

  // Calculate surface endpoints connecting source node surface to target node surface
  const { start, end, distance } = calculateSurfaceEndpoints(edge.source, edge.target, edge.line.parent);

  // 1. Update Core Line (kept for layer opacity tracking)
  const position = edge.line.geometry.attributes.position;
  position.setXYZ(0, start.x, start.y, start.z);
  position.setXYZ(1, end.x, end.y, end.z);
  position.needsUpdate = true;

  const isVisible = edge.line.visible && isObjectInVisibleWorld(edge.source) && isObjectInVisibleWorld(edge.target);
  const opacityRatio = edge.material.opacity / (edge.material.userData.baseOpacity || 1);

  // 2. Update Permanent 3D Neural Cable (Layer A)
  if (edge.cableMesh) {
    if (isVisible && distance > 0.05) {
      alignCylinderBetweenPoints(edge.cableMesh, start, end, 1.0);
      setMaterialVisualOpacity(edge.cableMat, opacityRatio);
    } else {
      edge.cableMesh.visible = false;
    }
  }

  // 3. Update Travelling Pulse Position & Localized Cable Glow Segment (Layer B)
  if (edge.pulseGroup && edge.glowMesh) {
    if (isVisible && distance > 0.05) {
      const p = edge.pulseProgress;

      // Pulse moves along centerline from start (source surface) to end (target surface)
      const pulsePos = new THREE.Vector3().lerpVectors(start, end, p);
      edge.pulseGroup.position.copy(pulsePos);
      edge.pulseGroup.visible = true;

      // Localized Cable Glow around travelling pulse (short 3D tube segment)
      const glowHalfSpan = 0.12;
      const pStart = Math.max(0, p - glowHalfSpan);
      const pEnd = Math.min(1, p + glowHalfSpan);
      const gStart = new THREE.Vector3().lerpVectors(start, end, pStart);
      const gEnd = new THREE.Vector3().lerpVectors(start, end, pEnd);

      alignCylinderBetweenPoints(edge.glowMesh, gStart, gEnd, 1.0);
      setMaterialVisualOpacity(edge.glowMat, opacityRatio);
    } else {
      edge.pulseGroup.visible = false;
      edge.glowMesh.visible = false;
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
  title: 'Deepak R V',
  subtitle: 'AI / ML Engineer & Computer Vision Specialist',
  sections: [
    {
      heading: 'PROFILE & IDENTITY',
      content: 'B.Tech AI&DS graduate passionate about building robust, real-time spatial visual systems, custom object tracking pipelines, and high-performance edge inference engines.',
    },
    {
      heading: 'ENGINEERING PHILOSOPHY',
      content: 'Focusing on low-latency inference, spatial computer vision pipelines, modular zero-bloat architecture, and edge hardware deployment without unnecessary complexity.',
    },
    {
      heading: 'CORE TECHNICAL CAPABILITIES',
      bullets: [
        'Real-Time Object Detection & Tracking (YOLOv8, ByteTrack)',
        'Fast Semantic Segmentation (Fast-SCNN)',
        'Touchless HCI Gesture Controls (MediaPipe Hands)',
        'Deep Neural Network Training & Optimization (PyTorch, TensorFlow)',
        'Low-Latency Containerized Microservices (FastAPI, Docker, ONNX)',
      ],
    },
  ],
  tags: ['AI/ML Engineer', 'Computer Vision', 'B.Tech AI&DS', 'Real-Time Vision', 'PyTorch', 'YOLOv8', 'FastAPI'],
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
          { id: 'opencv', label: 'OpenCV', position: [-5.2, 6.2, 3.2], name: 'OpenCV', category: 'Computer Vision', usedIn: ['SightMate', 'Football Analysis System', 'Virtual Mouse Control'], tags: ['Image Geometry', 'Frame Processing'] },
          { id: 'fast-scnn', label: 'Fast-SCNN', position: [-10.5, 3.6, -1.0], name: 'Fast-SCNN', category: 'Computer Vision', usedIn: ['SightMate'], tags: ['Semantic Segmentation', 'Real-Time'] },
          { id: 'mediapipe', label: 'MediaPipe', position: [-4.2, 2.0, -2.2], name: 'MediaPipe Hands', category: 'Computer Vision', usedIn: ['Virtual Mouse Control'], tags: ['3D Landmarks', 'Hand Tracking'] },
        ],
      },
      {
        id: 'dl-category',
        label: 'DEEP LEARNING & AI',
        position: [6.8, 3.8, -1.8],
        skills: [
          { id: 'pytorch', label: 'PyTorch', position: [5.2, 6.2, -3.2], name: 'PyTorch', category: 'Deep Learning & AI', usedIn: ['Kaatchi Media Engine', 'Custom Vision Models'], tags: ['Model Training', 'Neural Networks'] },
          { id: 'tensorflow', label: 'TensorFlow', position: [9.8, 5.5, -2.5], name: 'TensorFlow', category: 'Deep Learning & AI', usedIn: ['SightMate (TFLite)', 'Deep Neural Networks'], tags: ['Deep Learning', 'TFLite'] },
          { id: 'cnns', label: 'CNNs', position: [4.2, 2.0, 2.2], name: 'CNNs', category: 'Deep Learning & AI', usedIn: ['SightMate', 'Football Analysis'], tags: ['Classification', 'Feature Extraction'] },
          { id: 'kmeans', label: 'K-Means', position: [9.2, 2.2, -0.8], name: 'K-Means Clustering', category: 'Deep Learning & AI', usedIn: ['Football Analysis System'], tags: ['Color Clustering', 'Team Assignment'] },
        ],
      },
      {
        id: 'systems-category',
        label: 'SYSTEMS & DEPLOYMENT',
        position: [-6.8, -3.8, -1.8],
        skills: [
          { id: 'fastapi', label: 'FastAPI', position: [-9.8, -5.5, -2.5], name: 'FastAPI', category: 'Systems & Deployment', usedIn: ['Kaatchi Media Engine'], tags: ['REST Endpoints', 'Async Python'] },
          { id: 'docker', label: 'Docker', position: [-9.2, -2.2, -0.8], name: 'Docker', category: 'Systems & Deployment', usedIn: ['Kaatchi Media Engine'], tags: ['Containerization', 'Microservices'] },
          { id: 'onnx', label: 'ONNX Runtime', position: [-5.2, -6.2, -3.2], name: 'ONNX Runtime', category: 'Systems & Deployment', usedIn: ['Edge AI Optimization'], tags: ['Cross-Platform Inference'] },
          { id: 'cpp', label: 'C++', position: [-4.2, -2.0, 2.2], name: 'C++', category: 'Systems & Deployment', usedIn: ['Algorithmic Systems'], tags: ['High Performance', 'Low Latency'] },
        ],
      },
      {
        id: 'lang-category',
        label: 'LANGUAGES & TOOLS',
        position: [6.8, -3.8, 1.8],
        skills: [
          { id: 'python', label: 'Python', position: [9.8, -5.5, 2.5], name: 'Python', category: 'Languages & Tools', usedIn: ['SightMate', 'Football Analysis System', 'Kaatchi Media Engine', 'Virtual Mouse Control'], tags: ['Core Language', 'AI/ML Engineering'] },
          { id: 'flutter', label: 'Flutter / Dart', position: [5.2, -6.2, 3.2], name: 'Flutter / Dart', category: 'Languages & Tools', usedIn: ['SightMate Mobile App'], tags: ['Cross-Platform UI', 'Mobile Apps'] },
          { id: 'sql', label: 'SQL', position: [9.2, -2.2, 0.8], name: 'SQL', category: 'Languages & Tools', usedIn: ['Quality Threads Analytics'], tags: ['Relational DB', 'Data Pipelines'] },
          { id: 'git', label: 'Git & Linux', position: [4.2, -2.0, -2.2], name: 'Git & Linux', category: 'Languages & Tools', usedIn: ['All Projects & Systems'], tags: ['Version Control', 'DevOps'] },
        ],
      },
    ],
  },

  projects: {
    id: 'projects',
    title: 'ENGINEERING PROJECTS',
    subtitle: 'APPLIED AI & VISION SYSTEMS',
    categories: [
      {
        id: 'sightmate',
        label: 'SIGHTMATE',
        position: [-5.2, 2.8, 3.2],
        kicker: 'PROJECT PRESENTATION',
        title: 'SightMate',
        subtitle: 'AI Navigation & Spoken Assistance System',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'Flutter-based accessibility system built for visual assistance, combining computer vision object detection, fast semantic segmentation, OCR text reading, and real-time spoken voice interaction.',
          },
          {
            heading: 'PROBLEM STATEMENT',
            content: 'Visually impaired individuals face immense difficulty navigating unfamiliar physical environments, recognizing everyday obstacles, reading text labels, and identifying currency notes in real time without continuous internet connectivity.',
          },
          {
            heading: 'SYSTEM ARCHITECTURE',
            content: 'Modular mobile pipeline: Live camera frames are ingested into parallel lightweight inference workers. YOLOv8 handles bounding box object detection while Fast-SCNN computes real-time traversable path segmentation. Tesseract OCR processes detected text regions, sending structured spoken cues to text-to-speech audio feedback.',
          },
          {
            heading: 'TECHNOLOGIES USED',
            bullets: [
              'Flutter / Dart — Cross-Platform Mobile UI',
              'YOLOv8 — Object & Obstacle Detection',
              'Fast-SCNN — Fast Semantic Segmentation',
              'TensorFlow Lite — On-Device Model Inference',
              'Tesseract OCR — Offline Text Reading',
            ],
          },
          {
            heading: 'KEY FEATURES & IMPLEMENTATION',
            bullets: [
              'Real-Time Obstacle Detection & Distance Estimation',
              'Traversable Path & Floor Segmentation',
              'OCR Text & Signboard Spoken Reader',
              'Currency Note Recognition Engine',
              'Offline Spoken Voice Guidance Feedback',
            ],
          },
          {
            heading: 'RESULTS & OUTPUT',
            content: 'Achieved sub-100ms camera frame processing latency on mobile hardware, enabling real-time spoken navigation cues and obstacle alerts without external server dependency.',
          },
          {
            heading: 'KEY LEARNINGS',
            content: 'Mobile neural model quantization, optimizing camera stream frame rates, and building non-intrusive voice-first accessibility user interfaces.',
          },
        ],
        tags: ['Flutter', 'YOLOv8', 'Fast-SCNN', 'Tesseract OCR', 'Accessibility'],
        actions: [
          { label: 'GITHUB REPO', type: 'primary', url: 'https://github.com/DEEPAKRV07/SightMate' },
        ],
      },

      {
        id: 'football',
        label: 'FOOTBALL ANALYSIS',
        position: [-1.4, 5.6, -3.0],
        kicker: 'PROJECT PRESENTATION',
        title: 'Football Analysis System',
        subtitle: 'AI Sports Analytics & Video Tracking Pipeline',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'Computer vision pipeline for automated football match analysis: player, referee, and ball detection, multi-object tracking, team jersey color classification, and perspective transformation for spatial match statistics.',
          },
          {
            heading: 'PROBLEM STATEMENT',
            content: 'Manual sports video analysis is extremely labor-intensive and subjective. Automated analytics require consistent multi-object tracking through heavy occlusion, camera motion, and player body overlaps.',
          },
          {
            heading: 'SYSTEM ARCHITECTURE',
            content: 'Video processing pipeline: Frames are processed by YOLOv8 for player/ball detection. ByteTrack maintains consistent IDs across frames. K-Means clustering extracts jersey color histograms from player bounding boxes for automatic team assignment. Planar homography warps pitch pixel coordinates to a top-down tactical 2D map.',
          },
          {
            heading: 'TECHNOLOGIES USED',
            bullets: [
              'YOLOv8 — Player, Referee & Ball Detection',
              'ByteTrack — Multi-Object ID Tracking',
              'K-Means Clustering — Automatic Team Jersey Color Assignment',
              'OpenCV — Planar Homography & Perspective Transformation',
              'Python — Video Processing & Metric Analytics',
            ],
          },
          {
            heading: 'KEY FEATURES & IMPLEMENTATION',
            bullets: [
              'Multi-Object Player & Ball ID Tracking',
              'K-Means Jersey Color Team Classification',
              'Top-Down Tactical 2D Radar Map Projection',
              'Player Speed & Total Distance Traveled Metrics',
              'Team Ball Possession Percentage Calculation',
            ],
          },
          {
            heading: 'RESULTS & OUTPUT',
            content: 'Accurate tracking across complex match footage with visual overlays showing player IDs, team tactical radar mapping, speed tracking, and automated match possession stats.',
          },
          {
            heading: 'KEY LEARNINGS',
            content: 'Robust tracking under occlusions, camera homography matrix computation, and pixel-to-meter physical distance estimation.',
          },
        ],
        tags: ['YOLOv8', 'ByteTrack', 'K-Means', 'OpenCV', 'Python Analytics'],
        actions: [
          { label: 'GITHUB REPO', type: 'primary', url: 'https://github.com/DEEPAKRV07/Football-Analysis-System' },
        ],
      },

      {
        id: 'kaatchi',
        label: 'KAATCHI MEDIA',
        position: [5.2, 3.5, 2.5],
        kicker: 'PROJECT PRESENTATION',
        title: 'Kaatchi Media Engine',
        subtitle: 'Media Processing & AI Content Indexing Microservice',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'Scalable backend processing engine built for automated media analysis, computer vision metadata extraction, keyframe indexing, and fast visual search optimization.',
          },
          {
            heading: 'PROBLEM STATEMENT',
            content: 'Large video archives require automated visual tagging and metadata extraction to make unorganized video files searchable without manual logging.',
          },
          {
            heading: 'SYSTEM ARCHITECTURE',
            content: 'Asynchronous microservice architecture: FFmpeg ingests high-resolution video into chunked segment queues. PyTorch vision models extract visual embeddings, keyframes, and object tags. FastAPI exposes low-latency query endpoints backed by Dockerized worker queues.',
          },
          {
            heading: 'TECHNOLOGIES USED',
            bullets: [
              'PyTorch — Feature Embedding & Vision Extraction',
              'FastAPI — Low-Latency REST Endpoints',
              'FFmpeg — Video Decoding & Frame Chunking',
              'Docker — Asynchronous Microservice Workers',
              'Python — Pipeline Automation',
            ],
          },
          {
            heading: 'KEY FEATURES & IMPLEMENTATION',
            bullets: [
              'Automatic Keyframe Extraction & Indexing',
              'Visual Scene Feature Tagging',
              'Asynchronous Task Queue Ingestion',
              'Structured JSON Metadata API Responses',
            ],
          },
          {
            heading: 'RESULTS & OUTPUT',
            content: 'High-throughput automated video indexing engine capable of processing video workloads with fast metadata query response times.',
          },
          {
            heading: 'KEY LEARNINGS',
            content: 'Batch inference queue management, async Python concurrency, and Docker microservice orchestration.',
          },
        ],
        tags: ['PyTorch', 'FastAPI', 'FFmpeg', 'Docker', 'Microservices'],
        actions: [
          { label: 'GITHUB REPO', type: 'primary', url: 'https://github.com/DEEPAKRV07/Kaatchi-Media' },
        ],
      },

      {
        id: 'virtual-mouse',
        label: 'VIRTUAL MOUSE',
        position: [5.6, -1.8, -3.2],
        kicker: 'PROJECT PRESENTATION',
        title: 'Virtual Mouse Control System',
        subtitle: 'Gesture HCI Control System',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'Real-time human-computer interaction system translating webcam hand landmark tracking into touchless OS cursor movements, pinch clicks, drag-and-drop, and scroll gestures.',
          },
          {
            heading: 'PROBLEM STATEMENT',
            content: 'Creating a touchless, low-latency computer cursor interface that feels natural, removes jitter from raw camera frames, and accurately distinguishes between accidental movements and deliberate click gestures.',
          },
          {
            heading: 'SYSTEM ARCHITECTURE',
            content: 'Webcam frames are passed to MediaPipe Hands for 21 3D landmark coordinate extraction. Index finger tip coordinates are smoothed using exponential moving average filtering and mapped to screen dimensions. Pinch distance triggers PyAutoGUI click events.',
          },
          {
            heading: 'TECHNOLOGIES USED',
            bullets: [
              'MediaPipe Hands — 21 3D Hand Landmark Tracking',
              'OpenCV — Webcam Frame Capture & Processing',
              'PyAutoGUI — Operating System Input Automation',
              'Python — Gesture Logic & Smoothing Filters',
            ],
          },
          {
            heading: 'KEY FEATURES & IMPLEMENTATION',
            bullets: [
              'Exponential Smoothing Cursor Motion Filter',
              'Pinch-to-Click & Right-Click Gesture Triggers',
              'Two-Finger Scroll Gesture Detection',
              'Drag & Drop State Machine',
            ],
          },
          {
            heading: 'RESULTS & OUTPUT',
            content: 'Smooth touchless OS cursor control running at real-time camera frame rates with reliable gesture recognition.',
          },
          {
            heading: 'KEY LEARNINGS',
            content: 'Coordinate space transformations, noise filtering algorithms, and state-machine design for gesture recognition.',
          },
        ],
        tags: ['MediaPipe Hands', 'OpenCV', 'PyAutoGUI', 'Touchless HCI'],
        actions: [
          { label: 'GITHUB REPO', type: 'primary', url: 'https://github.com/DEEPAKRV07/Virtual-Mouse-Controll' },
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
        id: 'kaatchi-exp',
        label: 'KAATCHI MEDIA',
        position: [-5.2, 2.8, 2.5],
        kicker: 'CAREER MILESTONE',
        title: 'AI / ML Engineer',
        subtitle: 'Kaatchi Media (Media Processing Engine)',
        sections: [
          {
            heading: 'ROLE & CONTRIBUTION',
            content: 'Designed and deployed automated media vision processing microservices, keyframe indexing pipelines, and metadata extraction APIs.',
          },
          {
            heading: 'RESPONSIBILITIES & TECH',
            bullets: [
              'PyTorch vision feature extraction pipeline engineering',
              'FastAPI low-latency microservice architecture',
              'FFmpeg automated chunked video frame processing',
              'Docker containerized worker queue deployment',
            ],
          },
        ],
        tags: ['PyTorch', 'FastAPI', 'FFmpeg', 'Docker'],
        actions: [
          { label: 'VIEW CODE ON GITHUB', type: 'primary', url: 'https://github.com/DEEPAKRV07/Kaatchi-Media' },
        ],
      },
      {
        id: 'msme-exp',
        label: 'MSME INTERNSHIP',
        position: [-1.4, 5.2, -2.5],
        kicker: 'CAREER MILESTONE',
        title: 'AI Systems Engineering Intern',
        subtitle: 'MSME Training Program',
        sections: [
          {
            heading: 'ROLE & CONTRIBUTION',
            content: 'Trained custom object detection models, benchmarked inference pipelines, and optimized computer vision algorithms for real-time edge hardware.',
          },
          {
            heading: 'RESPONSIBILITIES & TECH',
            bullets: [
              'YOLOv8 dataset curation, annotation, and model training',
              'OpenCV real-time stream processing optimization',
              'Latency benchmarking across embedded edge hardware',
            ],
          },
        ],
        tags: ['YOLOv8', 'OpenCV', 'Python', 'Edge AI'],
        actions: [],
      },
      {
        id: 'quality-exp',
        label: 'QUALITY THREADS',
        position: [3.8, 3.0, 2.2],
        kicker: 'CAREER MILESTONE',
        title: 'Data & Analytics Engineering',
        subtitle: 'Quality Threads',
        sections: [
          {
            heading: 'ROLE & CONTRIBUTION',
            content: 'Built automated analytics reporting pipelines, structured feature extraction routines, and database management systems.',
          },
          {
            heading: 'RESPONSIBILITIES & TECH',
            bullets: [
              'Automated data analytics & feature extraction in Python',
              'Structured SQL database query optimization',
              'Analytics reporting automation',
            ],
          },
        ],
        tags: ['Python', 'SQL', 'Data Analytics'],
        actions: [],
      },
      {
        id: 'forcrux-exp',
        label: 'FORCRUX',
        position: [6.2, -2.2, -2.2],
        kicker: 'CAREER MILESTONE',
        title: 'Web Software Engineering',
        subtitle: 'Forcrux Development',
        sections: [
          {
            heading: 'ROLE & CONTRIBUTION',
            content: 'Engineered responsive web applications, API integrations, and user interfaces backed by structured database backends.',
          },
          {
            heading: 'RESPONSIBILITIES & TECH',
            bullets: [
              'Frontend UI integration & component design',
              'REST API consumption & state management',
            ],
          },
        ],
        tags: ['JavaScript', 'HTML/CSS', 'Web APIs'],
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
        actionUrl: 'mailto:deepakrv07@gmail.com',
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
        actionUrl: 'https://linkedin.com/in/deepak-r-v',
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

function createSubnetWorld(subnetId) {
  const definition = subnetDefinitions[subnetId];
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
    };

    group.add(node.group);

    const label = createLabel(category.label, 'category', 'subnet');
    label.object = node.nucleusMesh;
    label.offset.set(0, 0.72, 0);

    const categoryObj = { ...category, mesh: node.nucleusMesh, group: node.group, label, originalPos: node.group.position.clone() };
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
        skillNode.nucleusMesh.userData = {
          type: 'skill-node',
          id: skill.id,
          subnetId,
          label: skill.label,
          skillData: skill,
        };

        group.add(skillNode.group);

        const skillLabel = createLabel(skill.label, 'skill', 'subnet');
        skillLabel.object = skillNode.nucleusMesh;
        skillLabel.offset.set(0, 0.45, 0);

        edges.push(createEdge(node.nucleusMesh, skillNode.nucleusMesh, group, 0.35));
      }
    }
  }

  for (let i = 0; i < categories.length; i++) {
    const source = categories[i];
    const target = categories[(i + 1) % categories.length];
    edges.push(createEdge(source.mesh, target.mesh, group, 0.18));
  }

  return {
    subnetId,
    definition,
    group,
    core: subnetCore,
    nucleus: coreNode.nucleusMesh,
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
   CAMERA TRANSITIONS
   ============================================================ */

let transitionState = null;

function startTransition(targetPosition, targetLookAt, duration = 850) {
  transitionState = {
    startPosition: camera.position.clone(),
    targetPosition: targetPosition.clone(),
    startLookAt: controls.target.clone(),
    targetLookAt: targetLookAt.clone(),
    startTime: performance.now(),
    duration,
  };
}

function updateCameraTransition() {
  if (!transitionState) return;

  const now = performance.now();
  const progress = Math.min((now - transitionState.startTime) / transitionState.duration, 1);
  const eased = progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

  camera.position.lerpVectors(transitionState.startPosition, transitionState.targetPosition, eased);
  controls.target.lerpVectors(transitionState.startLookAt, transitionState.targetLookAt, eased);
  controls.update();

  if (progress >= 1) {
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
   LAYER CONTROL FUNCTIONS (HOME-ONLY FLOATING 3D OBJECT VISIBILITY)
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
    setWorldVisibility(mainGraph, true);
    setWorldOpacity(mainGraph, 0.08); // Heavily faded Home network ghost
    setWorldOpacity(core, 0.18);       // Persistent core

    /* HIDE THE 5 AMBIENT 3D FLOATING LOGOS COMPLETELY IN SUBNETWORKS! */
    ambientLogosGroup.visible = false;

    for (const world of subnetWorlds.values()) {
      const isCurrent = world === activeSubnet;
      setWorldVisibility(world.group, isCurrent);
      setWorldOpacity(world.group, isCurrent ? 1.0 : 0.0);
    }

    setLabelMode('subnet');
    showCoreBeacon(true);
  }
}

function enterSubnet(subnetId) {
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
}

function returnToCore() {
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
}

function exitLayer() {
  if (document.body.classList.contains('detail-panel-open')) {
    hideDetailPresentation();
    return;
  }

  if (skillContextPanelEl?.classList.contains('active')) {
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

function updatePointer(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function getPointerObject() {
  raycaster.setFromCamera(pointer, camera);

  /* Universal Neural Core & Core Beacon raycast anchor */
  const coreTargets = [coreNode.nucleusMesh, beaconNode.nucleusMesh];
  if (activeSubnet) coreTargets.push(activeSubnet.nucleus);

  const coreHit = raycaster.intersectObjects(coreTargets, false)[0];
  if (coreHit) {
    return { type: 'core', object: coreHit.object };
  }

  /* 3D Ambient Logo Objects Raycast (ONLY IN HOME MAIN LAYER) */
  if (currentLayer === 'MAIN' && ambientLogosGroup.visible) {
    const logoHits = raycaster.intersectObjects(
      ambientLogoObjects.map(item => item.mesh),
      false
    );
    if (logoHits.length) {
      return { type: 'ambient-logo', object: logoHits[0].object };
    }
  }

  /* Subnet Layer Skill Nodes */
  if (activeSubnet) {
    const skillMeshes = [];
    activeSubnet.group.traverse(child => {
      if (child.isMesh && child.userData.type === 'skill-node') {
        skillMeshes.push(child);
      }
    });

    const skillHits = raycaster.intersectObjects(skillMeshes, false);
    if (skillHits.length) {
      return { type: 'skill-node', object: skillHits[0].object };
    }
  }

  /* Subnet Layer Category / Terminal Nodes */
  if (activeSubnet) {
    const hits = raycaster.intersectObjects(
      activeSubnet.categories.map(node => node.mesh),
      false
    );
    if (hits.length) {
      return { type: 'category-node', object: hits[0].object };
    }
  }

  /* Main Homepage Layer (5 Primary Destination Nodes) */
  if (currentLayer === 'MAIN') {
    const hits = raycaster.intersectObjects(
      mainNodeObjects.map(node => node.mesh),
      false
    );
    if (hits.length) {
      return { type: 'main', object: hits[0].object };
    }
  }

  return null;
}

renderer.domElement.addEventListener('pointerdown', event => {
  pointerDown.set(event.clientX, event.clientY);
  pointerMoved = false;
});

renderer.domElement.addEventListener('pointermove', event => {
  updatePointer(event);
  const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
  if (distance > 7) {
    pointerMoved = true;
  }
});

renderer.domElement.addEventListener('contextmenu', event => {
  event.preventDefault();
});

renderer.domElement.addEventListener('click', () => {
  if (pointerMoved) return;

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
    const node = mainNodeObjects.find(item => item.mesh === hit.object);
    if (node) {
      if (node.id === 'about') {
        showDetailPresentation(combinedAboutData);
      } else {
        enterSubnet(node.id);
      }
    }
    return;
  }

  if (hit.type === 'category-node') {
    const categoryObj = activeSubnet.categories.find(node => node.mesh === hit.object);
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

function updateHover() {
  const hit = getPointerObject();

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
  coreRingB.rotation.x += 0.004;
  coreRingC.rotation.y += 0.006;

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

  animateBurstState();
  updateCameraTransition();
  controls.update();

  /* Continuous Travelling Electric Pulse Motion */
  for (const edge of mainEdges) {
    if (edge.pulseGroup) {
      edge.pulseProgress += edge.pulseSpeed;
      if (edge.pulseProgress > 1) edge.pulseProgress = 0;
    }
  }
  if (activeSubnet) {
    for (const edge of activeSubnet.edges) {
      if (edge.pulseGroup) {
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
   INITIALIZATION & RESIZE HANDLERS
   ============================================================ */

setLayerVisibility('MAIN');
setMode('OVERVIEW');
setLayerPath('NEURAL NETWORK / OVERVIEW');
updateCounters(mainNodeObjects.length + 1, mainEdges.length);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  for (const mat of lineMaterialsRegistry) {
    mat.resolution.set(window.innerWidth, window.innerHeight);
  }
});

requestAnimationFrame(animate);