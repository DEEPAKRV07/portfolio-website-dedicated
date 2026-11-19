// RVD COREWORLD // Evidence manifest, 2026-11-17
// Public GitHub inventory checked using the repository owner's connected account.
// These are source artifacts, NOT footage of the procedural WebGL scene.
// External image sources only load if a visitor expands a proof item.
const evidence = {
  sight: {
    pipeline:['Camera','YOLOv8 TFLite','Fast-SCNN','Guidance fusion','Accessible feedback'],
    status:'4 original images located in public repository · footage not supplied',
    media:[
      {name:'Object detection interface',type:'Project screenshot',src:'https://raw.githubusercontent.com/DEEPAKRV07/SightMate-AI-Assistant/main/assets/screenshots/object_detection.png',source:'https://github.com/DEEPAKRV07/SightMate-AI-Assistant/blob/main/assets/screenshots/object_detection.png'},
      {name:'OCR module development view',type:'Development screenshot',src:'https://raw.githubusercontent.com/DEEPAKRV07/SightMate-AI-Assistant/main/assets/screenshots/ocr.png',source:'https://github.com/DEEPAKRV07/SightMate-AI-Assistant/blob/main/assets/screenshots/ocr.png'},
      {name:'Braille input screen',type:'Project screenshot',src:'https://raw.githubusercontent.com/DEEPAKRV07/SightMate-AI-Assistant/main/assets/screenshots/braille.png',source:'https://github.com/DEEPAKRV07/SightMate-AI-Assistant/blob/main/assets/screenshots/braille.png'},
      {name:'Voice navigation UI in emulator',type:'Development screenshot',src:'https://raw.githubusercontent.com/DEEPAKRV07/SightMate-AI-Assistant/main/assets/screenshots/voice.png',source:'https://github.com/DEEPAKRV07/SightMate-AI-Assistant/blob/main/assets/screenshots/voice.png'}
    ],
    links:[['Source / README','https://github.com/DEEPAKRV07/SightMate-AI-Assistant'],['Flutter modules','https://github.com/DEEPAKRV07/SightMate-AI-Assistant/tree/main/lib']],
    notes:'Repository credits Deepak R.V, Gowtham S and Harmithaa V. Screenshot files were located, but their visual contents and current runtime were not independently validated. Distance labels inside the 3D simulation are illustrative; depth estimation is listed as future work in the README.'
  },
  football: {
    pipeline:['Video','YOLOv8','ByteTrack','Camera compensation','Analytics'],
    status:'Output screenshot and training curves in public repository · not benchmarked here',
    metrics:[['Precision (README)','0.95'],['Recall (README)','0.75'],['mAP@50 (README)','0.81'],['mAP@50–95 (README)','0.58']],
    media:[
      {name:'Annotated output screenshot',type:'Repository screenshot',src:'https://raw.githubusercontent.com/DEEPAKRV07/Football-Analysis-System/main/output_videos/screenshot.png',source:'https://github.com/DEEPAKRV07/Football-Analysis-System/blob/main/output_videos/screenshot.png'},
      {name:'YOLO training curves',type:'Training report image',src:'https://raw.githubusercontent.com/DEEPAKRV07/Football-Analysis-System/main/results.png',source:'https://github.com/DEEPAKRV07/Football-Analysis-System/blob/main/results.png'}
    ],
    links:[['Code and setup','https://github.com/DEEPAKRV07/Football-Analysis-System'],['Output folder','https://github.com/DEEPAKRV07/Football-Analysis-System/tree/main/output_videos']],
    notes:'The README reports the displayed precision, recall and mAP values. The repository contains a screenshot, not a shareable processed video in output_videos at inspection time. These values have not been independently reproduced.'
  },
  leads: {
    pipeline:['Playwright collection','SQLite queue','Four website workers','Validation / scoring','Dashboard & CRM'],
    status:'Code, sample dashboard and validation report found in public repository',
    metrics:[['Validation parts (repo report)','13/13'],['Website worker limit','4'],['Crawl speedup (README)','2.51×']],
    links:[['Architecture / README','https://github.com/DEEPAKRV07/Google-Maps-Lead-Generator'],['Dashboard HTML source','https://github.com/DEEPAKRV07/Google-Maps-Lead-Generator/blob/main/outputs/dashboard.html'],['Validation report','https://github.com/DEEPAKRV07/Google-Maps-Lead-Generator/blob/main/outputs/VALIDATION_REPORT.md'],['Dashboard code','https://github.com/DEEPAKRV07/Google-Maps-Lead-Generator/blob/main/dashboard.py']],
    notes:'The repository report records 13 validation sections passing on 3 Aug 2026. The speedup is README-reported and was not rerun. To avoid exposing business contact data, no database export is bundled. The 3D pipeline simulation uses synthetic records.'
  },
  unity: {
    pipeline:['Unity 3.5.7','Asset migration','Unity 2022.3','ARM64 IL2CPP','Device QA'],
    status:'Private repo · public evidence awaiting your approval',
    notes:'Personal compatibility study, still in progress. No private repository files, copyrighted game resources or APK are made public. Supply an approved redacted device recording to show the build.'
  },
  experience: {
    pipeline:['Research baseline','Calibration / CV','Ground-truth checks','Unity XR','Runtime profiling'],
    status:'Résumé and public LinkedIn profile · confidential work excluded',
    links:[['LinkedIn career profile','https://www.linkedin.com/in/deepakrv07/']],
    notes:'BOA XR prototype media is not provided; no confidential prototype is shown. The FORCRUX client project appears on LinkedIn, but permission and an approved public URL still need confirmation before embedding screenshots.'
  },
  education: {
    status:'Academic record on résumé · additional public credentials listed on LinkedIn',
    links:[['LinkedIn certificates','https://www.linkedin.com/in/deepakrv07/']],
    notes:'The public profile lists NPTEL Privacy and Security in Online Social Media (May 2025) and MSME Embedded Systems (Sep 2024). Credential numbers are deliberately excluded; certificates are not reproduced.'
  },
  about: {
    status:'Résumé plus repository account verified',
    links:[['GitHub profile','https://github.com/DEEPAKRV07'],['LinkedIn profile','https://www.linkedin.com/in/deepakrv07/'],['Portfolio source','https://github.com/DEEPAKRV07/portfolio-website-dedicated']],
    notes:'Select a public project laboratory to see source artifacts and traceable repo links. Additional repos appear in the development workbench; ownership of a repository does not establish sole authorship.'
  }
};

// Supplementary source-backed explorations; included separately from core résumé projects.
const workbench = [
{n:'Gesture-controlled virtual mouse',group:'Computer vision',repo:'Virtual-Mouse-Controll',desc:'MediaPipe hand landmarks and gesture rules for cursor movement and click actions.',stack:'Python · OpenCV · MediaPipe · PyAutoGUI',stage:'README reviewed'},
{n:'Communication assistant',group:'AI / RAG',repo:'Communication_Assistant_AI',desc:'Streamlit email/triage and retrieval experiments; review the repository for setup.',stack:'Python · Streamlit · NLP',stage:'Public repository listing'},
{n:'Procedural title animation',group:'Graphics / GPU',repo:'jailer2-title-card-recreation',desc:'CUDA and CPU-driven experimental title animation with FFmpeg output.',stack:'Python · NumPy · CuPy · FFmpeg',stage:'Public repository listing',media:'https://github.com/DEEPAKRV07/jailer2-title-card-recreation'},
{n:'CarZone modernization',group:'Software',repo:'carzone-modernized',desc:'Django updates, Docker, seed data, application testing and modernized setup. Visual redesign still pending.',stack:'Django · Python · Docker · PostgreSQL',stage:'README reviewed'},
{n:'Weather Globe',group:'Software',repo:'weather-globe',desc:'React/Vite weather UI and GitHub Pages workflow; live API use requires a configured key.',stack:'React · Vite · OpenWeather',stage:'README reviewed · contribution scope unconfirmed'},
{n:'Diabetes prediction notebook',group:'AI / RAG',repo:'diabetes-prediction',desc:'Educational predictive-model experiment; not a clinical tool.',stack:'Python · Scikit-learn',stage:'Public repository listed'},
{n:'Face detection study',group:'Computer vision',repo:'Face-Detection-System',desc:'Computer vision learning exercise.',stack:'Python · OpenCV',stage:'Public repository listed'},
{n:'RAG explorations',group:'AI / RAG',repo:'RAG_LEARNIINGS',desc:'Public RAG learning repository.',stack:'LangChain · RAG',stage:'Public repository listed',branch:'master'},
{n:'LangGraph learning',group:'AI / RAG',repo:'Langgraph_learning',desc:'Public repository listing; implementation detail not independently checked.',stack:'LangGraph',stage:'Repository listed'},
{n:'3D portfolio experiments',group:'Graphics / GPU',repo:'portfolio-website-dedicated',desc:'Earlier 3D web design experiments using Three.js and Vite.',stack:'Three.js · Vite',stage:'Package manifest checked'}
];
