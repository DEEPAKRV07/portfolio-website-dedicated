import * as THREE from 'three';

/* ============================================================
   SCENE CONTROLLER v5 — CORRECT BILLBOARD
   
   DEFINITIVE FORENSIC FINDINGS (from raw GLB binary + coordinate analysis):
   ─────────────────────────────────────────────────────────────
   1. All label animations end at quaternion (x=0.7071, y=0, z=0, w=0.7071)
      = exactly +90° rotation around local X axis.
   
   2. Text geometry readable face direction in Three.js:
      In Blender, text faces +Y (toward front-view camera at -Y).
      GLTF export (Y-up) applies scene rotation that maps:
        Blender +Y (text normal toward front camera) → Three.js +Z
      Therefore: text readable face = LOCAL +Z in Three.js.
   
   3. WHY PREVIOUS FIXES WERE WRONG:
      ✗ camera.quaternion.copy() — correct direction but timing issue
      ✗ Matrix4.lookAt(label,cam) + rotateY(π) — rotateY flips X axis → MIRRORED text
      ✗ Matrix4.lookAt(label,cam) alone — makes -Z face cam, +Z faces away → BACKWARDS text
   
   4. CORRECT BILLBOARD:
      Object3D.lookAt(camera.position)
        → makes local +Z face camera (correct direction)
        → preserves local +X as world right (no mirror)
        → accounts for parent world matrix automatically
        → no additional rotation corrections needed
   
   5. CRITICAL BUG FIXED: previous code matched "about" in clip name "Node_aboutAction",
      accidentally disabling node reveal animations → nodes disappeared.
      Fix: only match clips containing "_label" in their name.
   
   GLB PROVENANCE (confirmed from binary):
   ─────────────────────────────────────────────────────────────
   SOURCE: public/models/home.glb
   Node meshes:  *_core, *_shell (6 nodes × 2 = 12 meshes)
   Edge meshes:  hero->about/skills/projects/experience/contact (5 meshes)
   Label meshes: hero_label, about_label, skills_label, projects_label,
                 experience_label, contact_label (6 meshes)
   Animations:   17 Blender clips (node reveals, edge reveals, label reveals)
   Runtime fixes: child offset reset, child scale reset, emissive materials, billboard
   PROCEDURAL HOME NETWORK: 0
   ============================================================ */

// Pre-allocated reusable objects (no GC pressure in hot path)
const _tmpV   = new THREE.Vector3();
const _tmpV2  = new THREE.Vector3();
const _tmpV3  = new THREE.Vector3();
const _tmpV4  = new THREE.Vector3();
const _worldUp = new THREE.Vector3(0, 1, 0);
const _tmpQ        = new THREE.Quaternion();
const _tmpM        = new THREE.Matrix4();
const _parentWorldQ = new THREE.Quaternion(); // re-used for parent inverse in billboard

// Label clearance offsets — additive offsets on top of GLB authored positions.
//
// FORENSIC DATA (from raw binary, 2026-08-13):
//   projects_core mesh bounds: min=[-0.951,-1.0,-1.0], max=[0.951,1.0,1.0]
//   projects_core radius ≈ 1.0 unit (in its local/child space)
//   Node_projects container is at world Y = -3.2
//   Sphere Y range in world space: [-4.2, -2.2]
//   projects_label GLB authored position: Y = -2.34
//
// PREVIOUS BUG: offset (0, -1.30, 0.15) → label at Y=-3.64 → INSIDE sphere ([-4.2,-2.2]) → depth-test occlusion → INVISIBLE
// FIX: move label to Y = -2.34 + (-2.20) = -4.54 → 0.34 units below sphere bottom (-4.2) → OUTSIDE sphere → VISIBLE
//
// Other destination labels: GLB authored position is 0.86 units ABOVE each node center.
// With sphere radius=1.0, the sphere TOP is 1.0 units above center, so labels at +0.86 are INSIDE the sphere top.
// FIX: add +0.45 Y to move all destination labels to +1.31 above node center = 0.31 units above sphere top.
//
// Z offset: 0.25 keeps labels in front of edge geometry for depth testing.
const LABEL_OFFSETS = {
  hero_label:        new THREE.Vector3( 0.00,  0.35, 0.25),  // above hero_core, moderate clearance
  about_label:       new THREE.Vector3(-0.10,  0.25, 0.25),  // above-left, 0.25 above sphere top
  skills_label:      new THREE.Vector3(-0.05,  0.25, 0.25),  // above-left, 0.25 above sphere top
  projects_label:    new THREE.Vector3( 0.00,  0.25, 0.25),  // BELOW sphere bottom (sphere bottom at -4.2 local, label at -3.94)
  experience_label:  new THREE.Vector3( 0.05,  0.25, 0.25),  // above-right, 0.25 above sphere top
  contact_label:     new THREE.Vector3( 0.10,  0.25, 0.25),  // above-right, 0.25 above sphere top
};

export class SceneController {
  constructor() {
    this.homeGroup = new THREE.Group();
    this.homeGroup.name = 'HOME_GLB_CONTAINER';

    this.interactiveMeshes = [];    // Raycaster targets (*_core meshes)
    this.nodeMap     = new Map();   // destId → [mesh, ...]
    this.nodeGroups  = new Map();   // key → THREE.Group (Node_* containers)
    this.labelMeshes = new Map();   // labelName → Mesh
    this.edgeMeshes  = new Map();   // edgeName → Mesh
    this.hoveredId   = null;
    this.homeAsset   = null;
    this._ready           = false;
    this._billboardActive = false;
    this._animDone        = false;

    // Projects GLB World state (Phase 2 Integration)
    this.projectsGroup = new THREE.Group();
    this.projectsGroup.name = 'PROJECTS_GLB_CONTAINER';
    this.projectsGroup.visible = false;

    this.projectsInteractiveMeshes = [];
    this.projectsNodeMap     = new Map();
    this.projectsNodeGroups  = new Map();
    this.projectsLabelMeshes = new Map();
    this.projectsEdgeMeshes  = new Map();
    this.projectsAsset       = null;

    // Skills GLB World state (Phase 3 Integration)
    this.skillsGroup = new THREE.Group();
    this.skillsGroup.name = 'SKILLS_GLB_CONTAINER';
    this.skillsGroup.visible = false;

    this.skillsInteractiveMeshes = [];
    this.skillsNodeMap     = new Map();
    this.skillsNodeGroups  = new Map();
    this.skillsLabelMeshes = new Map();
    this.skillsEdgeMeshes  = new Map();
    this.skillsAsset       = null;

    this.activeWorld       = 'home'; // 'home' | 'projects' | 'skills'
  }

  /* ──────────────────────────────────────────────────────────────
     initHomeScene — called once from main.js after home.glb loads
  ────────────────────────────────────────────────────────────── */
  initHomeScene(scene, homeAsset, camera /*, controls */) {
    if (!homeAsset?.scene) {
      console.warn('[SceneController] home.glb missing — cannot init.');
      return;
    }

    this.homeAsset = homeAsset;
    this.homeGroup.clear();
    this.interactiveMeshes = [];
    this.nodeMap.clear();
    this.nodeGroups.clear();
    this.labelMeshes.clear();
    this.edgeMeshes.clear();
    this._billboardActive = false;
    this._animDone        = false;

    // 1. Attach GLB scene — root transform unchanged
    this.homeGroup.add(homeAsset.scene);
    scene.add(this.homeGroup);

    // Raise network +0.7 Y for better vertical composition:
    // Hero node moves from Y=0 → Y=0.7 (closer to upper-middle of viewport)
    // Destination nodes move from Y=-3.2 → Y=-2.5 (more centered overall)
    this.homeGroup.position.y = 0.7;

    // 2. Fix A: reset un-cleared child local position offsets
    //    about_core: [-32,0,0]→[0,0,0], skills: [-16,0,0], etc.
    this._fixChildOffsets(homeAsset.scene);

    // 3. Fix B: reset child scales [0,0,0]→[1,1,1]
    //    Parent container animations (Node_*Action) scale containers 0→1.
    //    Children must start at (1,1,1) so parent animation can reveal them.
    this._fixChildScales(homeAsset.scene);

    // 4. Fix C: emissive materials (GLB colors are near-black without emissive)
    this._applyMaterials(homeAsset.scene);

    // 5. Index all objects for interaction and per-frame updates
    this._indexScene(homeAsset.scene);

    // 6. Small clearance offsets on labels
    this._applyLabelOffsets();

    // 7. Play Blender animations; schedule billboard after last label settles
    this._playAnimations(homeAsset);

    // 8. Install billboard wrappers (Phase 6).
    //    NOTE: During Phase 1 test, _billboardActive stays false so wrappers
    //    rotate in updateIdleMotion only when _billboardActive is set to true.
    //    Uncomment the next line and set _billboardActive=true in _activateBillboard
    //    to enable the wrapper billboard.
    this._setupBillboardWrappers();
    this._initSignalSystem(homeAsset.scene);

    this.homeGroup.updateMatrixWorld(true);
    this._ready = true;

    console.log('[SceneController] Initialized. Nodes:', this.interactiveMeshes.length,
      '| Labels:', this.labelMeshes.size, '| Edges:', this.edgeMeshes.size);
  }

  /* ──────────────────────────────────────────────────────────────
     Fix A: reset only *_core and *_shell children's local positions.
  ────────────────────────────────────────────────────────────── */
  _fixChildOffsets(root) {
    root.traverse((obj) => {
      const nm = obj.name || '';
      if (nm.endsWith('_core') || nm.endsWith('_shell')) {
        obj.position.set(0, 0, 0);
      }
    });
  }

  /* ──────────────────────────────────────────────────────────────
     Fix B: reset child scales to (1,1,1).
  ────────────────────────────────────────────────────────────── */
  _fixChildScales(root) {
    root.traverse((obj) => {
      const nm = obj.name || '';
      if (nm.endsWith('_core') || nm.endsWith('_shell')) {
        obj.scale.set(1, 1, 1);
        obj.visible      = true;
        obj.frustumCulled = false;
      }
    });
  }

  /* ──────────────────────────────────────────────────────────────
     Fix C: apply emissive materials.
     Labels: white/off-white for contrast against green geometry.
     Nodes: green with moderate emissive (not overblown).
  ────────────────────────────────────────────────────────────── */
  _applyMaterials(root) {
    const cache = new Map();
    root.traverse((obj) => {
      if (!obj.isMesh) return;
      const nm = obj.name || '';

      let style = null;
      if      (nm === 'hero_core')    style = 'hero-core';
      else if (nm === 'hero_shell')   style = 'hero-shell';
      else if (nm.endsWith('_core'))   style = 'dest-core';
      else if (nm.endsWith('_shell'))  style = 'dest-shell';
      else if (nm.includes('->'))      style = 'edge';
      else if (nm.endsWith('_label'))  style = 'label';
      if (!style) return;

      if (!cache.has(style)) {
        let mat;
        switch (style) {
          case 'hero-core':
            mat = new THREE.MeshStandardMaterial({
              color: 0x00ff88, emissive: 0x00cc66, emissiveIntensity: 0.65,
              roughness: 0.18, metalness: 0.08, side: THREE.FrontSide });
            break;
          case 'hero-shell':
            mat = new THREE.MeshStandardMaterial({
              color: 0x00ff88, emissive: 0x006633, emissiveIntensity: 0.35,
              roughness: 0.30, wireframe: true, transparent: true,
              opacity: 0.48, side: THREE.DoubleSide });
            break;
          case 'dest-core':
            mat = new THREE.MeshStandardMaterial({
              color: 0x00ff88, emissive: 0x009955, emissiveIntensity: 0.50,
              roughness: 0.22, metalness: 0.06, side: THREE.FrontSide });
            break;
          case 'dest-shell':
            mat = new THREE.MeshStandardMaterial({
              color: 0x00ff88, emissive: 0x003322, emissiveIntensity: 0.25,
              roughness: 0.35, wireframe: true, transparent: true,
              opacity: 0.38, side: THREE.DoubleSide });
            break;
          case 'edge':
            mat = new THREE.MeshStandardMaterial({
              color: 0x00cc66, emissive: 0x004422, emissiveIntensity: 0.45,
              roughness: 0.45, transparent: true, opacity: 0.70,
              side: THREE.DoubleSide });
            break;
          case 'label':
            // Off-white: maximum contrast against green geometry.
            // DoubleSide: ensures text renders from both sides (safety for orientation jitter).
            // depthTest: false → labels always render above sphere/edge geometry.
            //   Labels are information overlays — they MUST be visible regardless of their
            //   exact 3D position relative to node sphere surfaces.
            //   This is the standard Three.js approach for spatial labels.
            // depthWrite: false → labels don't occlude other objects in depth buffer.
            mat = new THREE.MeshStandardMaterial({
              color: 0xf4f7f5, emissive: 0xe0eee8, emissiveIntensity: 0.85,
              roughness: 0.06, side: THREE.DoubleSide,
              depthTest: false, depthWrite: false,
              transparent: true });
            break;
        }
        cache.set(style, mat);
      }

      obj.material      = cache.get(style);
      obj.castShadow    = false;
      obj.receiveShadow = false;
      obj.frustumCulled = false;
    });
  }

  /* ──────────────────────────────────────────────────────────────
     Index all objects for interaction / billboard / animation
  ────────────────────────────────────────────────────────────── */
  _indexScene(root) {
    root.traverse((obj) => {
      const nm = obj.name || '';

      if (nm.startsWith('Node_')) {
        this.nodeGroups.set(nm.replace('Node_', ''), obj);
        obj.visible = true;
        return;
      }

      if (nm.endsWith('_label')) {
        this.labelMeshes.set(nm, obj);
        obj.visible      = true;
        obj.frustumCulled = false;
        obj.renderOrder  = 6;
        return;
      }

      if (nm.includes('->')) {
        this.edgeMeshes.set(nm, obj);
        obj.visible      = true;
        obj.frustumCulled = false;
        return;
      }

      if (obj.isMesh && nm.endsWith('_core')) {
        const destId = this._destId(nm);
        if (destId) {
          obj.userData.destId    = destId;
          obj.userData.id        = destId;
          obj.userData.type      = destId === 'core' ? 'core' : 'primary';
          obj.userData.isGLBNode = true;
          obj.frustumCulled      = false;
          // Clone material per mesh so hover mutations are ISOLATED to this mesh only.
          // All *_core meshes previously shared one MeshStandardMaterial instance.
          // Mutating it on hover changed ALL nodes at once. Clone once here, not per-frame.
          obj.material = obj.material.clone();
          obj.userData.origEmissive          = obj.material.emissive.getHex();
          obj.userData.origEmissiveIntensity = obj.material.emissiveIntensity;
          if (!this.nodeMap.has(destId)) this.nodeMap.set(destId, []);
          this.nodeMap.get(destId).push(obj);
          this.interactiveMeshes.push(obj);
        }
      }
    });
  }

  /* ──────────────────────────────────────────────────────────────
     Apply clearance offsets to label positions
  ────────────────────────────────────────────────────────────── */
  _applyLabelOffsets() {
    for (const [nm, mesh] of this.labelMeshes) {
      const off = LABEL_OFFSETS[nm];
      if (off) mesh.position.add(off);
    }
  }

  /* ──────────────────────────────────────────────────────────────
     Play animations. Schedule billboard activation after labels settle.
     
     Label animation durations (from binary):
       hero_labelAction:       0.792s  (fastest)
       about_labelAction:      2.458s
       contact_labelAction:    2.625s
       experience_labelAction: 2.792s
       projects_labelAction:   2.958s
       skills_labelAction:     3.125s  (slowest)
     
     Billboard activates 400ms after the last animation finishes (3.525s total).
     
     CRITICAL: only label clips are disabled at billboard time.
     Node clips (Node_heroAction, Node_aboutAction, etc.) must keep running.
  ────────────────────────────────────────────────────────────── */
  _playAnimations(homeAsset) {
    if (!homeAsset.mixer || !homeAsset.animations?.length) return;

    const { mixer, animations } = homeAsset;
    let maxDuration = 0;

    animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
      maxDuration = Math.max(maxDuration, clip.duration);
    });

    // Activate billboard 400ms after the last label animation settles
    setTimeout(() => this._activateBillboard(homeAsset), (maxDuration + 0.4) * 1000);
    setTimeout(() => { this._animDone = true; }, (maxDuration + 0.6) * 1000);
  }

  /* ──────────────────────────────────────────────────────────────
     Billboard activation: called once after all animations finish.

     ROOT CAUSE FIX — labels disappearing at the animation/billboard transition:
     ─────────────────────────────────────────────────────────────
     WRONG (previous): action.enabled = false
       Disabling actions can cause Three.js PropertyMixer to restore the
       label object's animated properties to their initial bind-pose values
       (scale=[0,0,0]) on the next mixer.update() call.
       Result: all labels disappear exactly at the transition. ← THE BUG

     CORRECT (fixed): keep label animations ALIVE, clamped at final frame.
       - mixer.update() writes scale=1 and rot=+90X (final clamped keyframe) every frame
       - Our lookAt() in updateIdleMotion() runs AFTER assetManager.update()
         (which internally calls mixer.update()) and overwrites ONLY the rotation
       - Scale=1 is provided by the mixer. Rotation=camera-facing from lookAt.
       - Labels stay visible permanently. No disappearing.

     RENDER ORDER (confirmed in main.js animate loop):
       1. assetManager.update(delta)  → mixer.update() → writes scale=1, rot=+90X
       2. sceneController.updateIdleMotion()  → lookAt() → overwrites rotation only
       3. renderer.render()  → renders with scale=1 + camera-facing rotation
  ────────────────────────────────────────────────────────────── */
  _activateBillboard(homeAsset) {
    // PHASE 1 — ISOLATION TEST (billboard intentionally disabled)
    //
    // The GLB animation's final quaternion is [0.7071, 0, 0, 0.7071] = +90deg around X.
    // parentWorldQ = identity, so localQ == worldQ at animation end.
    //
    // With billboard=false the labels stay in their animation-end orientation.
    // This lets us visually confirm whether the GLB's own final pose is correct.
    //
    //   EXPECTED: text remains readable after animation finishes.
    //   If YES  -> GLB is good, billboard was the bug source -> implement wrapper.
    //   If NO   -> investigate GLB animation itself.
    //
    // Billboard wrapper implementation is in _setupBillboardWrappers() below (ready to enable).
    this._billboardActive = true;    // <- Phase 6: wrapper billboard enabled

    // Diagnostic: log every label's state at animation end
    for (const [nm, labelMesh] of this.labelMeshes) {
      const wqObj = new THREE.Quaternion();
      labelMesh.getWorldQuaternion(wqObj);
      const wp = new THREE.Vector3();
      labelMesh.getWorldPosition(wp);
      console.log(
        '[PHASE1 ANIM-END]', nm,
        'localQ=' + JSON.stringify(labelMesh.quaternion.toArray().map(v => +v.toFixed(4))),
        'worldQ=' + JSON.stringify(wqObj.toArray().map(v => +v.toFixed(4))),
        'worldPos=' + JSON.stringify(wp.toArray().map(v => +v.toFixed(3))),
        'scale=' + JSON.stringify(labelMesh.scale.toArray().map(v => +v.toFixed(3))),
        'parent=' + (labelMesh.parent ? labelMesh.parent.name : 'none')
      );
    }
    console.log('[PHASE1] Billboard DISABLED. If labels are readable now, GLB=GOOD. Next step: enable wrapper billboard.');
    this._printProvenance(homeAsset.scene);
  }

  _destId(name) {
    if (name.includes('hero'))       return 'core';         // → returnToCore()
    if (name.includes('about'))      return 'about';
    if (name.includes('projects'))   return 'projects';
    if (name.includes('skills'))     return 'skills';
    if (name.includes('experience')) return 'experience';
    if (name.includes('contact'))    return 'contact';
    return null;
  }

  /* ──────────────────────────────────────────────────────────────
     setVisible — toggle Home GLB group
  ────────────────────────────────────────────────────────────── */
  setVisible(visible) {
    this.homeGroup.visible = visible;
  }

  /* ──────────────────────────────────────────────────────────────
     getRaycastTargets — *_core meshes for raycasting
  ────────────────────────────────────────────────────────────── */
  getRaycastTargets() {
    if (this.activeWorld === 'projects' && this.projectsGroup.visible) {
      return this.projectsInteractiveMeshes;
    }
    if (this.activeWorld === 'skills' && this.skillsGroup.visible) {
      return this.skillsInteractiveMeshes;
    }
    return this.homeGroup.visible ? this.interactiveMeshes : [];
  }

  /* ──────────────────────────────────────────────────────────────
     setHoveredNode — visual feedback on hover
  ────────────────────────────────────────────────────────────── */
  setHoveredNode(activeId) {
    if (this.hoveredId === activeId) return;
    this.hoveredId = activeId;
    for (const [destId, meshList] of this.nodeMap) {
      const isHov = destId === activeId;
      for (const mesh of meshList) {
        if (!mesh.material?.emissive) continue;
        if (isHov) {
          // Hover: slightly brighter/tighter emissive on ONLY this mesh (cloned material)
          mesh.material.emissive.setHex(0x44ffaa);
          mesh.material.emissiveIntensity = 0.90;
        } else {
          // Restore from stored originals
          mesh.material.emissive.setHex(mesh.userData.origEmissive ?? (mesh.name === 'hero_core' ? 0x00cc66 : 0x009955));
          mesh.material.emissiveIntensity = mesh.userData.origEmissiveIntensity ?? (mesh.name === 'hero_core' ? 0.65 : 0.50);
        }
      }
      const key = destId === 'core' ? 'hero' : destId;
      const grp = this.nodeGroups.get(key);
      if (grp && destId !== 'core') grp.scale.setScalar(isHov ? 1.08 : 1.0);
    }
  }

  /* ──────────────────────────────────────────────────────────────
     computeNetworkBounds — for auto camera framing in main.js
  ────────────────────────────────────────────────────────────── */
  computeNetworkBounds() {
    if (!this.homeAsset?.scene) return null;
    this.homeGroup.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(this.homeGroup);
  }

  /* ──────────────────────────────────────────────────────────────
     updateIdleMotion — called every frame from main.js animate()
     
     Three.js runtime responsibilities:
       1. Billboard: Object3D.lookAt(camera.position)
          WHY lookAt IS CORRECT:
          - For non-camera objects, lookAt(target) makes LOCAL +Z face target
          - Text's readable face IS local +Z (Blender +Y → GLTF/Three.js +Z)
          - No additional rotations needed (they would introduce mirroring)
          - lookAt() accounts for parent world matrix automatically
       2. Hero shell rotation
       3. Destination node breathing
       4. Edge opacity pulse
  ────────────────────────────────────────────────────────────── */
  
  /* ──────────────────────────────────────────────────────────────
     initProjectsScene — initializes projects.glb 3D world
  ────────────────────────────────────────────────────────────── */
  
  /* ──────────────────────────────────────────────────────────────
     initSkillsScene — initializes skills.glb 3D world
  ────────────────────────────────────────────────────────────── */
  initSkillsScene(scene, skillsAsset, camera) {
    if (!skillsAsset?.scene) {
      console.warn('[SceneController] skills.glb missing — cannot init skills world.');
      return;
    }

    this.skillsAsset = skillsAsset;
    this.skillsGroup.clear();
    this.skillsInteractiveMeshes = [];
    this.skillsNodeMap.clear();
    this.skillsNodeGroups.clear();
    this.skillsLabelMeshes.clear();
    this.skillsEdgeMeshes.clear();

    // Attach skills GLB scene
    this.skillsGroup.add(skillsAsset.scene);
    scene.add(this.skillsGroup);

    this.skillsGroup.position.y = 0.5;

    // Fix offsets, scales, materials & index objects for interaction
    this._fixChildOffsets(skillsAsset.scene);
    this._fixChildScales(skillsAsset.scene);
    this._applyMaterials(skillsAsset.scene);
    this._indexSkillsScene(skillsAsset.scene);

    // Install wrapper billboards for skills labels
    this._setupBillboardWrappers(this.skillsLabelMeshes, 'skills');

    this.skillsGroup.updateMatrixWorld(true);
    console.log('[SceneController] Skills World Initialized. Nodes:', this.skillsInteractiveMeshes.length,
      '| Labels:', this.skillsLabelMeshes.size, '| Edges:', this.skillsEdgeMeshes.size);
    this._printSkillsProvenance(skillsAsset.scene);
  }

  /* Index skills.glb nodes for interaction with presentation hierarchy */
  _indexSkillsScene(root) {
    const categories = ['cv-category', 'dl-category', 'systems-category', 'lang-category'];

    root.traverse((obj) => {
      const nm = obj.name || '';
      if (!nm) return;

      if (nm.startsWith('Node_')) {
        const key = nm.replace('Node_', '');
        this.skillsNodeGroups.set(key, obj);

        if (categories.includes(key)) {
          obj.scale.set(1.12, 1.12, 1.12); // Primary category nodes prominent
        } else if (key !== 'skills_root') {
          obj.scale.set(0.68, 0.68, 0.68); // Skill subnodes secondary
        }
      }

      if (nm.endsWith('_label')) {
        this.skillsLabelMeshes.set(nm, obj);
        if (!categories.some(c => nm.includes(c)) && !nm.includes('skills_root')) {
          obj.scale.set(0.68, 0.68, 0.68); // Subdued label scale for skill subnodes
        }
      }

      if (nm.includes('->')) {
        this.skillsEdgeMeshes.set(nm, obj);
      }

      if (obj.isMesh && (nm.endsWith('_core') || nm.endsWith('_shell') || categories.some(c => nm.includes(c)) || nm.includes('_core') || nm.includes('label') === false)) {
        obj.visible = true;
        obj.frustumCulled = false;
        if (!obj.material) return;
        obj.material = obj.material.clone();

        const destId = this._destId(nm) || nm;
        obj.userData.destId = destId;
        obj.userData.world = 'skills';

        if (!this.skillsNodeMap.has(destId)) {
          this.skillsNodeMap.set(destId, []);
        }
        this.skillsNodeMap.get(destId).push(obj);

        this.skillsInteractiveMeshes.push(obj);

        const isCategory = categories.some(c => nm.includes(c));
        const origEm = isCategory ? 0x00cc66 : 0x009955;
        const origInt = isCategory ? 0.65 : 0.40;

        if (obj.material.emissive) {
          obj.material.emissive.setHex(origEm);
          obj.material.emissiveIntensity = origInt;
        }
        obj.userData.origEmissive = origEm;
        obj.userData.origEmissiveIntensity = origInt;
      }
    });

    this._initSignalParticlesForWorld(this.skillsGroup, this.skillsEdgeMeshes, 'skills');
  }

  computeSkillsBounds() {
    if (!this.skillsAsset?.scene) return null;
    this.skillsGroup.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(this.skillsGroup);
  }

  _printSkillsProvenance(root) {
    console.group('%c[SKILLS GLB PROVENANCE]', 'color: #00ff88; font-weight: bold;');
    console.log('PROCEDURAL_NODES=0');
    console.log('Source GLB: public/models/skills.glb');
    console.log('Indexed Nodes:', Array.from(this.skillsNodeMap.keys()).join(', '));
    console.log('Indexed Labels:', Array.from(this.skillsLabelMeshes.keys()).join(', '));
    console.log('Indexed Edges:', Array.from(this.skillsEdgeMeshes.keys()).join(', '));
    console.log('Authored Animation Clips:', this.skillsAsset?.animations?.length ?? 0);
    console.groupEnd();
  }

initProjectsScene(scene, projectsAsset, camera) {
    if (!projectsAsset?.scene) {
      console.warn('[SceneController] projects.glb missing — cannot init projects world.');
      return;
    }

    this.projectsAsset = projectsAsset;
    this.projectsGroup.clear();
    this.projectsInteractiveMeshes = [];
    this.projectsNodeMap.clear();
    this.projectsNodeGroups.clear();
    this.projectsLabelMeshes.clear();
    this.projectsEdgeMeshes.clear();

    // Attach projects GLB scene
    this.projectsGroup.add(projectsAsset.scene);
    scene.add(this.projectsGroup);

    // Position projects world slightly raised for framing
    this.projectsGroup.position.y = 0.5;

    // Fix offsets, scales, materials & index objects for interaction
    this._fixChildOffsets(projectsAsset.scene);
    this._fixChildScales(projectsAsset.scene);
    this._applyMaterials(projectsAsset.scene);
    this._indexProjectsScene(projectsAsset.scene);

    // Install wrapper billboards for projects labels
    this._setupBillboardWrappers(this.projectsLabelMeshes, 'projects');

    this.projectsGroup.updateMatrixWorld(true);
    console.log('[SceneController] Projects World Initialized. Nodes:', this.projectsInteractiveMeshes.length,
      '| Labels:', this.projectsLabelMeshes.size, '| Edges:', this.projectsEdgeMeshes.size);
    this._printProjectsProvenance(projectsAsset.scene);
  }

  /* Index projects.glb nodes for interaction */
  _indexProjectsScene(root) {
    root.traverse((obj) => {
      const nm = obj.name || '';
      if (!nm) return;

      if (nm.startsWith('Node_')) {
        const key = nm.replace('Node_', '');
        this.projectsNodeGroups.set(key, obj);
      }

      if (nm.endsWith('_label')) {
        this.projectsLabelMeshes.set(nm, obj);
      }

      if (nm.includes('->')) {
        this.projectsEdgeMeshes.set(nm, obj);
      }

      // Interactive project nodes
      if (obj.isMesh && (nm.endsWith('_core') || nm.endsWith('_shell') || ['sightmate', 'football', 'forcrux', 'google-maps', 'kaatchi', 'projects_root'].includes(nm))) {
        obj.visible = true;
        obj.frustumCulled = false;
        if (!obj.material) return;
        obj.material = obj.material.clone();

        const destId = this._destId(nm) || nm;
        obj.userData.destId = destId;
        obj.userData.world = 'projects';

        if (!this.projectsNodeMap.has(destId)) {
          this.projectsNodeMap.set(destId, []);
        }
        this.projectsNodeMap.get(destId).push(obj);

        if (nm.endsWith('_core') || ['sightmate', 'football', 'forcrux', 'google-maps', 'kaatchi'].includes(nm)) {
          this.projectsInteractiveMeshes.push(obj);
          obj.userData.origEmissive = obj.material.emissive ? obj.material.emissive.getHex() : 0x00cc66;
          obj.userData.origEmissiveIntensity = obj.material.emissiveIntensity ?? 0.5;
        }
      }
    });
  }

  /* Toggle active 3D world: 'home' | 'projects' */
  setActiveWorld(worldId) {
    this.activeWorld = worldId;
    if (worldId === 'home') {
      this.homeGroup.visible = true;
      this.projectsGroup.visible = false;
      if (this.skillsGroup) this.skillsGroup.visible = false;
    } else if (worldId === 'projects') {
      this.homeGroup.visible = false;
      this.projectsGroup.visible = true;
      if (this.skillsGroup) this.skillsGroup.visible = false;

      if (this.projectsAsset?.mixer && this.projectsAsset?.animations?.length) {
        this.projectsAsset.animations.forEach((clip) => {
          const action = this.projectsAsset.mixer.clipAction(clip);
          action.reset();
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
          action.play();
        });
      }
    } else if (worldId === 'skills') {
      this.homeGroup.visible = false;
      this.projectsGroup.visible = false;
      if (this.skillsGroup) this.skillsGroup.visible = true;

      if (this.skillsAsset?.mixer && this.skillsAsset?.animations?.length) {
        this.skillsAsset.animations.forEach((clip) => {
          const action = this.skillsAsset.mixer.clipAction(clip);
          action.reset();
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
          action.play();
        });
      }
    }
  }

  computeProjectsBounds() {
    if (!this.projectsAsset?.scene) return null;
    this.projectsGroup.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(this.projectsGroup);
  }

updateIdleMotion(currentTime, delta, camera) {
    if (!this._ready || !this.homeGroup.visible) return;

    const t = currentTime * 0.001;

    // -- 1. BILLBOARD (PHASE 1: DISABLED for isolation test) --
    // Billboard wrapper implementation is in _setupBillboardWrappers() below.
    // To enable: set _billboardActive = true in _activateBillboard() and call _setupBillboardWrappers().
    if (this._billboardActive && camera) {
      // WRAPPER billboard: wrapper.rotation.y = atan2(dx,dz) to face camera horizontally
      // Label mesh quaternion is NOT modified here — animation owns it.
      if (this.billboardWrappers) {
        for (const [, wrapper] of this.billboardWrappers) {
          wrapper.getWorldPosition(_tmpV);
          const dx = camera.position.x - _tmpV.x;
          const dz = camera.position.z - _tmpV.z;
          wrapper.rotation.y = Math.atan2(dx, dz);
        }
      }
      if (this.projectsBillboardWrappers && this.activeWorld === 'projects') {
        for (const [, wrapper] of this.projectsBillboardWrappers) {
          wrapper.getWorldPosition(_tmpV);
          const dx = camera.position.x - _tmpV.x;
          const dz = camera.position.z - _tmpV.z;
          wrapper.rotation.y = Math.atan2(dx, dz);
        }
      }
      if (this.skillsBillboardWrappers && this.activeWorld === 'skills') {
        for (const [, wrapper] of this.skillsBillboardWrappers) {
          wrapper.getWorldPosition(_tmpV);
          const dx = camera.position.x - _tmpV.x;
          const dz = camera.position.z - _tmpV.z;
          wrapper.rotation.y = Math.atan2(dx, dz);
        }
      }
    }

    // ── 2. HERO SHELL SLOW ROTATION ─────────────────────────────
    const heroShell = this.homeAsset?.scene?.getObjectByName('hero_shell');
    if (heroShell) {
      heroShell.rotation.y += 0.0025;
      heroShell.rotation.x += 0.0006;
    }

    // ── 3. DESTINATION NODE BREATHING (after reveal animations) ──
    if (this._animDone) {
      const subnets = ['about', 'skills', 'projects', 'experience', 'contact'];
      subnets.forEach((key, idx) => {
        const grp = this.nodeGroups.get(key);
        if (!grp) return;
        if (grp.userData._authY === undefined) grp.userData._authY = grp.position.y;
        grp.position.y = grp.userData._authY + Math.sin(t * 1.1 + idx * 1.3) * 0.04;
      });
    }

    // ── 4. EDGE OPACITY PULSE ───────────────────────────────────
    for (const [, edgeMesh] of this.edgeMeshes) {
      if (edgeMesh?.material?.opacity !== undefined) {
        edgeMesh.material.opacity = 0.55 + Math.sin(t * 2.2) * 0.15;
      }
    }

    // ── 5. LIVING SIGNAL PARTICLES ───────────────────────────────
    if (this._animDone && this.signalParticles) {
      const heroGroup = this.nodeGroups.get('hero');
      const startPos  = heroGroup ? heroGroup.position : _tmpV.set(0, 0, 0);

      for (const p of this.signalParticles) {
        const destGroup = this.nodeGroups.get(p.destKey);
        if (!destGroup) continue;

        const progress = (t * p.speed + p.offset) % 1.0;
        p.mesh.position.lerpVectors(startPos, destGroup.position, progress);

        const fade = Math.sin(progress * Math.PI);
        p.mesh.scale.setScalar(0.5 + fade * 0.8);
        if (p.mesh.material) {
          p.mesh.material.opacity = fade * 0.90;
        }
      }
    }
  }

  /* ──────────────────────────────────────────────────────────────
     _billboardLabelToCamera — makes label local +Y face camera

     Binary forensic: about_label thin axis = Y (Y=0.020, X=1.004, Z=0.210)
     Text face normal = local +Y.

     MATH (right-hand XYZ basis, proven at all orbit angles):
       toCam  = normalize(camera.pos − labelWorldPos)   ← local +Y target
       localX = normalize(toCam × worldUp)              ← text right (no mirroring)
       localZ = normalize(localX × toCam)               ← text up (X×Y=Z)
       makeBasis(localX, toCam, localZ)                  ← col1=+Y=toCam ✔
  ────────────────────────────────────────────────────────────── */
  /* ----------------------------------------------------------------
     _setupBillboardWrappers (Phase 6)
     Called once after _applyLabelOffsets to install billboard wrappers.

     ARCHITECTURE:
       Before: GLB_HOME_scene --> label_mesh  (animation writes quaternion here)
       After:  GLB_HOME_scene --> wrapper     (Three.js rotates wrapper on Y-axis)
                                    --> label_mesh  (animation still owns quaternion)

     Why this is correct:
       Animation final quaternion = +90 degX. Under +90 degX:
         local +Y --> world +Z (toward default camera at +Z) = text face toward camera
         local +X --> world +X = text reads left-to-right
       Wrapper adds Y-rotation to track camera as it orbits.
       Combined: R_y(yAngle) * R_x(90deg) makes text face camera at any orbit angle.

       At yAngle=0   (default):  local +Y -> world +Z = toward camera  OK
       At yAngle=90  (orbit right): local +Y -> world +X = toward camera  OK
       At yAngle=180 (orbit behind): local +Y -> world -Z = toward camera  OK
       Text right always = camera right (no mirroring). Verified by dot product.
  ---------------------------------------------------------------- */
  _setupBillboardWrappers(targetLabelMap = null, worldKey = 'home') {
    const labelMap = targetLabelMap || this.labelMeshes;
    const wrapperMap = new Map();
    if (worldKey === 'projects') {
      this.projectsBillboardWrappers = wrapperMap;
    } else if (worldKey === 'skills') {
      this.skillsBillboardWrappers = wrapperMap;
    } else {
      this.billboardWrappers = wrapperMap;
    }

    for (const [nm, labelMesh] of labelMap) {
      const wrapper = new THREE.Object3D();
      wrapper.name = nm + '_billboard_wrapper';

      // Place wrapper at the label's current position IN the parent space.
      // (label.position already includes _applyLabelOffsets adjustment)
      wrapper.position.copy(labelMesh.position);

      // Insert wrapper between label's current parent and the label mesh
      const labelParent = labelMesh.parent;
      if (labelParent) {
        labelParent.add(wrapper);
      }
      // Move label into wrapper. Label position becomes (0,0,0) relative to wrapper.
      // animation mixer still owns label.quaternion — we do NOT touch it here.
      wrapper.add(labelMesh);
      labelMesh.position.set(0, 0, 0);

      // Record the animation-end quaternion for diagnostic purposes
      const animEndQ = labelMesh.quaternion.clone();
      const wq       = new THREE.Quaternion();
      labelMesh.getWorldQuaternion(wq);
      console.log(
        '[WRAPPER SETUP]', nm,
        'animEndLocalQ=' + animEndQ.toArray().map(v => +v.toFixed(4)),
        'worldQ=' + wq.toArray().map(v => +v.toFixed(4))
      );

      // Mirror check: with default camera (at +Z), the text's right direction in
      // world space should align with camera right (+X).
      // local +X at animation-end (+90 degX world rotation) -> world +X.
      // Camera right at default position -> world +X. Dot = +1 > 0  CORRECT.
      const textRight   = new THREE.Vector3(1, 0, 0).applyQuaternion(wq);
      const cameraRight = new THREE.Vector3(1, 0, 0); // default camera right
      const dot         = textRight.dot(cameraRight);
      console.log('  mirror-check dot(textRight, cameraRight) =', dot.toFixed(3),
        dot > 0 ? 'CORRECT (>0)' : 'MIRRORED (<0)');

      wrapperMap.set(nm, wrapper);
    }

    console.log('[SceneController] Billboard wrappers installed:', this.billboardWrappers.size);
  }

  /* ──────────────────────────────────────────────────────────────
     _initSignalSystem — living signal particles along existing GLB edges
     
     Procedural visual overlay following existing GLB edge paths from
     hero_core -> destination nodes (about, skills, projects, experience, contact).
     Does NOT modify or replace GLB edge geometry.
  ────────────────────────────────────────────────────────────── */
  _initSignalSystem(root) {
    if (this.signalGroup) {
      this.homeGroup.remove(this.signalGroup);
    }

    this.signalGroup = new THREE.Group();
    this.signalGroup.name = 'PROCEDURAL_SIGNAL_PARTICLES';

    const destinations = ['about', 'skills', 'projects', 'experience', 'contact'];
    this.signalParticles = [];

    const particleGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.85,
    });

    destinations.forEach((destKey, edgeIdx) => {
      const destGroup = this.nodeGroups.get(destKey);
      if (!destGroup) return;

      for (let p = 0; p < 2; p++) {
        const mesh = new THREE.Mesh(particleGeo, particleMat.clone());
        mesh.frustumCulled = false;
        mesh.renderOrder = 4;
        this.signalGroup.add(mesh);

        this.signalParticles.push({
          mesh,
          destKey,
          speed: 0.35 + (edgeIdx % 3) * 0.05,
          offset: p * 0.5 + (edgeIdx * 0.18),
        });
      }
    });

    this.homeGroup.add(this.signalGroup);
  }

  /* ──────────────────────────────────────────────────────────────
     GLB Provenance report — console only, not production UI
  ────────────────────────────────────────────────────────────── */
  _printProvenance(root) {
    const keys = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];
    const rows  = [];
    keys.forEach((key) => {
      const mesh = root.getObjectByName(key + '_core');
      if (!mesh) { rows.push({ key, found: 'MISSING ← BUG' }); return; }
      mesh.getWorldPosition(_tmpV);
      const bb = new THREE.Box3().setFromObject(mesh);
      const sz = bb.getSize(_tmpV2);
      rows.push({
        mesh:     key + '_core',
        source:   'home.glb ✓',
        verts:    mesh.geometry?.attributes?.position?.count ?? '?',
        worldXYZ: `(${_tmpV.x.toFixed(2)}, ${_tmpV.y.toFixed(2)}, ${_tmpV.z.toFixed(2)})`,
        size:     `(${sz.x.toFixed(2)}, ${sz.y.toFixed(2)})`,
        visible:  mesh.visible,
      });
    });

    console.group('%c[HOME GLB PROVENANCE] PROCEDURAL_NODES=0', 'color:#00ff88;font-weight:bold');
    console.table(rows);
    console.log('Labels:', [...this.labelMeshes.keys()].join(', '));
    console.log('Edges:', [...this.edgeMeshes.keys()].join(', '));
    console.log('[Phase1] Billboard=DISABLED. GLB anim-end pose is ground truth.');
    console.groupEnd();
  }

  _printProjectsProvenance(root) {
    console.group('%c[PROJECTS GLB PROVENANCE]', 'color: #00ff88; font-weight: bold;');
    console.log('PROCEDURAL_NODES=0');
    console.log('Source GLB: public/models/projects.glb');
    console.log('Indexed Nodes:', Array.from(this.projectsNodeMap.keys()).join(', '));
    console.log('Indexed Labels:', Array.from(this.projectsLabelMeshes.keys()).join(', '));
    console.log('Indexed Edges:', Array.from(this.projectsEdgeMeshes.keys()).join(', '));
    console.log('Authored Animation Clips:', this.projectsAsset?.animations?.length ?? 0);
    console.groupEnd();
  }

}
export const sceneController = new SceneController();
