import { normalize, validateSnapshot } from './schema.js';
import { THEME } from './theme.js';

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const MAX_RESUME_TEXT = 100000;
const HEADINGS = [
  ['education', 'Education', /^(?:education|academic(?: background| qualifications)?|qualifications)$/i],
  ['skills', 'Skills', /^(?:(?:technical|professional|core|key) )?(?:skills|competencies|technical exposure)(?: (?:and|&) (?:tools|technologies|expertise))?$/i],
  ['experience', 'Experience', /^(?:(?:work|professional|relevant|internship) )?(?:experience|employment|work history|internships)$/i],
  ['projects', 'Projects', /^(?:(?:selected|academic|personal|key) )?projects(?: (?:and|&) research)?$/i],
  ['certifications', 'Certifications', /^(?:certifications?|certificates?|licenses?(?: and certifications?)?)$/i],
  ['summary', 'Profile', /^(?:(?:professional|career) )?(?:summary|profile|objective|about me)$/i],
];
// These group literal matches; they do not assess ability or infer employment.
const DOMAINS = [
  ['ai', 'AI / ML terms', ['machine learning','deep learning','tensorflow','pytorch','yolo','yolov8','opencv','computer vision','nlp','llm','rag','generative ai']],
  ['software', 'Software terms', ['python','javascript','typescript','react','next.js','nextjs','three.js','threejs','java','c++','c#','html','css','node.js','sql']],
  ['data', 'Data & cloud terms', ['pandas','numpy','excel','postgresql','mongodb','aws','azure','docker','kubernetes','power bi']],
  ['immersive', 'Mobile & XR terms', ['flutter','dart','unity','unreal','xr','ar','vr','android','ios']],
];
const matches = (text, term) => new RegExp(`(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}($|[^a-z0-9])`, 'i').test(text);

export function validateResumeFile(file) {
  const extension = file?.name?.split('.').pop()?.toLowerCase();
  if (!['pdf','docx'].includes(extension)) throw new Error('Choose a PDF or DOCX resume. Other file types are not supported.');
  if (!file.size || file.size > MAX_RESUME_BYTES) throw new Error('Choose a non-empty file smaller than 5 MB.');
  const allowed = extension === 'pdf' ? ['application/pdf'] : ['application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/zip'];
  if (file.type && !allowed.includes(file.type)) throw new Error('The file type does not match its extension. Choose an original PDF or DOCX.');
  return extension;
}

export function extractSections(text) {
  if (typeof text !== 'string' || text.length > MAX_RESUME_TEXT) throw new Error('This document is too large to explore. Use a resume under 20 pages.');
  const lines = text.replace(/\r/g,'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').split('\n').map(s=>s.trim()).filter(Boolean);
  if (lines.join(' ').length < 35) throw new Error('No readable resume text found. Scanned PDFs need OCR first; export a text-based PDF or DOCX.');
  const sections = new Map();
  let current = ['summary', 'Profile'];
  for (const line of lines) {
    const clean = line.replace(/^[•\d.\s-]+/,'').replace(/[:\s]+$/,'');
    const heading = clean.length < 65 && HEADINGS.find(([, , expression]) => expression.test(clean));
    if (heading) { current=heading; continue; }
    if (!sections.has(current[0])) sections.set(current[0], { id:current[0], title:current[1], lines:[] });
    sections.get(current[0]).lines.push(line);
  }
  return [...sections.values()].map(s=>({id:s.id,title:s.title,text:s.lines.join('\n')}));
}

export function buildResumeGraph(text, fileName = 'Resume') {
  const sections = extractSections(text);
  const nodes=[], edges=[], records=[];
  const add = (id,title,layer,description,tags=[],type='section') => {
    records.push({id,slug:id,type,status:'published',title,summary:layer===1?'Terms grouped by transparent matching rules; no proficiency is inferred.':'Text extracted from your document. Review it against the original.',tags,sections:(description.match(/[\s\S]{1,18000}/g)||[]).map((content,index)=>({heading:(layer===1?'Source excerpts':'Extracted text')+(index?` (continued ${index+1})`:''),content}))});
    nodes.push({id,contentId:id,world:'resume',label:title,networkLayer:layer,networkOrder:nodes.filter(n=>n.networkLayer===layer).length,appearance:{geometry:layer===1?'neural-cluster':layer===0?'neural-chip':id==='resume-profile'?'neural-core':'neural-node',size:id==='resume-profile'?1.15:.8,color:layer===1?THEME.cyan:THEME.mint,labelPosition:'below'},animation:{entrance:'scale',hover:'glow',duration:.6}});
    return id;
  };
  const connect = (source,target,relationship) => {
    if (!edges.some(e=>e.source===source&&e.target===target)) edges.push({id:`${source}-${target}`,source,target,relationship,directed:true,style:'tube'});
  };
  for(const section of sections)add(`resume-input-${section.id}`,section.title,0,section.text);
  const groups=DOMAINS.map(([id,title,terms])=>({id,title,terms:terms.filter(term=>matches(text,term))})).filter(g=>g.terms.length);
  const covered=new Set();
  for(const group of groups){
    const sources=sections.filter(s=>group.terms.some(term=>matches(s.text,term)));
    add(`resume-group-${group.id}`,group.title,1,sources.map(s=>`${s.title}\n${s.text}`).join('\n\n'),group.terms);
    for(const source of sources){connect(`resume-input-${source.id}`,`resume-group-${group.id}`,'contains-term');covered.add(source.id);}
  }
  const rest=sections.filter(s=>!covered.has(s.id));
  if(rest.length){
    add('resume-group-background','Background context',1,rest.map(s=>`${s.title}\n${s.text}`).join('\n\n'));
    for(const s of rest)connect(`resume-input-${s.id}`,'resume-group-background','document-context');
  }
  add('resume-profile','Document profile',2,sections.map(s=>`${s.title}\n${s.text}`).join('\n\n'));
  for(const n of nodes.filter(n=>n.networkLayer===1))connect(n.id,'resume-profile','summarized-in');
  for(const section of sections.filter(s=>['projects','experience'].includes(s.id))){
    const output=add(`resume-output-${section.id}`,`${section.title} evidence`,2,section.text,[],section.id==='projects'?'project':'experience');
    const parents=edges.filter(e=>e.source===`resume-input-${section.id}`).map(e=>e.target);
    for(const parent of parents)connect(parent,output,'source-evidence');
  }
  records.push({id:'resume',slug:'resume',type:'section',status:'published',title:'Resume explorer'});
  for(const node of nodes){const record=records.find(r=>r.id===node.contentId);record.relatedIds=[...new Set(edges.filter(e=>e.source===node.id||e.target===node.id).map(e=>e.source===node.id?e.target:e.source))];}
  const graph=normalize({schemaVersion:3,profile:{name:'Uploaded resume',title:fileName.slice(0,300),summary:'Private, local exploration'},records,nodes,edges,settings:{layouts:{resume:'network'}}});
  const validation=validateSnapshot(graph);
  if(!validation.valid)throw new Error('The extracted graph could not be validated. Your portfolio is unchanged.');
  return {graph,sections, fileName, warnings:sections.length===1?['Section headings were not detected. The text is preserved as one profile section.']:[]};
}
