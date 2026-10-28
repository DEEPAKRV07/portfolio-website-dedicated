# Local resume explorer

The **Build my network from a resume** link on Home, or **Resume explorer** in the footer, opens `#/resume`. Select or drop one PDF/DOCX up to 5 MB. The parser runs only after a file is selected. It never sends document bytes or extracted text to a server, never calls an AI service, and never writes resume data to localStorage/IndexedDB or the published content store. Returning to another portfolio world, clearing, or reloading discards the temporary graph.

PDF.js extracts text from text-based PDFs (maximum 20 pages; 30-second processing timeout). A bundled worker is used with evaluation and font injection disabled. Password-protected, malformed and image-only files show a useful error. OCR is not included. DOCX extraction reads only `word/document.xml` from the ZIP in a short-lived worker, with a 2 MB uncompressed XML limit and 15-second timeout. Imported XML is inert; macros, embedded objects, hyperlinks and document scripts are not rendered or executed. The overall text limit is 100,000 characters.

The extractor recognizes common standalone English headings: profile/summary, education, skills, experience, projects and certifications. Unrecognized text remains in the current section, and documents without recognized headings retain a single profile section with a warning. Complex columns, text boxes, unconventional headings and unusual PDF encodings can affect reading order. The complete extracted text remains inspectable. This is not a semantic AI resume evaluator and does not infer proficiency, dates, employers or missing qualifications.

Graph construction uses three layers:

- **Input:** actual non-empty source sections.
- **Hidden / synthesis:** deterministic groups of literal technology terms, or background context for unmatched sections. Group cards retain the source excerpts and matched terms.
- **Output:** a document profile and project/experience evidence only when those source sections exist.

Every edge represents a source-term match, context aggregation or source-evidence relationship. Stable IDs, bounded node counts, validation, geometry, camera controls, highlighting, responsive positions and detail cards reuse the portfolio engine. Frames, faceted processing structures and output cores distinguish roles without relying on color. Assembly appears in layer order; reduced motion shows the finished graph immediately. This is an ANN-inspired information visualization, not a trained neural network.

Use the node labels or text entries to inspect source content. **Close** returns to the graph; **Main core** or **Return to Deepak’s portfolio** restores authoritative content. Failed extraction leaves the current graph and portfolio intact. The explorer is independent of owner Studio publishing and requires no Supabase setup.

Implementation: `resumeUpload.js` (lifecycle/UI), `resumeParser.js` + `docx.worker.js` (local extraction), `resumeGraph.js` (source schema and deterministic relationships), and `computationGraph.js` (shared layer layout/path highlighting). Parser packages are lazily loaded; PDF.js and its worker are not downloaded for ordinary portfolio exploration. See the [PDF.js API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html) and [fflate](https://github.com/101arrowz/fflate) for their underlying APIs.
