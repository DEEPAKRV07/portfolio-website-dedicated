import { LEGACY_GRAPH } from './legacyGraph.js';

// Keep the original graph keys and add newly supplied content to that graph.
export function preserveNeuralGraph(records, nodes, edges) {
  const aliases = { 'home-profile': 'core', 'education-degree-node': 'sa_engineering_college' };
  for (const node of nodes) {
    if (node.id.startsWith('home-')) aliases[node.id] = node.contentId;
    if (node.world === 'projects') aliases[node.id] = node.contentId;
    if (node.world === 'skills') aliases[node.id] = node.contentId;
    if (node.world === 'experience') aliases[node.id] = node.contentId;
    if (node.world === 'contact') aliases[node.id] = `contact_${node.contentId}`;
  }
  aliases['home-profile'] = 'core';
  for (const node of nodes) { node.id = aliases[node.id] || node.id; node.parentId = aliases[node.parentId] || node.parentId; }
  for (const edge of edges) { edge.source = aliases[edge.source] || edge.source; edge.target = aliases[edge.target] || edge.target; }
  const connect = (source, target) => {
    if (source !== target && !edges.some(e => (e.source === source && e.target === target) || (e.target === source && e.source === target))) edges.push({id:`edge-${source}-${target}`,source,target,style:'tube',directed:false});
  };
  for (const world of ['projects','skills','experience','education','contact']) {
    const rootId = `${world}_root`;
    nodes.push({id:rootId,contentId:world,world,label:world==='skills'?'SKILLS & TECHNOLOGIES':world==='contact'?'GET IN TOUCH':world.toUpperCase(),parentId:null,layout:{mode:'auto',position:null,anchor:[0,0,0]},appearance:{geometry:'neural-core',material:'titanium',color:'#59e8a6',size:1.25,labelVisible:true},animation:{entrance:'scale',hover:'glow',duration:1.1},visible:true});
    for (const node of nodes.filter(n=>n.world===world && n.id!==rootId && !n.parentId)) { node.parentId=rootId; connect(rootId,node.id); }
  }
  const originalKey = id => ({core:'hero',football:'football-analysis',kaatchi:'kaatchi-media'}[id] || id);
  const currentKey = id => ({hero:'core','football-analysis':'football','kaatchi-media':'kaatchi'}[id] || id);
  const home = {core:[0,0,0],about:[0,7.8,0],skills:[-8,3.5,-.8],experience:[8,3.5,.8],projects:[-6.8,-4.8,-.6],contact:[6.8,-4.8,.6],education:[0,-7.8,0]};
  // Compact authored rows into balanced branches without changing any identity
  // or relationship. Wide Blender rows otherwise force tiny phone geometry.
  const composed={ 'boa-xr-exp':[0,6.2,0], 'forcrux-exp':[-6,-2.8,.2], 'msme-exp':[0,-6,0], 'quality-exp':[6,-2.8,-.2], contact_email:[-5,4,0],contact_linkedin:[5,4,.2],contact_github:[-5,-4.5,-.2],contact_resume:[5,-4.5,0] };
  for (const node of nodes) {
    const record=records.find(r=>r.id===node.contentId);
    const root=node.id==='core'||node.id.endsWith('_root')||node.id==='about-profile';
    node.appearance={...node.appearance,geometry:root?'neural-core':record?.type==='skill'?'neural-chip':record?.type==='category'?'neural-cluster':'neural-node',color:'#55e9a6',material:'titanium',size:node.id==='core'?1.75:root?1.35:record?.type==='skill'?.65:1.12,labelPosition:'below'};
    node.animation={entrance:'scale',hover:'glow',duration:root?1.1:.85};
    const authored=LEGACY_GRAPH[node.world]?.nodes.find(n=>n.id===originalKey(node.id));
    if(authored) {node.appearance.legacyWorld=node.world;node.appearance.legacyNode=authored.id;node.layout.anchor=authored.position.map(v=>v*1.45);}
    if(node.world==='home'){node.parentId=node.id==='core'?null:'core';node.layout.anchor=home[node.id];}
    if(composed[node.id])node.layout.anchor=composed[node.id];
    if(node.world==='skills') delete node.layout.anchor; // retain category links; expand into readable clusters
  }
  for (const [world, graph] of Object.entries(LEGACY_GRAPH)) for(const [source,target] of graph.edges){
    const a=currentKey(source),b=currentKey(target);
    if(nodes.some(n=>n.id===a&&n.world===world)&&nodes.some(n=>n.id===b&&n.world===world))connect(a,b);
  }
  for(const [a,b] of [['about','skills'],['skills','projects'],['projects','contact'],['contact','experience'],['experience','about'],['education','projects'],['education','contact']])connect(a,b);
  for(const edge of edges) {edge.id=`edge-${edge.source}-${edge.target}`;edge.style='tube';}
  for(const record of records.filter(r=>r.type==='category')) {
    const categoryNode=nodes.find(n=>n.contentId===record.id);
    record.relatedIds=[...new Set([...(record.relatedIds||[]),...nodes.filter(n=>n.parentId===categoryNode?.id).map(n=>n.contentId)])];
  }
}
