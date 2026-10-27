import test from 'node:test';
import assert from 'node:assert/strict';
import { connectionPoints } from '../src/v3/engine/connections.js';

test('connections terminate on both geometry boundaries', () => {
  const points = connectionPoints([0, 0, 0], [10, 0, 0], 2, 1);
  assert.deepEqual(points.start.toArray(), [2, 0, 0]);
  assert.deepEqual(points.end.toArray(), [9, 0, 0]);
  assert.ok(points.middle.y < 0);
});

test('overlapping manual nodes yield finite non-reversed connections', () => {
  const points = connectionPoints([0, 0, 0], [1, 0, 0], 3, 3);
  assert.ok(points.start.x < points.end.x);
  assert.ok([...points.start.toArray(), ...points.end.toArray()].every(Number.isFinite));
  assert.equal(connectionPoints([1, 1, 1], [1, 1, 1]), null);
});
