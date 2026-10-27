import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Neural bodies: layered nuclei, segmented shells, bevelled rails and signal contacts.
// No platforms or islands: each body is a node in the original computational graph.
export function buildNeuralNode(factory, group, materials, node, rotors, record = {}) {
  const core = node.appearance.geometry === 'neural-core';
  const chip = node.appearance.geometry === 'neural-chip';
  const cluster = node.appearance.geometry === 'neural-cluster';
  const body = new THREE.Group(); body.name='neural-body'; group.add(body);
  const nucleus = new THREE.Group(); nucleus.name='authored-nucleus-slot'; body.add(nucleus);
  factory.mesh(nucleus,factory.geometry('neural-nucleus',()=>new THREE.IcosahedronGeometry(.58,2)),materials.metal);
  factory.mesh(nucleus,factory.geometry('neural-energy',()=>new THREE.IcosahedronGeometry(.41,1)),materials.energy);
  const frame = new THREE.Group(); body.add(frame);
  const variant = node.contentId || node.id;
  const signature = ['about','projects','skills','experience','education','contact'].includes(variant) ? variant : ({project:'projects',skill:'skills',category:'skills',experience:'experience',education:'education',contact:'contact',about:'about'}[record.type]||'about');
  const rounded = factory.geometry('neural-bevel',()=>new RoundedBoxGeometry(1,1,1,2,.12));
  const count=core?12:chip?4:cluster?8:6;
  const transforms=new THREE.Object3D();
  const rails=new THREE.InstancedMesh(rounded,materials.metal,count);
  const contacts=new THREE.InstancedMesh(factory.box(),materials.energy,count);
  for(let i=0;i<count;i++){
    const angle=i/count*Math.PI*2;
    transforms.position.set(Math.cos(angle)*.86,Math.sin(angle)*.86,0);
    transforms.rotation.set(0,0,angle);transforms.scale.set(.17,.32,core?.54:.28);transforms.updateMatrix();rails.setMatrixAt(i,transforms.matrix);
    transforms.position.multiplyScalar(1.05);transforms.scale.set(.035,.14,.34);transforms.updateMatrix();contacts.setMatrixAt(i,transforms.matrix);
  }
  frame.add(rails,contacts);
  // Open structural forms give each section a readable silhouette while the
  // neural nucleus, graph identity and editable geometry system stay shared.
  const structure=new THREE.Group();body.add(structure);
  const strutBatches=new Map();
  const strut=(a,b,width=.035,material=materials.metal)=>{
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),direction=end.clone().sub(start);
    const part=new THREE.Object3D();
    part.position.copy(start).add(end).multiplyScalar(.5);part.scale.set(width,direction.length(),width);
    part.quaternion.setFromUnitVectors(THREE.Object3D.DEFAULT_UP,direction.normalize());
    part.updateMatrix();
    if(!strutBatches.has(material))strutBatches.set(material,[]);
    strutBatches.get(material).push(part.matrix.clone());
  };
  if(!core && ['projects','education'].includes(signature)){
    frame.scale.setScalar(.78);const width=signature==='education'?.66:.8,depth=.55;
    const vertices=[[-width,-.8,-depth],[width,-.8,-depth],[width,.8,-depth],[-width,.8,-depth],[-width,-.8,depth],[width,-.8,depth],[width,.8,depth],[-width,.8,depth]];
    for(const [a,b]of[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]])strut(vertices[a],vertices[b],.045);
    for(const z of[-depth,depth])strut([-width,-.8,z],[width,.8,z],.018,materials.energy);
    structure.rotation.set(.14,.42,signature==='projects'?.07:0);
    if(signature==='education')for(let i=0;i<3;i++)factory.mesh(structure,rounded,materials.glass,[0,(i-1)*.39,0],[width*1.7,.08,depth*1.7]);
  }
  if(!core && signature==='skills'){
    frame.scale.set(.8,.8,1);
    const top=[0,1.04,0],bottom=[0,-1.04,0],corners=[[.91,0,.45],[-.91,0,.45],[.91,0,-.45],[-.91,0,-.45]];
    for(const corner of corners){strut(top,corner,.035);strut(bottom,corner,.035);}
    for(let i=0;i<4;i++)strut(corners[i],corners[(i+1)%4],.017,materials.energy);
    structure.rotation.y=.3;
  }
  if(!core && signature==='experience'){
    for(const y of[-.45,.45])factory.mesh(structure,factory.ring(1.12,.045,Math.PI*1.75),materials.metal,[0,y,0],[1,.45,1],[.4,.1,.25]);
    for(const x of[-.85,.85])strut([x,-.6,-.3],[x,.6,.3],.04);
  }
  if(core || signature==='about' || signature==='contact'){
    const orbit=factory.mesh(structure,factory.ring(core?1.26:1.09,.014,Math.PI*1.8),core?materials.warm:materials.energy,[0,0,0],[1,.55,1],[.45,.3,.22]);
    if(core)rotors.push({object:orbit,axis:'z',speed:.025});
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2;factory.mesh(structure,factory.geometry('signal-junction',()=>new THREE.IcosahedronGeometry(.045,1)),materials.energy,[Math.cos(a)*1.08,Math.sin(a)*1.08,.1]);}
  }
  if(core){
    const veil=factory.mesh(body,factory.geometry('core-lens',()=>new THREE.SphereGeometry(.65,28,18)),materials.glass);
    veil.scale.set(1,1,.94);
  }
  const glow=factory.mesh(body,factory.geometry('signal-plane',()=>new THREE.PlaneGeometry(1,1)),factory.material('signal-halo','#41eaa3'),[0,0,.2],[core?2.4:1.3,core?2.4:1.3,1]);
  glow.renderOrder=2;
  glow.raycast=()=>{};
  const rings=core?3:cluster?2:1;
  for(let i=0;i<rings;i++){
    const ring=factory.mesh(frame,factory.ring(.82+i*.11,.045,Math.PI*1.65),materials.metal,[0,0,(i-1)*.12],[1,1,1],[i*.4,i*.6,i*2]);
    if(core)rotors.push({object:ring,axis:'z',speed:(i%2?-.04:.05)});
    factory.mesh(frame,factory.ring(.78+i*.11,.012,Math.PI*.75),materials.energy,[0,0,(i-1)*.12],[1,1,1],[i*.4,i*.6,i*2]);
  }
  if(!chip && !node.appearance.legacyWorld){
    const shell=factory.mesh(body,factory.geometry('neural-shell',()=>new THREE.IcosahedronGeometry(.72,1)),materials.glass);
    shell.rotation.set(.25,.2,0);
  }
  // Distinct section signatures remain part of the node's shell, not separate props.
  if(/project|forcrux|sightmate/.test(variant))frame.rotation.z=Math.PI/4;
  if(/skill|category/.test(variant))frame.scale.set(1.1,.85,1);
  if(/contact|email|github|linkedin|resume/.test(variant)){
    for(let i=0;i<2;i++)factory.mesh(frame,factory.ring(1.05+i*.14,.018,Math.PI*.6),materials.energy,[0,0,0],[1,1,1],[0,0,.6]);
  }
  if(/education|college/.test(variant))for(let i=0;i<3;i++)factory.mesh(frame,rounded,materials.metal,[(i-1)*.23,0,.78],[.12,.75,.12]);
  if(/experience/.test(variant))for(let i=0;i<3;i++)factory.mesh(frame,rounded,materials.metal,[0,(i-1)*.2,.8],[.5-i*.08,.08,.12]);
  // Identical frame members share a draw call without changing their geometry,
  // transforms, raycasting or the parent's material/selection behavior.
  for(const [material,matrices] of strutBatches){
    const batch=new THREE.InstancedMesh(rounded,material,matrices.length);
    matrices.forEach((matrix,i)=>batch.setMatrixAt(i,matrix));structure.add(batch);
  }
  return {nucleus};
}

export function neuralEnvironment(factory){
  const group=new THREE.Group();group.name='Neural network field';
  const grid=new THREE.PolarGridHelper(34,24,8,128,'#143f32','#0c251d');grid.position.y=-12;group.add(grid);
  for(const material of Array.isArray(grid.material)?grid.material:[grid.material]){material.transparent=true;material.opacity=.28;material.depthWrite=false;}
  factory.owned.add(grid.geometry);for(const m of Array.isArray(grid.material)?grid.material:[grid.material])factory.owned.add(m);
  const positions=new Float32Array(180*3);for(let i=0;i<180;i++){const a=i*2.39996323,r=10+(i%23);positions.set([Math.cos(a)*r,(i%19)-9,Math.sin(a)*r-12],i*3);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const material=new THREE.PointsMaterial({color:'#3d9671',size:.035,transparent:true,opacity:.55,depthWrite:false});factory.owned.add(geometry);factory.owned.add(material);
  const particles=new THREE.Points(geometry,material);group.add(particles);return{group,particles};
}
