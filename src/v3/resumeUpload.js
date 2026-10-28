import { el } from './dom.js';
import { validateResumeFile, buildResumeGraph } from './resumeGraph.js';

export function resumeUpload({result,onReady,onClear}) {
  let controller=null, disposed=false;
  const status=el('p',{role:'status',class:'resume-progress'});
  const error=el('p',{role:'alert',class:'resume-error'});
  const input=el('input',{type:'file',accept:'.pdf,.docx',id:'resume-file','aria-describedby':'resume-privacy'});
  const cancel=el('button',{hidden:true,onClick:()=>{controller?.abort();status.textContent='Reading cancelled. Your portfolio is unchanged.';}},'Cancel reading');
  const zone=el('div',{class:'resume-dropzone'},el('label',{htmlFor:'resume-file'},'Choose a resume'),input,el('span',{},'or drop one PDF / DOCX here · up to 5 MB'));
  async function read(file){
    controller?.abort();const job=new AbortController();controller=job;
    input.disabled=true;cancel.hidden=false;error.textContent='';status.textContent='Checking file…';
    try{
      validateResumeFile(file);
      const {parseResume}=await import('./resumeParser.js');
      if(job.signal.aborted||disposed)return;
      const text=await parseResume(file,{signal:job.signal,onProgress:message=>{if(controller===job&&!disposed)status.textContent=message;}});
      if(job.signal.aborted||disposed)return;
      const extracted=buildResumeGraph(text,file.name);
      if(controller===job)onReady(extracted);
    }catch(err){if(!disposed&&controller===job){if(job.signal.aborted)status.textContent='Reading cancelled. Your portfolio is unchanged.';else{status.textContent='';error.textContent=err.message;}}}
    finally{if(!disposed&&controller===job){input.disabled=false;cancel.hidden=true;input.value='';}}
  }
  input.addEventListener('change',()=>{if(input.files?.[0])read(input.files[0]);});
  zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('drag-over');});
  zone.addEventListener('dragleave',()=>zone.classList.remove('drag-over'));
  zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('drag-over');if(e.dataTransfer.files.length!==1){error.textContent='Drop one resume at a time.';return;}read(e.dataTransfer.files[0]);});
  const element=el('section',{class:'resume-upload','aria-label':'Local resume explorer'},
    el('div',{},el('p',{class:'eyebrow'},'LOCAL RESUME EXPLORER'),el('h1',{},'Your experience, connected.'),
      el('p',{id:'resume-privacy'},'PDF and DOCX text is processed on this device. No upload to a server, no account, and no saved copy. Your file never changes Deepak’s published portfolio.'),
      el('p',{class:'resume-limit'},'Text-based files only; scanned PDFs need OCR first. Section detection and term groupings use rules, not a trained ANN. Review extracted text against your original document.')),
    zone,status,error,cancel,
    result?el('div',{class:'resume-result'},el('strong',{},result.fileName),el('p',{},`${result.sections.length} source sections · ${result.graph.nodes.length} connected nodes. Select a node or its text entry below.`),...result.warnings.map(w=>el('p',{},w)),el('button',{onClick:onClear},'Clear resume')):null,
    el('a',{href:'#/home',class:'text-link'},'← Return to Deepak’s portfolio'));
  return {element,dispose(){disposed=true;controller?.abort();}};
}
