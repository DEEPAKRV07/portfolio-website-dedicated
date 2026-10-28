/**
 * Deterministic, bounded graph layout. No timers, randomness, DOM or Three.js.
 * Positions are [x, y, z]; explicit manual anchors are never moved.
 */
export const LAYOUTS = ['network', 'radial', 'hierarchical', 'timeline', 'force', 'manual'];

export function nodeRadius(node) {
  const size = node.appearance?.size;
  const scale = Number.isFinite(Number(size)) ? Math.max(0.4, Math.min(3, Number(size))) : 1;
  const geometry = node.appearance?.geometry;
  return (geometry?.startsWith('neural-') ? 1.35 : geometry === 'core' ? 2.15 : geometry === 'monolith' ? 1.35 : 1.05) * scale;
}

export function isManual(node) {
  return node.layout?.mode === 'manual' && Array.isArray(node.layout.position)
    && node.layout.position.length === 3 && node.layout.position.every(Number.isFinite);
}

function hash(text) {
  let result = 2166136261;
  for (const char of String(text)) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return (result >>> 0) / 4294967296;
}

function rootNode(nodes) {
  return nodes.find((node) => ['core','neural-core'].includes(node.appearance?.geometry))
    || (nodes.length > 1 && nodes.find((node) => !node.parentId && nodes.some((child) => child.parentId === node.id)));
}

function separate(nodes, positions, iterations = 70) {
  // Keep a useful label/geometry gap even for minimum-size objects.
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    let changed = false;
    for (let a = 0; a < nodes.length; a += 1) {
      for (let b = a + 1; b < nodes.length; b += 1) {
        const first = nodes[a], second = nodes[b];
        if (isManual(first) && isManual(second)) continue;
        const p = positions.get(first.id), q = positions.get(second.id);
        let dx = q[0] - p[0], dy = q[1] - p[1], dz = q[2] - p[2];
        let distance = Math.hypot(dx, dy, dz);
        const minimum = nodeRadius(first) + nodeRadius(second) + 0.9;
        if (distance >= minimum - 0.0001) continue;
        if (distance < 0.001) {
          const angle = hash(`${first.id}/${second.id}`) * Math.PI * 2;
          dx = Math.cos(angle); dy = 0; dz = Math.sin(angle);
          distance = 1;
        }
        const correction = (minimum - Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2])) / distance;
        const firstWeight = isManual(first) ? 0 : isManual(second) ? 1 : 0.5;
        const secondWeight = isManual(second) ? 0 : isManual(first) ? 1 : 0.5;
        p[0] -= dx * correction * firstWeight;
        p[1] -= dy * correction * firstWeight;
        p[2] -= dz * correction * firstWeight;
        q[0] += dx * correction * secondWeight;
        q[1] += dy * correction * secondWeight;
        q[2] += dz * correction * secondWeight;
        changed = true;
      }
    }
    if (!changed) break;
  }
}

export function calculateLayout(inputNodes = [], edges = [], requestedStrategy = 'radial') {
  const nodes = inputNodes.filter((node) => node.visible !== false).slice().sort((a, b) => String(a.id).localeCompare(String(b.id), 'en'));
  const positions = new Map();
  if (!nodes.length) return positions;
  const strategy = LAYOUTS.includes(requestedStrategy) ? requestedStrategy : 'radial';
  const root = rootNode(nodes);
  const leaves = nodes.filter((node) => node !== root);
  const radius = Math.max(root ? 6.2 : 4.2, leaves.length * 0.83);

  nodes.forEach((node, index) => {
    if (node === root) {
      positions.set(node.id, [0, 0.65, 0]);
      return;
    }
    const leafIndex = leaves.indexOf(node);
    const angle = leafIndex / Math.max(1, leaves.length) * Math.PI * 2 - Math.PI / 2;
    positions.set(node.id, [Math.cos(angle) * radius, 0, Math.sin(angle) * radius * 0.7]);
    if (strategy === 'timeline') {
      positions.set(node.id, [(index - (nodes.length - 1) / 2) * 4.7, (index % 2) * 0.7, (index % 2) * -0.9]);
    }
  });

  if (strategy === 'hierarchical') {
    const ids = new Set(nodes.map((node) => node.id));
    const levels = new Map();
    const depth = (node, visited = new Set()) => {
      if (!node.parentId || !ids.has(node.parentId) || visited.has(node.id)) return 0;
      visited.add(node.id);
      return Math.min(12, 1 + depth(nodes.find((parent) => parent.id === node.parentId), visited));
    };
    nodes.forEach((node) => {
      const level = depth(node);
      if (!levels.has(level)) levels.set(level, []);
      levels.get(level).push(node);
    });
    let terrace = 0;
    for (const [level, row] of [...levels].sort(([a], [b]) => a - b)) {
      const columns = Math.min(6, Math.ceil(Math.sqrt(row.length * 1.5)));
      row.forEach((node, index) => {
        // A shallow, terraced constellation remains legible from an oblique camera.
        positions.set(node.id, [((index % columns) - (columns - 1) / 2) * 3.9, (1 - level) * 2.4, terrace + Math.floor(index / columns) * 3.9]);
      });
      terrace += Math.ceil(row.length / columns) * 3.9 + 1.5;
    }
  }

  if (strategy === 'network') {
    const branches = root ? nodes.filter(n => n.parentId === root.id) : leaves;
    const clustered = branches.some(branch => nodes.some(n => n.parentId === branch.id));
    if(root) positions.set(root.id,[0,0,0]);
    const radialNodes = root ? leaves : nodes;
    radialNodes.forEach((node,index) => {
      const anchor = node.layout?.anchor;
      if(Array.isArray(anchor) && anchor.length===3 && anchor.every(Number.isFinite)) positions.set(node.id,[...anchor]);
      else { const a=index/Math.max(1,radialNodes.length)*Math.PI*2+Math.PI/2; positions.set(node.id,[Math.cos(a)*6.8,Math.sin(a)*6.8,Math.sin(a*2)*.65]); }
    });
    if(clustered) branches.forEach((branch,index) => {
      const a=index/branches.length*Math.PI*2+Math.PI/2;
      const center=[Math.cos(a)*9.5,Math.sin(a)*9.5,0];positions.set(branch.id,center);
      const children=nodes.filter(n=>n.parentId===branch.id);
      children.forEach((child,i)=>{const b=a+(i-(children.length-1)/2)*.7;positions.set(child.id,[center[0]+Math.cos(b)*4,center[1]+Math.sin(b)*4,(i%2?-.4:.4)]);});
    });
  }

  for (const node of nodes) {
    if (isManual(node)) positions.set(node.id, [...node.layout.position]);
  }

  if (strategy === 'force') {
    const ids = new Set(nodes.map((node) => node.id));
    const links = edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target) && edge.source !== edge.target);
    const fixed = new Set(nodes.filter(isManual).map((node) => node.id));
    // Deterministic relaxation, finite passes, with no simulation in the frame loop.
    for (let pass = 0; pass < 90; pass += 1) {
      for (const edge of links) {
        const p = positions.get(edge.source), q = positions.get(edge.target);
        const dx = q[0] - p[0], dz = q[2] - p[2];
        const distance = Math.max(0.01, Math.hypot(dx, dz));
        const pull = (distance - 4.8) * 0.026;
        if (!fixed.has(edge.source)) { p[0] += dx / distance * pull; p[2] += dz / distance * pull; }
        if (!fixed.has(edge.target)) { q[0] -= dx / distance * pull; q[2] -= dz / distance * pull; }
      }
      separate(nodes, positions, 1);
    }
  }

  separate(nodes, positions);
  return positions;
}

export function layoutBounds(positions, nodes = []) {
  if (!positions.size) return { center: [0, 0, 0], size: [8, 5, 8] };
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const [id, position] of positions) {
    const radius = byId.has(id) ? nodeRadius(byId.get(id)) : 1;
    for (let dimension = 0; dimension < 3; dimension += 1) {
      min[dimension] = Math.min(min[dimension], position[dimension] - radius);
      max[dimension] = Math.max(max[dimension], position[dimension] + radius);
    }
  }
  return { center: min.map((value, axis) => (value + max[axis]) / 2), size: min.map((value, axis) => max[axis] - value) };
}
