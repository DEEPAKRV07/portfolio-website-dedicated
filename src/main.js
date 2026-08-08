import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/*
 * ============================================================
 * DEEPAK R V — INSIDE MY NEURAL NETWORK
 * Sprint 3F — FINAL NEURAL TOPOLOGY + SUBNETWORK CONTENT SYSTEM
 *             + SIGNAL PATH REFINEMENT
 *
 * Core Objectives:
 * 1. Controlled Irregular 3D Pentagonal Homepage Topology (5 Primary Nodes with Z-depth rhythm).
 * 2. Unified 3D Neural Node Construction across ALL hierarchy levels.
 * 3. Signal particles travel STRICTLY along actual connection edges (zero free-floating particles).
 * 4. Focused Information Overlay Panel System (Node -> Activation -> Glass Detail Overlay -> Close).
 * 5. Complete Subnets: About, Skills (rich graph), Contact (linear 4 nodes), Experience (flowing memory path), Projects (4 actual projects).
 * 6. Redundant Top Core Button Removed; Neural Core remains universal click anchor.
 * 7. Full preservation of OrbitControls, 360° horizontal/vertical orbit, pan, zoom, and ESC/HOME rules.
 * ============================================================
 */

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

let currentLayer = 'MAIN'; // 'MAIN' | 'SUBNET' | 'PROJECT' | 'DETAIL'

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
   All hierarchy levels (Core, Primary, Category, Detail)
   use the SAME visual family: Nucleus + Wire Shell + Torus Ring!
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
   FOCUSED DETAIL OVERLAY PANEL SYSTEM
   ============================================================ */

const detailPanelEl = document.getElementById('detailPanel');
const panelCloseBtn = document.getElementById('panelCloseBtn');
const panelKickerEl = document.getElementById('panelKicker');
const panelTitleEl = document.getElementById('panelTitle');
const panelSubtitleEl = document.getElementById('panelSubtitle');
const panelDescEl = document.getElementById('panelDescription');
const panelTagsEl = document.getElementById('panelTags');
const panelActionsEl = document.getElementById('panelActions');

function showDetailPanel(data) {
  if (!detailPanelEl || !data) return;

  panelKickerEl.textContent = data.kicker || 'SUBNET DETAIL';
  panelTitleEl.textContent = data.title || 'NODE DETAIL';
  panelSubtitleEl.textContent = data.subtitle || '';
  panelDescEl.textContent = data.description || '';

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
      } else if (act.onClick) {
        btn.href = '#';
        btn.onclick = e => {
          e.preventDefault();
          act.onClick();
        };
      }
      panelActionsEl.appendChild(btn);
    }
  }

  detailPanelEl.classList.add('active');
  detailPanelEl.setAttribute('aria-hidden', 'false');
}

function hideDetailPanel() {
  if (!detailPanelEl) return;
  detailPanelEl.classList.remove('active');
  detailPanelEl.setAttribute('aria-hidden', 'true');
}

if (panelCloseBtn) {
  panelCloseBtn.addEventListener('click', hideDetailPanel);
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
    mode, // 'main' | 'subnet' | 'project' | 'detail' | 'persistent'
    offset: new THREE.Vector3(0, 0.48, 0),
    baseOpacity: 1,
    hidden: false,
  };

  labels.push(label);
  return label;
}

function removeLabel(label) {
  if (!label) return;
  label.element.remove();
  const index = labels.indexOf(label);
  if (index !== -1) {
    labels.splice(index, 1);
  }
}

function setLabelMode(mode) {
  labelMode = mode;
}

function updateLabels() {
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

    // 4. Layer Mode & Ghosting Rules
    let shouldShow = false;
    let effectiveOpacity = label.baseOpacity;

    if (label.mode === 'persistent') {
      shouldShow = true;
    } else if (label.mode === labelMode) {
      shouldShow = true;
    } else if (label.mode === 'main' && currentLayer !== 'MAIN') {
      shouldShow = true;
      effectiveOpacity = Math.min(label.baseOpacity, 0.08);
    } else if (label.mode === 'subnet' && currentLayer === 'DETAIL' && isObjectInVisibleWorld(label.object)) {
      shouldShow = true;
      effectiveOpacity = Math.min(label.baseOpacity, 0.12);
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
   Controlled irregular 3D pentagonal composition with Z-depth!
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

  const nodeObj = { ...data, mesh: node.nucleusMesh, group: node.group, label };
  mainNodeObjects.push(nodeObj);
  mainNodeMap.set(data.id, nodeObj);
}

/* ============================================================
   DYNAMIC EDGE CREATION & UPDATING
   ============================================================ */

function createEdge(source, target, parent, opacity = 0.5, color = COLORS.dim) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(6);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = lineMaterial(opacity, color);
  const line = new THREE.Line(geometry, material);
  line.frustumCulled = false;

  parent.add(line);

  return { line, source, target, material };
}

function updateEdge(edge) {
  if (!edge || !edge.source || !edge.target || !edge.line) return;

  const start = new THREE.Vector3();
  const end = new THREE.Vector3();

  edge.source.getWorldPosition(start);
  edge.target.getWorldPosition(end);

  if (edge.line.parent) {
    edge.line.parent.worldToLocal(start);
    edge.line.parent.worldToLocal(end);
  }

  const position = edge.line.geometry.attributes.position;
  position.setXYZ(0, start.x, start.y, start.z);
  position.setXYZ(1, end.x, end.y, end.z);
  position.needsUpdate = true;
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
   SUBNETWORK DEFINITIONS (5 MAJOR SUBNETS)
   ============================================================ */

const subnetDefinitions = {
  about: {
    id: 'about',
    title: 'ABOUT ME',
    subtitle: 'INTELLIGENCE SYSTEM & PROFILE',
    categories: [
      {
        id: 'profile',
        label: 'PROFILE & IDENTITY',
        position: [-4.8, 2.8, 2.5],
        kicker: 'PROFILE & IDENTITY',
        title: 'Deepak R V',
        subtitle: 'AI / ML Engineer & Computer Vision Specialist',
        description: 'B.Tech AI&DS graduate passionate about building robust, real-time spatial visual systems, custom object tracking pipelines, and high-performance edge inference engines.',
        tags: ['AI/ML Engineer', 'Computer Vision', 'B.Tech AI&DS', 'Real-Time Vision'],
        actions: [
          { label: 'VIEW RESUME', type: 'primary', url: '/my_resume.pdf' },
        ],
      },
      {
        id: 'philosophy',
        label: 'ENGINEERING PHILOSOPHY',
        position: [0.0, 5.2, -2.5],
        kicker: 'ENGINEERING PHILOSOPHY',
        title: 'System Design & Optimization',
        subtitle: 'Core Computational Principles',
        description: 'Focusing on low-latency inference, spatial computer vision pipelines, modular architecture, and edge hardware deployment without unnecessary bloat.',
        tags: ['Spatial AI', 'Edge Optimization', 'Modular Code', 'Real-Time Vision'],
        actions: [
          { label: 'VIEW RESUME', type: 'secondary', url: '/my_resume.pdf' },
        ],
      },
      {
        id: 'capabilities',
        label: 'CAPABILITIES',
        position: [4.8, -2.2, 2.2],
        kicker: 'CAPABILITIES',
        title: 'Technical Core Competencies',
        subtitle: 'Specialization & Skill Spectrum',
        description: 'Custom object detection & tracking (YOLOv8, ByteTrack), fast semantic segmentation (Fast-SCNN), MediaPipe gesture recognition, PyTorch/TensorFlow training, and FastAPI microservice integration.',
        tags: ['YOLOv8', 'PyTorch', 'FastAPI', 'OpenCV', 'MediaPipe'],
        actions: [
          { label: 'VIEW RESUME', type: 'primary', url: '/my_resume.pdf' },
        ],
      },
    ],
  },

  skills: {
    id: 'skills',
    title: 'SKILLS & TECHNOLOGIES',
    subtitle: 'COMPUTATIONAL KNOWLEDGE GRAPH',
    categories: [
      {
        id: 'computer-vision',
        label: 'COMPUTER VISION',
        position: [-5.2, 2.8, 3.2],
        kicker: 'SKILL CATEGORY',
        title: 'Computer Vision',
        subtitle: 'Visual Perception & Tracking',
        description: 'Advanced visual understanding, multi-object tracking, fast semantic segmentation, hand gesture modeling, and optical character recognition.',
        details: ['YOLOv8', 'ByteTrack', 'OpenCV', 'Fast-SCNN', 'MediaPipe', 'OCR / Tesseract'],
        tags: ['YOLOv8', 'ByteTrack', 'OpenCV', 'Fast-SCNN', 'MediaPipe', 'Tesseract OCR'],
      },
      {
        id: 'deep-learning',
        label: 'DEEP LEARNING & AI',
        position: [-1.4, 5.6, -3.0],
        kicker: 'SKILL CATEGORY',
        title: 'Deep Learning & AI',
        subtitle: 'Neural Architectures & Training',
        description: 'Deep neural network design, Convolutional Neural Networks (CNNs), Vision Transformers, PyTorch & TensorFlow training pipelines, and unsupervised clustering.',
        details: ['PyTorch', 'TensorFlow', 'CNNs', 'Vision Transformers', 'K-Means Clustering'],
        tags: ['PyTorch', 'TensorFlow', 'CNNs', 'Transformers', 'K-Means'],
      },
      {
        id: 'systems-deployment',
        label: 'SYSTEMS & DEPLOYMENT',
        position: [5.2, 3.5, 2.5],
        kicker: 'SKILL CATEGORY',
        title: 'Systems & Deployment',
        subtitle: 'Inference Engines & Microservices',
        description: 'High-throughput microservice architectures, REST APIs, ONNX Runtime optimization, Docker containerization, and mobile/edge inference.',
        details: ['FastAPI', 'Docker', 'ONNX Runtime', 'TensorFlow Lite', 'C++ Inference'],
        tags: ['FastAPI', 'Docker', 'ONNX', 'TFLite', 'C++'],
      },
      {
        id: 'languages-tools',
        label: 'LANGUAGES & TOOLS',
        position: [5.6, -1.8, -3.2],
        kicker: 'SKILL CATEGORY',
        title: 'Languages & Tools',
        subtitle: 'Programming Languages & Systems',
        description: 'Core software engineering stack across Python, C++, Dart, SQL databases, Git version control, and Linux systems administration.',
        details: ['Python', 'C++', 'Flutter / Dart', 'SQL', 'Git & Linux'],
        tags: ['Python', 'C++', 'Flutter', 'SQL', 'Git & Linux'],
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
        kicker: 'FEATURED PROJECT',
        title: 'SightMate',
        subtitle: 'AI Navigation & Assistance System',
        description: 'Flutter-based accessibility application combining real-time object detection (YOLOv8), fast semantic segmentation (Fast-SCNN), Tesseract OCR text reading, and spoken voice guidance.',
        tags: ['Flutter', 'YOLOv8', 'Fast-SCNN', 'Tesseract OCR', 'Accessibility'],
        actions: [
          { label: 'GITHUB REPO', type: 'primary', url: 'https://github.com/DEEPAKRV07/SightMate' },
          { label: 'VIEW RESUME', type: 'secondary', url: '/my_resume.pdf' },
        ],
      },
      {
        id: 'football',
        label: 'FOOTBALL ANALYSIS',
        position: [-1.4, 5.6, -3.0],
        kicker: 'FEATURED PROJECT',
        title: 'Football Analysis System',
        subtitle: 'AI Sports Analytics & Tracking',
        description: 'Computer vision pipeline for player, referee and ball detection (YOLOv8), multi-object tracking (ByteTrack), K-Means team jersey classification, and planar perspective transformation for match stats.',
        tags: ['YOLOv8', 'ByteTrack', 'K-Means', 'OpenCV', 'Python Analytics'],
        actions: [
          { label: 'GITHUB REPO', type: 'primary', url: 'https://github.com/DEEPAKRV07/Football-Analysis-System' },
          { label: 'VIEW RESUME', type: 'secondary', url: '/my_resume.pdf' },
        ],
      },
      {
        id: 'kaatchi',
        label: 'KAATCHI MEDIA',
        position: [5.2, 3.5, 2.5],
        kicker: 'FEATURED PROJECT',
        title: 'Kaatchi Media Engine',
        subtitle: 'Media Processing & AI Indexing',
        description: 'Scalable processing engine for automated media analysis, computer vision metadata extraction, keyframe indexing, and search optimization.',
        tags: ['PyTorch', 'FastAPI', 'FFmpeg', 'Docker', 'Microservices'],
        actions: [
          { label: 'GITHUB REPO', type: 'primary', url: 'https://github.com/DEEPAKRV07/Kaatchi-Media' },
          { label: 'VIEW RESUME', type: 'secondary', url: '/my_resume.pdf' },
        ],
      },
      {
        id: 'virtual-mouse',
        label: 'VIRTUAL MOUSE',
        position: [5.6, -1.8, -3.2],
        kicker: 'FEATURED PROJECT',
        title: 'Virtual Mouse Control',
        subtitle: 'Gesture HCI Control System',
        description: 'Real-time hand tracking system mapping human hand landmarks (MediaPipe) to touchless OS cursor movements, pinch clicks, and scroll gestures.',
        tags: ['MediaPipe Hands', 'OpenCV', 'PyAutoGUI', 'Touchless HCI'],
        actions: [
          { label: 'GITHUB REPO', type: 'primary', url: 'https://github.com/DEEPAKRV07/Virtual-Mouse-Controll' },
          { label: 'VIEW RESUME', type: 'secondary', url: '/my_resume.pdf' },
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
        description: 'Designed and deployed automated media vision processing microservices, keyframe indexing pipelines, and metadata extraction APIs.',
        tags: ['PyTorch', 'FastAPI', 'FFmpeg', 'Docker'],
        actions: [
          { label: 'GITHUB CODE', type: 'primary', url: 'https://github.com/DEEPAKRV07/Kaatchi-Media' },
        ],
      },
      {
        id: 'msme-exp',
        label: 'MSME INTERNSHIP',
        position: [-1.4, 5.2, -2.5],
        kicker: 'CAREER MILESTONE',
        title: 'AI Systems Engineering Intern',
        subtitle: 'MSME Training Program',
        description: 'Trained custom object detection models, benchmarked inference pipelines, and optimized computer vision algorithms for real-time edge hardware.',
        tags: ['YOLOv8', 'OpenCV', 'Python', 'Edge AI'],
        actions: [
          { label: 'VIEW RESUME', type: 'primary', url: '/my_resume.pdf' },
        ],
      },
      {
        id: 'quality-exp',
        label: 'QUALITY THREADS',
        position: [3.8, 3.0, 2.2],
        kicker: 'CAREER MILESTONE',
        title: 'Data & Analytics Engineering',
        subtitle: 'Quality Threads',
        description: 'Built automated analytics reporting pipelines, structured feature extraction routines, and database management systems.',
        tags: ['Python', 'SQL', 'Data Analytics'],
        actions: [
          { label: 'VIEW RESUME', type: 'primary', url: '/my_resume.pdf' },
        ],
      },
      {
        id: 'forcrux-exp',
        label: 'FORCRUX',
        position: [6.2, -2.2, -2.2],
        kicker: 'CAREER MILESTONE',
        title: 'Web Software Engineering',
        subtitle: 'Forcrux Development',
        description: 'Engineered responsive web applications, API integrations, and user interfaces backed by structured database backends.',
        tags: ['JavaScript', 'HTML/CSS', 'Web APIs'],
        actions: [
          { label: 'VIEW RESUME', type: 'primary', url: '/my_resume.pdf' },
        ],
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
        kicker: 'DIRECT TRANSMISSION',
        title: 'Email Deepak R V',
        subtitle: 'deepakrv07@gmail.com',
        description: 'Send a direct inquiry regarding AI/ML engineering roles, computer vision projects, or technical collaboration.',
        tags: ['Direct Contact', 'AI/ML Projects'],
        actions: [
          { label: 'SEND EMAIL', type: 'primary', url: 'mailto:deepakrv07@gmail.com' },
        ],
      },
      {
        id: 'github',
        label: 'GITHUB',
        position: [-1.4, 4.8, -2.0],
        kicker: 'CODE REPOSITORY',
        title: 'GitHub Profile',
        subtitle: 'github.com/DEEPAKRV07',
        description: 'Explore open source vision repositories, project source code, detection pipelines, and model implementations.',
        tags: ['Repositories', 'Source Code', 'Vision Pipelines'],
        actions: [
          { label: 'OPEN GITHUB', type: 'primary', url: 'https://github.com/DEEPAKRV07' },
        ],
      },
      {
        id: 'linkedin',
        label: 'LINKEDIN',
        position: [2.8, 3.2, 2.0],
        kicker: 'PROFESSIONAL NETWORK',
        title: 'LinkedIn Profile',
        subtitle: 'linkedin.com/in/deepak-r-v',
        description: 'Connect professionally, review technical recommendations, and track engineering work experience.',
        tags: ['Professional Network', 'Career Profile'],
        actions: [
          { label: 'OPEN LINKEDIN', type: 'primary', url: 'https://linkedin.com/in/deepak-r-v' },
        ],
      },
      {
        id: 'resume',
        label: 'RESUME',
        position: [6.2, -2.0, -2.0],
        kicker: 'OFFICIAL DOCUMENT',
        title: 'Curriculum Vitae',
        subtitle: 'Deepak R V — Resume PDF',
        description: 'View or download the official resume detailing engineering experience, education, skills, and technical accomplishments.',
        tags: ['PDF Resume', 'Qualifications', 'Contact Info'],
        actions: [
          { label: 'VIEW RESUME PDF', type: 'primary', url: '/my_resume.pdf' },
        ],
      },
    ],
  },
};

/* Existing Project Networks Data (for Project -> Category -> Detail 3D subnetwork layer) */
const projectNetworks = {
  sightmate: {
    title: 'SIGHTMATE',
    subtitle: 'AI NAVIGATION ASSISTANT',
    description: 'Flutter-based accessibility system combining computer vision, navigation fusion, OCR and voice interaction.',
    categories: [
      { id: 'overview', label: 'OVERVIEW', position: [-5.2, 2.8, 3.5], description: 'Real-time visual understanding and spoken interaction for visual assistance.', details: ['Flutter', 'Accessibility', 'Offline AI'] },
      { id: 'tech-stack', label: 'TECH STACK', position: [-1.4, 5.6, -3.0], description: 'Core technologies used across inference and application pipeline.', details: ['YOLOv8', 'TensorFlow Lite', 'Fast-SCNN', 'Tesseract OCR'] },
      { id: 'architecture', label: 'ARCHITECTURE', position: [5.2, 3.5, 2.5], description: 'Modular pipeline connecting camera input, AI inference, navigation and voice output.', details: ['Camera Input', 'Object Detection', 'Fast Segmentation', 'Audio Guidance'] },
      { id: 'features', label: 'FEATURES', position: [5.6, -1.8, -3.2], description: 'Real-time assistance features built around scene understanding.', details: ['Object Detection', 'OCR Text Reader', 'Currency Recognition', 'Voice Feedback'] },
      { id: 'output', label: 'OUTPUT', position: [0.8, -5.2, 3.0], description: 'Turns visual information into accessible spoken feedback.', details: ['Scene Understanding', 'Text Reading', 'Voice Feedback'] },
      { id: 'links', label: 'PROJECT', position: [-5.0, -3.0, -2.6], description: 'Project implementation and supporting repository.', details: ['GitHub Repo', 'Documentation', 'Video Demo'] },
    ],
  },

  football: {
    title: 'FOOTBALL ANALYSIS',
    subtitle: 'AI SPORTS ANALYTICS',
    description: 'Computer vision pipeline for player, referee and ball tracking, team classification and match statistics.',
    categories: [
      { id: 'overview', label: 'OVERVIEW', position: [-5.2, 2.8, 3.5], description: 'A football video analytics pipeline built around detection, tracking and statistical analysis.', details: ['Computer Vision', 'Sports Analytics', 'Video Processing'] },
      { id: 'tech-stack', label: 'TECH STACK', position: [-1.4, 5.6, -3.0], description: 'Core models and tools used throughout the analysis pipeline.', details: ['YOLOv8', 'ByteTrack', 'K-Means', 'OpenCV', 'Python'] },
      { id: 'architecture', label: 'ARCHITECTURE', position: [5.2, 3.5, 2.5], description: 'Detection, tracking, classification and transformation stages work together as one pipeline.', details: ['Player Detection', 'Multi-Object Tracking', 'K-Means Team Color', 'Perspective Warp'] },
      { id: 'features', label: 'FEATURES', position: [5.6, -1.8, -3.2], description: 'The pipeline extracts player and match-level information from video.', details: ['Player Tracking', 'Ball Tracking', 'Speed Estimation', 'Distance Traveled', 'Possession Stats'] },
      { id: 'output', label: 'OUTPUT', position: [0.8, -5.2, 3.0], description: 'Visualized match analytics and player statistics.', details: ['Tracking Overlay', 'Team Assignment', 'Match Statistics'] },
      { id: 'links', label: 'PROJECT', position: [-5.0, -3.0, -2.6], description: 'Source repository and technical walkthrough.', details: ['GitHub Repo', 'Video Walkthrough', 'Architecture PDF'] },
    ],
  },

  kaatchi: {
    title: 'KAATCHI MEDIA',
    subtitle: 'MEDIA COMPUTATIONAL ENGINE',
    description: 'Scalable processing engine for automated media analysis, computer vision metadata and content optimization.',
    categories: [
      { id: 'overview', label: 'OVERVIEW', position: [-5.2, 2.8, 3.5], description: 'Media processing engine for automatic content tag extraction and visual indexing.', details: ['Media AI', 'Content Analysis', 'Pipeline Engineering'] },
      { id: 'tech-stack', label: 'TECH STACK', position: [-1.4, 5.6, -3.0], description: 'Frameworks used for high-throughput media ingestion and inference.', details: ['Python', 'PyTorch', 'OpenCV', 'FFmpeg', 'FastAPI'] },
      { id: 'architecture', label: 'ARCHITECTURE', position: [5.2, 3.5, 2.5], description: 'Queue-driven microservice system handling batch media workloads.', details: ['Ingestion Queue', 'Feature Extraction', 'Model Service', 'Metadata Storage'] },
      { id: 'features', label: 'FEATURES', position: [5.6, -1.8, -3.2], description: 'Automatic indexing, keyframe extraction and visual feature clustering.', details: ['Keyframe Extraction', 'Visual Indexing', 'Auto Tagging', 'Search Index'] },
      { id: 'output', label: 'OUTPUT', position: [0.8, -5.2, 3.0], description: 'Structured JSON metadata and searchable media index.', details: ['Metadata API', 'Search Index', 'Analytics Dashboard'] },
      { id: 'links', label: 'PROJECT', position: [-5.0, -3.0, -2.6], description: 'Engine code and system documentation.', details: ['GitHub Repo', 'API Docs', 'Performance Benchmarks'] },
    ],
  },

  'virtual-mouse': {
    title: 'VIRTUAL MOUSE',
    subtitle: 'GESTURE CONTROL SYSTEM',
    description: 'Real-time hand tracking system mapping human gestures to touchless mouse controls.',
    categories: [
      { id: 'overview', label: 'OVERVIEW', position: [-5.2, 2.8, 3.5], description: 'Touchless human-computer interaction system translating hand landmarks into cursor movements.', details: ['HCI Interface', 'Gesture Control', 'Real-Time Vision'] },
      { id: 'tech-stack', label: 'TECH STACK', position: [-1.4, 5.6, -3.0], description: 'Tracking models and OS input automation libraries.', details: ['MediaPipe Hands', 'OpenCV', 'PyAutoGUI', 'Python'] },
      { id: 'architecture', label: 'ARCHITECTURE', position: [5.2, 3.5, 2.5], description: 'Low-latency pipeline connecting camera frames, gesture recognition and OS cursor events.', details: ['Frame Ingestion', 'Landmark Model', 'Gesture Classifier', 'OS Cursor Controller'] },
      { id: 'features', label: 'FEATURES', position: [5.6, -1.8, -3.2], description: 'Pinch-to-click, drag-and-drop, scroll gestures and smooth cursor filtering.', details: ['Cursor Smoothing', 'Left / Right Click', 'Scroll Gesture', 'Drag & Drop'] },
      { id: 'output', label: 'OUTPUT', position: [0.8, -5.2, 3.0], description: 'Responsive system control driven directly by webcam input.', details: ['Real-Time Overlay', 'Gesture Logs', 'Smooth Cursor'] },
      { id: 'links', label: 'PROJECT', position: [-5.0, -3.0, -2.6], description: 'Source code and execution instructions.', details: ['GitHub Repo', 'Setup Guide', 'Gesture Reference'] },
    ],
  },
};

/* ============================================================
   SUBNETWORK WORLDS BUILDER
   ============================================================ */

const subnetWorlds = new Map();
const projectWorlds = new Map();

let activeSubnet = null;
let activeProject = null;
let activeCategory = null;
let detailWorld = null;

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
      type: 'subnet-category',
      id: category.id,
      subnetId,
      label: category.label,
      categoryData: category,
    };

    group.add(node.group);

    const label = createLabel(category.label, 'category', 'subnet');
    label.object = node.nucleusMesh;
    label.offset.set(0, 0.72, 0);

    const categoryObj = { ...category, mesh: node.nucleusMesh, group: node.group, label };
    categoryNodes.set(category.id, categoryObj);
    categories.push(categoryObj);

    edges.push(createEdge(coreNode.nucleusMesh, node.nucleusMesh, group, 0.48));
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

/* Create Project Worlds for deep project -> category -> detail navigation */
function createProjectWorld(projectId) {
  const definition = projectNetworks[projectId];
  const group = new THREE.Group();
  group.name = `PROJECT_${projectId}`;
  group.visible = false;
  scene.add(group);

  const projectCore = new THREE.Group();
  projectCore.name = 'PROJECT_CORE';
  group.add(projectCore);

  const coreNode = createNeuralNodeGroup({
    nucleusRadius: 0.88,
    torusRadius: 0.98,
    torusTube: 0.028,
    color: COLORS.bright,
    opacity: 0.92,
  });
  coreNode.nucleusMesh.userData = { type: 'project-core', projectId };
  projectCore.add(coreNode.group);

  const projectLabel = createLabel(definition.title, 'project-core', 'project');
  projectLabel.object = coreNode.nucleusMesh;
  projectLabel.offset.set(0, -2.10, 0);

  const subtitleLabel = createLabel(definition.subtitle, 'project-subtitle', 'project');
  subtitleLabel.object = coreNode.nucleusMesh;
  subtitleLabel.offset.set(0, -2.65, 0);

  const categoryNodes = new Map();
  const categories = [];
  const edges = [];

  for (const category of definition.categories) {
    const node = createNeuralNodeGroup({
      nucleusRadius: 0.42,
      torusRadius: 0.56,
      torusTube: 0.022,
      color: COLORS.medium,
      opacity: 0.95,
    });

    node.group.position.set(...category.position);
    node.nucleusMesh.userData = {
      type: 'project-category',
      id: category.id,
      projectId,
      label: category.label,
      categoryData: category,
    };

    group.add(node.group);

    const label = createLabel(category.label, 'category', 'project');
    label.object = node.nucleusMesh;
    label.offset.set(0, 0.65, 0);

    const categoryObj = { ...category, mesh: node.nucleusMesh, group: node.group, label };
    categoryNodes.set(category.id, categoryObj);
    categories.push(categoryObj);

    edges.push(createEdge(coreNode.nucleusMesh, node.nucleusMesh, group, 0.48));
  }

  for (let i = 0; i < categories.length; i++) {
    const source = categories[i];
    const target = categories[(i + 1) % categories.length];
    edges.push(createEdge(source.mesh, target.mesh, group, 0.18));
  }

  return {
    projectId,
    definition,
    group,
    core: projectCore,
    nucleus: coreNode.nucleusMesh,
    label: projectLabel,
    subtitleLabel,
    categories,
    categoryMap: categoryNodes,
    edges,
  };
}

for (const projectId of Object.keys(projectNetworks)) {
  projectWorlds.set(projectId, createProjectWorld(projectId));
}

/* ============================================================
   DETAIL WORLD BUILDER
   ============================================================ */

function clearDetailWorld() {
  if (!detailWorld) return;
  for (const label of detailWorld.labels) {
    removeLabel(label);
  }
  if (detailWorld.centerLabel) removeLabel(detailWorld.centerLabel);
  if (detailWorld.descriptionLabel) removeLabel(detailWorld.descriptionLabel);
  scene.remove(detailWorld.group);
  detailWorld = null;
}

function createDetailWorld(parentWorld, category) {
  clearDetailWorld();

  const group = new THREE.Group();
  group.name = `DETAIL_${category.id}`;
  scene.add(group);

  const centerNode = createNeuralNodeGroup({
    nucleusRadius: 0.48,
    torusRadius: 0.62,
    torusTube: 0.024,
    color: COLORS.bright,
    opacity: 0.95,
  });
  centerNode.nucleusMesh.userData = { type: 'detail-center', id: category.id };
  group.add(centerNode.group);

  const categoryTitle = typeof category.label === 'string' ? category.label : (category.label?.label || category.id || 'CATEGORY');
  const centerLabel = createLabel(categoryTitle, 'category', 'detail');
  centerLabel.object = centerNode.nucleusMesh;
  centerLabel.offset.set(0, -0.95, 0);

  let descriptionLabel = null;
  if (category.description) {
    descriptionLabel = createLabel(category.description, 'detail-desc', 'detail');
    descriptionLabel.object = centerNode.nucleusMesh;
    descriptionLabel.offset.set(0, -1.45, 0);
  }

  const detailNodes = [];
  const detailLabels = [];
  const edges = [];

  const details = (category.details || []).map(item => {
    if (typeof item === 'object' && item !== null) {
      return item.label || item.name || item.title || JSON.stringify(item);
    }
    return String(item ?? '');
  });

  const count = details.length;
  const radius = 4.2;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.72;
    const z = (i % 2 === 0 ? 1 : -1) * 1.8;

    const node = createNeuralNodeGroup({
      nucleusRadius: 0.28,
      torusRadius: 0.38,
      torusTube: 0.020,
      color: COLORS.medium,
      opacity: 0.95,
    });

    node.group.position.set(x, y, z);
    node.nucleusMesh.userData = { type: 'detail', label: details[i] };
    group.add(node.group);

    const label = createLabel(details[i], 'detail', 'detail');
    label.object = node.nucleusMesh;
    label.offset.set(0, 0.48, 0);

    detailNodes.push(node.nucleusMesh);
    detailLabels.push(label);
    edges.push(createEdge(centerNode.nucleusMesh, node.nucleusMesh, group, 0.45));
  }

  for (let i = 0; i < detailNodes.length; i++) {
    const source = detailNodes[i];
    const target = detailNodes[(i + 1) % detailNodes.length];
    edges.push(createEdge(source, target, group, 0.16));
  }

  return {
    group,
    centerMesh: centerNode.nucleusMesh,
    centerLabel,
    descriptionLabel,
    nodes: detailNodes,
    labels: detailLabels,
    edges,
  };
}

/* ============================================================
   CAMERA TRANSITIONS
   ============================================================ */

let transitionState = null;

function startTransition(targetPosition, targetLookAt, duration = 800) {
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
   LAYER CONTROL FUNCTIONS
   ============================================================ */

function setLayerVisibility(layerName) {
  currentLayer = layerName;

  if (layerName === 'MAIN') {
    setWorldVisibility(mainGraph, true);
    setWorldOpacity(mainGraph, 1.0);
    setWorldOpacity(core, 1.0);

    for (const world of subnetWorlds.values()) {
      setWorldVisibility(world.group, false);
      setWorldOpacity(world.group, 0);
    }
    for (const world of projectWorlds.values()) {
      setWorldVisibility(world.group, false);
      setWorldOpacity(world.group, 0);
    }
    if (detailWorld) {
      setWorldVisibility(detailWorld.group, false);
    }

    setLabelMode('main');
    showCoreBeacon(false);
  } else if (layerName === 'SUBNET') {
    setWorldVisibility(mainGraph, true);
    setWorldOpacity(mainGraph, 0.08); // Subtle main network ghost
    setWorldOpacity(core, 0.20);       // Persistent core

    for (const world of subnetWorlds.values()) {
      const isCurrent = world === activeSubnet;
      setWorldVisibility(world.group, isCurrent);
      setWorldOpacity(world.group, isCurrent ? 1.0 : 0.0);
    }
    for (const world of projectWorlds.values()) {
      setWorldVisibility(world.group, false);
      setWorldOpacity(world.group, 0);
    }
    if (detailWorld) {
      setWorldVisibility(detailWorld.group, false);
    }

    setLabelMode('subnet');
    showCoreBeacon(true);
  } else if (layerName === 'PROJECT') {
    setWorldVisibility(mainGraph, true);
    setWorldOpacity(mainGraph, 0.05);

    for (const world of subnetWorlds.values()) {
      const isCurrent = world === activeSubnet;
      setWorldVisibility(world.group, isCurrent);
      setWorldOpacity(world.group, isCurrent ? 0.10 : 0.0);
    }
    for (const world of projectWorlds.values()) {
      const isCurrent = world === activeProject;
      setWorldVisibility(world.group, isCurrent);
      setWorldOpacity(world.group, isCurrent ? 1.0 : 0.0);
    }
    if (detailWorld) {
      setWorldVisibility(detailWorld.group, false);
    }

    setLabelMode('project');
    showCoreBeacon(true);
  } else if (layerName === 'DETAIL') {
    setWorldVisibility(mainGraph, true);
    setWorldOpacity(mainGraph, 0.04);

    for (const world of subnetWorlds.values()) {
      const isCurrent = world === activeSubnet;
      setWorldVisibility(world.group, isCurrent);
      setWorldOpacity(world.group, isCurrent ? 0.06 : 0.0);
    }
    for (const world of projectWorlds.values()) {
      const isCurrent = world === activeProject;
      setWorldVisibility(world.group, isCurrent);
      setWorldOpacity(world.group, isCurrent ? 0.08 : 0.0);
    }
    if (detailWorld) {
      setWorldVisibility(detailWorld.group, true);
      setWorldOpacity(detailWorld.group, 1.0);
    }

    setLabelMode('detail');
    showCoreBeacon(true);
  }
}

function enterSubnet(subnetId) {
  const world = subnetWorlds.get(subnetId);
  if (!world) return;

  activeSubnet = world;
  activeProject = null;
  activeCategory = null;
  clearDetailWorld();
  hideDetailPanel();

  setLayerVisibility('SUBNET');

  document.body.classList.add('project-mode');
  document.body.classList.remove('detail-mode');

  setMode(world.definition.title);
  setLayerPath(`NEURAL NETWORK / ${world.definition.title}`);
  updateCounters(world.categories.length + 1, world.edges.length);

  startTransition(new THREE.Vector3(0, 1.2, 18.5), new THREE.Vector3(0, 0, 0), 850);
}

function enterProject(projectId) {
  const world = projectWorlds.get(projectId);
  if (!world) return;

  activeProject = world;
  activeCategory = null;
  clearDetailWorld();
  hideDetailPanel();

  setLayerVisibility('PROJECT');

  document.body.classList.add('project-mode');
  document.body.classList.remove('detail-mode');

  setMode('PROJECT');
  setLayerPath(`NEURAL NETWORK / PROJECTS / ${world.definition.title}`);
  updateCounters(world.categories.length + 1, world.edges.length);

  startTransition(new THREE.Vector3(0, 1.2, 18.5), new THREE.Vector3(0, 0, 0), 850);
}

function enterCategory(category) {
  const parentWorld = activeProject || activeSubnet;
  if (!parentWorld) return;

  activeCategory = category;
  detailWorld = createDetailWorld(parentWorld, category);
  hideDetailPanel();

  setLayerVisibility('DETAIL');

  document.body.classList.add('detail-mode');
  setMode('DETAIL');
  setLayerPath(`NEURAL NETWORK / ${parentWorld.definition.title} / ${category.label}`);
  updateCounters(category.details ? category.details.length + 1 : 1, detailWorld.edges.length);

  startTransition(new THREE.Vector3(0, 1.0, 16.0), new THREE.Vector3(0, 0, 0), 760);
}

function returnToCore() {
  activeSubnet = null;
  activeProject = null;
  activeCategory = null;
  clearDetailWorld();
  hideDetailPanel();

  setLayerVisibility('MAIN');

  document.body.classList.remove('project-mode');
  document.body.classList.remove('detail-mode');

  setMode('OVERVIEW');
  setLayerPath('NEURAL NETWORK / OVERVIEW');
  updateCounters(mainNodeObjects.length + 1, mainEdges.length);

  startTransition(new THREE.Vector3(0, 1.2, 30), new THREE.Vector3(0, 0, 0), 900);
}

function exitLayer() {
  hideDetailPanel();

  if (currentLayer === 'DETAIL') {
    if (activeProject) {
      enterProject(activeProject.projectId);
    } else if (activeSubnet) {
      enterSubnet(activeSubnet.subnetId);
    } else {
      returnToCore();
    }
  } else if (currentLayer === 'PROJECT') {
    if (activeSubnet) {
      enterSubnet(activeSubnet.subnetId);
    } else {
      returnToCore();
    }
  } else if (currentLayer === 'SUBNET') {
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

function updatePointer(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function getPointerObject() {
  raycaster.setFromCamera(pointer, camera);

  /* Universal Neural Core & Core Beacon raycast anchor */
  const coreTargets = [coreNode.nucleusMesh, beaconNode.nucleusMesh];
  if (activeSubnet) coreTargets.push(activeSubnet.nucleus);
  if (activeProject) coreTargets.push(activeProject.nucleus);

  const coreHit = raycaster.intersectObjects(coreTargets, false)[0];
  if (coreHit) {
    return { type: 'core', object: coreHit.object };
  }

  /* Detail Layer */
  if (activeCategory && detailWorld) {
    const hits = raycaster.intersectObjects(detailWorld.nodes, false);
    if (hits.length) {
      return { type: 'detail', object: hits[0].object };
    }
  }

  /* Project Layer */
  if (activeProject) {
    const hits = raycaster.intersectObjects(
      activeProject.categories.map(node => node.mesh),
      false
    );
    if (hits.length) {
      return { type: 'project-category', object: hits[0].object };
    }
  }

  /* Subnet Layer */
  if (activeSubnet) {
    const hits = raycaster.intersectObjects(
      activeSubnet.categories.map(node => node.mesh),
      false
    );
    if (hits.length) {
      return { type: 'subnet-category', object: hits[0].object };
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

  if (hit.type === 'main') {
    const node = mainNodeObjects.find(item => item.mesh === hit.object);
    if (node) {
      enterSubnet(node.id);
    }
    return;
  }

  if (hit.type === 'subnet-category') {
    const categoryObj = activeSubnet.categories.find(node => node.mesh === hit.object);
    if (categoryObj) {
      if (activeSubnet.subnetId === 'projects') {
        enterProject(categoryObj.id);
      } else {
        // Show focused detail overlay panel with category data!
        showDetailPanel(categoryObj.categoryData || categoryObj);
      }
    }
    return;
  }

  if (hit.type === 'project-category') {
    const categoryObj = activeProject.categories.find(node => node.mesh === hit.object);
    if (categoryObj) {
      if (categoryObj.details && categoryObj.details.length) {
        enterCategory(categoryObj);
      } else {
        showDetailPanel(categoryObj.categoryData || categoryObj);
      }
    }
    return;
  }

  if (hit.type === 'detail') {
    const detailLabel = hit.object.userData.label;
    showDetailPanel({
      kicker: 'DETAIL NODE',
      title: detailLabel,
      subtitle: activeCategory ? activeCategory.label : 'NODE SPECIFICATION',
      description: `Specific skill / technical element: ${detailLabel}. Part of the ${activeSubnet ? activeSubnet.definition.title : 'Neural Network'} capability graph.`,
      tags: [detailLabel, 'Technical Skill'],
      actions: [
        { label: 'VIEW RESUME', type: 'primary', url: '/my_resume.pdf' },
      ],
    });
    return;
  }
});

/* Hover Scaling Effect */
const tempScale = new THREE.Vector3();
function updateHover() {
  const hit = getPointerObject();

  if (coreBeacon.visible) {
    const beaconActive = hit?.type === 'core';
    const beaconScale = beaconActive ? 1.18 : 1.0;
    tempScale.set(beaconScale, beaconScale, beaconScale);
    coreBeacon.scale.lerp(tempScale, 0.16);
  }

  renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
}

/* ============================================================
   KEYBOARD NAVIGATION
   ============================================================ */

window.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    exitLayer();
  } else if (event.key === 'Home') {
    returnToCore();
  }
});

/* ============================================================
   STRICT SIGNAL PARTICLES (Travel strictly along connection edges)
   Zero free-floating particles in empty space!
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

    // Hide signal if source or target world is invisible
    if (!isObjectInVisibleWorld(signal.edge.source) || !isObjectInVisibleWorld(signal.edge.target)) {
      signal.mesh.visible = false;
      continue;
    }

    signal.progress += signal.speed;
    if (signal.progress > 1) signal.progress = 0;

    // Calculate exact 3D world coordinates of edge endpoints
    signal.edge.source.getWorldPosition(start);
    signal.edge.target.getWorldPosition(end);

    // Interpolate signal position strictly along edge line
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

  updateCameraTransition();
  controls.update();

  /* Dynamic 3D Edge Updating */
  updateEdges(mainEdges);
  if (activeSubnet) {
    updateEdges(activeSubnet.edges);
  }
  if (activeProject) {
    updateEdges(activeProject.edges);
  }
  if (detailWorld) {
    updateEdges(detailWorld.edges);
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
});

requestAnimationFrame(animate);