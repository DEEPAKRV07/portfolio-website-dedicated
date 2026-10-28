import { isManual, nodeRadius } from './engine/layout.js';

// A visual analogy for information synthesis, not a trained neural model.
// Preserve the original seven identities and their section destinations.
export function structureHome(nodes, edges) {
  const layers = [['education', 'experience', 'skills'], ['core'], ['about', 'projects', 'contact']];
  const ids = new Set(layers.flat());
  for (const node of nodes.filter(n => n.world === 'home' && ids.has(n.id))) {
    node.networkLayer = layers.findIndex(layer => layer.includes(node.id));
    node.networkOrder = layers[node.networkLayer].indexOf(node.id);
    node.parentId = node.id === 'core' ? null : 'core';
  }
  // Replace only the seed's old home cross-links with named, directed flow.
  for (let i = edges.length - 1; i >= 0; i--) if (ids.has(edges[i].source) && ids.has(edges[i].target)) edges.splice(i, 1);
  const add = (source, target, relationship) => edges.push({ id: `edge-${source}-${target}`, source, target, relationship, directed: true, style: 'tube' });
  for (const id of layers[0]) add(id, 'core', 'informs-profile');
  for (const id of layers[2]) add('core', id, 'profile-destination');
}

export function isLayered(nodes) { return nodes.some(n => Number.isInteger(n.networkLayer)); }

export function computationPath(edges, selected) {
  const related = new Set(selected ? [selected] : []);
  const trace = (id, backwards, visited = new Set()) => {
    if(visited.has(id))return; visited.add(id);
    for(const edge of edges)if((backwards?edge.target:edge.source)===id){
      const next=backwards?edge.source:edge.target;related.add(next);trace(next,backwards,visited);
    }
  };
  if(selected){trace(selected,true);trace(selected,false);}
  return related;
}

/** Same graph and ordering on every viewport. Mobile stacks the three layers. */
export function computationPositions(nodes, compact = false) {
  const layers = new Map();
  for (const node of nodes) {
    const level = Number.isInteger(node.networkLayer) ? node.networkLayer : 2;
    if (!layers.has(level)) layers.set(level, []);
    layers.get(level).push(node);
  }
  const positions = new Map();
  let rowTop = 0;
  const levels = [...layers.keys()].sort((a, b) => a - b);
  for (const [levelIndex, level] of levels.entries()) {
    const group = layers.get(level).sort((a, b) => (a.networkOrder || 0) - (b.networkOrder || 0) || a.id.localeCompare(b.id));
    const gap = Math.max(5.5, ...group.map(n => nodeRadius(n) * 2 + 2));
    group.forEach((node, index) => {
      const columns = Math.min(3, group.length);
      const row = Math.floor(index / columns);
      const rowCount = Math.min(columns, group.length - row * columns);
      const position = compact
        ? [(index % columns - (rowCount - 1) / 2) * Math.max(7.8,gap), rowTop - row * gap, 0]
        : [(levelIndex - (levels.length - 1) / 2) * 10.5, ((group.length - 1) / 2 - index) * gap, 0];
      positions.set(node.id, isManual(node) ? [...node.layout.position] : position);
    });
    rowTop -= Math.ceil(group.length / 3) * gap + 4;
  }
  return positions;
}
