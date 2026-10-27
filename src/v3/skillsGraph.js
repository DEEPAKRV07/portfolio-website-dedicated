// Stable legacy IDs are intentionally retained. Their display titles, rather
// than historical GLB names, determine the actual technical meaning.
export const SKILL_DOMAINS = [
  ['cv-category','AI / ML',['yolov8','bytetrack','pytorch','tensorflow']],
  ['systems-category','Software Development',['playwright','sqlite','concurrency','pandas','python']],
  ['vision-geometry','Computer Vision',['opencv','ml-kit','kmeans','camera-calibration','semantic-segmentation','multi-object-tracking','spatial-geometry']],
  ['dl-category','Generative AI',['fast-scnn']],
  ['engineering-practice','Automation & Engineering',['embedded-systems','data-automation','engineering-validation','nextjs']],
  ['lang-category','Mobile & XR',['flutter','unity']],
];

export function structureSkills(records,nodes,edges){
  const byRecord=new Map(records.map(r=>[r.id,r]));
  const root=nodes.find(n=>n.id==='skills_root');
  root.contentId='profile';root.label='Deepak R V';root.graphRole='identity';
  const skillIds=new Set(nodes.filter(n=>n.world==='skills').map(n=>n.id));
  // Replace inherited asset lines with semantic relationships, not proximity.
  for(let i=edges.length-1;i>=0;i--)if(skillIds.has(edges[i].source)||skillIds.has(edges[i].target))edges.splice(i,1);
  const connect=(source,target,relationship)=>edges.push({id:`edge-${source}-${target}`,source,target,relationship,style:'tube',directed:true});
  for(const [order,[id,title,children]] of SKILL_DOMAINS.entries()){
    const domain=byRecord.get(id),parent=nodes.find(n=>n.id===id);
    Object.assign(domain,{title,summary:`${title}: ${children.map(id=>byRecord.get(id).title).join(', ')}.`,relatedIds:[...children],order});
    Object.assign(parent,{label:title,parentId:root.id,graphRole:'domain',branchOrder:order});parent.appearance.size=1.1;
    connect(root.id,parent.id,'domain');
    for(const [index,id] of children.entries()){
      const record=byRecord.get(id),node=nodes.find(n=>n.id===id);
      record.category=parent.id;record.subtitle=title;
      Object.assign(node,{parentId:parent.id,graphRole:'technology',branchOrder:index});
      if(id==='opencv')node.label='Real-time Vision';
      if(id==='fast-scnn')node.label='LLMs & RAG';
      node.appearance.size=.62;
      connect(parent.id,node.id,'contains');
    }
  }
  // The source only documents generative-AI exposure and Three.js in this
  // portfolio. Neither establishes use in the older FORCRUX/Maps projects.
  for(const id of ['fast-scnn','python']){
    const record=byRecord.get(id);
    for(const target of record.relatedIds){const other=byRecord.get(target);if(other)other.relatedIds=other.relatedIds.filter(x=>x!==id);}
    record.relatedIds=[];
  }
  for(const project of records.filter(r=>r.type==='project'&&r.status==='published')){
    const technologies=nodes.filter(n=>n.world==='skills'&&n.graphRole==='technology'&&byRecord.get(n.contentId).relatedIds.includes(project.id));
    if(!technologies.length)continue;
    const id=`skills-project-${project.id}`;
    const original=nodes.find(n=>n.world==='projects'&&n.contentId===project.id);
    nodes.push({id,contentId:project.id,world:'skills',label:original?.label||project.title,parentId:technologies[0].id,graphRole:'evidence',layout:{mode:'auto',position:null},appearance:{geometry:'neural-node',material:'titanium',color:'#70ddcc',size:.8,labelVisible:true,labelPosition:'below'},animation:{entrance:'scale',hover:'glow',duration:.65},visible:true});
    for(const technology of technologies)connect(technology.id,id,'applied-in');
  }
}

/** Ancestors, descendants and directly evidenced connections; no flood through siblings. */
export function relationshipPath(nodes,edges,selected){
  const byId=new Map(nodes.map(n=>[n.id,n])),related=new Set(selected?[selected]:[]);
  let parent=byId.get(selected)?.parentId;
  while(parent&&!related.has(parent)){related.add(parent);parent=byId.get(parent)?.parentId;}
  const visit=id=>{for(const n of nodes)if(n.parentId===id&&!related.has(n.id)){related.add(n.id);visit(n.id);}};
  if(selected)visit(selected);
  for(const e of edges)if(e.relationship==='applied-in'&&related.has(e.source)&&byId.get(e.source)?.graphRole==='technology')related.add(e.target);
  for(const e of edges)if(e.relationship==='applied-in'&&(e.source===selected||e.target===selected))related.add(e.source===selected?e.target:e.source);
  return related;
}

/** One graph; a responsive projection of its hierarchy, never random coordinates. */
export function skillPositions(nodes,edges,branchId,compact){
  const positions=new Map(),root=nodes.find(n=>n.graphRole==='identity');
  if(!root)return positions;
  const sorted=(list)=>list.slice().sort((a,b)=>(a.branchOrder??0)-(b.branchOrder??0)||a.id.localeCompare(b.id));
  if(!branchId){
    positions.set(root.id,[0,0,0]);
    sorted(nodes.filter(n=>n.graphRole==='domain')).forEach((domain,index)=>{
      const angle=Math.PI/2-index*Math.PI/3,radial=7.5;
      positions.set(domain.id,[Math.cos(angle)*radial,Math.sin(angle)*radial,0]);
      const children=sorted(nodes.filter(n=>n.parentId===domain.id));
      children.forEach((child,i)=>{const a=angle+(i-(children.length-1)/2)*.12;positions.set(child.id,[Math.cos(a)*11.8,Math.sin(a)*11.8,.1]);});
    });
  }else{
    const domain=nodes.find(n=>n.id===branchId),children=sorted(nodes.filter(n=>n.parentId===branchId));
    const projects=nodes.filter(n=>n.graphRole==='evidence').sort((a,b)=>a.id.localeCompare(b.id));
    positions.set(root.id,compact?[0,12,0]:[-13,0,0]);
    positions.set(domain.id,compact?[0,7.5,0]:[-7.5,0,0]);
    children.forEach((child,i)=>positions.set(child.id,compact?[children.length===1?0:(i%2?1:-1)*4.1,2-Math.floor(i/2)*4.5,0]:[0,((children.length-1)/2-i)*3.6,0]));
    const bottom=2-Math.floor((children.length-1)/2)*4.5-5;
    projects.forEach((project,i)=>positions.set(project.id,compact?[(i%2?1:-1)*4.1,bottom-Math.floor(i/2)*4.5,0]:[8,((projects.length-1)/2-i)*5,0]));
  }
  for(const node of nodes)if(node.layout?.mode==='manual')positions.set(node.id,[...node.layout.position]);
  return positions;
}

/** Keep owner-selected category and project relations synchronized with the scene. */
export function syncSkillRelationships(data){
  const root=data.nodes.find(n=>n.world==='skills'&&n.graphRole==='identity');if(!root)return;
  const records=new Map(data.records.map(r=>[r.id,r]));
  for(const node of data.nodes.filter(n=>n.world==='skills'&&n.graphRole==='technology')){
    const record=records.get(node.contentId);
    const domain=data.nodes.find(n=>n.world==='skills'&&n.graphRole==='domain'&&n.contentId===record?.category);
    if(domain)node.parentId=domain.id;
  }
  const existing=new Map(data.edges.map(e=>[`${e.source}/${e.target}`,e]));
  const typed=new Set(data.nodes.filter(n=>n.world==='skills'&&n.graphRole).map(n=>n.id));
  data.edges=data.edges.filter(e=>!e.relationship||!typed.has(e.source));
  const connect=(source,target,relationship)=>data.edges.push({...existing.get(`${source}/${target}`),id:existing.get(`${source}/${target}`)?.id||`edge-${source}-${target}`,source,target,relationship,style:existing.get(`${source}/${target}`)?.style||'tube',directed:true});
  for(const node of data.nodes.filter(n=>n.world==='skills'&&['domain','technology'].includes(n.graphRole)))if(node.parentId)connect(node.parentId,node.id,node.graphRole==='domain'?'domain':'contains');
  const activeEvidence=new Set();
  for(const project of data.records.filter(r=>r.type==='project')){
    const sources=data.nodes.filter(n=>n.world==='skills'&&n.graphRole==='technology'&&records.get(n.contentId)?.relatedIds.includes(project.id));
    if(!sources.length)continue;
    let target=data.nodes.find(n=>n.world==='skills'&&n.graphRole==='evidence'&&n.contentId===project.id);
    if(!target){target={id:`skills-project-${project.id}`,contentId:project.id,world:'skills',label:project.title,graphRole:'evidence',layout:{mode:'auto',position:null},appearance:{geometry:'neural-node',material:'titanium',color:'#70ddcc',size:.8,labelVisible:true,labelPosition:'below'},animation:{entrance:'scale',hover:'glow',duration:.65},visible:true};data.nodes.push(target);}
    target.parentId=sources[0].id;activeEvidence.add(target.id);
    for(const source of sources)connect(source.id,target.id,'applied-in');
  }
  const stale=new Set(data.nodes.filter(n=>n.graphRole==='evidence'&&!activeEvidence.has(n.id)).map(n=>n.id));
  data.nodes=data.nodes.filter(n=>!stale.has(n.id));data.edges=data.edges.filter(e=>!stale.has(e.source)&&!stale.has(e.target));
  for(const domain of data.nodes.filter(n=>n.graphRole==='domain')){const record=records.get(domain.contentId);if(record)record.relatedIds=data.nodes.filter(n=>n.parentId===domain.id).map(n=>n.contentId);}
}
