/* ============================================================
   PORTFOLIO DATA MODEL
   Centralized data repository for Deepak R V's 3D Portfolio
   ============================================================ */

export const BASE_URL = import.meta.env.BASE_URL || '/';

export const MAIN_NODES_MOBILE_POSITIONS = {
  'core':       [0.0,  1.8, 0.0],
  'about':      [0.0,  6.2, 0.5],
  'skills':     [-3.6, -1.8, 0.0],
  'projects':   [0.0, -1.8, 0.0],
  'experience': [3.6, -1.8, 0.0],
  'contact':    [0.0, -5.8, 0.5],
};

export const MAIN_NODES = [
  { id: 'about', label: 'ABOUT', type: 'primary', position: [0.0, 7.8, 1.8] },
  { id: 'skills', label: 'SKILLS', type: 'primary', position: [-9.2, 3.8, -1.2] },
  { id: 'experience', label: 'EXPERIENCE', type: 'primary', position: [9.2, 3.8, 1.2] },
  { id: 'projects', label: 'PROJECTS', type: 'primary', position: [-6.8, -5.2, -1.8] },
  { id: 'contact', label: 'CONTACT', type: 'primary', position: [6.8, -5.2, 0.8] },
];

export const COMBINED_ABOUT_DATA = {
  kicker: 'PROFILE & CAPABILITIES',
  title: 'DEEPAK R V',
  subtitle: 'AI / ML ENGINEER & SOFTWARE DEVELOPER',
  sections: [
    {
      heading: 'PROFESSIONAL SUMMARY',
      content: 'B.E. Computer Science & Engineering (AIML Specialization) graduate specializing in real-time Computer Vision, Deep Learning, spatial decision reasoning, automated lead data engineering, and full-stack web platforms. Proven experience designing object detection and tracking pipelines (YOLOv8, ByteTrack), spatial navigation systems (SightMate), production data harvesting platforms (Google Maps Lead Intelligence), and design-system-driven web applications (FORCRUX, Kaatchi Media).',
    },
    {
      heading: 'CORE TECHNICAL FOCUS',
      bullets: [
        'Computer Vision & Tracking — YOLOv8, ByteTrack, OpenCV, Fast-SCNN, Optical Flow, K-Means Clustering',
        'Deep Learning & Edge AI — TensorFlow Lite, PyTorch, Google ML Kit OCR, Model Quantization, Spatial Decision Fusion',
        'Data Engineering & Automation — Python, Playwright, SQLite Master DB, ThreadPoolExecutor Concurrency, Pandas',
        'Full-Stack & Web Engineering — Next.js, React, TypeScript, GSAP Motion Design, Responsive CSS3/HTML5, Payload CMS',
      ],
    },
    {
      heading: 'CAREER MILESTONES',
      bullets: [
        'Lead Frontend Engineer & Design Systems — FORCRUX Studio Platform',
        'Software Developer Intern / Frontend Developer — Kaatchi Media (kaatchimedia.com)',
        'Embedded Systems Intern — MSME Technology Development Centre (MSME TDC)',
        'Digital Media Contributor — Quality Threads',
      ],
    },
    {
      heading: 'EDUCATION & QUALIFICATIONS',
      content: 'Bachelor of Engineering (B.E.) in Computer Science and Engineering (AI/ML Specialization) — S.A. Engineering College, Chennai (2022–2026) | CGPA: 8.1 / 10.',
    },
    {
      heading: 'CONTACT & SOCIAL CHANNELS',
      bullets: [
        'Email: deepakvetrivelan@gmail.com',
        'LinkedIn: linkedin.com/in/deepakrv07/',
        'GitHub: github.com/DEEPAKRV07',
      ],
    },
  ],
  tags: ['AI/ML Engineer', 'Computer Vision', 'B.E. CSE (AIML)', 'YOLOv8', 'Playwright', 'Next.js', 'PyTorch', 'SQLite'],
  actions: [
    { label: 'VIEW RESUME PDF', type: 'primary', url: `${BASE_URL}my_resume.pdf` },
  ],
};

export const SUBNET_DEFINITIONS = {
  skills: {
    id: 'skills',
    title: 'SKILLS & TECHNOLOGIES',
    subtitle: 'COMPUTATIONAL KNOWLEDGE GRAPH',
    categories: [
      {
        id: 'cv-category',
        label: 'COMPUTER VISION',
        position: [-6.8, 3.8, 1.8],
        skills: [
          { id: 'yolov8', label: 'YOLOv8', position: [-9.8, 5.5, 2.5], name: 'YOLOv8', category: 'Computer Vision', usedIn: ['SightMate', 'Football Analysis System'], tags: ['Object Detection', 'Real-Time Vision'] },
          { id: 'bytetrack', label: 'ByteTrack', position: [-9.2, 2.2, 0.8], name: 'ByteTrack', category: 'Computer Vision', usedIn: ['Football Analysis System'], tags: ['Multi-Object Tracking', 'Re-ID'] },
          { id: 'opencv', label: 'OpenCV', position: [-5.2, 6.2, 3.2], name: 'OpenCV', category: 'Computer Vision', usedIn: ['SightMate', 'Football Analysis System', 'MSME Center'], tags: ['Image Geometry', 'Frame Processing'] },
          { id: 'fast-scnn', label: 'Fast-SCNN', position: [-10.5, 3.6, -1.0], name: 'Fast-SCNN', category: 'Computer Vision', usedIn: ['SightMate'], tags: ['Semantic Segmentation', 'Real-Time'] },
        ],
      },
      {
        id: 'dl-category',
        label: 'DEEP LEARNING & AI',
        position: [6.8, 3.8, -1.8],
        skills: [
          { id: 'pytorch', label: 'PyTorch', position: [5.2, 6.2, -3.2], name: 'PyTorch', category: 'Deep Learning & AI', usedIn: ['Football Analysis System', 'Custom Vision Models'], tags: ['Model Training', 'Neural Networks'] },
          { id: 'tensorflow', label: 'TensorFlow', position: [9.8, 5.5, -2.5], name: 'TensorFlow Lite', category: 'Deep Learning & AI', usedIn: ['SightMate (TFLite)'], tags: ['On-Device Inference', 'TFLite'] },
          { id: 'ml-kit', label: 'ML Kit', position: [4.2, 2.0, 2.2], name: 'Google ML Kit', category: 'Deep Learning & AI', usedIn: ['SightMate (OCR & Translation)'], tags: ['Text Recognition', 'On-Device AI'] },
          { id: 'kmeans', label: 'K-Means', position: [9.2, 2.2, -0.8], name: 'K-Means Clustering', category: 'Deep Learning & AI', usedIn: ['Football Analysis System'], tags: ['Color Clustering', 'Team Assignment'] },
        ],
      },
      {
        id: 'systems-category',
        label: 'SYSTEMS & DEPLOYMENT',
        position: [-6.8, -3.8, -1.8],
        skills: [
          { id: 'playwright', label: 'Playwright', position: [-9.8, -5.5, -2.5], name: 'Playwright & Chromium', category: 'Systems & Deployment', usedIn: ['Google Maps Lead Platform'], tags: ['Browser Automation', 'Scraping'] },
          { id: 'sqlite', label: 'SQLite', position: [-9.2, -2.2, -0.8], name: 'SQLite Master DB', category: 'Systems & Deployment', usedIn: ['Google Maps Lead Platform', 'FORCRUX'], tags: ['Stateful Queue', 'Item Checkpoints'] },
          { id: 'concurrency', label: 'Concurrency', position: [-5.2, -6.2, -3.2], name: 'ThreadPoolExecutor', category: 'Systems & Deployment', usedIn: ['Google Maps Lead Platform'], tags: ['Multithreading', 'Parallel Crawling'] },
          { id: 'pandas', label: 'Pandas', position: [-4.2, -2.0, 2.2], name: 'Pandas & Data Pipelines', category: 'Systems & Deployment', usedIn: ['Google Maps Lead Platform', 'Football Analysis'], tags: ['Data Processing', 'Analytics'] },
        ],
      },
      {
        id: 'lang-category',
        label: 'LANGUAGES & TOOLS',
        position: [6.8, -3.8, 1.8],
        skills: [
          { id: 'python', label: 'Python', position: [9.8, -5.5, 2.5], name: 'Python', category: 'Languages & Tools', usedIn: ['Google Maps Platform', 'SightMate', 'Football Analysis'], tags: ['Core Language', 'AI/ML Engineering'] },
          { id: 'flutter', label: 'Flutter / Dart', position: [5.2, -6.2, 3.2], name: 'Flutter / Dart', category: 'Languages & Tools', usedIn: ['SightMate Mobile App'], tags: ['Cross-Platform UI', 'Mobile Apps'] },
          { id: 'nextjs', label: 'Next.js / TS', position: [9.2, -2.2, 0.8], name: 'Next.js, React & TS', category: 'Languages & Tools', usedIn: ['FORCRUX Studio Platform'], tags: ['Frontend Engineering', 'GSAP'] },
          { id: 'git', label: 'Git & GitHub', position: [4.2, -2.0, -2.2], name: 'Git & GitHub', category: 'Languages & Tools', usedIn: ['All Projects & Workflows'], tags: ['Version Control', 'DevOps'] },
        ],
      },
    ],
  },

  projects: {
    id: 'projects',
    title: 'ENGINEERING PROJECTS',
    subtitle: 'APPLIED AI, VISION & DATA SYSTEMS',
    categories: [
      {
        id: 'forcrux',
        label: 'FORCRUX',
        position: [-7.5, 3.8, 1.2],
        kicker: 'PRIVATE PROJECT / CASE STUDY',
        title: 'FORCRUX',
        subtitle: 'Premium Digital Engineering & Technology Studio Platform',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'FORCRUX is a premium digital engineering and technology studio platform designed to present the company’s software services, team, portfolio, case studies, and client conversion pipelines through an interactive digital web experience.',
          },
          {
            heading: 'MY ROLE & RESPONSIBILITIES',
            content: 'Lead Frontend Engineer & Design Systems Contributor. Engineered the component-based Next.js architecture, responsive virtual-camera composition, centralized GSAP motion design engine, video streaming optimization, and administrative Control OS direction.',
          },
          {
            heading: 'TECHNICAL ARCHITECTURE',
            content: 'Full-stack platform built with Next.js App Router, React, TypeScript, Payload CMS v3, and PostgreSQL. Features CMS-decoupled section providers, custom GSAP motion tokens, responsive viewport-specific video framing, and integer-pixel GPU compositing.',
          },
          {
            heading: 'KEY CONTRIBUTIONS & METRICS',
            bullets: [
              'Centralized GSAP Motion Engine with performance budgets & ScrollTrigger reveals',
              'Hero Video Payload Optimization: 7.43 MB → 1.98 MB WebM (73% reduction) & 3.50 MB MP4 fallback with faststart streaming',
              'Virtual Camera Composition: Responsive framing across 8 viewport classes from mobile to ultrawide',
              'Testimonial System: Seamless infinite circular carousel with touch-swipe, keyboard controls, and IntersectionObserver navigation visibility',
            ],
          },
          {
            heading: 'TECHNOLOGY STACK',
            bullets: [
              'Next.js & React — Component Architecture & App Router',
              'TypeScript — Strict Type Safety & System Interfaces',
              'GSAP & ScrollTrigger — Centralized Motion Design System',
              'Payload CMS v3 & PostgreSQL — Content & Data Management',
              'WebM / MP4 / WebP — GPU-Accelerated Responsive Streaming',
            ],
          },
        ],
        tags: ['Next.js', 'React', 'TypeScript', 'GSAP', 'Payload CMS', 'PostgreSQL', 'Design Systems', 'Private Case Study'],
        actions: [],
      },

      {
        id: 'google-maps',
        label: 'GOOGLE MAPS PLATFORM',
        position: [7.5, 3.8, -1.2],
        kicker: 'DATA ENGINEERING & AUTOMATION',
        title: 'Google Maps Lead Intelligence Platform',
        subtitle: 'Production-Grade Automated Discovery & Contact Enrichment Pipeline',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'A production-grade Python/Playwright platform that automates multi-category, multi-location business discovery from Google Maps, enriches leads through concurrent website crawling, validates data, persists state in SQLite, and ranks prospects using contactability scoring.',
          },
          {
            heading: 'SYSTEM ARCHITECTURE',
            content: 'Multi-stage data pipeline: Round-robin multi-category scheduler → Playwright Google Maps harvesting → SQLite master database & item-level queue engine → ThreadPoolExecutor multithreaded website contact crawler → Data validation & normalization → Lead scoring (A+ to D) → FORCRUX AI digital-gap analyzer → HTML/Excel dashboards & CRM exporters.',
          },
          {
            heading: 'MEASURED VALIDATION METRICS & RESULTS',
            bullets: [
              '50 Scheduled Search Tasks across 10 Categories & 5 Geographic Locations',
              '242 Harvested Leads with 97.5% Phone, 82.2% Website & 54.1% Email Coverage',
              '2.51× Measured Website-Enrichment Speedup via ThreadPoolExecutor parallel workers',
              '0 Extraction Failures with SQLite item-level resume state recovery',
            ],
          },
          {
            heading: 'KEY FEATURES & CAPABILITIES',
            bullets: [
              'Multi-Category Interleaved Round-Robin Scheduler',
              'SQLite Item-Level Resume System (Category → Location → Business Index)',
              'Persistent Work Queues & Duplicate URL Filtering',
              'Multithreaded Email, Social (FB, IG, LinkedIn, WhatsApp) & Form Crawling',
              'Contactability Lead Prioritization Scoring (A+ to D)',
              'FORCRUX AI Website Digital-Gap & Sales Pitch Analysis',
              'Standalone Dark HTML & Excel Dashboards + HubSpot/Zoho/Salesforce CSV Exporters',
            ],
          },
          {
            heading: 'TECHNOLOGY STACK',
            bullets: [
              'Python — Pipeline Automation & Business Logic',
              'Playwright & Chromium — Headless Browser Automation',
              'SQLite — Persistent Master Database & Stateful Work Queue',
              'ThreadPoolExecutor — Parallel Concurrent Website Enrichment',
              'Pandas — Data Processing & Multi-Format Reporting',
              'AI Engine — Digital Gap Analysis & Pitch Recommendation',
            ],
          },
        ],
        tags: ['Python', 'Playwright', 'SQLite', 'Pandas', 'ThreadPoolExecutor', 'Data Engineering', 'Lead Generation', 'CRM Automation'],
        actions: [
          { label: 'VIEW GITHUB REPO', type: 'primary', url: 'https://github.com/DEEPAKRV07/Google-Maps-Lead-Generator' },
        ],
      },

      {
        id: 'sightmate',
        label: 'SIGHTMATE',
        position: [-6.2, -4.5, -1.2],
        kicker: 'AI ASSISTIVE VISION PLATFORM',
        title: 'SightMate — AI Navigation Assistant',
        subtitle: 'Mobile Vision, Spatial Reasoning & Spoken Accessibility System',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'SightMate is an AI-powered mobile assistive application built in Flutter to help visually impaired users perceive their surroundings through real-time camera-based vision, spatial danger fusion, OCR text reading, voice commands, and spoken guidance.',
          },
          {
            heading: 'SYSTEM ARCHITECTURE',
            content: 'On-device mobile processing pipeline using TensorFlow Lite. Camera frames are processed concurrently by YOLOv8 for bounding-box object detection and Fast-SCNN for semantic scene segmentation. The Navigation Fusion Service evaluates Left/Center/Right danger regions to produce actionable guidance.',
          },
          {
            heading: 'KEY FEATURES & CAPABILITIES',
            bullets: [
              'On-Device YOLOv8 Object Detection & Bounding-Box Identification',
              'Fast-SCNN Semantic Scene & Traversable Path Segmentation',
              'Navigation Decision Fusion Engine (Move Left / Move Right / Path Clear / Obstacle Ahead)',
              'Google ML Kit OCR Spoken Text Reader with Duplicate Suppression',
              'Voice Command Controller for Hands-Free Navigation',
              'Touch-Based 6-Dot Braille Input Keyboard',
              'Google ML Kit Speech Translation Module',
              'Spoken Battery, Time, Date & Location Telemetry Feedback',
            ],
          },
          {
            heading: 'TECHNOLOGY STACK',
            bullets: [
              'Flutter & Dart — Cross-Platform Mobile Application Framework',
              'YOLOv8 & TensorFlow Lite — On-Device Object Detection Inference',
              'Fast-SCNN — Real-Time Semantic Scene Segmentation',
              'Google ML Kit — OCR Text Recognition & Language Translation',
              'Speech-to-Text & Text-to-Speech — Voice Control & Audio Guidance',
            ],
          },
        ],
        tags: ['Flutter', 'Dart', 'YOLOv8', 'TensorFlow Lite', 'Fast-SCNN', 'Google ML Kit', 'Computer Vision', 'Accessibility'],
        actions: [
          { label: 'VIEW GITHUB REPO', type: 'primary', url: 'https://github.com/DEEPAKRV07/SightMate-AI-Assistant' },
        ],
      },

      {
        id: 'football',
        label: 'FOOTBALL ANALYSIS',
        position: [6.2, -4.5, 1.2],
        kicker: 'COMPUTER VISION & SPORTS ANALYTICS',
        title: 'Football Match Video Analysis System',
        subtitle: 'End-to-End Deep Learning & Spatial Video Analytics Pipeline',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'Computer vision pipeline for automated football match video analysis, identifying players, referees, and the ball, maintaining tracking IDs across frames, compensating for camera motion, classifying team jersey colors, and calculating spatial match metrics.',
          },
          {
            heading: 'SYSTEM PIPELINE ARCHITECTURE',
            content: 'Video Frames → YOLOv8 Object Detection → ByteTrack Multi-Object Tracking → Optical Flow Camera Motion Compensation → Planar Homography View Transformation → Ball Position Interpolation → K-Means Team Jersey Classification → Speed, Distance & Possession Analytics → OpenCV Overlay Video Generation.',
          },
          {
            heading: 'DOCUMENTED MODEL PERFORMANCE METRICS',
            bullets: [
              'Precision: 0.95 (95% detection accuracy)',
              'Recall: 0.75 (75% object retrieval)',
              'mAP@50: 0.81 (Mean Average Precision at 0.5 IoU threshold)',
              'mAP@50-95: 0.58 (Mean Average Precision across IoU thresholds)',
              '4 Trained Football Classes: Ball, Player, Goalkeeper, Referee',
            ],
          },
          {
            heading: 'KEY FEATURES & CAPABILITIES',
            bullets: [
              'YOLOv8 & ByteTrack Multi-Object Player & Ball Tracking',
              'Optical Flow Camera-Motion Compensation for True Movement Metrics',
              'Planar Homography View Transformation to Top-Down 2D Pitch Representation',
              'Linear Ball Trajectory Interpolation for Missing Detection Handling',
              'K-Means Color Clustering for Automatic Team Jersey Assignment',
              'Player Speed Estimation & Total Distance Travelled Metrics',
              'Player-Ball Assignment & Team Possession Percentage Calculation',
              'OpenCV Video Output with Visual Radar Overlays & Player Statistics',
            ],
          },
          {
            heading: 'TECHNOLOGY STACK',
            bullets: [
              'Python — Pipeline Logic & Analytics Engine',
              'YOLOv8 — Deep Learning Object Detection',
              'ByteTrack — Persistent Multi-Object Tracking',
              'OpenCV — Optical Flow, Homography & Video Annotation',
              'K-Means & Scikit-Learn — Jersey Color Team Classification',
              'Pandas & NumPy — Spatial Positional & Trajectory Analytics',
            ],
          },
        ],
        tags: ['Python', 'YOLOv8', 'ByteTrack', 'OpenCV', 'K-Means', 'Optical Flow', 'Pandas', 'Sports Analytics'],
        actions: [
          { label: 'VIEW GITHUB REPO', type: 'primary', url: 'https://github.com/DEEPAKRV07/Football-Analysis-System' },
        ],
      },

      {
        id: 'kaatchi',
        label: 'KAATCHI MEDIA',
        position: [0.0, 6.8, 0.5],
        kicker: 'MEDIA PORTFOLIO & WEB ENGINEERING',
        title: 'Kaatchi Media',
        subtitle: 'Official Media & Photography Portfolio Platform',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'Official digital media portfolio platform for Kaatchi Media (kaatchimedia.com), presenting professional photography collections, media production capabilities, client testimonials, and contact lead workflows through a cinematic dark visual interface.',
          },
          {
            heading: 'MY ROLE & RESPONSIBILITIES',
            content: 'Software Developer Intern / Frontend Web Developer. Engineered the modular JavaScript architecture, responsive UI design across desktop/mobile viewports, photography gallery system, fullscreen lightbox presentation, portfolio filtering, and Web3Forms contact integration.',
          },
          {
            heading: 'KEY FEATURES & IMPLEMENTATION',
            bullets: [
              'Modular ES JavaScript Architecture (navigation, galleries, lightbox, filtering, contact)',
              'Responsive Photography Collections (Professionals, Behind the Scenes, My Favorites)',
              'Interactive Portfolio Category Filtering',
              'Fullscreen Image Lightbox with Touch & Keyboard Navigation',
              'IntersectionObserver Reveal Animations & Photography Page Entrance Transitions',
              'Responsive Testimonial Carousel with Desktop Arrows & Mobile Touch Swipe',
              'Web3Forms Asynchronous Client Contact & Lead Submission Integration',
            ],
          },
          {
            heading: 'TECHNOLOGY STACK',
            bullets: [
              'HTML5 & CSS3 — Responsive Layouts, CSS Grid & Flexbox',
              'JavaScript ES6+ — Modular ES Architecture & DOM APIs',
              'IntersectionObserver — Reveal Animations & Navigation Visibility',
              'Web3Forms — Asynchronous Form Validation & Lead Capture',
              'Git & GitHub — Feature Branch Workflow & Production Deployment',
            ],
          },
        ],
        tags: ['HTML5', 'CSS3', 'JavaScript ES6+', 'Responsive UX', 'Web3Forms', 'Photography Galleries', 'Live Site'],
        actions: [
          { label: 'VISIT LIVE WEBSITE', type: 'primary', url: 'https://kaatchimedia.com/' },
        ],
      },
    ],
  },

  experience: {
    id: 'experience',
    title: 'EXPERIENCE & CAREER',
    subtitle: 'ENGINEERING MEMORY PATH',
    categories: [
      {
        id: 'forcrux-exp',
        label: 'FORCRUX',
        position: [-5.2, 2.8, 2.5],
        kicker: 'CAREER MILESTONE',
        title: 'Lead Frontend Engineer & Design Systems',
        subtitle: 'FORCRUX Technology Studio Platform',
        sections: [
          {
            heading: 'ROLE & RESPONSIBILITIES',
            content: 'Led the frontend component architecture, responsive virtual-camera framing system, GSAP motion design engine, video payload compression, and administrative Control OS direction.',
          },
          {
            heading: 'ENGINEERING CONTRIBUTIONS',
            bullets: [
              'Built component-based Next.js App Router architecture with Payload CMS v3 & PostgreSQL',
              'Created centralized GSAP Motion Design System with ScrollTrigger reveals & performance budgets',
              'Reduced hero video payload from 7.43 MB to 1.98 MB WebM (73% reduction) & 3.50 MB MP4 fallback',
              'Engineered virtual camera framing across 8 viewport classes from mobile to ultrawide',
            ],
          },
        ],
        tags: ['Next.js', 'React', 'TypeScript', 'GSAP', 'Payload CMS', 'PostgreSQL', 'Design Systems'],
        actions: [],
      },
      {
        id: 'kaatchi-exp',
        label: 'KAATCHI MEDIA',
        position: [-1.4, 5.2, -2.5],
        kicker: 'CAREER MILESTONE',
        title: 'Software Developer Intern / Frontend Developer',
        subtitle: 'Kaatchi Media (kaatchimedia.com)',
        sections: [
          {
            heading: 'ROLE & RESPONSIBILITIES',
            content: 'Developed and productionized the official Kaatchi Media digital portfolio website (kaatchimedia.com), building a modular JavaScript architecture, responsive UI design across desktop/mobile viewports, photography gallery systems, and contact workflows.',
          },
          {
            heading: 'ENGINEERING CONTRIBUTIONS',
            bullets: [
              'Modularized frontend architecture with ES JavaScript modules & reusable component loaders',
              'Engineered responsive photography galleries (Professionals, BTS, My Favorites) with fullscreen lightbox',
              'Built responsive testimonial carousel supporting desktop controls & mobile touch swipe',
              'Integrated Web3Forms for client-side form validation and asynchronous lead submission',
            ],
          },
        ],
        tags: ['HTML5', 'CSS3', 'JavaScript ES6+', 'Responsive UX', 'Web3Forms', 'Git Workflow'],
        actions: [
          { label: 'VISIT LIVE WEBSITE', type: 'primary', url: 'https://kaatchimedia.com/' },
        ],
      },
      {
        id: 'msme-exp',
        label: 'MSME CENTER',
        position: [3.8, 3.0, 2.2],
        kicker: 'CAREER MILESTONE',
        title: 'Embedded Systems Intern',
        subtitle: 'MSME Technology Development Centre (Aug 2024 – Sep 2024)',
        sections: [
          {
            heading: 'ROLE & RESPONSIBILITIES',
            content: 'Embedded Systems Intern at MSME Technology Development Centre (MSME TDC), Guindy, Chennai (Aug 2024 – Sep 2024). Prototyped, configured, and benchmarked embedded hardware circuits, microcontrollers, sensor interfaces, and IoT telemetry architectures using Arduino and Raspberry Pi platform systems.',
          },
          {
            heading: 'ENGINEERING CONTRIBUTIONS',
            bullets: [
              'Embedded system hardware prototyping & sensor interfacing using Arduino & Raspberry Pi',
              'IoT telemetry data acquisition, wireless sensor integration & microcontroller circuit design',
              'Real-time sensor signal processing, hardware I/O debugging & firmware scripting',
              'Hardware-level latency measurement, circuit testing & power optimization',
            ],
          },
        ],
        tags: ['Embedded Systems', 'Arduino', 'Raspberry Pi', 'Sensors', 'IoT', 'Microcontrollers'],
        actions: [],
      },
      {
        id: 'quality-exp',
        label: 'QUALITY THREADS',
        position: [6.2, -2.2, -2.2],
        kicker: 'CAREER MILESTONE',
        title: 'Digital Media Collaboration',
        subtitle: 'Quality Threads',
        sections: [
          {
            heading: 'OVERVIEW',
            content: 'Worked with a team on two small school-clothing deals, handling the digital media and social-media side of the work.',
          },
          {
            heading: 'MY CONTRIBUTION',
            bullets: [
              'Small business collaboration on two school-clothing deals',
              'Handled digital media assets & social-media promotion',
              'Created visual content for clothing presentation',
              'Supported digital channel communication',
            ],
          },
        ],
        tags: ['Digital Media', 'Social Media', 'Content Creation', 'Small Business Collaboration'],
        actions: [],
      },
    ],
  },

  contact: {
    id: 'contact',
    title: 'CONTACT & CONNECT',
    subtitle: 'NETWORK TRANSMISSION GATEWAY',
    categories: [
      {
        id: 'email',
        label: 'EMAIL',
        position: [-5.2, 2.5, 2.0],
        actionUrl: 'mailto:deepakvetrivelan@gmail.com',
      },
      {
        id: 'github',
        label: 'GITHUB',
        position: [-1.4, 4.8, -2.0],
        actionUrl: 'https://github.com/DEEPAKRV07',
      },
      {
        id: 'linkedin',
        label: 'LINKEDIN',
        position: [2.8, 3.2, 2.0],
        actionUrl: 'https://www.linkedin.com/in/deepakrv07/',
      },
      {
        id: 'resume',
        label: 'RESUME',
        position: [6.2, -2.0, -2.0],
        actionUrl: `${BASE_URL}my_resume.pdf`,
      },
    ],
  },
};
