import { validateResumeFile, MAX_RESUME_TEXT } from './resumeGraph.js';

function abortError(){return new DOMException('Resume processing cancelled.','AbortError');}
export async function parseResume(file, {signal, onProgress=()=>{}}={}) {
  const extension=validateResumeFile(file);
  const buffer=await file.arrayBuffer();
  if(signal?.aborted)throw abortError();
  const signature=new Uint8Array(buffer,0,Math.min(5,buffer.byteLength));
  if(extension==='pdf'&&String.fromCharCode(...signature)!=='%PDF-')throw new Error('This file is not a valid PDF.');
  if(extension==='docx'&&(signature[0]!==0x50||signature[1]!==0x4b))throw new Error('This file is not a valid DOCX.');
  onProgress('Reading document text on this device…');
  if(extension==='docx')return readDocx(buffer,signal);
  const [pdfjs, {default:workerUrl}]=await Promise.all([import('pdfjs-dist'),import('pdfjs-dist/build/pdf.worker.min.mjs?url')]);
  if(signal?.aborted)throw abortError();
  pdfjs.GlobalWorkerOptions.workerSrc=workerUrl;
  const task=pdfjs.getDocument({data:new Uint8Array(buffer),isEvalSupported:false,disableFontFace:true,useSystemFonts:true,useWorkerFetch:false,useWasm:false,verbosity:0});
  task.onPassword=()=>task.destroy();
  let timedOut=false;
  const cancel=()=>task.destroy();
  signal?.addEventListener('abort',cancel,{once:true});
  const timeout=setTimeout(()=>{timedOut=true;cancel();},30000);
  try {
    const pdf=await task.promise;
    if(pdf.numPages>20)throw new Error('Use a resume of 20 pages or fewer.');
    const pages=[];
    for(let number=1;number<=pdf.numPages;number++){
      if(signal?.aborted)throw abortError();
      onProgress(`Reading page ${number} of ${pdf.numPages} locally…`);
      const page=await pdf.getPage(number);
      const content=await page.getTextContent();
      let line='',lastY=null;const lines=[];
      for(const item of content.items){
        if(!('str' in item))continue;
        const y=item.transform?.[5];
        if(lastY!==null&&Math.abs(y-lastY)>3&&line){lines.push(line.trim());line='';}
        line+=item.str+' ';lastY=y;
        if(item.hasEOL){lines.push(line.trim());line='';lastY=null;}
      }
      if(line)lines.push(line.trim());pages.push(lines.join('\n'));
      if(pages.join('\n').length>MAX_RESUME_TEXT)throw new Error('The extracted text is too large. Use a shorter resume.');
      page.cleanup();
    }
    return pages.join('\n\n');
  } catch(error){
    if(signal?.aborted)throw abortError();
    if(timedOut)throw new Error('Reading took too long. Try a smaller text-based PDF.');
    if(/20 pages|too large/.test(error.message))throw error;
    throw new Error('This PDF could not be read. Remove password protection or export a fresh text-based PDF.');
  } finally {clearTimeout(timeout);signal?.removeEventListener('abort',cancel);await task.destroy();}
}

function readDocx(buffer,signal){
  return new Promise((resolve,reject)=>{
    const worker=new Worker(new URL('./docx.worker.js',import.meta.url),{type:'module'});
    const cleanup=()=>{clearTimeout(timer);worker.terminate();signal?.removeEventListener('abort',cancel);};
    const cancel=()=>{cleanup();reject(abortError());};
    const timer=setTimeout(()=>{cleanup();reject(new Error('DOCX reading took too long. Try a smaller file.'));},15000);
    signal?.addEventListener('abort',cancel,{once:true});
    worker.onerror=()=>{cleanup();reject(new Error('DOCX reading failed. Try exporting a PDF.'));};
    worker.onmessage=({data})=>{
      cleanup();
      if(data.error){reject(new Error(data.error));return;}
      // Parse inert XML only: never insert imported markup, relationships,
      // macros, links or embedded objects into the page.
      if(/<!DOCTYPE|<!ENTITY/i.test(data.xml)){reject(new Error('Unsupported XML declarations in this document.'));return;}
      const xml=new DOMParser().parseFromString(data.xml,'application/xml');
      if(xml.querySelector('parsererror')){reject(new Error('The DOCX text is malformed.'));return;}
      const ns='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
      const lines=[...xml.getElementsByTagNameNS(ns,'p')].map(p=>[...p.getElementsByTagNameNS(ns,'t')].map(n=>n.textContent).join(''));
      const text=lines.join('\n');
      if(text.length>MAX_RESUME_TEXT){reject(new Error('The extracted text is too large. Use a shorter resume.'));return;}
      resolve(text);
    };
    worker.postMessage(buffer,[buffer]);
  });
}
