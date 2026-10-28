import { unzipSync, strFromU8 } from 'fflate';
self.onmessage = ({data}) => {
  try {
    const files=unzipSync(new Uint8Array(data),{filter:file=>file.name==='word/document.xml'&&file.originalSize<=2*1024*1024});
    const document=files['word/document.xml'];
    if(!document||document.length>2*1024*1024)throw new Error('Missing or oversized document text.');
    self.postMessage({xml:strFromU8(document)});
  } catch { self.postMessage({error:'This DOCX could not be read. Export a fresh DOCX or text-based PDF.'}); }
};
