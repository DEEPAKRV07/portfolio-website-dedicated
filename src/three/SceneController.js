import * as THREE from 'three';

/* ──────────────────────────────────────────────────────────────
   V1 DOM Projected Label Manager (Exact V1 Architecture)
   
   Creates crisp, browser-rendered HTML graph-label elements using the Deltha
   font. Projects node world positions through the camera every frame to NDC
   screen coordinates, eliminating 3D mesh mirroring, edge-on text, or flipping.
   Includes camera-distance perspective scaling (S) so labels scale with 3D nodes.
────────────────────────────────────────────────────────────── */
export class V1DOMLabelManager {
  constructor() {
    this.labels = []; // Array of label objects { id, text, object, world, offset, element, type, baseFontSize, isPopped }
    this.fadeTimeouts = new Map();
    this.container = document.getElementById('graph-labels-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'graph-labels-container';
      this.container.style.position = 'fixed';
      this.container.style.top = '0';
      this.container.style.left = '0';
      this.container.style.width = '100vw';
      this.container.style.height = '100vh';
      this.container.style.pointerEvents = 'none';
      this.container.style.zIndex = '10';
      document.body.appendChild(this.container);
    }
  }

  createLabel(id, text, object, world = 'home', type = 'category', offset = new THREE.Vector3(0, 0.85, 0)) {
    if (!object) return;

    const existingIdx = this.labels.findIndex(l => l.id === id && l.world === world);
    if (existingIdx !== -1) {
      const old = this.labels[existingIdx];
      if (old.element && old.element.parentNode) old.element.parentNode.removeChild(old.element);
      this.labels.splice(existingIdx, 1);
    }

    const el = document.createElement('div');
    el.className = `graph-label ${type}`;
    el.textContent = text.toUpperCase();
    el.style.position = 'absolute';
    el.style.top = '0';
    el.style.left = '0';
    el.style.fontFamily = "var(--font-display, 'Deltha', 'Space Grotesk', sans-serif)";
    el.style.fontWeight = '700';
    el.style.letterSpacing = '0.08em';
    el.style.color = '#ffffff';
    el.style.textShadow = '0 0 14px rgba(0, 255, 136, 0.45), 0 2px 4px rgba(0, 0, 0, 0.9)';
    el.style.pointerEvents = 'none';
    el.style.whiteSpace = 'nowrap';
    el.style.userSelect = 'none';
    el.style.willChange = 'transform, opacity, font-size';

    let baseFontSize = 14;
    if (type === 'root-core') {
      baseFontSize = 18;
      el.style.color = '#ffffff';
      el.style.textShadow = '0 0 18px rgba(0, 255, 136, 0.60), 0 2px 6px rgba(0, 0, 0, 0.95)';
    } else if (type === 'skill-subnode') {
      baseFontSize = 12; // Calibrated for crisp readability matching Home/Experience/Contact reference worlds
      el.style.fontWeight = '600';
      el.style.opacity = '0.92';
    } else {
      baseFontSize = 14; // Category nodes
    }

    el.style.fontSize = `${baseFontSize}px`;
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    this.container.appendChild(el);

    this.labels.push({
      id,
      text,
      object,
      world,
      type,
      baseFontSize,
      offset: offset.clone(),
      element: el,
      isPopped: false,
    });
  }

  update(camera, activeWorld) {
    if (!camera) return;

    const _tmpPos = new THREE.Vector3();
    const _camPos = camera.position;
    const halfW = window.innerWidth * 0.5;
    const halfH = window.innerHeight * 0.5;
    const refDist = 18.0; // Reference camera distance for 1.0x perspective scale

    for (let i = 0; i < this.labels.length; i++) {
      const label = this.labels[i];
      if (label.world !== activeWorld || !label.object) {
        label.element.style.display = 'none';
        continue;
      }

      // 1. Get 3D node world position + fixed 3D world-space clearance offset
      label.object.updateMatrixWorld(true);
      label.object.getWorldPosition(_tmpPos);

      // Measure 3D camera distance to node for perspective scaling
      const dist = _camPos.distanceTo(_tmpPos);
      _tmpPos.add(label.offset);

      // 2. Project 3D world position through camera to screen NDC
      _tmpPos.project(camera);

      if (_tmpPos.z > 1.0 || _tmpPos.z < -1.0) {
        label.element.style.display = 'none';
        continue;
      }

      const screenX = (_tmpPos.x * halfW) + halfW;
      const screenY = (-(_tmpPos.y * halfH)) + halfH;

      // 3. True 3D perspective scaling factor S based on camera distance with readability floor (0.82)
      const refDist = activeWorld === 'skills' ? 21.0 : 18.0; // Skills reference camera distance matches default 21.0
      let perspectiveScale = refDist / Math.max(dist, 1.0);
      perspectiveScale = Math.min(Math.max(perspectiveScale, 0.82), 1.65); // Readability floor = 0.82 (never becomes tiny)

      const computedFontSize = Math.round(label.baseFontSize * perspectiveScale);
      const popScale = label.isPopped ? 1.0 : 0.82;

      // 4. Render label physically anchored to 3D node world position with subtle pop scale
      label.element.style.display = 'block';
      label.element.style.fontSize = `${computedFontSize}px`;
      label.element.style.transform = `translate3d(${screenX}px, ${screenY}px, 0px) translate(-50%, -50%) scale(${popScale})`;
    }
  }

  hideWorldLabels(worldKey) {
    for (const [key, timer] of this.fadeTimeouts.entries()) {
      if (key.startsWith(worldKey)) {
        clearTimeout(timer);
        this.fadeTimeouts.delete(key);
      }
    }
    for (let i = 0; i < this.labels.length; i++) {
      const l = this.labels[i];
      if (l.world === worldKey) {
        l.isPopped = false;
        if (l.element) {
          l.element.style.opacity = '0';
        }
      }
    }
  }

  fadeInWorldLabels(worldKey, startDelayMs = 0) {
    this.hideWorldLabels(worldKey);

    // Exact GLB animation keyframe completion timestamps per node (in milliseconds)
    const nodeAnimTimings = {
      // Root & Categories
      'skills_root': 480,
      'cv-category': 1600,
      'dl-category': 1680,
      'lang-category': 1760,
      'systems-category': 1850,

      // Category 1: AI / ML subnodes
      'bytetrack': 3980,  // Deep Learning
      'fast-scnn': 4140,  // Generative AI
      'opencv': 4640,     // Computer Vision
      'yolov8': 5220,     // Machine Learning

      // Category 2: AI TOOLS subnodes
      'kmeans': 4400,     // OpenCV
      'ml-kit': 4480,     // YOLOv8
      'pytorch': 4980,    // TensorFlow
      'tensorflow': 5140, // PyTorch

      // Category 3: DEVELOPMENT subnodes
      'concurrency': 4060, // React
      'pandas': 4720,      // Next.js
      'playwright': 4810,  // Python
      'sqlite': 5060,      // JavaScript

      // Category 4: MOBILE / DEVOPS subnodes
      'flutter': 4220,    // Flutter / Dart
      'nextjs': 4560,     // Git & GitHub (Node_nextjs 3D sphere at branch tip)
      'python': 4900,     // Three.js
    };

    const worldLabels = this.labels.filter(l => l.world === worldKey && l.element);

    worldLabels.forEach(l => {
      let nodeDelay = 1200; // Fallback for non-skills worlds
      if (worldKey === 'skills') {
        nodeDelay = nodeAnimTimings[l.id] || 3800;
      }

      const timer = setTimeout(() => {
        if (l.element) {
          l.isPopped = true;
          l.element.style.opacity = (l.type === 'skill-subnode' ? '0.94' : '1');
        }
      }, nodeDelay);

      this.fadeTimeouts.set(`${worldKey}_${l.id}`, timer);
    });
  }

  getLabelCount(world = null) {
    if (!world) return this.labels.length;
    return this.labels.filter(l => l.world === world).length;
  }
}

export class SceneController {
  constructor() {
    // 1. Home GLB World state (LOCKED REFERENCE)
    this.homeGroup = new THREE.Group();
    this.homeGroup.name = 'HOME_GLB_CONTAINER';
    this.interactiveMeshes = [];
    this.nodeMap           = new Map();
    this.nodeGroups        = new Map();

    // 2. Projects GLB World state
    this.projectsGroup = new THREE.Group();
    this.projectsGroup.name = 'PROJECTS_GLB_CONTAINER';
    this.projectsInteractiveMeshes = [];
    this.projectsNodeMap     = new Map();
    this.projectsNodeGroups  = new Map();

    // 3. Skills GLB World state
    this.skillsGroup = new THREE.Group();
    this.skillsGroup.name = 'SKILLS_GLB_CONTAINER';
    this.skillsInteractiveMeshes = [];
    this.skillsNodeMap     = new Map();
    this.skillsNodeGroups  = new Map();

    // 4. Experience GLB World state
    this.experienceGroup = new THREE.Group();
    this.experienceGroup.name = 'EXPERIENCE_GLB_CONTAINER';
    this.experienceInteractiveMeshes = [];
    this.experienceNodeMap     = new Map();
    this.experienceNodeGroups  = new Map();

    // 5. Education GLB World state
    this.educationGroup = new THREE.Group();
    this.educationGroup.name = 'EDUCATION_GLB_CONTAINER';
    this.educationInteractiveMeshes = [];
    this.educationNodeMap     = new Map();
    this.educationNodeGroups  = new Map();

    // 6. Contact GLB World state
    this.contactGroup = new THREE.Group();
    this.contactGroup.name = 'CONTACT_GLB_CONTAINER';
    this.contactInteractiveMeshes = [];
    this.contactNodeMap     = new Map();
    this.contactNodeGroups  = new Map();

    this.activeWorld = 'home';
    this.v1LabelManager = new V1DOMLabelManager();
    this.mixers = new Map();
  }

  /* ── 1. HOME GLB INITIALIZATION (LOCKED REFERENCE) ── */
  initHomeScene(scene, homeAsset, camera, controls) {
    if (!homeAsset?.scene) return;
    this.homeAsset = homeAsset;
    this.homeGroup.clear();
    this.interactiveMeshes = [];
    this.nodeMap.clear();
    this.nodeGroups.clear();

    this.homeGroup.add(homeAsset.scene);
    scene.add(this.homeGroup);

    this._setupWorldGeometry(homeAsset.scene, 'home', this.nodeGroups, this.nodeMap, this.interactiveMeshes, homeAsset.animations);
    this.homeGroup.updateMatrixWorld(true);

    const homeLabels = {
      'hero': 'DEEPAK R V',
      'about': 'ABOUT',
      'skills': 'SKILLS',
      'projects': 'PROJECTS',
      'experience': 'EXPERIENCE',
      'contact': 'CONTACT'
    };

    this.nodeGroups.forEach((groupObj, key) => {
      const text = homeLabels[key];
      if (text) {
        let offset = new THREE.Vector3(0, 0.70, 0);
        if (key === 'hero') offset = new THREE.Vector3(0, 0.95, 0);
        this.v1LabelManager.createLabel(key, text, groupObj, 'home', key === 'hero' ? 'root-core' : 'category', offset);
      }
    });
  }

  /* ── 2. PROJECTS GLB INITIALIZATION ── */
  initProjectsScene(scene, projectsAsset, camera) {
    if (!projectsAsset?.scene) return;
    this.projectsAsset = projectsAsset;
    this.projectsGroup.clear();
    this.projectsInteractiveMeshes = [];
    this.projectsNodeMap.clear();
    this.projectsNodeGroups.clear();

    this.projectsGroup.add(projectsAsset.scene);
    scene.add(this.projectsGroup);

    this._setupWorldGeometry(projectsAsset.scene, 'projects', this.projectsNodeGroups, this.projectsNodeMap, this.projectsInteractiveMeshes, projectsAsset.animations);
    this.projectsGroup.updateMatrixWorld(true);

    const projectTitles = {
      'projects_root': 'ENGINEERING PROJECTS',
      'sightmate': 'SIGHTMATE',
      'football': 'FOOTBALL ANALYSIS',
      'football-analysis': 'FOOTBALL ANALYSIS',
      'forcrux': 'FORCRUX',
      'google-maps': 'GOOGLE MAPS PLATFORM',
      'kaatchi': 'KAATCHI MEDIA',
      'kaatchi-media': 'KAATCHI MEDIA',
    };

    this.projectsNodeGroups.forEach((groupObj, key) => {
      const title = projectTitles[key];
      if (title) {
        const offset = key === 'projects_root' ? new THREE.Vector3(0, 0.95, 0) : new THREE.Vector3(0, 0.70, 0);
        this.v1LabelManager.createLabel(key, title, groupObj, 'projects', key === 'projects_root' ? 'root-core' : 'category', offset);
      }
    });
  }

  /* ── 3. SKILLS GLB INITIALIZATION ── */
  initSkillsScene(scene, skillsAsset, camera) {
    if (!skillsAsset?.scene) return;
    this.skillsAsset = skillsAsset;
    this.skillsGroup.clear();
    this.skillsInteractiveMeshes = [];
    this.skillsNodeMap.clear();
    this.skillsNodeGroups.clear();

    this.skillsGroup.add(skillsAsset.scene);
    scene.add(this.skillsGroup);

    this._setupWorldGeometry(skillsAsset.scene, 'skills', this.skillsNodeGroups, this.skillsNodeMap, this.skillsInteractiveMeshes, skillsAsset.animations);
    this.skillsGroup.updateMatrixWorld(true);

    const categories = ['cv-category', 'dl-category', 'systems-category', 'lang-category'];
    const skillTitles = {
      'skills_root': 'SKILLS & TECHNOLOGIES',
      'cv-category': 'AI / ML',
      'dl-category': 'AI TOOLS',
      'systems-category': 'DEVELOPMENT',
      'lang-category': 'MOBILE / DEVOPS',

      // Category 1: AI / ML (4 subnodes)
      'yolov8': 'Machine Learning',
      'bytetrack': 'Deep Learning',
      'opencv': 'Computer Vision',
      'fast-scnn': 'Generative AI',

      // Category 2: AI TOOLS (4 subnodes)
      'pytorch': 'TensorFlow',
      'tensorflow': 'PyTorch',
      'ml-kit': 'YOLOv8',
      'kmeans': 'OpenCV',

      // Category 3: DEVELOPMENT (4 subnodes mapping to 5 items)
      'playwright': 'Python',
      'sqlite': 'JavaScript',
      'concurrency': 'React',
      'pandas': 'Next.js',

      // Category 4: MOBILE / DEVOPS (3 subnodes -> 3 unique skills)
      'python': 'Three.js',
      'flutter': 'Flutter / Dart',
      'nextjs': 'Git & GitHub',
    };

    this.skillsNodeGroups.forEach((groupObj, key) => {
      // Node_nextjs is the true 3D sphere centered at the tip of lang-category->nextjs branch line
      if (key === 'nextjs') {
        groupObj.visible = true;
        groupObj.traverse(child => { child.visible = true; });
      }

      // Hide the offset 16th GLB node 'git' so Column 4 renders EXACTLY 3 subnodes with 0 dangling edges
      if (key === 'git') {
        groupObj.visible = false;
        groupObj.traverse(child => { child.visible = false; });
        return;
      }

      let title = skillTitles[key];
      if (!title) {
        title = groupObj.userData?.node_label || groupObj.userData?.label;
      }
      if (!title) {
        title = key.toUpperCase();
      }

      const isRoot = key === 'skills_root';
      const isCategory = categories.includes(key);
      const type = isRoot ? 'root-core' : (isCategory ? 'category' : 'skill-subnode');

      let offset = new THREE.Vector3(0, 0.45, 0); // Small world-space clearance right above sphere
      if (isRoot) {
        offset = new THREE.Vector3(0, 1.05, 0);
      } else if (isCategory) {
        if (key === 'cv-category') offset = new THREE.Vector3(-0.45, 0.82, 0);
        else if (key === 'dl-category') offset = new THREE.Vector3(-0.35, 0.82, 0);
        else if (key === 'systems-category') offset = new THREE.Vector3(0.35, 0.82, 0);
        else if (key === 'lang-category') offset = new THREE.Vector3(0.45, 0.82, 0);
        else offset = new THREE.Vector3(0, 0.82, 0);
      }

      this.v1LabelManager.createLabel(key, title, groupObj, 'skills', type, offset);
    });
  }

  /* ── 4. EXPERIENCE GLB INITIALIZATION ── */
  initExperienceScene(scene, experienceAsset, camera) {
    if (!experienceAsset?.scene) return;
    this.experienceAsset = experienceAsset;
    this.experienceGroup.clear();
    this.experienceInteractiveMeshes = [];
    this.experienceNodeMap.clear();
    this.experienceNodeGroups.clear();

    this.experienceGroup.add(experienceAsset.scene);
    scene.add(this.experienceGroup);

    this._setupWorldGeometry(experienceAsset.scene, 'experience', this.experienceNodeGroups, this.experienceNodeMap, this.experienceInteractiveMeshes, experienceAsset.animations);
    this.experienceGroup.updateMatrixWorld(true);

    const expTitles = {
      'experience_root': 'WORK EXPERIENCE',
      'forcrux-exp': 'FORCRUX / AI DEVELOPER',
      'kaatchi-exp': 'KAATCHI / FULL STACK',
      'msme-exp': 'MSME / ML ENGINEER',
      'quality-exp': 'QUALITY ENGINEERING',
    };

    this.experienceNodeGroups.forEach((groupObj, key) => {
      const title = expTitles[key] || key.toUpperCase();
      const isRoot = key === 'experience_root';
      this.v1LabelManager.createLabel(key, title, groupObj, 'experience', isRoot ? 'root-core' : 'category', isRoot ? new THREE.Vector3(0, 0.95, 0) : new THREE.Vector3(0, 0.70, 0));
    });
  }

  /* ── 5. EDUCATION GLB INITIALIZATION ── */
  initEducationScene(scene, educationAsset, camera) {
    if (!educationAsset?.scene) return;
    this.educationAsset = educationAsset;
    this.educationGroup.clear();
    this.educationInteractiveMeshes = [];
    this.educationNodeMap.clear();
    this.educationNodeGroups.clear();

    this.educationGroup.add(educationAsset.scene);
    scene.add(this.educationGroup);

    this._setupWorldGeometry(educationAsset.scene, 'education', this.educationNodeGroups, this.educationNodeMap, this.educationInteractiveMeshes, educationAsset.animations);
    this.educationGroup.updateMatrixWorld(true);

    const eduTitles = {
      'education_root': 'EDUCATION',
      'sa_engineering_college': 'S.A. ENGINEERING COLLEGE / B.E. CSE',
    };

    this.educationNodeGroups.forEach((groupObj, key) => {
      const title = eduTitles[key] || key.toUpperCase();
      const isRoot = key === 'education_root';
      this.v1LabelManager.createLabel(key, title, groupObj, 'education', isRoot ? 'root-core' : 'category', isRoot ? new THREE.Vector3(0, 0.95, 0) : new THREE.Vector3(0, 0.70, 0));
    });
  }

  /* ── 6. CONTACT GLB INITIALIZATION ── */
  initContactScene(scene, contactAsset, camera) {
    if (!contactAsset?.scene) return;
    this.contactAsset = contactAsset;
    this.contactGroup.clear();
    this.contactInteractiveMeshes = [];
    this.contactNodeMap.clear();
    this.contactNodeGroups.clear();

    this.contactGroup.add(contactAsset.scene);
    scene.add(this.contactGroup);

    this._setupWorldGeometry(contactAsset.scene, 'contact', this.contactNodeGroups, this.contactNodeMap, this.contactInteractiveMeshes, contactAsset.animations);
    this.contactGroup.updateMatrixWorld(true);

    const contactTitles = {
      'contact_root': 'GET IN TOUCH',
      'contact_email': 'EMAIL',
      'contact_linkedin': 'LINKEDIN',
      'contact_github': 'GITHUB',
      'contact_resume': 'RESUME PDF',
    };

    this.contactNodeGroups.forEach((groupObj, key) => {
      const title = contactTitles[key] || key.toUpperCase();
      const isRoot = key === 'contact_root';
      this.v1LabelManager.createLabel(key, title, groupObj, 'contact', isRoot ? 'root-core' : 'category', isRoot ? new THREE.Vector3(0, 0.95, 0) : new THREE.Vector3(0, 0.70, 0));
    });
  }

  /* ── PRECISE GEOMETRY & MATERIAL SETUP FOR ALL GLB WORLDS ── */
  _setupWorldGeometry(rootScene, worldKey, nodeGroupsMap, nodeMap, interactiveMeshesArr, animations = []) {
    // 1. Setup AnimationMixer from gltf.animations array (LoopOnce + clampWhenFinished to prevent repeat flickering)
    if (animations && animations.length > 0) {
      const mixer = new THREE.AnimationMixer(rootScene);
      for (const clip of animations) {
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.play();
      }
      this.mixers.set(worldKey, mixer);
    }

    // 2. Traverse scene geometry preserving Blender-authored transforms
    rootScene.traverse((obj) => {
      const nm = obj.name || '';
      obj.visible = true;
      obj.frustumCulled = false;

      // Guarantee core/shell child meshes are centered (0,0,0) inside parent container while retaining GLB-authored scale
      if (nm.endsWith('_core') || nm.endsWith('_shell')) {
        obj.position.set(0, 0, 0);
        if (obj.scale.x === 0 && obj.scale.y === 0 && obj.scale.z === 0) {
          obj.scale.set(1, 1, 1);
        }
      }

      if (nm.includes('->') || nm.includes('curve')) {
        obj.scale.set(1, 1, 1);
      }

      // Register group container nodes starting with 'Node_'
      if (nm.startsWith('Node_')) {
        const key = nm.replace('Node_', '');
        nodeGroupsMap.set(key, obj);
        if (obj.scale.x === 0 && obj.scale.y === 0 && obj.scale.z === 0) {
          obj.scale.set(1, 1, 1);
        }
      }

      // Hide text-only meshes ending with '_label' and 16th duplicate 'git' node in skills world
      if (nm.endsWith('_label') || (worldKey === 'skills' && (nm === 'Node_git' || nm.startsWith('git_') || nm === 'git'))) {
        obj.visible = false;
        return;
      }

      // Configure 3D node sphere cores, wireframe shells, and edge lines
      if (obj.isMesh) {
        const destId = this._destId(nm) || nm;
        obj.userData.destId = destId;
        obj.userData.world = worldKey;

        // Apply relative node sphere geometry scale for Skills world so spheres match Blender spacing cleanly
        if (worldKey === 'skills') {
          if (nm.includes('skills_root')) {
            obj.scale.set(0.88, 0.88, 0.88);
          } else if (nm.includes('category')) {
            obj.scale.set(0.62, 0.62, 0.62);
          } else if (nm.endsWith('_core') || nm.endsWith('_shell')) {
            obj.scale.set(0.42, 0.42, 0.42);
          }
        }

        if (nm.endsWith('_core')) {
          obj.material = new THREE.MeshStandardMaterial({
            color: 0x00ff88, emissive: 0x009955, emissiveIntensity: 0.55,
            roughness: 0.22, metalness: 0.06, side: THREE.FrontSide
          });
          obj.userData.origEmissive = 0x009955;
          obj.userData.origEmissiveIntensity = 0.55;

          if (!nodeMap.has(destId)) nodeMap.set(destId, []);
          nodeMap.get(destId).push(obj);
          interactiveMeshesArr.push(obj);
        } else if (nm.endsWith('_shell')) {
          obj.material = new THREE.MeshStandardMaterial({
            color: 0x00ff88, emissive: 0x003322, emissiveIntensity: 0.25,
            roughness: 0.35, wireframe: true, transparent: true, opacity: 0.40, side: THREE.DoubleSide
          });
        } else if (nm.includes('->') || nm.includes('curve')) {
          // Preserve authored edge curve geometry and scale
          obj.material = new THREE.MeshStandardMaterial({
            color: 0x00ff88, emissive: 0x00cc77, emissiveIntensity: 0.65,
            transparent: true, opacity: 0.85, side: THREE.DoubleSide
          });
        }
      }
    });
  }

  /* ── EXPLICIT 1-WORLD VISIBILITY CONTROL ── */
  setActiveWorld(worldId) {
    this.activeWorld = worldId;
    this.homeGroup.visible        = (worldId === 'home');
    this.projectsGroup.visible    = (worldId === 'projects');
    this.skillsGroup.visible      = (worldId === 'skills');
    this.experienceGroup.visible  = (worldId === 'experience');
    this.educationGroup.visible   = (worldId === 'education');
    this.contactGroup.visible     = (worldId === 'contact');

    if (this.v1LabelManager) {
      this.v1LabelManager.fadeInWorldLabels(worldId, 450);
    }
  }

  getRaycastTargets() {
    switch (this.activeWorld) {
      case 'projects':   return this.projectsInteractiveMeshes;
      case 'skills':     return this.skillsInteractiveMeshes;
      case 'experience': return this.experienceInteractiveMeshes;
      case 'education':  return this.educationInteractiveMeshes;
      case 'contact':    return this.contactInteractiveMeshes;
      default:           return this.homeGroup.visible ? this.interactiveMeshes : [];
    }
  }

  setHoveredNode(activeId) {
    if (this.hoveredId === activeId) return;
    this.hoveredId = activeId;
    let targetMap = this.nodeMap;
    if (this.activeWorld === 'projects') targetMap = this.projectsNodeMap;
    else if (this.activeWorld === 'skills') targetMap = this.skillsNodeMap;
    else if (this.activeWorld === 'experience') targetMap = this.experienceNodeMap;
    else if (this.activeWorld === 'education') targetMap = this.educationNodeMap;
    else if (this.activeWorld === 'contact') targetMap = this.contactNodeMap;

    for (const [destId, meshList] of targetMap) {
      const isHov = destId === activeId;
      for (const mesh of meshList) {
        if (!mesh.material?.emissive) continue;
        if (isHov) {
          mesh.material.emissive.setHex(0x44ffaa);
          mesh.material.emissiveIntensity = 0.90;
        } else {
          mesh.material.emissive.setHex(mesh.userData.origEmissive ?? 0x009955);
          mesh.material.emissiveIntensity = mesh.userData.origEmissiveIntensity ?? 0.55;
        }
      }
    }
  }

  playWorldAnimation(worldKey) {
    let maxClipDuration = 1.0;
    const mixer = this.mixers.get(worldKey);
    if (mixer) {
      mixer.stopAllAction();
      mixer.time = 0;
      if (mixer._actions) {
        for (const action of mixer._actions) {
          if (action) {
            action.reset();
            action.enabled = true;
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            action.setEffectiveTimeScale(1);
            action.setEffectiveWeight(1);
            action.play();
            if (action._clip?.duration) {
              maxClipDuration = Math.max(maxClipDuration, action._clip.duration);
            }
          }
        }
      }
    }

    // Hide labels immediately when world entrance animation starts
    if (this.v1LabelManager) {
      this.v1LabelManager.hideWorldLabels(worldKey);
      // Wait for GLB entrance animation completion (maxClipDuration * 1000ms) before fading in labels!
      const animationDurationMs = Math.round(maxClipDuration * 1000);
      this.v1LabelManager.fadeInWorldLabels(worldKey, animationDurationMs);
    }
  }

  updateIdleMotion(currentTime, delta, camera) {
    const activeMixer = this.mixers.get(this.activeWorld);
    if (activeMixer) {
      activeMixer.update(delta);
    }

    if (this.v1LabelManager && camera) {
      this.v1LabelManager.update(camera, this.activeWorld);
    }
  }

  computeNetworkBounds() {
    if (!this.homeAsset?.scene) return null;
    this.homeGroup.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(this.homeGroup);
  }

  computeProjectsBounds() {
    if (!this.projectsAsset?.scene) return null;
    this.projectsGroup.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(this.projectsGroup);
  }

  computeSkillsBounds() {
    if (!this.skillsAsset?.scene) return null;
    this.skillsGroup.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(this.skillsGroup);
  }

  computeExperienceBounds() {
    if (!this.experienceAsset?.scene) return null;
    this.experienceGroup.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(this.experienceGroup);
  }

  computeEducationBounds() {
    if (!this.educationAsset?.scene) return null;
    this.educationGroup.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(this.educationGroup);
  }

  computeContactBounds() {
    if (!this.contactAsset?.scene) return null;
    this.contactGroup.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(this.contactGroup);
  }

  _destId(name) {
    if (!name) return null;
    let clean = name;
    if (clean.startsWith('Node_')) clean = clean.replace('Node_', '');
    if (clean.endsWith('_core')) clean = clean.slice(0, -5);
    if (clean.endsWith('_shell')) clean = clean.slice(0, -6);
    return clean;
  }
}

export const sceneController = new SceneController();
