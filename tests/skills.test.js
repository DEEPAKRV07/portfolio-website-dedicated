import test from 'node:test';
import assert from 'node:assert/strict';
import {createSeed} from '../src/v3/data.js';
import {validateSnapshot} from '../src/v3/schema.js';
import {SKILL_DOMAINS,relationshipPath,skillPositions,syncSkillRelationships} from '../src/v3/skillsGraph.js';

test('Skills has one identity, exact domain membership and only documented directed connections',()=>{
 const d=createSeed(),nodes=d.nodes.filter(n=>n.world==='skills'),byId=new Map(nodes.map(n=>[n.id,n])),edges=d.edges.filter(e=>byId.has(e.source));
 assert.deepEqual(nodes.filter(n=>!n.parentId).map(n=>[n.id,n.contentId]),[['skills_root','profile']]);
 for(const[id,title,children]of SKILL_DOMAINS){assert.equal(d.records.find(r=>r.id===id).title,title);assert.deepEqual(nodes.filter(n=>n.parentId===id).map(n=>n.id).sort(),children.slice().sort());}
 for(const node of nodes.filter(n=>n.id!=='skills_root'))assert.ok(edges.some(e=>e.source===node.parentId&&e.target===node.id),node.id);
 for(const edge of edges){assert.ok(edge.directed);const a=byId.get(edge.source),b=byId.get(edge.target);if(edge.relationship==='applied-in')assert.ok(d.records.find(r=>r.id===a.contentId).relatedIds.includes(b.contentId));else assert.equal(b.parentId,a.id);}
 const bad=structuredClone(d);bad.edges.push({id:'invalid-claim',source:'fast-scnn',target:'skills-project-football',style:'tube',directed:true,relationship:'applied-in'});assert.equal(validateSnapshot(bad).valid,false);
});
test('Skill paths include identity/domain and evidenced projects without unrelated siblings',()=>{
 const d=createSeed(),related=relationshipPath(d.nodes,d.edges,'ml-kit');
 for(const id of ['ml-kit','vision-geometry','skills_root','skills-project-sightmate','skills-project-football'])assert.ok(related.has(id),id);
 for(const id of ['sqlite','pandas','skills-project-forcrux'])assert.ok(!related.has(id),id);
});
test('Skill layout is deterministic and branch topology adapts to both viewports',()=>{
 const d=createSeed(),nodes=d.nodes.filter(n=>n.world==='skills');
 for(const compact of [false,true])for(const [domain]of SKILL_DOMAINS){
  const children=nodes.filter(n=>n.id==='skills_root'||n.id===domain||n.parentId===domain),ids=new Set(children.map(n=>n.id));
  for(const edge of d.edges)if(edge.relationship==='applied-in'&&ids.has(edge.source))ids.add(edge.target);
  const branch=nodes.filter(n=>ids.has(n.id));const a=skillPositions(branch,d.edges,domain,compact),b=skillPositions([...branch].reverse(),d.edges,domain,compact);
  assert.deepEqual([...a].sort(),[...b].sort());assert.equal(a.size,branch.length);
  for(const p of a.values())assert.ok(p.every(Number.isFinite));
 }
});
test('Studio category changes and explicit project links synchronize the same graph',()=>{
 const d=createSeed(),skill=d.records.find(r=>r.id==='python');skill.category='systems-category';skill.relatedIds=['kaatchi'];syncSkillRelationships(d);
 assert.ok(d.edges.some(e=>e.source==='python'&&e.target==='skills-project-kaatchi'&&e.relationship==='applied-in'));
 assert.equal(validateSnapshot(d).valid,true);
 skill.relatedIds=[];syncSkillRelationships(d);assert.ok(!d.edges.some(e=>e.source==='python'&&e.relationship==='applied-in'));
 assert.equal(validateSnapshot(d).valid,true);
});

test('owner-added skill domains have distinct automatic positions beyond the original six',()=>{
 const d=createSeed(),nodes=d.nodes.filter(n=>n.world==='skills');
 nodes.push({...structuredClone(nodes.find(n=>n.graphRole==='domain')),id:'owner-new-domain',contentId:'owner-new-category',branchOrder:6});
 const positions=skillPositions(nodes,d.edges,null,false),domains=nodes.filter(n=>n.graphRole==='domain');
 for(let i=0;i<domains.length;i++)for(let j=i+1;j<domains.length;j++)assert.ok(Math.hypot(...positions.get(domains[i].id).map((v,k)=>v-positions.get(domains[j].id)[k]))>3,`${domains[i].id} overlaps ${domains[j].id}`);
});
