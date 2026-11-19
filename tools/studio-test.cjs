const assert=require('node:assert/strict'),S=require('../studio-light.js');
assert.equal(S.receiver(.72,1),0);assert.equal(S.receiver(1,1),1);assert.equal(S.receiver(.72,0),-1);assert.equal(S.receiver(.8,1),-1);assert.deepEqual(S.uv(-50,-50,0),[0,0]);assert.deepEqual(S.uv(50,62,1),[512,1024]);
let p=S.projected(0,2,0,0),q=S.uv(0,0,0);assert(p[0]>q[0]&&p[1]<q[1]);assert.deepEqual(S.projected(0,.72,0,0),q);assert.equal(S.material(.64,.63,.62),'metal');assert.equal(S.material(.2,.23,.3),'graphite');assert(S.shade(.6,.6,.6,0,1,0)[0]>S.shade(.6,.6,.6,0,-1,0)[0]);assert(S.shade(1,1,1,0,1,0).every(v=>v<=255));
console.log('Studio: 12 mapping, projection, receiver, material and lighting assertions passed');
