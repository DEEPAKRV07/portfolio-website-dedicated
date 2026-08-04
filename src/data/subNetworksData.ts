import { NodeData, EdgeData } from '../types/neural';

export interface ProjectDetail {
  id: string;
  title: string;
  subtitle: string;
  authors: string;
  date: string;
  conference: string;
  problemStatement: string;
  architecture: string[];
  dataset: string;
  method: string;
  pipeline: string[];
  results: string;
  githubUrl: string;
  demoUrl?: string;
  learnings: string;
  futureImprovements: string;
  techStack: string[];
}

export const RESEARCH_PROJECTS: Record<string, ProjectDetail> = {
  'proj-football': {
    id: 'proj-football',
    title: 'Real-Time Multi-Object Football Tracking & Tactical Analytics Engine',
    subtitle: 'IEEE-Style Technical Report on Vision-Based Sports Analytics',
    authors: 'Deepak R V (Lead AI & Computer Vision Engineer)',
    date: '2024',
    conference: 'IEEE Computer Vision & Sports Intelligence',
    problemStatement: 'Tracking dynamic soccer players, ball trajectories, and camera homography in real-time broadcast video under severe player occlusions and dynamic lighting conditions.',
    architecture: [
      'YOLOv8 Detection Backbone (Custom Fine-tuned on Soccer Footage)',
      'ByteTrack High-Speed Data Association with Kalman Filtering',
      'Pitch Homography Mapping (2D Broadcast to 2D Top-Down Tactical Board)',
      'Team Clustering (Color Space K-Means on Player Uniforms)'
    ],
    dataset: 'SoccerNet Benchmark + 15,000 Custom Annotated HD Broadcast Frames',
    method: 'Real-time object detection combined with bounding box tracking and projective geometry for tactical speed, distance, and heat-map calculation.',
    pipeline: [
      'Video Input Stream (1080p @ 60 FPS)',
      'Feature Extraction & YOLOv8 Bounding Box Detection',
      'ByteTrack Multi-Object Tracking & ID Persistence',
      'Homography Projection Matrix Calculation',
      'Tactical Overlay Rendering & Heatmap Generation'
    ],
    results: 'Achieved 94.2% mAP@50 at 62 FPS inference speed on NVIDIA RTX GPUs.',
    githubUrl: 'https://github.com/deepakrv',
    demoUrl: 'https://github.com/deepakrv',
    learnings: 'Deep understanding of spatial homography transformations, occlusion recovery in tracking, and CUDA inference acceleration.',
    futureImprovements: 'Integrating 3D multi-camera view synchronization and player biomechanics estimation.',
    techStack: ['Python', 'YOLOv8', 'ByteTrack', 'OpenCV', 'PyTorch', 'Computer Vision']
  },
  'proj-sightmate': {
    id: 'proj-sightmate',
    title: 'SightMate: Edge AI Assistance System for Visually Impaired Navigation',
    subtitle: 'Cross-Platform Real-Time Obstacle Detection & Audio Feedback Engine',
    authors: 'Deepak R V (Flutter & Embedded AI Developer)',
    date: '2024',
    conference: 'IEEE Mobile AI & Accessibility Systems',
    problemStatement: 'Providing real-time, low-latency indoor/outdoor spatial guidance and hazard alerts for visually impaired individuals via lightweight mobile hardware.',
    architecture: [
      'Flutter Cross-Platform Frontend UI with Haptic Engine',
      'TensorFlow Lite / ONNX Mobile Vision Inference Engine',
      'Spatial Audio 3D Positioning Feedback Synthesizer'
    ],
    dataset: 'COCO Dataset + Custom Accessibility Indoor Hazard Dataset',
    method: 'Mobile-optimized lightweight neural network running locally on-device without internet dependency.',
    pipeline: [
      'Camera Stream Feed',
      'TFLite Object & Hazard Segmentation',
      'Distance Calculation via Monocular Depth Estimation',
      'Audio & Text-to-Speech Directional Alert Dispatch'
    ],
    results: '91.8% hazard detection accuracy with <45ms end-to-end latency on mobile hardware.',
    githubUrl: 'https://github.com/deepakrv',
    demoUrl: 'https://github.com/deepakrv',
    learnings: 'Optimizing deep learning models for low-power ARM devices and creating accessible UI/UX.',
    futureImprovements: 'Integrating LiDAR depth sensor fusion on modern smartphones.',
    techStack: ['Flutter', 'Python', 'TensorFlow', 'OpenCV', 'AI/ML']
  },
  'proj-virtualmouse': {
    id: 'proj-virtualmouse',
    title: 'Touchless Neural Gesture Control & Virtual Mouse System',
    subtitle: 'Hand-Landmark Tracking & Human-Computer Interaction Pipeline',
    authors: 'Deepak R V (Computer Vision Developer)',
    date: '2023',
    conference: 'HCI & Vision-Based Input Systems',
    problemStatement: 'Replacing physical input hardware with high-precision, low-latency hand gesture tracking via a standard web camera.',
    architecture: [
      'MediaPipe 21 Hand-Landmark Detection Framework',
      'Smoothing & Velocity Acceleration Filter',
      'PyAutoGUI / System Input Injection Protocol'
    ],
    dataset: 'MediaPipe Hands Benchmark + Custom Multi-Lighting Gesture Capture',
    method: '3D hand skeletal coordinate extraction mapped to screen coordinates with dynamic gesture state machines.',
    pipeline: [
      'Webcam Frame Capture',
      '21-Point Hand Skeleton Coordinate Tracking',
      'Click / Scroll / Drag Gesture Recognition State Machine',
      'Smooth Cursor Interpolation & OS Event Injection'
    ],
    results: 'Sub-15ms latency with 98% gesture accuracy across varying hand distances.',
    githubUrl: 'https://github.com/deepakrv',
    learnings: 'Fast skeletal tracking techniques, velocity smoothing filters, and real-time HCI mapping.',
    futureImprovements: 'Integrating 3D depth camera gesture mapping and multi-hand palm pose recognition.',
    techStack: ['Python', 'OpenCV', 'MediaPipe', 'Computer Vision']
  }
};

// Skills Sub-Graph Nodes
export const SKILLS_SUB_NODES: NodeData[] = [
  {
    id: 'sk-prog',
    label: 'Programming',
    subLabel: 'Python, C++, JavaScript, Dart',
    layer: 'hidden',
    position: [-4.5, 2.5, 0],
    color: '#00ff88',
    glowColor: '#00ff88',
    size: 0.9,
    icon: 'code'
  },
  {
    id: 'sk-cv',
    label: 'Computer Vision',
    subLabel: 'OpenCV, YOLOv8, MediaPipe',
    layer: 'hidden',
    position: [4.5, 2.5, 0],
    color: '#00aaff',
    glowColor: '#3b82f6',
    size: 0.9,
    icon: 'cpu'
  },
  {
    id: 'sk-aiml',
    label: 'AI & Machine Learning',
    subLabel: 'Deep Learning, PyTorch, TensorFlow',
    layer: 'hidden',
    position: [-4.5, -2.5, 0],
    color: '#8b5cf6',
    glowColor: '#8b5cf6',
    size: 0.9,
    icon: 'sparkles'
  },
  {
    id: 'sk-tools',
    label: 'Tools & Frameworks',
    subLabel: 'Flutter, React, SQL, Git',
    layer: 'hidden',
    position: [4.5, -2.5, 0],
    color: '#ff007f',
    glowColor: '#ff007f',
    size: 0.9,
    icon: 'briefcase'
  }
];

export const SKILLS_SUB_EDGES: EdgeData[] = [
  { id: 'sk-e1', source: 'sk-prog', target: 'sk-cv', color: '#00ff88' },
  { id: 'sk-e2', source: 'sk-prog', target: 'sk-aiml', color: '#00ff88' },
  { id: 'sk-e3', source: 'sk-cv', target: 'sk-tools', color: '#00aaff' },
  { id: 'sk-e4', source: 'sk-aiml', target: 'sk-tools', color: '#8b5cf6' }
];

// Timeline Sub-Graph Nodes
export const TIMELINE_SUB_NODES: NodeData[] = [
  {
    id: 'tl-2022',
    label: '2022',
    subLabel: 'Foundation Phase (College & ML Basics)',
    layer: 'input',
    position: [-8, 0, 0],
    color: '#00ff88',
    glowColor: '#00ff88',
    size: 0.8,
    icon: 'clock'
  },
  {
    id: 'tl-2023',
    label: '2023',
    subLabel: 'Skill Building (Computer Vision & OpenCV)',
    layer: 'hidden',
    position: [-4, 0, 0],
    color: '#00aaff',
    glowColor: '#3b82f6',
    size: 0.85,
    icon: 'clock'
  },
  {
    id: 'tl-2024',
    label: '2024',
    subLabel: 'Major Projects & Internships (YOLOv8 & Flutter)',
    layer: 'hidden',
    position: [0, 0, 0],
    color: '#8b5cf6',
    glowColor: '#8b5cf6',
    size: 0.9,
    icon: 'clock'
  },
  {
    id: 'tl-2025',
    label: '2025',
    subLabel: 'Advanced Work (Open Source AI Tools)',
    layer: 'hidden',
    position: [4, 0, 0],
    color: '#ff007f',
    glowColor: '#ff007f',
    size: 0.95,
    icon: 'clock'
  },
  {
    id: 'tl-present',
    label: 'Present',
    subLabel: 'Growing & Building High-Impact AI Systems',
    layer: 'output',
    position: [8, 0, 0],
    color: '#00ffff',
    glowColor: '#00ffff',
    size: 1.0,
    icon: 'sparkles'
  }
];

export const TIMELINE_SUB_EDGES: EdgeData[] = [
  { id: 'tl-e1', source: 'tl-2022', target: 'tl-2023', color: '#00ff88' },
  { id: 'tl-e2', source: 'tl-2023', target: 'tl-2024', color: '#00aaff' },
  { id: 'tl-e3', source: 'tl-2024', target: 'tl-2025', color: '#8b5cf6' },
  { id: 'tl-e4', source: 'tl-2025', target: 'tl-present', color: '#ff007f' }
];
