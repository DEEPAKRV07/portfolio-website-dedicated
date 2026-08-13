import * as THREE from 'three';

/* ──────────────────────────────────────────────────────────────
   V1 DOM Projected Label Manager (Exact V1 Architecture)
   
   Creates crisp, browser-rendered HTML graph-label elements using the Deltha
   font. Projects node world positions through the camera every frame to NDC
   screen coordinates, eliminating 3D mesh mirroring, edge-on text, or flipping.
────────────────────────────────────────────────────────────── */
export class V1DOMLabelManager {
  constructor() {
    this.labels = []; // Array of label objects { id, text, object, world, offset, element, type }
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

    // Remove existing label with same ID & world
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
    el.style.letterSpacing = '0.12em';
    el.style.color = '#ffffff';
    el.style.textShadow = '0 0 16px rgba(0, 255, 136, 0.45), 0 2px 4px rgba(0, 0, 0, 0.9)';
    el.style.pointerEvents = 'none';
    el.style.whiteSpace = 'nowrap';
    el.style.userSelect = 'none';
    el.style.willChange = 'transform, opacity';

    if (type === 'root-core') {
      el.style.fontSize = '18px';
      el.style.color = '#ffffff';
      el.style.textShadow = '0 0 20px rgba(0, 255, 136, 0.60), 0 2px 6px rgba(0, 0, 0, 0.95)';
    } else if (type === 'skill-subnode') {
      el.style.fontSize = '12px';
      el.style.fontWeight = '600';
      el.style.opacity = '0.88';
    } else {
      el.style.fontSize = '14px';
    }

    this.container.appendChild(el);

    this.labels.push({
      id,
      text,
      object,
      world,
      type,
      offset: offset.clone(),
      element: el,
    });
  }

  update(camera, activeWorld) {
    if (!camera) return;

    const _tmpPos = new THREE.Vector3();
    const halfW = window.innerWidth * 0.5;
    const halfH = window.innerHeight * 0.5;

    for (let i = 0; i < this.labels.length; i++) {
      const label = this.labels[i];
      if (label.world !== activeWorld || !label.object) {
        label.element.style.display = 'none';
        continue;
      }

      label.object.updateMatrixWorld(true);
      label.object.getWorldPosition(_tmpPos);
      _tmpPos.add(label.offset);

      _tmpPos.project(camera);

      if (_tmpPos.z > 1.0 || _tmpPos.z < -1.0) {
        label.element.style.display = 'none';
        continue;
      }

      const screenX = (_tmpPos.x * halfW) + halfW;
      const screenY = (-(_tmpPos.y * halfH)) + halfH;

      label.element.style.display = 'block';
      label.element.style.transform = `translate3d(${screenX}px, ${screenY}px, 0px) translate(-50%, -50%)`;
    }
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

    this._setupWorldGeometry(homeAsset.scene, 'home', this.nodeGroups, this.nodeMap, this.interactiveMeshes);
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
        const offset = key === 'hero' ? new THREE.Vector3(0, 0.95, 0) : new THREE.Vector3(0, 0.75, 0);
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

    this._setupWorldGeometry(projectsAsset.scene, 'projects', this.projectsNodeGroups, this.projectsNodeMap, this.projectsInteractiveMeshes);
    this.projectsGroup.updateMatrixWorld(true);

    const projectTitles = {
      'projects_root': 'ENGINEERING PROJECTS',
      'sightmate': 'SIGHTMATE',
      'football': 'FOOTBALL ANALYSIS',
      'forcrux': 'FORCRUX',
      'google-maps': 'GOOGLE MAPS PLATFORM',
      'kaatchi': 'KAATCHI MEDIA',
    };

    this.projectsNodeGroups.forEach((groupObj, key) => {
      const title = projectTitles[key];
      if (title) {
        const offset = key === 'projects_root' ? new THREE.Vector3(0, 1.10, 0) : new THREE.Vector3(0, 0.85, 0);
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

    this._setupWorldGeometry(skillsAsset.scene, 'skills', this.skillsNodeGroups, this.skillsNodeMap, this.skillsInteractiveMeshes);
    this.skillsGroup.updateMatrixWorld(true);

    const categories = ['cv-category', 'dl-category', 'systems-category', 'lang-category'];
    const skillTitles = {
      'skills_root': 'SKILLS & TECHNOLOGIES',
      'cv-category': 'COMPUTER VISION',
      'dl-category': 'DEEP LEARNING & AI',
      'systems-category': 'SYSTEMS & DEPLOYMENT',
      'lang-category': 'LANGUAGES & TOOLS',
      'yolov8': 'YOLOv8',
      'bytetrack': 'ByteTrack',
      'opencv': 'OpenCV',
      'fast-scnn': 'Fast-SCNN',
      'pytorch': 'PyTorch',
      'tensorflow': 'TensorFlow Lite',
      'ml-kit': 'Google ML Kit',
      'kmeans': 'K-Means',
      'playwright': 'Playwright',
      'sqlite': 'SQLite',
      'concurrency': 'ThreadPoolExecutor',
      'pandas': 'Pandas',
      'python': 'Python',
      'flutter': 'Flutter / Dart',
      'nextjs': 'Next.js',
      'git': 'Git & GitHub',
    };

    this.skillsNodeGroups.forEach((groupObj, key) => {
      const title = skillTitles[key] || key.toUpperCase();
      const isRoot = key === 'skills_root';
      const isCategory = categories.includes(key);
      const type = isRoot ? 'root-core' : (isCategory ? 'category' : 'skill-subnode');
      const offset = isRoot ? new THREE.Vector3(0, 1.10, 0) : (isCategory ? new THREE.Vector3(0, 0.85, 0) : new THREE.Vector3(0, 0.48, 0));
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

    this._setupWorldGeometry(experienceAsset.scene, 'experience', this.experienceNodeGroups, this.experienceNodeMap, this.experienceInteractiveMeshes);
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
      this.v1LabelManager.createLabel(key, title, groupObj, 'experience', isRoot ? 'root-core' : 'category', isRoot ? new THREE.Vector3(0, 1.10, 0) : new THREE.Vector3(0, 0.85, 0));
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

    this._setupWorldGeometry(educationAsset.scene, 'education', this.educationNodeGroups, this.educationNodeMap, this.educationInteractiveMeshes);
    this.educationGroup.updateMatrixWorld(true);

    const eduTitles = {
      'education_root': 'EDUCATION',
      'sa_engineering_college': 'S.A. ENGINEERING COLLEGE / B.E. CSE',
    };

    this.educationNodeGroups.forEach((groupObj, key) => {
      const title = eduTitles[key] || key.toUpperCase();
      const isRoot = key === 'education_root';
      this.v1LabelManager.createLabel(key, title, groupObj, 'education', isRoot ? 'root-core' : 'category', isRoot ? new THREE.Vector3(0, 1.10, 0) : new THREE.Vector3(0, 0.85, 0));
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

    this._setupWorldGeometry(contactAsset.scene, 'contact', this.contactNodeGroups, this.contactNodeMap, this.contactInteractiveMeshes);
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
      this.v1LabelManager.createLabel(key, title, groupObj, 'contact', isRoot ? 'root-core' : 'category', isRoot ? new THREE.Vector3(0, 1.10, 0) : new THREE.Vector3(0, 0.85, 0));
    });
  }

  /* ── PRECISE GEOMETRY & MATERIAL SETUP FOR ALL GLB WORLDS ── */
  _setupWorldGeometry(rootScene, worldKey, nodeGroupsMap, nodeMap, interactiveMeshesArr) {
    rootScene.traverse((obj) => {
      const nm = obj.name || '';
      obj.visible = true;
      obj.frustumCulled = false;

      // Guarantee full scale (1, 1, 1) and zero position offsets for Blender core/shell/node objects
      if (nm.endsWith('_core') || nm.endsWith('_shell')) {
        obj.position.set(0, 0, 0);
        obj.scale.set(1, 1, 1);
      }

      // Register group container nodes starting with 'Node_' and enforce scale (1, 1, 1)
      if (nm.startsWith('Node_')) {
        obj.scale.set(1, 1, 1);
        const key = nm.replace('Node_', '');
        nodeGroupsMap.set(key, obj);
      }

      // Hide ONLY text-only meshes ending with '_label'
      if (nm.endsWith('_label')) {
        obj.visible = false;
        return;
      }

      // Configure 3D node sphere cores, wireframe shells, and edge lines
      if (obj.isMesh) {
        const destId = this._destId(nm) || nm;
        obj.userData.destId = destId;
        obj.userData.world = worldKey;

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
        } else if (nm.includes('->')) {
          obj.material = new THREE.MeshStandardMaterial({
            color: 0x00ff88, emissive: 0x009955, emissiveIntensity: 0.45,
            transparent: true, opacity: 0.70
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

  updateIdleMotion(currentTime, delta, camera) {
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
    if (name.includes('hero'))       return 'core';
    if (name.includes('about'))      return 'about';
    if (name.includes('projects'))   return 'projects';
    if (name.includes('skills'))     return 'skills';
    if (name.includes('experience')) return 'experience';
    if (name.includes('education'))  return 'education';
    if (name.includes('contact'))    return 'contact';
    return null;
  }
}

export const sceneController = new SceneController();
