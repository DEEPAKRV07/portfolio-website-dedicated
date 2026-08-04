import React, { useState, useEffect, useCallback } from 'react';
import { NeuralScene } from './components/Canvas/NeuralScene';
import { HeaderHUD } from './components/HUD/HeaderHUD';
import { CompactNavigationHUD } from './components/HUD/CompactNavigationHUD';
import { ResearchPaperModal } from './components/Modals/ResearchPaperModal';
import { ContactNeuronsModal } from './components/Modals/ContactNeuronsModal';
import { NodeDetailModal } from './components/Modals/NodeDetailModal';
import { MAIN_NODES, MAIN_EDGES } from './data/graphData';
import { SKILLS_SUB_NODES, SKILLS_SUB_EDGES, TIMELINE_SUB_NODES, TIMELINE_SUB_EDGES, RESEARCH_PROJECTS, ProjectDetail } from './data/subNetworksData';
import { NodeData, EdgeData } from './types/neural';
import { Sparkles } from 'lucide-react';

export type SubNetworkType = 'main' | 'skills' | 'projects' | 'timeline';

// Projects Sub-Network Nodes
const PROJECTS_SUB_NODES: NodeData[] = [
  {
    id: 'proj-football',
    label: 'Football Analysis',
    subLabel: 'YOLOv8 + ByteTrack IEEE Report',
    layer: 'hidden',
    position: [-5, 2, 0],
    color: '#00ff88',
    glowColor: '#00ff88',
    size: 1.0,
    icon: 'code'
  },
  {
    id: 'proj-sightmate',
    label: 'SightMate AI',
    subLabel: 'Flutter + Edge AI Mobile Report',
    layer: 'hidden',
    position: [0, 0, 0],
    color: '#00aaff',
    glowColor: '#3b82f6',
    size: 1.0,
    icon: 'cpu'
  },
  {
    id: 'proj-virtualmouse',
    label: 'Virtual Mouse',
    subLabel: 'OpenCV + MediaPipe HCI Report',
    layer: 'hidden',
    position: [5, -2, 0],
    color: '#ff007f',
    glowColor: '#ff007f',
    size: 1.0,
    icon: 'sparkles'
  }
];

const PROJECTS_SUB_EDGES: EdgeData[] = [
  { id: 'pe1', source: 'proj-football', target: 'proj-sightmate', color: '#00ff88' },
  { id: 'pe2', source: 'proj-sightmate', target: 'proj-virtualmouse', color: '#00aaff' }
];

export default function App() {
  const [currentView, setCurrentView] = useState<SubNetworkType>('main');
  const [activeNodes, setActiveNodes] = useState<NodeData[]>(MAIN_NODES);
  const [activeEdges, setActiveEdges] = useState<EdgeData[]>(MAIN_EDGES);

  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [activeDetailNode, setActiveDetailNode] = useState<NodeData | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectDetail | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [isInferenceRunning, setIsInferenceRunning] = useState<boolean>(false);

  // Modal open flag to cleanly dim backdrop canvas & hide floating 3D labels
  const isAnyModalOpen = activeDetailNode !== null || activeProject !== null || isContactModalOpen;

  // Backpropagation recovery handler
  const handleBackpropagation = useCallback(() => {
    setCurrentView('main');
    setActiveNodes(MAIN_NODES);
    setActiveEdges(MAIN_EDGES);
    setSelectedNode(null);
    setActiveDetailNode(null);
    setActiveProject(null);
    setIsContactModalOpen(false);
  }, []);

  // Keyboard shortcut for Esc / Backspace to backpropagate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        handleBackpropagation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBackpropagation]);

  // Handle node selection & sub-network traversal
  const handleNodeClick = (node: NodeData) => {
    setSelectedNode(node);

    // 1. Skills Sub-Network Transition
    if (node.id === 'skills') {
      setCurrentView('skills');
      setActiveNodes(SKILLS_SUB_NODES);
      setActiveEdges(SKILLS_SUB_EDGES);
      return;
    }

    // 2. Projects Sub-Network Transition
    if (node.id === 'projects') {
      setCurrentView('projects');
      setActiveNodes(PROJECTS_SUB_NODES);
      setActiveEdges(PROJECTS_SUB_EDGES);
      return;
    }

    // 3. Timeline Sub-Network Transition
    if (node.id === 'timeline') {
      setCurrentView('timeline');
      setActiveNodes(TIMELINE_SUB_NODES);
      setActiveEdges(TIMELINE_SUB_EDGES);
      return;
    }

    // 4. Input Layer Nodes Modal (About Me, Resume, Experience, Contact)
    if (['about-me', 'resume', 'experience'].includes(node.id)) {
      setActiveDetailNode(node);
      return;
    }

    if (node.id === 'contact') {
      setIsContactModalOpen(true);
      return;
    }

    // 5. Timeline Nodes Modal
    if (node.id.startsWith('tl-')) {
      setActiveDetailNode(node);
      return;
    }

    // 6. Project Node IEEE Paper Modal Trigger
    if (RESEARCH_PROJECTS[node.id]) {
      setActiveProject(RESEARCH_PROJECTS[node.id]);
      return;
    }

    // 7. Hire Me Inference Journey Trigger
    if (node.id === 'hire-me') {
      triggerInferenceJourney();
      return;
    }
  };

  // Automated Inference Journey ("Hire Me" pulse sequence)
  const triggerInferenceJourney = () => {
    setIsInferenceRunning(true);
    setTimeout(() => {
      setIsInferenceRunning(false);
      setIsContactModalOpen(true);
    }, 1800);
  };

  return (
    <div className="w-screen h-screen relative bg-[#050505] text-[#f0f0f0] overflow-hidden select-none font-sans">
      
      {/* Responsive Camera-Aware Top Header */}
      <HeaderHUD currentView={currentView} isModalOpen={isAnyModalOpen} />

      {/* Sleek Compact Navigation HUD with Floating Bottom-Center Backpropagation Button */}
      <CompactNavigationHUD
        currentView={currentView}
        selectedNode={selectedNode}
        onBackpropagation={handleBackpropagation}
        isModalOpen={isAnyModalOpen}
      />

      {/* Inference Journey Pulse Banner */}
      {isInferenceRunning && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-40 px-6 py-3 rounded-2xl bg-[#ff007f]/20 border border-[#ff007f] text-[#ff007f] font-mono text-xs font-bold tracking-widest flex items-center gap-3 shadow-[0_0_30px_rgba(255,0,127,0.4)] animate-pulse backdrop-blur-md">
          <Sparkles className="w-4 h-4 animate-spin" /> INFERENCE PROPAGATION IN PROGRESS... FIRING OUTPUT NEURONS
        </div>
      )}

      {/* Main 3D Interactive Viewport - Occupies 85-90% of screen */}
      <NeuralScene
        nodes={activeNodes}
        edges={activeEdges}
        onNodeClick={handleNodeClick}
        isModalOpen={isAnyModalOpen}
      />

      {/* Node Detail Modal (About Me, Resume, Experience, Timeline) */}
      <NodeDetailModal
        node={activeDetailNode}
        onClose={() => setActiveDetailNode(null)}
      />

      {/* IEEE Research Paper Modal */}
      <ResearchPaperModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />

      {/* Contact Output Neurons Modal */}
      <ContactNeuronsModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

    </div>
  );
}
