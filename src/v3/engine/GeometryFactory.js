import * as THREE from 'three';
import { buildNeuralNode, neuralEnvironment } from './neuralGeometry.js';

export const GEOMETRY_PRESETS = ['neural-core', 'neural-node', 'neural-cluster', 'neural-chip', 'core', 'portal', 'monolith', 'chip', 'tower', 'archive', 'beacon'];
export const MATERIAL_PRESETS = ['titanium', 'glass', 'emissive'];

function seed(id) {
  return [...String(id)].reduce((value, letter) => (value * 31 + letter.charCodeAt(0)) >>> 0, 7);
}

/**
 * Geometries/materials are owned by this pool, never by individual nodes.
 * Scene reconciliation can remove thousands of instances without invalidating
 * another node's shared resources. dispose() is called once per engine.
 */
export class GeometryFactory {
  constructor() {
    this.geometries = new Map();
    this.materials = new Map();
    this.presets = new Map();
    this.owned = new Set();
  }

  geometry(key, create) {
    if (!this.geometries.has(key)) this.geometries.set(key, create());
    return this.geometries.get(key);
  }

  box() { return this.geometry('box', () => new THREE.BoxGeometry(1, 1, 1)); }
  cylinder(sides = 8) { return this.geometry(`cylinder:${sides}`, () => new THREE.CylinderGeometry(1, 1, 1, sides)); }
  ring(radius = 1, thickness = 0.02, arc = Math.PI * 2) {
    return this.geometry(`ring:${radius}:${thickness}:${arc}`, () => new THREE.TorusGeometry(radius, thickness, 5, Math.max(32, Math.round(arc * 18)), arc));
  }

  material(role, color = '#7be9b0', preset = 'titanium') {
    const key = `${role}:${color}:${preset}`;
    if (this.materials.has(key)) return this.materials.get(key);
    let material;
    if (role === 'energy') material = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    else if(role === 'signal-halo') material = new THREE.ShaderMaterial({
      transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{tint:{value:new THREE.Color(color)}},
      vertexShader:'varying vec2 vUv; void main(){vUv=uv;vec4 center=modelViewMatrix*vec4(0.0,0.0,0.0,1.0);center.xy+=position.xy*vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz));gl_Position=projectionMatrix*center;}',
      fragmentShader:'uniform vec3 tint; varying vec2 vUv; void main(){vec2 p=vUv*2.0-1.0;float r=length(p);float a=exp(-dot(p,p)*7.0)*(1.0-smoothstep(0.65,1.0,r));gl_FragColor=vec4(tint,a*0.22);}',
    });
    else if (role === 'line') material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45, depthWrite: false });
    else if (role === 'glass' || preset === 'glass') material = new THREE.MeshPhysicalMaterial({
      color: '#6eb29a', metalness: 0.25, roughness: 0.12, transparent: true, opacity: 0.12,
      clearcoat: 1, side: THREE.DoubleSide, depthWrite: false,
    });
    else material = new THREE.MeshStandardMaterial({
      color: role === 'dark' ? '#0c1918' : role === 'warm' ? '#9b795b' : '#3b514d',
      metalness: 0.88, roughness: role === 'dark' ? 0.4 : 0.22,
      emissive: preset === 'emissive' ? color : '#000000',
      emissiveIntensity: preset === 'emissive' ? 0.18 : 0,
    });
    this.materials.set(key, material);
    return material;
  }

  mesh(group, geometry, material, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0]) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.fromArray(position);
    mesh.scale.fromArray(scale);
    mesh.rotation.fromArray(rotation);
    group.add(mesh);
    return mesh;
  }

  registerPreset(name, builder) {
    if (!/^[a-z][a-z0-9-]{1,40}$/.test(name) || typeof builder !== 'function') throw new Error('Invalid geometry preset');
    this.presets.set(name, builder);
  }

  createNode(node, record = {}) {
    const group = new THREE.Group();
    group.name = `node:${node.id}`;
    const color = /^#[0-9a-f]{6}$/i.test(node.appearance?.color) ? node.appearance.color : '#73f3bf';
    const preset = node.appearance?.material || 'titanium';
    const materials = {
      metal: this.material('metal', color, preset),
      dark: this.material('dark', color),
      energy: this.material('energy', color),
      glass: this.material('glass', color),
      warm: this.material('warm', color),
    };
    const requested = node.appearance?.geometry;
    const geometry = requested || ({ project: 'monolith', skill: 'chip', experience: 'tower', education: 'archive', contact: 'beacon' }[record.type] || 'portal');
    const rotors = [];
    const build = this.presets.get(geometry);
    let neural;
    if (geometry.startsWith('neural-')) neural = buildNeuralNode(this, group, materials, node, rotors, record);
    else if (build) build({ group, factory: this, materials, node, record, rotors });
    else if (geometry === 'core') this.core(group, materials, rotors);
    else if (geometry === 'monolith') this.monolith(group, materials, node.id);
    else if (geometry === 'chip') this.chip(group, materials);
    else if (geometry === 'tower') this.tower(group, materials, node.id);
    else if (geometry === 'archive') this.archive(group, materials);
    else if (geometry === 'beacon') this.beacon(group, materials, rotors);
    else this.portal(group, materials, node.id);

    const rawSize = Number(node.appearance?.size);
    const size = Number.isFinite(rawSize) && rawSize > 0 ? THREE.MathUtils.clamp(rawSize, 0.4, 3) : 1;
    group.scale.setScalar(size);
    const selection = this.mesh(group, this.ring(geometry === 'core' ? 2.4 : 1.2, 0.025), materials.energy, [0, -1.2, 0], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    selection.visible = false;
    const highlight = this.mesh(group, this.ring(geometry === 'core' ? 2.5 : 1.28, 0.012, Math.PI * 1.4), materials.energy, [0, -1.19, 0], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    highlight.visible = false;
    if(neural){selection.rotation.set(0,0,0);selection.position.set(0,0,.15);highlight.rotation.set(0,0,0);highlight.position.set(0,0,.15);}
    group.traverse((child) => {
      if (child.isMesh) { child.userData.nodeId = node.id; child.castShadow = !child.material?.transparent; child.receiveShadow = !child.material?.transparent; }
    });
    return {
      group, selection, highlight, rotors, size, nucleus: neural?.nucleus,
      dispose() { group.traverse(child => { if (child.isInstancedMesh) child.dispose(); }); group.removeFromParent(); },
      labelHeight: (geometry.startsWith('neural-') ? 1.2 : geometry === 'core' ? 2.55 : geometry === 'monolith' ? 2.15 : geometry === 'tower' ? 2.3 : 1.65) * size,
      radius: (geometry.startsWith('neural-') ? 1.27 : geometry === 'core' ? 2.05 : geometry === 'monolith' ? 1.2 : 0.95) * size,
      geometry,
    };
  }

  core(group, material, rotors) {
    const housing = new THREE.Group();
    group.add(housing);
    this.mesh(housing, this.cylinder(8), material.dark, [0, 0, 0], [1.22, 1.35, 1.22]);
    this.mesh(housing, this.cylinder(8), material.metal, [0, 0.74, 0], [1.4, 0.16, 1.4]);
    this.mesh(housing, this.cylinder(8), material.metal, [0, -0.74, 0], [1.4, 0.16, 1.4]);
    this.mesh(housing, this.cylinder(8), material.energy, [0, 0.88, 0], [1.05, 0.026, 1.05]);
    this.mesh(housing, this.cylinder(8), material.energy, [0, -0.87, 0], [1.05, 0.026, 1.05]);
    this.mesh(housing, this.cylinder(8), material.dark, [0, 0.92, 0], [0.92, 0.08, 0.92]);
    this.mesh(housing, this.cylinder(8), material.glass, [0, 0.05, 0], [1.32, 1.2, 1.32]);
    for (let i = 0; i < 8; i += 1) {
      const angle = i / 8 * Math.PI * 2;
      const x = Math.sin(angle), z = Math.cos(angle);
      this.mesh(housing, this.box(), material.metal, [x * 1.32, 0, z * 1.32], [0.17, 1.25, 0.22], [0, angle, 0]);
      this.mesh(housing, this.box(), material.energy, [x * 1.46, 0, z * 1.46], [0.045, 0.53, 0.035], [0, angle, 0]);
    }
    const gyroscope = new THREE.Group();
    gyroscope.rotation.set(0.32, 0.1, 0.18);
    group.add(gyroscope);
    this.mesh(gyroscope, this.ring(1.9, 0.075, Math.PI * 1.62), material.metal, [0, 0, 0], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    this.mesh(gyroscope, this.ring(1.9, 0.022, Math.PI * 1.43), material.energy, [0, 0.065, 0], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    this.mesh(gyroscope, this.ring(2.17, 0.028, Math.PI * 1.2), material.warm, [0, 0, 0], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    rotors.push({ object: gyroscope, speed: 0.12, axis: 'y' });
    const antenna = new THREE.Group();
    group.add(antenna);
    this.mesh(antenna, this.ring(1.72, 0.035, Math.PI * 1.65), material.metal, [0, 0, 0], [1, 1, 1], [0.1, 0, Math.PI / 4]);
    this.mesh(antenna, this.ring(1.73, 0.009, Math.PI * 1.5), material.energy, [0, 0, 0], [1, 1, 1], [0.1, 0, Math.PI / 4]);
    rotors.push({ object: antenna, speed: -0.07, axis: 'y' });
    this.mesh(group, this.cylinder(8), material.dark, [0, -1.55, 0], [2, 0.23, 2]);
    this.mesh(group, this.ring(1.95, 0.018), material.energy, [0, -1.41, 0], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    this.mesh(group, this.cylinder(8), material.metal, [0, -1.37, 0], [1.52, 0.1, 1.52]);
    // An original faceted computational crystal inside the machined cap.
    this.mesh(group, this.geometry('crystal', () => new THREE.OctahedronGeometry(0.42, 0)), material.energy, [0, 1.34, 0], [1, 1.35, 1]);
  }

  portal(group, material, id) {
    const rotation = (seed(id) % 5 - 2) * 0.09;
    group.rotation.y = rotation;
    this.mesh(group, this.cylinder(6), material.dark, [0, -0.8, 0], [1.05, 0.22, 1.05]);
    this.mesh(group, this.cylinder(6), material.metal, [0, -0.62, 0], [0.88, 0.12, 0.88]);
    this.mesh(group, this.box(), material.metal, [-0.66, 0.05, 0], [0.15, 1.35, 0.28]);
    this.mesh(group, this.box(), material.metal, [0.66, 0.05, 0], [0.15, 1.35, 0.28]);
    this.mesh(group, this.box(), material.metal, [0, 0.71, 0], [1.43, 0.15, 0.28]);
    this.mesh(group, this.box(), material.energy, [-0.55, 0.06, 0.12], [0.027, 1.12, 0.027]);
    this.mesh(group, this.box(), material.energy, [0.55, 0.06, 0.12], [0.027, 1.12, 0.027]);
    this.mesh(group, this.box(), material.glass, [0, 0.09, 0.015], [1.08, 1.06, 0.04]);
    this.mesh(group, this.geometry('octa', () => new THREE.OctahedronGeometry(0.35, 0)), material.metal, [0, 0.1, 0.08], [1, 1, 1], [0, 0, Math.PI / 4]);
    this.mesh(group, this.box(), material.energy, [0, -0.4, 0.16], [0.37, 0.035, 0.035]);
  }

  monolith(group, material, id) {
    group.rotation.y = ((seed(id) % 7) - 3) * 0.08;
    this.mesh(group, this.box(), material.dark, [0, -1, 0], [1.9, 0.2, 1.1]);
    this.mesh(group, this.box(), material.warm, [0, -0.87, 0], [1.65, 0.05, 0.8]);
    this.mesh(group, this.box(), material.metal, [0, 0.1, 0], [1.35, 1.88, 0.28]);
    this.mesh(group, this.box(), material.dark, [0, 0.14, 0.16], [1.2, 1.61, 0.035]);
    this.mesh(group, this.box(), material.energy, [-0.54, 0.63, 0.2], [0.025, 0.45, 0.02]);
    this.mesh(group, this.box(), material.energy, [0.06, 0.79, 0.2], [0.9, 0.025, 0.02]);
    for (let i = 0; i < 7; i += 1) {
      const width = 0.25 + ((seed(id) >> (i * 3 % 21)) % 8) * 0.085;
      this.mesh(group, this.box(), i % 3 === 0 ? material.energy : material.metal, [-0.42 + width / 2, 0.43 - i * 0.155, 0.2], [width, 0.038, 0.018]);
    }
    for (let i = 0; i < 4; i += 1) this.mesh(group, this.box(), material.metal, [0.83 + i * 0.1, 0, -0.12], [0.035, 1.4 - i * 0.18, 0.68]);
    this.mesh(group, this.box(), material.glass, [0, 0.13, 0.24], [1.12, 1.52, 0.018]);
    this.mesh(group, this.box(), material.energy, [0, -0.98, 0.56], [1.18, 0.02, 0.02]);
  }

  chip(group, material) {
    this.mesh(group, this.box(), material.dark, [0, -0.22, 0], [1.42, 0.23, 1.42]);
    this.mesh(group, this.box(), material.metal, [0, -0.01, 0], [0.98, 0.22, 0.98]);
    this.mesh(group, this.box(), material.energy, [0, 0.12, 0], [0.76, 0.03, 0.76]);
    this.mesh(group, this.box(), material.dark, [0, 0.16, 0], [0.64, 0.04, 0.64]);
    const pins = new THREE.InstancedMesh(this.box(), material.warm, 24);
    const transform = new THREE.Object3D();
    for (let i = 0; i < 6; i += 1) {
      const coordinate = -0.5 + i * 0.2;
      [[coordinate, -0.2, 0.81], [coordinate, -0.2, -0.81], [-0.81, -0.2, coordinate], [0.81, -0.2, coordinate]].forEach((position, side) => {
        transform.position.fromArray(position);
        transform.scale.set(side < 2 ? 0.075 : 0.3, 0.06, side < 2 ? 0.3 : 0.075);
        transform.updateMatrix(); pins.setMatrixAt(i * 4 + side, transform.matrix);
      });
    }
    group.add(pins);
    this.mesh(group, this.box(), material.glass, [0, 0.44, 0], [0.85, 0.05, 0.85]);
  }

  tower(group, material, id) {
    this.mesh(group, this.cylinder(6), material.dark, [0, -1.1, 0], [1.12, 0.25, 1.12]);
    const tiers = 4 + seed(id) % 3;
    for (let i = 0; i < tiers; i += 1) {
      const width = 1.15 - i * 0.09;
      this.mesh(group, this.box(), material.metal, [0, -0.72 + i * 0.34, 0], [width, 0.25, width * 0.7]);
      this.mesh(group, this.box(), material.energy, [0.1, -0.64 + i * 0.34, width * 0.36], [width * 0.65, 0.028, 0.025]);
    }
    this.mesh(group, this.box(), material.warm, [-0.7, -0.02, -0.2], [0.08, 2.12, 0.08]);
  }

  archive(group, material) {
    this.mesh(group, this.box(), material.dark, [0, -0.96, 0], [1.9, 0.2, 1.4]);
    for (let i = 0; i < 4; i += 1) {
      this.mesh(group, this.box(), material.metal, [(i - 1.5) * 0.38, 0, 0], [0.14, 1.7, 0.9], [0, 0, -0.12]);
      this.mesh(group, this.box(), material.energy, [(i - 1.5) * 0.38, 0.54, 0.46], [0.075, 0.2, 0.025]);
    }
    this.mesh(group, this.box(), material.warm, [0, 0.92, 0], [1.9, 0.13, 1.1]);
    this.mesh(group, this.box(), material.glass, [0, 0, 0.57], [1.6, 1.56, 0.035]);
  }

  beacon(group, material, rotors) {
    this.mesh(group, this.cylinder(6), material.dark, [0, -0.95, 0], [0.95, 0.23, 0.95]);
    this.mesh(group, this.cylinder(6), material.metal, [0, -0.32, 0], [0.17, 1.05, 0.17]);
    const receiver = new THREE.Group();
    receiver.position.y = 0.4;
    group.add(receiver);
    this.mesh(receiver, this.ring(0.64, 0.08, Math.PI * 1.7), material.metal);
    this.mesh(receiver, this.ring(0.55, 0.017, Math.PI * 1.7), material.energy);
    this.mesh(receiver, this.geometry('diamond', () => new THREE.OctahedronGeometry(0.18)), material.energy);
    rotors.push({ object: receiver, axis: 'y', speed: 0.12 });
  }

  environment() {
    return neuralEnvironment(this);
  }

  legacyObservatoryEnvironment() {
    const group = new THREE.Group();
    group.name = 'Computational observatory';
    const metal = this.material('metal'), dark = this.material('dark'), energy = this.material('energy', '#316b59'), warm = this.material('warm');
    this.mesh(group, this.cylinder(96), dark, [0, -2.15, 0], [8.9, 0.23, 8.9]);
    this.mesh(group, this.cylinder(96), metal, [0, -2.3, 0], [9.1, 0.09, 9.1]);
    for (const radius of [3.1, 5.2, 7.1, 8.8]) {
      this.mesh(group, this.ring(radius, 0.012), energy, [0, -2.02, 0], [1, 1, 1], [-Math.PI / 2, 0, 0]);
    }
    for (let i = 0; i < 3; i += 1) {
      this.mesh(group, this.ring(9.15, 0.045, Math.PI * 0.43), metal, [0, -1.87, 0], [1, 1, 1], [-Math.PI / 2, 0, i * Math.PI * 2 / 3]);
      this.mesh(group, this.ring(9.2, 0.012, Math.PI * 0.36), warm, [0, -1.8, 0], [1, 1, 1], [-Math.PI / 2, 0, i * Math.PI * 2 / 3]);
    }
    const ticks = new THREE.InstancedMesh(this.box(), metal, 90);
    const matrix = new THREE.Matrix4(), position = new THREE.Vector3(), scale = new THREE.Vector3(), quaternion = new THREE.Quaternion();
    for (let i = 0; i < 90; i += 1) {
      const angle = i / 90 * Math.PI * 2;
      position.set(Math.sin(angle) * 8.35, -1.99, Math.cos(angle) * 8.35);
      quaternion.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, angle);
      scale.set(0.035, 0.02, i % 5 === 0 ? 0.4 : 0.15);
      ticks.setMatrixAt(i, matrix.compose(position, quaternion, scale));
    }
    ticks.instanceMatrix.needsUpdate = true;
    group.add(ticks);
    // Repeated radial structural piers use one draw call.
    const piers = new THREE.InstancedMesh(this.box(), metal, 12);
    for (let i = 0; i < 12; i += 1) {
      const angle = i / 12 * Math.PI * 2;
      position.set(Math.sin(angle) * 7.9, -2.38, Math.cos(angle) * 7.9);
      quaternion.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, angle);
      scale.set(0.3, 0.7, 0.65);
      piers.setMatrixAt(i, matrix.compose(position, quaternion, scale));
    }
    piers.instanceMatrix.needsUpdate = true;
    group.add(piers);

    const particlePositions = new Float32Array(110 * 3);
    for (let i = 0; i < 110; i += 1) {
      const angle = i * 2.399963229728653;
      const radius = 6 + (i % 19) * 0.6;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = -0.5 + (i % 13) * 0.45;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const pointsMaterial = new THREE.PointsMaterial({ color: '#71a695', size: 0.026, sizeAttenuation: true, transparent: true, opacity: 0.48, depthWrite: false });
    this.owned.add(pointsGeometry); this.owned.add(pointsMaterial);
    const particles = new THREE.Points(pointsGeometry, pointsMaterial);
    group.add(particles);
    return { group, particles, ticks, piers };
  }

  dispose() {
    for (const value of [...this.geometries.values(), ...this.materials.values(), ...this.owned]) value.dispose();
    this.geometries.clear();
    this.materials.clear();
    this.owned.clear();
    this.presets.clear();
  }
}
