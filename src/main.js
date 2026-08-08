import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/*
 * ============================================================
 * DEEPAK R V — INSIDE MY NEURAL NETWORK
 * Sprint 3G — FINAL CONTENT HIERARCHY, DETAIL VIEW, OVERLAY
 *             COMPOSITION & SUBNETWORK CORRECTION
 *
 * Core Principles:
 * 1. Two-Layer Navigation Architecture: Home -> Subnetwork -> Terminal Node -> Large Detail View.
 * 2. Research Paper Mode for Projects: Large technical case-study viewport with internal scrolling.
 * 3. Background Focus Mode: Dims background graph & hides text labels to prevent collisions.
 * 4. State Restoration: Closing detail view restores subnet layer & camera position cleanly.
 * 5. Unified 3D Neural Geometry across ALL nodes (Nucleus + Wire Shell + Torus Ring).
 * 6. Edge-Bound Signals: Particles travel strictly along edge vectors.
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

let currentLayer = 'MAIN'; // 'MAIN' | 'SUBNET' | 'DETAIL'

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
   LARGE TECHNICAL DETAIL PRESENTATION SYSTEM (Research Paper Mode)
   ============================================================ */

const detailPanelEl = document.getElementById('detailPanel');
const panelCloseBtn = document.getElementById('panelCloseBtn');
const panelKickerEl = document.getElementById('panelKicker');
const panelTitleEl = document.getElementById('panelTitle');
const panelSubtitleEl = document.getElementById('panelSubtitle');
const panelBodyEl = document.getElementById('panelBody');
const panelTagsEl = document.getElementById('panelTags');
const panelActionsEl = document.getElementById('panelActions');

let activeDetailNode = null;

function showDetailPresentation(data, activeNodeMesh = null) {
  if (!detailPanelEl || !data) return;

  activeDetailNode = activeNodeMesh;

  panelKickerEl.textContent = data.kicker || 'TECHNICAL CASE STUDY';
  panelTitleEl.textContent = data.title || 'NODE PRESENTATION';
  panelSubtitleEl.textContent = data.subtitle || '';

  // Render Structured Technical Sections (Research Paper Mode)
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
  } else if (data.description) {
    const secEl = document.createElement('section');
    secEl.className = 'research-section';
    const p = document.createElement('p');
    p.textContent = data.description;
    secEl.appendChild(p);
    panelBodyEl.appendChild(secEl);
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

  // Enable Background Focus Mode (dims background graph & hides text labels!)
  document.body.classList.add('detail-panel-open');
  if (activeSubnet) {
    setWorldOpacity(activeSubnet.group, 0.25);
  }
  if (mainGraph) {
    setWorldOpacity(mainGraph, 0.04);
  }

  detailPanelEl.classList.add('active');
  detailPanelEl.setAttribute('aria-hidden', 'false');
}

function hideDetailPresentation() {
  if (!detailPanelEl) return;

  detailPanelEl.classList.remove('active');
  detailPanelEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('detail-panel-open');

  // Restore background graph opacity to standard layer level
  if (currentLayer === 'SUBNET' && activeSubnet) {
    setWorldOpacity(activeSubnet.group, 1.0);
    setWorldOpacity(mainGraph, 0.08);
  } else if (currentLayer === 'MAIN') {
    setWorldOpacity(mainGraph, 1.0);
  }

  activeDetailNode = null;
}

if (panelCloseBtn) {
  panelCloseBtn.addEventListener('click', hideDetailPresentation);
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
   SUBNETWORK DEFINITIONS (5 MAJOR SUBNETS - TERMINAL NODES)
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
        sections: [
          {
            heading: 'PROFILE OVERVIEW',
            content: 'B.Tech AI&DS graduate specialized in designing, training, and deploying real-time computer vision systems, custom object tracking pipelines, and high-throughput edge inference engines.',
          },
          {
            heading: 'SPECIALIZATIONS',
            bullets: [
              'Real-Time Computer Vision & Multi-Object Tracking',
              'Fast Semantic Segmentation & Gesture Controls',
              'Deep Learning Architecture (PyTorch / TensorFlow)',
              'Edge Model Optimization & Microservice Deployment',
            ],
          },
          {
            heading: 'ENGINEERING BACKGROUND',
            content: 'Strong background in computer vision algorithms, real-time sports analytics pipelines, assistive accessibility systems, and gesture-driven HCI interfaces.',
          },
        ],
        tags: ['AI/ML Engineer', 'Computer Vision', 'B.Tech AI&DS', 'Real-Time Vision'],
        actions: [
          { label: 'VIEW RESUME PDF', type: 'primary', url: '/my_resume.pdf' },
        ],
      },
      {
        id: 'philosophy',
        label: 'ENGINEERING PHILOSOPHY',
        position: [0.0, 5.2, -2.5],
        kicker: 'ENGINEERING PHILOSOPHY',
        title: 'System Design & Optimization',
        subtitle: 'Core Computational Principles',
        sections: [
          {
            heading: 'PHILOSOPHY',
            content: 'Focusing on low-latency inference, spatial computer vision pipelines, modular architecture, and edge hardware deployment without unnecessary bloat.',
          },
          {
            heading: 'CORE PRINCIPLES',
            bullets: [
              'Zero-bloat modular pipeline design',
              'Edge-first model optimization (ONNX / TensorRT / TFLite)',
              'Spatial 3D visual perception',
              'Strict latency & throughput benchmarking',
            ],
          },
        ],
        tags: ['Spatial AI', 'Edge Optimization', 'Modular Code', 'Real-Time Vision'],
        actions: [
          { label: 'VIEW RESUME PDF', type: 'secondary', url: '/my_resume.pdf' },
        ],
      },
      {
        id: 'capabilities',
        label: 'CAPABILITIES',
        position: [4.8, -2.2, 2.2],
        kicker: 'CAPABILITIES',
        title: 'Technical Core Competencies',
        subtitle: 'Specialization & Skill Spectrum',
        sections: [
          {
            heading: 'COMPETENCY SPECTRUM',
            content: 'Deep technical proficiency in custom object detection (YOLOv8), multi-object tracking (ByteTrack), fast segmentation (Fast-SCNN), MediaPipe hand gesture recognition, PyTorch/TensorFlow training, and FastAPI microservices.',
          },
          {
            heading: 'KEY STRENGTHS',
            bullets: [
              'YOLOv8 & ByteTrack tracking pipelines',
              'PyTorch deep neural network training',
              'FastAPI containerized microservices',
              'OpenCV visual processing',
            ],
          },
        ],
        tags: ['YOLOv8', 'PyTorch', 'FastAPI', 'OpenCV', 'MediaPipe'],
        actions: [
          { label: 'VIEW RESUME PDF', type: 'primary', url: '/my_resume.pdf' },
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
        sections: [
          {
            heading: 'PERCEPTION & TRACKING SPECTRUM',
            content: 'Advanced visual understanding, multi-object tracking, fast semantic segmentation, hand gesture modeling, and optical character recognition.',
          },
          {
            heading: 'TECHNOLOGIES',
            bullets: [
              'YOLOv8 — Custom Object Detection',
              'ByteTrack — Multi-Object Tracking',
              'OpenCV — Image Processing & Geometry',
              'Fast-SCNN — Fast Semantic Segmentation',
              'MediaPipe — Hand Landmark Gesture Tracking',
              'Tesseract OCR — Text Recognition',
            ],
          },
        ],
        details: ['YOLOv8', 'ByteTrack', 'OpenCV', 'Fast-SCNN', 'MediaPipe', 'OCR / Tesseract'],
        tags: ['YOLOv8', 'ByteTrack', 'OpenCV', 'Fast-SCNN', 'MediaPipe', 'Tesseract OCR'],
        actions: [
          { label: 'VIEW RESUME PDF', type: 'primary', url: '/my_resume.pdf' },
        ],
      },
      {
        id: 'deep-learning',
        label: 'DEEP LEARNING & AI',
        position: [-1.4, 5.6, -3.0],
        kicker: 'SKILL CATEGORY',
        title: 'Deep Learning & AI',
        subtitle: 'Neural Architectures & Training',
        sections: [
          {
            heading: 'NEURAL NETWORKS & TRAINING',
            content: 'Deep neural network design, Convolutional Neural Networks (CNNs), Vision Transformers, PyTorch & TensorFlow training pipelines, and unsupervised clustering.',
          },
          {
            heading: 'TECHNOLOGIES',
            bullets: [
              'PyTorch — Model Training & Fine-Tuning',
              'TensorFlow — Deep Neural Networks',
              'CNNs — Feature Extraction & Classification',
              'Vision Transformers — Spatial Attention Networks',
              'K-Means — Team Jersey & Feature Clustering',
            ],
          },
        ],
        details: ['PyTorch', 'TensorFlow', 'CNNs', 'Vision Transformers', 'K-Means Clustering'],
        tags: ['PyTorch', 'TensorFlow', 'CNNs', 'Transformers', 'K-Means'],
        actions: [
          { label: 'VIEW RESUME PDF', type: 'primary', url: '/my_resume.pdf' },
        ],
      },
      {
        id: 'systems-deployment',
        label: 'SYSTEMS & DEPLOYMENT',
        position: [5.2, 3.5, 2.5],
        kicker: 'SKILL CATEGORY',
        title: 'Systems & Deployment',
        subtitle: 'Inference Engines & Microservices',
        sections: [
          {
            heading: 'HIGH-THROUGHPUT DEPLOYMENT',
            content: 'High-throughput microservice architectures, REST APIs, ONNX Runtime optimization, Docker containerization, and mobile/edge inference.',
          },
          {
            heading: 'TECHNOLOGIES',
            bullets: [
              'FastAPI — Low-Latency REST Microservices',
              'Docker — Containerized Service Deployment',
              'ONNX Runtime — Cross-Platform Inference',
              'TensorFlow Lite — Mobile & Edge Deployment',
              'C++ — High-Performance Inference Engines',
            ],
          },
        ],
        details: ['FastAPI', 'Docker', 'ONNX Runtime', 'TensorFlow Lite', 'C++ Inference'],
        tags: ['FastAPI', 'Docker', 'ONNX', 'TFLite', 'C++'],
        actions: [
          { label: 'VIEW RESUME PDF', type: 'primary', url: '/my_resume.pdf' },
        ],
      },
      {
        id: 'languages-tools',
        label: 'LANGUAGES & TOOLS',
        position: [5.6, -1.8, -3.2],
        kicker: 'SKILL CATEGORY',
        title: 'Languages & Tools',
        subtitle: 'Programming Languages & Systems',
        sections: [
          {
            heading: 'ENGINEERING STACK',
            content: 'Core software engineering stack across Python, C++, Dart, SQL databases, Git version control, and Linux systems administration.',
          },
          {
            heading: 'TECHNOLOGIES',
            bullets: [
              'Python — Core AI/ML Engineering & Analytics',
              'C++ — Systems & Algorithmic Performance',
              'Flutter / Dart — Cross-Platform Mobile Applications',
              'SQL — Database Querying & Data Pipelines',
              'Git & Linux — Version Control & System Admin',
            ],
          },
        ],
        details: ['Python', 'C++', 'Flutter / Dart', 'SQL', 'Git & Linux'],
        tags: ['Python', 'C++', 'Flutter', 'SQL', 'Git & Linux'],
        actions: [
          { label: 'VIEW RESUME PDF', type: 'primary', url: '/my_resume.pdf' },
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
        kicker: 'TECHNICAL CASE STUDY (RESEARCH PAPER MODE)',
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
          { label: 'VIEW RESUME PDF', type: 'secondary', url: '/my_resume.pdf' },
        ],
      },

      {
        id: 'football',
        label: 'FOOTBALL ANALYSIS',
        position: [-1.4, 5.6, -3.0],
        kicker: 'TECHNICAL CASE STUDY (RESEARCH PAPER MODE)',
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
          { label: 'VIEW RESUME PDF', type: 'secondary', url: '/my_resume.pdf' },
        ],
      },

      {
        id: 'kaatchi',
        label: 'KAATCHI MEDIA',
        position: [5.2, 3.5, 2.5],
        kicker: 'TECHNICAL CASE STUDY (RESEARCH PAPER MODE)',
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
          { label: 'VIEW RESUME PDF', type: 'secondary', url: '/my_resume.pdf' },
        ],
      },

      {
        id: 'virtual-mouse',
        label: 'VIRTUAL MOUSE',
        position: [5.6, -1.8, -3.2],
        kicker: 'TECHNICAL CASE STUDY (RESEARCH PAPER MODE)',
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
            content: 'Webcam frames are passed to MediaPipe Hands for 21 3D landmark coordinate extraction. Index finger tip coordinates are smoothed using exponential moving average filtering and mapped to screen screen dimensions. Pinch distance triggers PyAutoGUI click events.',
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
          { label: 'VIEW RESUME PDF', type: 'secondary', url: '/my_resume.pdf' },
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
          { label: 'VIEW RESUME PDF', type: 'secondary', url: '/my_resume.pdf' },
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
        actions: [
          { label: 'VIEW RESUME PDF', type: 'primary', url: '/my_resume.pdf' },
        ],
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
        actions: [
          { label: 'VIEW RESUME PDF', type: 'primary', url: '/my_resume.pdf' },
        ],
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
        actions: [
          { label: 'VIEW RESUME PDF', type: 'primary', url: '/my_resume.pdf' },
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
        sections: [
          {
            heading: 'DIRECT INQUIRIES',
            content: 'Send a direct message regarding AI/ML engineering positions, computer vision project collaborations, or technical consultations.',
          },
        ],
        tags: ['Direct Email', 'AI/ML Collaboration'],
        actions: [
          { label: 'SEND EMAIL NOW', type: 'primary', url: 'mailto:deepakrv07@gmail.com' },
        ],
      },
      {
        id: 'github',
        label: 'GITHUB',
        position: [-1.4, 4.8, -2.0],
        kicker: 'CODE REPOSITORY',
        title: 'GitHub Profile',
        subtitle: 'github.com/DEEPAKRV07',
        sections: [
          {
            heading: 'SOURCE CODE & REPOSITORIES',
            content: 'Explore open source computer vision repositories, detection pipelines, model architectures, and project implementations.',
          },
        ],
        tags: ['Repositories', 'Source Code', 'Vision Pipelines'],
        actions: [
          { label: 'OPEN GITHUB PROFILE', type: 'primary', url: 'https://github.com/DEEPAKRV07' },
        ],
      },
      {
        id: 'linkedin',
        label: 'LINKEDIN',
        position: [2.8, 3.2, 2.0],
        kicker: 'PROFESSIONAL NETWORK',
        title: 'LinkedIn Profile',
        subtitle: 'linkedin.com/in/deepak-r-v',
        sections: [
          {
            heading: 'PROFESSIONAL CONNECT',
            content: 'Connect professionally on LinkedIn to discuss career opportunities, engineering recommendations, and professional achievements.',
          },
        ],
        tags: ['Professional Network', 'Career Profile'],
        actions: [
          { label: 'OPEN LINKEDIN PROFILE', type: 'primary', url: 'https://linkedin.com/in/deepak-r-v' },
        ],
      },
      {
        id: 'resume',
        label: 'RESUME',
        position: [6.2, -2.0, -2.0],
        kicker: 'OFFICIAL DOCUMENT',
        title: 'Curriculum Vitae',
        subtitle: 'Deepak R V — Resume PDF',
        sections: [
          {
            heading: 'CURRICULUM VITAE',
            content: 'View or download the complete official resume detailing engineering experience, B.Tech AI&DS education, skill inventory, and technical projects.',
          },
        ],
        tags: ['PDF Resume', 'Qualifications', 'Contact Info'],
        actions: [
          { label: 'VIEW RESUME PDF', type: 'primary', url: '/my_resume.pdf' },
        ],
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
      type: 'terminal-node',
      id: category.id,
      subnetId,
      label: category.label,
      nodeData: category,
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

    setLabelMode('subnet');
    showCoreBeacon(true);
  }
}

function enterSubnet(subnetId) {
  const world = subnetWorlds.get(subnetId);
  if (!world) return;

  activeSubnet = world;
  hideDetailPresentation();

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

  /* Subnet Layer Terminal Nodes */
  if (activeSubnet) {
    const hits = raycaster.intersectObjects(
      activeSubnet.categories.map(node => node.mesh),
      false
    );
    if (hits.length) {
      return { type: 'terminal-node', object: hits[0].object };
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

  if (hit.type === 'terminal-node') {
    const categoryObj = activeSubnet.categories.find(node => node.mesh === hit.object);
    if (categoryObj) {
      const nodeData = categoryObj.nodeData || categoryObj;
      showDetailPresentation(nodeData, hit.object);
    }
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

  updateCameraTransition();
  controls.update();

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
});

requestAnimationFrame(animate);