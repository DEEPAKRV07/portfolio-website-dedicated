import { BASE_URL, SUBNET_DEFINITIONS } from '../data/portfolioData.js';
import { normalize } from './schema.js';

const summary = 'Computer Science graduate specializing in Artificial Intelligence and Machine Learning, with hands-on experience in computer vision, AI systems, XR integration, software development, and experiment-driven R&D.';
const technicalExposure = [
  { heading: 'Programming', content: 'Python, SQL, C++, C, Dart, JavaScript, HTML5, CSS3.' },
  { heading: 'AI / ML', content: 'Machine Learning, Deep Learning, Computer Vision, Object Detection, Semantic Segmentation, Multi-Object Tracking, YOLOv8, Fast-SCNN, TensorFlow, TensorFlow Lite, OCR, K-Means Clustering.' },
  { heading: 'Computer vision & geometry', content: 'Camera Calibration, Image Analysis, Geometric Measurement, Stereo Vision, 3D Geometry, Feature Extraction, Ground-Truth Validation, Error Analysis.' },
  { heading: 'XR & software', content: 'Unity, XR/MR Integration, Spatial Feedback, Real-Time Hardware Validation, Flutter, React, Next.js, TypeScript, Django, OpenCV, Google ML Kit, REST APIs.' },
  { heading: 'Generative AI & exposure', content: 'LLMs, RAG, LangChain, LangGraph, Prompt Engineering, Embeddings, Vector Databases, AI Agents.' },
  { heading: 'Engineering & tools', content: 'Git, GitHub, Regression Testing, Performance Profiling, Root-Cause Analysis, Experiment Design, Technical Documentation, Android Studio, Playwright, Chromium, Three.js, GSAP, SQL Server, SQLite3, Power BI.' },
];
import { preserveNeuralGraph } from './neuralGraph.js';
import { structureSkills } from './skillsGraph.js';
const clone = value => JSON.parse(JSON.stringify(value));
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const palette = { home: '#64f3b2', about: '#64f3b2', projects: '#6ad8ff', skills: '#b6f57b', experience: '#e4bc7c', education: '#b4a0ff', contact: '#72ead4' };
const geometries = { home: 'core', about: 'core', projects: 'monolith', skills: 'chip', experience: 'tower', education: 'archive', contact: 'beacon' };
const record = (id, type, title, data = {}) => ({
  id, slug: slug(id), type, title, subtitle: '', summary: '', sections: [], tags: [], links: [], media: [],
  relatedIds: [], status: 'published', order: 0, ...data,
});
const node = (id, contentId, world, label, data = {}) => ({
  id, contentId, world, label, parentId: null, layout: { mode: 'auto', position: null },
  appearance: { geometry: geometries[world] ?? 'portal', material: 'titanium', color: palette[world] ?? '#64f3b2', size: 1, labelVisible: true },
  animation: { entrance: 'rise', hover: 'glow', duration: 0.75 }, visible: true, ...data,
});

/** Deterministic V3 migration of the V2 portfolio, reconciled to the supplied October 2026 resume. */
export function createSeed() {
  const records = [];
  const nodes = [];
  const edges = [];
  const add = item => { records.push(item); return item; };
  const connect = (source, target, style = 'line') => edges.push({ id: `edge-${source}-${target}`, source, target, style, directed: false });
  const worldDescriptions = {
    about: ['About', 'A practice built around experimentation.', 'Computer vision, AI systems, XR integration, and thoughtful software engineering.'],
    projects: ['Projects', 'Ideas tested in the real world.', 'Assistive vision, sports analytics, data pipelines, web platforms, and a personal restoration study.'],
    skills: ['Skills', 'Connected tools. Applied knowledge.', 'Explore technologies through the projects and engineering work where they are used.'],
    experience: ['Experience', 'Learning through building.', 'Computer vision R&D, frontend engineering, and embedded systems.'],
    education: ['Education', 'The foundations of the practice.', 'Computer Science and Engineering, with an AI/ML specialization.'],
    contact: ['Contact', 'Start a conversation.', 'Email, professional profiles, and the latest resume.'],
  };
  for (const [world, [title, subtitle, description]] of Object.entries(worldDescriptions)) {
    add(record(world, 'section', title, { subtitle, summary: description, order: records.length }));
    nodes.push(node(`home-${world}`, world, 'home', title, {
      appearance: { geometry: 'portal', material: 'titanium', color: palette[world], size: 1, labelVisible: true },
    }));
  }
  add(record('profile', 'about', 'Deepak R V', {
    slug: 'deepak-r-v', subtitle: 'AI / ML Engineer · Software Developer', summary,
    sections: [
      { heading: 'Professional summary', content: `${summary} Strong problem-solving skills with experience developing, validating, debugging, and optimizing real-world technical prototypes.` },
      { heading: 'Recent work', bullets: [
        'Computer Vision / AI R&D Intern at BOA XR, iTNT Hub, Anna University, Guindy (September–October 2026).',
        'Frontend Developer at FORCRUX, a four-member startup initiative (May–July 2026); developed the Kaatchi Media client website.',
        'Embedded Systems Intern at MSME, Guindy, Chennai (August–September 2024).',
      ] },
      ...clone(technicalExposure),
      { heading: 'Education', content: 'B.E. Computer Science and Engineering (AI/ML Specialization), S.A. Engineering College, Chennai, 2022–2026. CGPA: 7.99 / 10.' },
    ],
    tags: ['Computer Vision', 'AI / ML', 'XR', 'Software Engineering'],
    links: [{ label: 'Read resume', url: `${BASE_URL}my_resume.pdf` }],
    relatedIds: ['boa-xr-exp', 'education-degree', 'sightmate'],
  }));
  nodes.push(node('home-profile', 'profile', 'home', 'Deepak R V', {
    appearance: { geometry: 'core', material: 'emissive', color: palette.home, size: 1.5, labelVisible: true },
  }));
  Object.keys(worldDescriptions).forEach(world => connect('home-profile', `home-${world}`, 'tube'));
  nodes.push(node('about-profile', 'profile', 'about', 'Deepak R V', {
    appearance: { geometry: 'core', material: 'emissive', color: palette.about, size: 1.5, labelVisible: true },
  }));

  // Preserve case-study prose and stable IDs. Superseded role/metric assertions are
  // retained in the V2 Git checkpoint; public V3 follows the newer resume.
  for (const [index, project] of SUBNET_DEFINITIONS.projects.categories.entries()) {
    const sections = clone(project.sections).filter(section => !/METRICS|MODEL PERFORMANCE/.test(section.heading));
    const roleSection = sections.find(section => section.heading.includes('ROLE'));
    if (project.id === 'forcrux' && roleSection) roleSection.content = 'Frontend architecture and design-system work for a private technology studio platform. This retained V2 case study is separate from the dated FORCRUX / Kaatchi Media client engagement in the experience timeline.';
    if (project.id === 'kaatchi' && roleSection) roleSection.content = 'Frontend Developer within the four-member FORCRUX team. Developed the Kaatchi Media client website based on business, design, and content requirements, and contributed to testing, debugging, performance optimization, collaboration, and production deployment.';
    const item = add(record(project.id, 'project', project.title, {
      subtitle: project.subtitle, summary: sections[0]?.content ?? '', sections, tags: clone(project.tags),
      links: project.actions.map(action => ({ label: action.label, url: action.url })),
      category: project.kicker, featured: ['sightmate', 'football', 'google-maps'].includes(project.id),
      role: project.id === 'kaatchi' ? 'Frontend Developer' : 'Developer',
      order: { sightmate: 0, football: 1, 'google-maps': 2, kaatchi: 3, forcrux: 5 }[project.id] ?? index,
      projectStatus: project.id === 'forcrux' ? 'Private case study' : 'Portfolio project',
      source: 'Existing V2 portfolio; roles reconciled with latest supplied resume',
    }));
    nodes.push(node(`project-${item.id}`, item.id, 'projects', project.label));
  }
  add(record('punch-hero', 'project', 'Punch Hero', {
    subtitle: 'Legacy Unity Android restoration & ARM64 porting study',
    summary: 'A personal, fan-driven compatibility study migrating a legacy Unity 3.5.7f6 Android game to Unity 2022.3.62f3.',
    category: 'Personal compatibility study', role: 'Independent study', order: 4, projectStatus: 'In progress',
    sections: [
      { heading: 'The study', content: 'Analyzing a legacy Unity 3.5.7f6 Android game and migrating its project to Unity 2022.3.62f3. The repository is private.' },
      { heading: 'Validated work', bullets: [
        'Built and installed an ARM64/IL2CPP APK while preserving the original package identity and existing saved career data.',
        'Fixed Training Center prefab loading linked to duplicate serialized IDs and corrected inter-round camera timing.',
        'Validated selected gameplay flows on a physical Android device.',
      ] },
      { heading: 'Current limitations', content: 'Restoration remains in progress. Mega Punch activation, character presentation, complete career progression, and broader gameplay validation are unresolved. No public APK is being claimed.' },
    ],
    tags: ['Unity', 'C#', 'Android', 'IL2CPP', 'ARM64', 'APK Analysis', 'ADB', 'PowerShell', 'Git', 'GitHub Actions'],
    relatedIds: ['unity', 'engineering-validation'],
  }));
  nodes.push(node('project-punch-hero', 'punch-hero', 'projects', 'PUNCH HERO'));

  add(record('boa-xr-exp', 'experience', 'Computer Vision / AI R&D Intern', {
    subtitle: 'BOA XR · iTNT Hub', organization: 'BOA XR', role: 'Computer Vision / AI R&D Intern',
    startDate: '2026-09', endDate: '2026-10', current: false, location: 'iTNT Hub, Anna University, Guindy',
    employmentType: 'Internship', order: 0,
    summary: 'Hands-on computer vision and AI R&D for a confidential real-time XR prototype.',
    sections: [
      { heading: 'Context', content: 'Confidential real-time XR prototype at iTNT Hub, Anna University, Guindy. The public description is limited to the experience disclosed in the supplied resume.' },
      { heading: 'Research & engineering', bullets: [
        'Analyzed an inherited codebase, validated baseline behavior, and used controlled experiments to identify technical limitations.',
        'Developed and evaluated vision-based physical measurement workflows involving camera calibration, object localization, segmentation, geometric analysis, and independent ground-truth validation.',
        'Integrated computer-vision processing with Unity-based XR workflows and real hardware, validating perception, spatial feedback, and runtime behavior under device conditions.',
        'Performed failure analysis across detection, segmentation, geometry, recognition, tracking, and runtime stages; applied regression testing and documented fixes, limitations, and findings.',
        'Profiled live pipeline behavior, identified bottlenecks, and implemented runtime optimizations while verifying expected system behavior.',
      ] },
    ],
    tags: ['Computer Vision', 'AI R&D', 'Unity', 'XR', 'Camera Calibration', 'Regression Testing', 'Performance Profiling'],
    relatedIds: ['opencv', 'unity', 'camera-calibration', 'engineering-validation'],
  }));
  add(record('forcrux-exp', 'experience', 'Frontend Developer', {
    subtitle: 'FORCRUX · Four-member startup initiative', organization: 'FORCRUX', role: 'Frontend Developer',
    startDate: '2026-05', endDate: '2026-07', current: false, employmentType: 'Part-time', order: 1,
    summary: 'Frontend development for the Kaatchi Media client website as part of a four-member team.',
    sections: [{ heading: 'Responsibilities & contribution', bullets: [
      'Developed the Kaatchi Media client website based on business, design, and content requirements.',
      'Built responsive interfaces, photography galleries, portfolio filtering, animations, reusable UI components, and interactive navigation.',
      'Contributed to testing, debugging, performance optimization, Git/GitHub collaboration, and production deployment.',
    ] }],
    tags: ['JavaScript', 'HTML5', 'CSS3', 'Responsive UI', 'Git', 'GitHub'],
    links: [{ label: 'Kaatchi Media', url: 'https://kaatchimedia.com/' }],
    relatedIds: ['kaatchi', 'sqlite', 'engineering-validation'],
  }));
  // Retain the old ID for migration/history without asserting a second employer.
  add(record('kaatchi-exp', 'experience', 'Kaatchi Media client engagement', {
    status: 'archived', subtitle: 'Merged into FORCRUX experience', organization: 'FORCRUX',
    summary: 'The latest resume identifies this work as a client engagement through FORCRUX. See the published FORCRUX entry.',
    relatedIds: ['forcrux-exp', 'kaatchi'], order: 4,
  }));
  add(record('msme-exp', 'experience', 'Intern — Embedded Systems', {
    subtitle: 'MSME · Guindy, Chennai', organization: 'MSME', role: 'Embedded Systems Intern',
    startDate: '2024-08', endDate: '2024-09', current: false, location: 'Guindy, Chennai', employmentType: 'Internship', order: 2,
    summary: 'Automation prototypes using Arduino boards and IoT components for real-time monitoring and control.',
    sections: [{ heading: 'Hands-on engineering', bullets: [
      'Developed automation projects using Arduino boards and IoT components for real-time monitoring and control.',
      'Programmed sensors and output modules; worked on microcontroller integration, circuit debugging, and prototype testing.',
      'Gained practical exposure to embedded hardware workflows, troubleshooting, and real-time control applications.',
    ] }],
    tags: ['Embedded Systems', 'Arduino', 'Sensors', 'IoT', 'Hardware Debugging'], relatedIds: ['embedded-systems'],
  }));
  const quality = SUBNET_DEFINITIONS.experience.categories.find(item => item.id === 'quality-exp');
  add(record('quality-exp', 'experience', quality.title, {
    subtitle: 'Quality Threads', organization: 'Quality Threads', role: 'Digital media collaboration', employmentType: 'Collaboration',
    summary: quality.sections[0].content, sections: clone(quality.sections), tags: clone(quality.tags), order: 3,
    source: 'Retained existing portfolio contribution; dates not supplied',
  }));
  records.filter(item => item.type === 'experience' && item.status === 'published').forEach(item => nodes.push(node(`experience-${item.id}`, item.id, 'experience', item.organization)));
  const experienceNodes = nodes.filter(item => item.world === 'experience');
  experienceNodes.slice(1).forEach((item, index) => connect(experienceNodes[index].id, item.id, 'ribbon'));

  add(record('education-degree', 'education', 'B.E. Computer Science & Engineering', {
    subtitle: 'AI / ML Specialization', institution: 'S.A. Engineering College', location: 'Chennai',
    degree: 'Bachelor of Engineering', course: 'Computer Science and Engineering', specialization: 'AI/ML',
    startDate: '2022', endDate: '2026', year: '2022–2026', grade: '7.99 / 10',
    summary: 'S.A. Engineering College, Chennai · 2022–2026 · CGPA 7.99 / 10',
    sections: [
      { heading: 'Qualification', content: 'Bachelor of Engineering in Computer Science and Engineering, AI/ML Specialization. CGPA: 7.99 / 10.' },
      { heading: 'Activities & societies', bullets: ['IEEE Student Member.', 'Coordinated a department-level hackathon.', 'Participated in technical events and project exhibitions.'] },
      { heading: 'Coursework', content: 'Data Structures, Algorithms, Database Management Systems, Machine Learning, Artificial Intelligence, Computer Vision.' },
    ],
    tags: ['Computer Science', 'AI/ML', 'IEEE', 'Engineering'], relatedIds: ['yolov8', 'opencv'],
  }));
  nodes.push(node('education-degree-node', 'education-degree', 'education', 'S.A. Engineering College'));
  nodes.push(node('about-education', 'education-degree', 'about', 'EDUCATION'));
  nodes.push(node('about-research', 'boa-xr-exp', 'about', 'RECENT R&D'));
  connect('about-profile', 'about-education');
  connect('about-profile', 'about-research');

  const relatedBySkill = {
    yolov8: ['sightmate', 'football'], bytetrack: ['sightmate', 'football'], opencv: ['sightmate', 'football', 'boa-xr-exp'],
    'fast-scnn': ['google-maps'], pytorch: ['sightmate'], tensorflow: ['football'], 'ml-kit': ['sightmate', 'football'],
    kmeans: ['football', 'boa-xr-exp'], playwright: ['google-maps', 'football'], sqlite: ['kaatchi', 'forcrux'],
    concurrency: ['forcrux'], pandas: ['forcrux'], python: ['forcrux'], flutter: ['sightmate'], nextjs: ['forcrux-exp', 'punch-hero'],
  };
  for (const [index, category] of SUBNET_DEFINITIONS.skills.categories.entries()) {
    add(record(category.id, 'category', category.label, { summary: `Technologies and exposure in ${category.label.toLowerCase()}.`, order: index }));
    const parentId = `skill-category-${category.id}`;
    nodes.push(node(parentId, category.id, 'skills', category.label, {
      appearance: { geometry: 'portal', material: 'glass', color: palette.skills, size: 1.1, labelVisible: true },
    }));
    for (const [skillIndex, skill] of category.skills.entries()) {
      add(record(skill.id, 'skill', skill.name, {
        subtitle: skill.category, category: category.id, order: index * 10 + skillIndex,
        summary: `${skill.name} is part of Deepak’s technical skills and project experience.`,
        sections: [{ heading: 'Practice & context', content: `${skill.name}: ${skill.tags.join(', ')}.` }],
        tags: clone(skill.tags), relatedIds: relatedBySkill[skill.id] ?? [],
      }));
      const childId = `skill-${skill.id}`;
      nodes.push(node(childId, skill.id, 'skills', skill.name, { parentId, appearance: { geometry: 'chip', material: 'titanium', color: palette.skills, size: 0.65, labelVisible: true } }));
      connect(parentId, childId);
    }
  }
  const additionalSkills = [
    ['vision-geometry', 'Vision & geometry', [
      ['camera-calibration', 'Camera Calibration', ['boa-xr-exp'], ['Calibration', 'Geometric Measurement', 'Ground-Truth Validation']],
      ['semantic-segmentation', 'Semantic Segmentation', ['sightmate', 'boa-xr-exp'], ['Fast-SCNN', 'Scene Understanding']],
      ['multi-object-tracking', 'Multi-Object Tracking', ['football'], ['ByteTrack', 'Tracking', 'Optical Flow']],
      ['spatial-geometry', '3D Geometry', ['boa-xr-exp'], ['Stereo Vision', 'Spatial Feedback', 'Image Analysis']],
    ]],
    ['engineering-practice', 'XR & engineering', [
      ['unity', 'Unity & XR', ['boa-xr-exp', 'punch-hero'], ['C#', 'Unity', 'XR/MR', 'Android']],
      ['engineering-validation', 'Validation & Profiling', ['boa-xr-exp', 'punch-hero', 'forcrux-exp'], ['Regression Testing', 'Root-Cause Analysis', 'Experiment Design']],
      ['embedded-systems', 'Embedded Systems', ['msme-exp'], ['Arduino', 'IoT', 'Sensors']],
      ['data-automation', 'Data Automation', ['google-maps'], ['Playwright', 'SQLite3', 'SQL', 'Concurrency']],
    ]],
  ];
  additionalSkills.forEach(([categoryId, title, skills], categoryIndex) => {
    add(record(categoryId, 'category', title, { summary: title, order: 4 + categoryIndex }));
    const parentId = `skill-category-${categoryId}`;
    nodes.push(node(parentId, categoryId, 'skills', title, { appearance: { geometry: 'portal', material: 'glass', color: palette.skills, size: 1.1, labelVisible: true } }));
    skills.forEach(([id, name, relatedIds, tags], index) => {
      add(record(id, 'skill', name, { category: categoryId, subtitle: title, summary: `${name} applied in practical projects and engineering work.`, tags, relatedIds, order: 40 + categoryIndex * 10 + index }));
      nodes.push(node(`skill-${id}`, id, 'skills', name, { parentId, appearance: { geometry: 'chip', material: 'titanium', color: palette.skills, size: 0.65, labelVisible: true } }));
      connect(parentId, `skill-${id}`);
    });
  });
  // Bidirectional content relationships make each project/experience discoverable
  // from its skills and show the relevant technology context in the reading panel.
  for (const skill of records.filter(item => item.type === 'skill')) {
    for (const id of skill.relatedIds) {
      const target = records.find(item => item.id === id);
      if (target && !target.relatedIds.includes(skill.id)) target.relatedIds.push(skill.id);
    }
  }
  for (const [index, item] of SUBNET_DEFINITIONS.contact.categories.entries()) {
    const descriptions = { email: 'deepakvetrivelan@gmail.com', github: 'Source code & engineering projects', linkedin: 'Professional profile', resume: 'Latest resume · October 2026' };
    add(record(item.id, 'contact', item.label === 'RESUME' ? 'Resume' : item.label.charAt(0) + item.label.slice(1).toLowerCase(), {
      subtitle: descriptions[item.id], summary: descriptions[item.id], contactType: item.id,
      links: [{ label: item.id === 'resume' ? 'Read resume PDF' : `Open ${item.label.toLowerCase()}`, url: item.id==='resume'?`${BASE_URL}my_resume.pdf`:item.actionUrl }], order: index,
    }));
    nodes.push(node(`contact-${item.id}`, item.id, 'contact', item.label));
  }
  preserveNeuralGraph(records, nodes, edges);
  structureSkills(records,nodes,edges);
  return normalize({
    schemaVersion: 3,
    profile: {
      name: 'Deepak R V', title: 'AI / ML Engineer & Software Developer', summary,
      location: 'Chennai, India', email: 'deepakvetrivelan@gmail.com', phone: '+91 78452 10074',
      emailUrl: 'mailto:deepakvetrivelan@gmail.com', githubUrl: 'https://github.com/DEEPAKRV07',
      linkedinUrl: 'https://www.linkedin.com/in/deepakrv07/', resumeUrl: `${BASE_URL}my_resume.pdf`,
    },
    records, nodes, edges,
    settings: { layouts: { home: 'network', about: 'network', projects: 'network', skills: 'network', experience: 'network', education: 'network', contact: 'network' } },
  });
}
