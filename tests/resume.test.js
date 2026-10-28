import test from 'node:test';
import assert from 'node:assert/strict';
import {buildResumeGraph,extractSections,validateResumeFile,MAX_RESUME_BYTES} from '../src/v3/resumeGraph.js';
import {computationPositions,computationPath} from '../src/v3/computationGraph.js';
import {validateSnapshot} from '../src/v3/schema.js';
import {createSeed} from '../src/v3/data.js';
const resume='Test Candidate\nEducation\nBSc Computer Science, Example College\nTechnical Skills\nPython, React, TensorFlow\nExperience\nBuilt React interfaces at Example Company.\nProjects\nPython and TensorFlow classification experiment.\nCertifications\nExample course completion';
test('resume extraction preserves source facts and groups only literal terms',()=>{
 const {graph,sections}=buildResumeGraph(resume,'test.docx');assert.equal(sections.length,6);assert.equal(validateSnapshot(graph).valid,true);
 assert.ok(graph.records.some(r=>r.tags.includes('tensorflow')));assert.ok(!graph.records.some(r=>r.tags.includes('unity')));
 assert.ok(!graph.nodes.some(n=>n.label.includes('XR')));assert.equal(graph.records.find(r=>r.id==='resume-input-projects').sections[0].content,'Python and TensorFlow classification experiment.');
 const byId=new Map(graph.nodes.map(n=>[n.id,n]));for(const e of graph.edges){assert.ok(byId.has(e.source)&&byId.has(e.target));assert.ok(byId.get(e.source).networkLayer<byId.get(e.target).networkLayer);}
 assert.deepEqual(buildResumeGraph(resume),buildResumeGraph(resume));
});
test('resume validates size, type, empty/scanned input and safely retains unfamiliar text',()=>{
 assert.throws(()=>validateResumeFile({name:'bad.exe',size:10}),/PDF or DOCX/);assert.throws(()=>validateResumeFile({name:'huge.pdf',size:MAX_RESUME_BYTES+1}),/5 MB/);assert.throws(()=>validateResumeFile({name:'wrong.pdf',size:100,type:'text/html'}),/type/);
 assert.throws(()=>extractSections(''),/No readable/);assert.throws(()=>extractSections('x'.repeat(100001)),/too large/);
 const {graph,warnings}=buildResumeGraph('Unfamiliar document with no recognized headings or technology keywords. <script>alert(1)</script>');assert.equal(warnings.length,1);assert.equal(graph.nodes.length,3);assert.ok(graph.records[0].sections[0].content.includes('<script>'));
});
test('computation layout stays deterministic, honors manual edits and highlights only connected evidence',()=>{
 const graph=createSeed(),nodes=graph.nodes.filter(n=>n.world==='home');
 for(const compact of [false,true]){
  const a=computationPositions(nodes,compact),b=computationPositions([...nodes].reverse(),compact);for(const n of nodes)assert.deepEqual(a.get(n.id),b.get(n.id));
  for(const edge of graph.edges.filter(e=>a.has(e.source)&&a.has(e.target)))assert.ok(compact?a.get(edge.source)[1]>a.get(edge.target)[1]:a.get(edge.source)[0]<a.get(edge.target)[0]);
 }
 nodes[0].layout={mode:'manual',position:[2,3,4]};assert.deepEqual(computationPositions(nodes,true).get(nodes[0].id),[2,3,4]);
 const path=computationPath(graph.edges,'skills');assert.ok(path.has('core')&&path.has('projects'));assert.ok(!path.has('education')&&!path.has('experience'));
});
