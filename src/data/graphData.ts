import { NodeData, EdgeData } from '../types/neural';

export const MAIN_NODES: NodeData[] = [
  // INPUT LAYER (Green #00ff88)
  {
    id: 'about-me',
    label: 'About Me',
    subLabel: 'Name, Role, Introduction',
    layer: 'input',
    position: [-7.5, 4.2, 0],
    color: '#00ff88',
    glowColor: '#00ff88',
    size: 0.8,
    icon: 'user'
  },
  {
    id: 'resume',
    label: 'Resume',
    subLabel: 'Download Resume, CV Highlights',
    layer: 'input',
    position: [-7.5, 1.4, 0],
    color: '#00ff88',
    glowColor: '#00ff88',
    size: 0.8,
    icon: 'file-text'
  },
  {
    id: 'experience',
    label: 'Experience',
    subLabel: 'Education, Experience, Key Achievements',
    layer: 'input',
    position: [-7.5, -1.4, 0],
    color: '#00ff88',
    glowColor: '#00ff88',
    size: 0.8,
    icon: 'briefcase'
  },
  {
    id: 'contact',
    label: 'Contact',
    subLabel: 'Email, GitHub, LinkedIn, Location',
    layer: 'input',
    position: [-7.5, -4.2, 0],
    color: '#00ff88',
    glowColor: '#00ff88',
    size: 0.8,
    icon: 'mail'
  },

  // HIDDEN LAYER (Blue #00aaff / #3b82f6)
  {
    id: 'skills',
    label: 'Skills',
    subLabel: '(Sub-Network)',
    layer: 'hidden',
    position: [0, 3.5, 0],
    color: '#00aaff',
    glowColor: '#3b82f6',
    size: 1.1,
    icon: 'cpu'
  },
  {
    id: 'projects',
    label: 'Projects',
    subLabel: '(Sub-Network)',
    layer: 'hidden',
    position: [0, 0, 0],
    color: '#00aaff',
    glowColor: '#3b82f6',
    size: 1.1,
    icon: 'code'
  },
  {
    id: 'timeline',
    label: 'Timeline',
    subLabel: '(Sub-Network)',
    layer: 'hidden',
    position: [0, -3.5, 0],
    color: '#00aaff',
    glowColor: '#3b82f6',
    size: 1.1,
    icon: 'clock'
  },

  // OUTPUT LAYER (Pink/Magenta #ff007f)
  {
    id: 'hire-me',
    label: 'Hire Me',
    subLabel: '(Final Inference)',
    layer: 'output',
    position: [7.5, 0, 0],
    color: '#ff007f',
    glowColor: '#ff007f',
    size: 1.25,
    icon: 'sparkles'
  }
];

// Fully connected feedforward edges
export const MAIN_EDGES: EdgeData[] = [
  // Input layer -> Hidden layer connections
  { id: 'e-about-skills', source: 'about-me', target: 'skills', color: '#00e5a3' },
  { id: 'e-about-projects', source: 'about-me', target: 'projects', color: '#00e5a3' },
  { id: 'e-about-timeline', source: 'about-me', target: 'timeline', color: '#00e5a3' },

  { id: 'e-resume-skills', source: 'resume', target: 'skills', color: '#00e5a3' },
  { id: 'e-resume-projects', source: 'resume', target: 'projects', color: '#00e5a3' },
  { id: 'e-resume-timeline', source: 'resume', target: 'timeline', color: '#00e5a3' },

  { id: 'e-exp-skills', source: 'experience', target: 'skills', color: '#00e5a3' },
  { id: 'e-exp-projects', source: 'experience', target: 'projects', color: '#00e5a3' },
  { id: 'e-exp-timeline', source: 'experience', target: 'timeline', color: '#00e5a3' },

  { id: 'e-contact-skills', source: 'contact', target: 'skills', color: '#00e5a3' },
  { id: 'e-contact-projects', source: 'contact', target: 'projects', color: '#00e5a3' },
  { id: 'e-contact-timeline', source: 'contact', target: 'timeline', color: '#00e5a3' },

  // Hidden layer -> Output layer connections
  { id: 'e-skills-hire', source: 'skills', target: 'hire-me', color: '#8b5cf6' },
  { id: 'e-projects-hire', source: 'projects', target: 'hire-me', color: '#8b5cf6' },
  { id: 'e-timeline-hire', source: 'timeline', target: 'hire-me', color: '#8b5cf6' }
];
