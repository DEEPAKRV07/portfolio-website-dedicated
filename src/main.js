import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/*
 * ============================================================
 * DEEPAK R V — INSIDE MY NEURAL NETWORK
 * Sprint 3E — NEURAL NETWORK TOPOLOGY & SPATIAL COMPOSITION
 *
 * Core Principles:
 * 1. Primary Homepage Topology: ONLY 5 Destination Nodes (ABOUT, SKILLS, PROJECTS, EXPERIENCE, CONTACT).
 * 2. Round 3D Neural Node Visual Language preserved with slightly thicker 3D structural rings (torus tube 0.032).
 * 3. Subnet Expansion for all 5 primary branches (Skills, Projects, Experience, About, Contact).
 * 4. Deterministic 3D spatial layout (no Math.random()).
 * 5. Full preservation of Core navigation architecture (Core -> Subnet/Project -> Category -> Detail).
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
   GEOMETRIES (Sprint 3E Thicker 3D Edges/Rings)
   ============================================================ */

const coreGeometry = new THREE.SphereGeometry(1.18, 36, 36);
const primaryGeometry = new THREE.SphereGeometry(0.88, 32, 32); // Scaled 5 primary home nodes
const categoryGeometry = new THREE.SphereGeometry(0.42, 26, 26);
const detailGeometry = new THREE.SphereGeometry(0.22, 22, 22);

/* Thicker, more substantial 3D Torus Geometry for node wireframes */
const nodeTorusGeometry = new THREE.TorusGeometry(1.48, 0.032, 10, 140);
const categoryTorusGeometry = new THREE.TorusGeometry(0.68, 0.024, 8, 90);

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
   MAIN GRAPH TOPOLOGY (EXACTLY 5 PRIMARY NODES)
   ============================================================ */

const mainGraph = new THREE.Group();
mainGraph.name = 'MAIN_NEURAL_NETWORK';
scene.add(mainGraph);

/* The ONLY FIVE Primary Destinations on Homepage */
const mainNodes = [
  { id: 'about', label: 'ABOUT', type: 'primary', position: [0.0, 7.8, 2.5] },
  { id: 'skills', label: 'SKILLS', type: 'primary', position: [-9.2, 3.8, -2.2] },
  { id: 'experience', label: 'EXPERIENCE', type: 'primary', position: [9.2, 3.8, 2.2] },
  { id: 'projects', label: 'PROJECTS', type: 'primary', position: [-6.8, -5.2, 2.8] },
  { id: 'contact', label: 'CONTACT', type: 'primary', position: [6.8, -5.2, -2.2] },
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

const coreNucleus = new THREE.Mesh(
  coreGeometry,
  nodeMaterial(COLORS.bright, 0.95)
);
coreNucleus.userData = { type: 'core', id: 'core' };
core.add(coreNucleus);

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

/* Core Thicker 3D Rings */
function createRing(rotation, scale = 1) {
  const ring = new THREE.Mesh(
    nodeTorusGeometry,
    new THREE.MeshBasicMaterial({
      color: COLORS.bright,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    })
  );
  ring.material.userData.baseOpacity = 0.65;
  ring.rotation.copy(rotation);
  ring.scale.setScalar(scale);
  core.add(ring);
  return ring;
}

const coreRingA = createRing(new THREE.Euler(0, 0, 0), 1);
const coreRingB = createRing(new THREE.Euler(Math.PI / 2, 0, 0), 0.94);
const coreRingC = createRing(new THREE.Euler(0, Math.PI / 2, 0), 1.05);

const coreLabel = createLabel('NEURAL CORE', 'core', 'main');
coreLabel.object = core;
coreLabel.offset.set(0, -1.88, 0);

/* ============================================================
   PERSISTENT CORE BEACON (Universal HOME Anchor)
   ============================================================ */

const coreBeacon = new THREE.Group();
coreBeacon.name = 'CORE_NAVIGATION_BEACON';
coreBeacon.visible = false;
scene.add(coreBeacon);

const beaconNucleus = new THREE.Mesh(
  new THREE.SphereGeometry(0.48, 24, 24),
  nodeMaterial(COLORS.bright, 0.95)
);
beaconNucleus.userData = { type: 'core', id: 'core-beacon' };
coreBeacon.add(beaconNucleus);

const beaconWire = new THREE.Mesh(
  new THREE.SphereGeometry(0.72, 24, 24),
  new THREE.MeshBasicMaterial({
    color: COLORS.medium,
    wireframe: true,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  })
);
beaconWire.material.userData.baseOpacity = 0.45;
coreBeacon.add(beaconWire);

const beaconLabel = createLabel('MAIN CORE', 'core-home', 'persistent');
beaconLabel.object = coreBeacon;
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
  const mesh = new THREE.Mesh(primaryGeometry, nodeMaterial(COLORS.bright, 0.95));
  mesh.position.set(...data.position);
  mesh.userData = { ...data };

  const shell = new THREE.Mesh(
    primaryGeometry,
    new THREE.MeshBasicMaterial({
      color: COLORS.bright,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    })
  );
  shell.material.userData.baseOpacity = 0.32;
  shell.scale.setScalar(1.22);
  mesh.add(shell);

  const ring = new THREE.Mesh(
    categoryTorusGeometry,
    new THREE.MeshBasicMaterial({
      color: COLORS.medium,
      transparent: true,
      opacity: 0.50,
      depthWrite: false,
    })
  );
  ring.material.userData.baseOpacity = 0.50;
  ring.rotation.x = Math.PI / 2;
  mesh.add(ring);

  mainGraph.add(mesh);

  const label = createLabel(data.label, 'primary-core', 'main');
  label.object = mesh;
  label.offset.set(0, 1.25, 0);

  const nodeObj = { ...data, mesh, shell, ring, label };
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
  const source = sourceId === 'core' ? core : mainNodeMap.get(sourceId)?.mesh;
  const target = targetId === 'core' ? core : mainNodeMap.get(targetId)?.mesh;
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
        description: 'Deepak R V — AI/ML Engineer & Computer Vision Specialist',
        details: ['Deepak R V', 'AI/ML Engineer', 'Computer Vision Specialist', 'B.Tech AI&DS'],
      },
      {
        id: 'philosophy',
        label: 'PHILOSOPHY',
        position: [0.0, 5.2, -2.5],
        description: 'Building robust, real-time computational systems.',
        details: ['Spatial AI Interfaces', 'Real-Time Vision Systems', 'Edge Optimization', 'Modular Code'],
      },
      {
        id: 'capabilities',
        label: 'CAPABILITIES',
        position: [4.8, -2.2, 2.2],
        description: 'Core technical competencies in visual learning.',
        details: ['Deep Learning Architecture', 'Object Detection & Tracking', 'Accessible AI Assistance', 'HCI Gesture Controls'],
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
        description: 'Visual perception, detection, tracking and segmentation.',
        details: ['YOLOv8', 'ByteTrack', 'OpenCV', 'Fast-SCNN', 'MediaPipe', 'OCR / Tesseract'],
      },
      {
        id: 'deep-learning',
        label: 'DEEP LEARNING & AI',
        position: [-1.4, 5.6, -3.0],
        description: 'Neural networks, training pipelines and model optimization.',
        details: ['PyTorch', 'TensorFlow', 'CNNs', 'Vision Transformers', 'K-Means Clustering'],
      },
      {
        id: 'systems-deployment',
        label: 'SYSTEMS & DEPLOYMENT',
        position: [5.2, 3.5, 2.5],
        description: 'High-throughput inference, APIs and cross-platform engines.',
        details: ['FastAPI', 'Docker', 'ONNX Runtime', 'TensorFlow Lite', 'C++ Inference'],
      },
      {
        id: 'languages-tools',
        label: 'LANGUAGES & TOOLS',
        position: [5.6, -1.8, -3.2],
        description: 'Programming languages, frameworks and development tools.',
        details: ['Python', 'C++', 'Flutter / Dart', 'SQL', 'Git & Linux'],
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
        description: 'Flutter-based accessibility system combining computer vision, navigation fusion, OCR and voice interaction.',
        details: ['Flutter', 'Accessibility', 'YOLOv8', 'Fast-SCNN', 'Tesseract OCR'],
      },
      {
        id: 'football',
        label: 'FOOTBALL ANALYSIS',
        position: [-1.4, 5.6, -3.0],
        description: 'Computer vision pipeline for player, referee and ball tracking, team classification and match statistics.',
        details: ['YOLOv8', 'ByteTrack', 'K-Means', 'OpenCV', 'Python Analytics'],
      },
      {
        id: 'kaatchi',
        label: 'KAATCHI MEDIA',
        position: [5.2, 3.5, 2.5],
        description: 'Scalable processing engine for automated media analysis, computer vision metadata and content optimization.',
        details: ['PyTorch', 'FastAPI', 'FFmpeg', 'Docker', 'Microservices'],
      },
      {
        id: 'virtual-mouse',
        label: 'VIRTUAL MOUSE',
        position: [5.6, -1.8, -3.2],
        description: 'Real-time hand tracking system mapping human gestures to touchless mouse controls.',
        details: ['MediaPipe Hands', 'OpenCV', 'PyAutoGUI', 'Touchless HCI'],
      },
    ],
  },

  experience: {
    id: 'experience',
    title: 'EXPERIENCE & CAREER',
    subtitle: 'ENGINEERING MEMORY PATH',
    categories: [
      {
        id: 'ai-ml-eng',
        label: 'AI / ML ENGINEERING',
        position: [-4.8, 2.8, 2.5],
        description: 'Designing, training and deploying vision models.',
        details: ['Custom Object Detectors', 'Video Tracking Pipelines', 'Dataset Curation', 'Inference Benchmarks'],
      },
      {
        id: 'pipeline-dev',
        label: 'PIPELINE DEVELOPMENT',
        position: [0.0, 5.2, -2.5],
        description: 'Building scalable end-to-end processing software.',
        details: ['Full Inference Flow', 'REST & Queue APIs', 'Edge & Mobile Integration', 'Cross-Platform Build'],
      },
      {
        id: 'technical-focus',
        label: 'TECHNICAL FOCUS',
        position: [4.8, -2.2, 2.2],
        description: 'Specialized focus areas in visual computing.',
        details: ['Real-Time Sports Analytics', 'Assistive AI for Healthcare', 'Gesture Control Interfaces'],
      },
    ],
  },

  contact: {
    id: 'contact',
    title: 'CONTACT & CONNECT',
    subtitle: 'NETWORK TRANSMISSION GATEWAY',
    categories: [
      {
        id: 'github',
        label: 'GITHUB',
        position: [-4.2, 2.5, 2.2],
        description: 'Open source repositories, code samples and vision pipelines.',
        details: ['github.com/Deepak-R-V', 'Repositories', 'Code Walkthroughs'],
      },
      {
        id: 'linkedin',
        label: 'LINKEDIN',
        position: [0.0, 4.8, -2.2],
        description: 'Professional experience, connections and profile.',
        details: ['linkedin.com/in/deepak-r-v', 'Professional Network'],
      },
      {
        id: 'email',
        label: 'EMAIL',
        position: [4.2, -2.0, 2.2],
        description: 'Direct inquiries, collaboration and engineering discussion.',
        details: ['AI/ML Collaboration', 'Direct Inquiry', 'Project Discussion'],
      },
    ],
  },
};

/* Existing Project Networks Data (for Project -> Category -> Detail layer) */
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

  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(0.88, 34, 34),
    nodeMaterial(COLORS.bright, 0.92)
  );
  nucleus.userData = { type: 'subnet-core', subnetId };
  subnetCore.add(nucleus);

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(1.18, 34, 34),
    new THREE.MeshBasicMaterial({
      color: COLORS.medium,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
  );
  shell.material.userData.baseOpacity = 0.35;
  subnetCore.add(shell);

  const ring = new THREE.Mesh(
    categoryTorusGeometry,
    new THREE.MeshBasicMaterial({
      color: COLORS.bright,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
  );
  ring.material.userData.baseOpacity = 0.55;
  ring.rotation.x = Math.PI / 2;
  subnetCore.add(ring);

  const subnetLabel = createLabel(definition.title, 'project-core', 'subnet');
  subnetLabel.object = subnetCore;
  subnetLabel.offset.set(0, -2.10, 0);

  const subtitleLabel = createLabel(definition.subtitle, 'project-subtitle', 'subnet');
  subtitleLabel.object = subnetCore;
  subtitleLabel.offset.set(0, -2.65, 0);

  const categoryNodes = new Map();
  const categories = [];
  const edges = [];

  for (const category of definition.categories) {
    const mesh = new THREE.Mesh(categoryGeometry, nodeMaterial(COLORS.medium));
    mesh.position.set(...category.position);
    mesh.userData = {
      type: 'subnet-category',
      id: category.id,
      subnetId,
      label: category.label,
    };

    group.add(mesh);

    const label = createLabel(category.label, 'category', 'subnet');
    label.object = mesh;
    label.offset.set(0, 0.60, 0);

    const node = { ...category, mesh, label };
    categoryNodes.set(category.id, node);
    categories.push(node);

    edges.push(createEdge(subnetCore, mesh, group, 0.48));
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
    nucleus,
    shell,
    ring,
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

  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(0.88, 34, 34),
    nodeMaterial(COLORS.bright, 0.92)
  );
  nucleus.userData = { type: 'project-core', projectId };
  projectCore.add(nucleus);

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(1.18, 34, 34),
    new THREE.MeshBasicMaterial({
      color: COLORS.medium,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
  );
  shell.material.userData.baseOpacity = 0.35;
  projectCore.add(shell);

  const ring = new THREE.Mesh(
    categoryTorusGeometry,
    new THREE.MeshBasicMaterial({
      color: COLORS.bright,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
  );
  ring.material.userData.baseOpacity = 0.55;
  ring.rotation.x = Math.PI / 2;
  projectCore.add(ring);

  const projectLabel = createLabel(definition.title, 'project-core', 'project');
  projectLabel.object = projectCore;
  projectLabel.offset.set(0, -2.10, 0);

  const subtitleLabel = createLabel(definition.subtitle, 'project-subtitle', 'project');
  subtitleLabel.object = projectCore;
  subtitleLabel.offset.set(0, -2.65, 0);

  const categoryNodes = new Map();
  const categories = [];
  const edges = [];

  for (const category of definition.categories) {
    const mesh = new THREE.Mesh(categoryGeometry, nodeMaterial(COLORS.medium));
    mesh.position.set(...category.position);
    mesh.userData = {
      type: 'project-category',
      id: category.id,
      projectId,
      label: category.label,
    };

    group.add(mesh);

    const label = createLabel(category.label, 'category', 'project');
    label.object = mesh;
    label.offset.set(0, 0.60, 0);

    const node = { ...category, mesh, label };
    categoryNodes.set(category.id, node);
    categories.push(node);

    edges.push(createEdge(projectCore, mesh, group, 0.48));
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
    nucleus,
    shell,
    ring,
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

  const centerMesh = new THREE.Mesh(
    categoryGeometry,
    nodeMaterial(COLORS.bright, 0.95)
  );
  centerMesh.userData = { type: 'detail-center', id: category.id };
  group.add(centerMesh);

  const categoryTitle = typeof category.label === 'string' ? category.label : (category.label?.label || category.id || 'CATEGORY');
  const centerLabel = createLabel(categoryTitle, 'category', 'detail');
  centerLabel.object = centerMesh;
  centerLabel.offset.set(0, -0.95, 0);

  let descriptionLabel = null;
  if (category.description) {
    descriptionLabel = createLabel(category.description, 'detail-desc', 'detail');
    descriptionLabel.object = centerMesh;
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

    const mesh = new THREE.Mesh(detailGeometry, nodeMaterial(COLORS.medium, 0.95));
    mesh.position.set(x, y, z);
    mesh.userData = { type: 'detail', label: details[i] };
    group.add(mesh);

    const label = createLabel(details[i], 'detail', 'detail');
    label.object = mesh;
    label.offset.set(0, 0.45, 0);

    detailNodes.push(mesh);
    detailLabels.push(label);
    edges.push(createEdge(centerMesh, mesh, group, 0.45));
  }

  for (let i = 0; i < detailNodes.length; i++) {
    const source = detailNodes[i];
    const target = detailNodes[(i + 1) % detailNodes.length];
    edges.push(createEdge(source, target, group, 0.16));
  }

  return {
    group,
    centerMesh,
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

  setLayerVisibility('MAIN');

  document.body.classList.remove('project-mode');
  document.body.classList.remove('detail-mode');

  setMode('OVERVIEW');
  setLayerPath('NEURAL NETWORK / OVERVIEW');
  updateCounters(mainNodeObjects.length + 1, mainEdges.length);

  startTransition(new THREE.Vector3(0, 1.2, 30), new THREE.Vector3(0, 0, 0), 900);
}

function enterLayer(layerName, payload) {
  if (layerName === 'SUBNET') {
    enterSubnet(payload);
  } else if (layerName === 'PROJECT') {
    enterProject(payload);
  } else if (layerName === 'DETAIL') {
    enterCategory(payload);
  } else if (layerName === 'MAIN') {
    returnToCore();
  }
}

function exitLayer() {
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
  const coreTargets = [coreNucleus, beaconNucleus];
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
    const category = activeSubnet.categories.find(node => node.mesh === hit.object);
    if (category) {
      if (activeSubnet.subnetId === 'projects') {
        enterProject(category.id);
      } else {
        enterCategory(category);
      }
    }
    return;
  }

  if (hit.type === 'project-category') {
    const category = activeProject.categories.find(node => node.mesh === hit.object);
    if (category) {
      enterCategory(category);
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
   SIGNAL PARTICLES
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

for (let i = 0; i < 18; i++) {
  const edge = mainEdges[i % mainEdges.length];
  if (edge) signals.push(createSignal(edge));
}

function updateSignals() {
  const start = new THREE.Vector3();
  const end = new THREE.Vector3();

  for (const signal of signals) {
    if (!signal.edge || !signal.edge.source || !signal.edge.target) continue;

    if (!isObjectInVisibleWorld(signal.edge.source)) {
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

  /* Core & Subnet Internal Rotation */
  coreRingA.rotation.z += 0.005;
  coreRingB.rotation.x += 0.004;
  coreRingC.rotation.y += 0.006;
  coreWire.rotation.y += 0.002;

  if (activeSubnet) {
    activeSubnet.ring.rotation.z += 0.006;
    activeSubnet.shell.rotation.y += 0.003;
  }
  if (activeProject) {
    activeProject.ring.rotation.z += 0.006;
    activeProject.shell.rotation.y += 0.003;
  }

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