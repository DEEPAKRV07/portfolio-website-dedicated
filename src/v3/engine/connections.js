import * as THREE from 'three';

/** Endpoints stop at the nodes' bounding silhouettes, not their centers. */
export function connectionPoints(source, target, sourceRadius = 1, targetRadius = 1) {
  const start = new THREE.Vector3().fromArray(source);
  const end = new THREE.Vector3().fromArray(target);
  const direction = end.clone().sub(start);
  const distance = direction.length();
  if (distance < 0.001) return null;
  direction.normalize();
  // Shorten proportionately when users intentionally overlap manual nodes.
  const budget = Math.min(1, distance * 0.8 / Math.max(0.001, sourceRadius + targetRadius));
  start.addScaledVector(direction, sourceRadius * budget);
  end.addScaledVector(direction, -targetRadius * budget);
  const middle = start.clone().lerp(end, 0.5);
  middle.y -= Math.min(0.85, distance * 0.07);
  return { start, end, middle };
}

export function createConnection(edge, source, target, factory) {
  const points = connectionPoints(source.group.position.toArray(), target.group.position.toArray(), source.radius, target.radius);
  if (!points) return null;
  let curve = new THREE.QuadraticBezierCurve3(points.start, points.middle, points.end);
  if(edge.relationship&&!source.compactBranch&&source.group.position.x<target.group.position.x){
    // Horizontal departure/arrival keeps a layered branch's transmission
    // paths clear of the labels directly underneath each node.
    points.start.copy(source.group.position).add(new THREE.Vector3(source.radius,0,0));
    points.end.copy(target.group.position).add(new THREE.Vector3(-target.radius,0,0));
    const middleX=(points.start.x+points.end.x)/2;
    curve=new THREE.CubicBezierCurve3(points.start,new THREE.Vector3(middleX,points.start.y,points.start.z),new THREE.Vector3(middleX,points.end.y,points.end.z),points.end);
  }
  if(source.compactBranch&&edge.relationship){
    // Route vertically stacked branches around the node/label columns. Ports
    // remain exactly on the same node boundaries used for raycast/framing.
    const targetSide=target.group.position.x>0?1:-1;
    const sourceSide=Math.abs(source.group.position.x)<.1?targetSide:Math.sign(source.group.position.x);
    points.start.copy(source.group.position).add(new THREE.Vector3(sourceSide*source.radius,0,0));
    points.end.copy(target.group.position).add(new THREE.Vector3(targetSide*target.radius,0,0));
    const lane=Math.max(10.5,Math.abs(source.group.position.x)+3,Math.abs(target.group.position.x)+3);
    const a=new THREE.Vector3(sourceSide*lane,points.start.y,points.start.z);
    const b=new THREE.Vector3(targetSide*lane,points.end.y,points.end.z);
    if(['identity','domain'].includes(source.node.graphRole))points.start.copy(source.group.position).add(new THREE.Vector3(0,-source.radius,0));
    if(Math.abs(source.group.position.x-target.group.position.x)<.1&&['identity','domain'].includes(source.node.graphRole)){
      points.end.copy(target.group.position).add(new THREE.Vector3(0,target.radius,0));
      a.copy(points.start).lerp(points.end,.33);b.copy(points.start).lerp(points.end,.67);
    }
    curve=new THREE.CubicBezierCurve3(points.start,a,b,points.end);
  }
  const group = new THREE.Group();
  group.name = `edge:${edge.id}`;
  const color = /^#[a-f0-9]{6}$/i.test(edge.color) ? edge.color : edge.relationship==='applied-in'?'#53aab1':'#5aab8c';
  let geometry, material, line;
  if (edge.style === 'tube' || edge.style === 'ribbon') {
    geometry = new THREE.TubeGeometry(curve, 24, edge.style === 'ribbon' ? 0.048 : 0.024, edge.style === 'ribbon' ? 3 : 5, false);
    material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.72 });
    line = new THREE.Mesh(geometry, material);
  } else {
    geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(28));
    material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 });
    line = new THREE.Line(geometry, material);
  }
  group.add(line);
  const portGeometry=factory.geometry('connection-port',()=>new THREE.SphereGeometry(.055,8,6));
  for(const point of [points.start,points.end]){const port=new THREE.Mesh(portGeometry,factory.material('energy','#70c6a4'));port.position.copy(point);group.add(port);}
  const pulse = new THREE.Mesh(factory.geometry('pulse', () => new THREE.OctahedronGeometry(0.065)), factory.material('energy', '#a5ffcd'));
  const halo = new THREE.Mesh(factory.geometry('signal-plane',()=>new THREE.PlaneGeometry(1,1)),factory.material('signal-halo','#49efb0'));
  halo.scale.setScalar(.55);pulse.add(halo);
  const idleSignal = Boolean(edge.relationship) || source.node.parentId === null || target.node.parentId === null;
  pulse.visible = idleSignal;
  group.add(pulse);
  pulse.position.copy(curve.getPoint(.5));
  let arrow;
  if (edge.directed) {
    arrow = new THREE.Mesh(factory.geometry('arrow', () => new THREE.ConeGeometry(0.08, 0.23, 4)), factory.material('energy', '#68a792'));
    arrow.position.copy(curve.getPoint(0.91));
    arrow.quaternion.setFromUnitVectors(THREE.Object3D.DEFAULT_UP, curve.getTangent(0.91).normalize());
    group.add(arrow);
  }
  return {
    group, curve, pulse, edge, line, material, flowLevel:({identity:0,domain:1,technology:2}[source.node.graphRole]||0),
    highlight(active,subdued=false) { material.color.set(active ? '#9efbd7' : color); material.opacity = subdued?.12:active?.95:.72; pulse.visible = !subdued&&(active || idleSignal); pulse.scale.setScalar(active?1:.65); },
    dispose() { geometry.dispose(); material.dispose(); group.removeFromParent(); },
  };
}
