import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLayout, nodeRadius, layoutBounds, LAYOUTS } from '../src/v3/engine/layout.js';

const nodes = Array.from({ length: 14 }, (_, index) => ({
  id: `node-${index}`, parentId: index ? 'node-0' : null,
  appearance: { geometry: index ? 'chip' : 'core', size: 1 },
  layout: { mode: 'auto', position: null },
}));
const edges = nodes.slice(1).map((node) => ({ id: `edge-${node.id}`, source: 'node-0', target: node.id }));

for (const strategy of LAYOUTS) {
  test(`${strategy} is reproducible across node ordering and avoids geometry collisions`, () => {
    const positions = calculateLayout(nodes, edges, strategy);
    assert.deepEqual(positions, calculateLayout([...nodes].reverse(), edges, strategy));
    for (let a = 0; a < nodes.length; a += 1) {
      for (let b = a + 1; b < nodes.length; b += 1) {
        const p = positions.get(nodes[a].id), q = positions.get(nodes[b].id);
        const distance = Math.hypot(...p.map((value, axis) => value - q[axis]));
        assert.ok(distance >= nodeRadius(nodes[a]) + nodeRadius(nodes[b]) + 0.89);
      }
    }
  });
}

test('manual anchors stay exact and automatic nodes move away', () => {
  const input = nodes.map((node, index) => index === 3 ? { ...node, layout: { mode: 'manual', position: [0, 0.65, 0] } } : node);
  const positions = calculateLayout(input, edges, 'radial');
  assert.deepEqual(positions.get('node-3'), [0, 0.65, 0]);
  assert.notDeepEqual(positions.get('node-0'), [0, 0.65, 0]);
});

test('hidden nodes and stale edges do not contaminate layout', () => {
  const input = nodes.map((node) => ({ ...node, visible: false }));
  assert.equal(calculateLayout(input, [{ source: 'missing', target: 'missing2' }], 'force').size, 0);
  assert.deepEqual(layoutBounds(new Map()).center, [0, 0, 0]);
});

test('cyclic parents terminate with finite, framed positions', () => {
  const input = nodes.slice(0, 3).map((node, index) => ({ ...node, parentId: nodes[(index + 1) % 3].id }));
  const positions = calculateLayout(input, [], 'hierarchical');
  assert.ok([...positions.values()].flat().every(Number.isFinite));
  const bounds = layoutBounds(positions, input);
  assert.ok(bounds.size.every((size) => size > 0 && Number.isFinite(size)));
});
