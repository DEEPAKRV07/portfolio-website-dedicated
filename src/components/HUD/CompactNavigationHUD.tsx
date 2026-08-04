import React, { useState } from 'react';
import { Activity, CornerDownLeft, RotateCw, ZoomIn, MousePointer, Power } from 'lucide-react';
import { SubNetworkType } from '../../App';
import { NodeData } from '../../types/neural';

interface CompactNavigationHUDProps {
  currentView?: SubNetworkType;
  selectedNode?: NodeData | null;
  onBackpropagation?: () => void;
  isModalOpen?: boolean;
}

export const CompactNavigationHUD: React.FC<CompactNavigationHUDProps> = ({
  currentView = 'main',
  selectedNode = null,
  onBackpropagation,
  isModalOpen = false
}) => {
  const [recruiterMode, setRecruiterMode] = useState<boolean>(true);

  // Auto fade/hide HUD when modal is open
  const hudVisibilityClass = isModalOpen ? 'opacity-0 pointer-events-none transition-opacity duration-300' : 'opacity-100 transition-opacity duration-300';

  return (
    <>
      {/* 1. Top Right Status Behavior (60 FPS | GPU ACTIVE | RECRUITER MODE: ON) */}
      <div className={`absolute top-4 right-6 z-20 flex items-center gap-3 ${hudVisibilityClass}`}>
        <div className="px-3 py-1 rounded-full glass-panel border border-[#00ff88]/30 text-[#00ff88] text-[10px] font-mono font-bold tracking-wider flex items-center gap-2 shadow-lg backdrop-blur-md">
          <Activity className="w-3.5 h-3.5 text-[#00ff88] animate-pulse" />
          <span>60 FPS &nbsp;|&nbsp; GPU ACTIVE</span>
        </div>

        <button
          onClick={() => setRecruiterMode(!recruiterMode)}
          className={`px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider transition-all border shadow-lg backdrop-blur-md cursor-pointer ${
            recruiterMode
              ? 'bg-[#00aaff]/15 border-[#00aaff]/50 text-[#00aaff]'
              : 'bg-white/5 border-white/15 text-gray-400'
          }`}
        >
          RECRUITER MODE: {recruiterMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* 2. Bottom-Center Floating Backpropagation Button (Fixed bottom-center as specified in reference image) */}
      {currentView !== 'main' && !isModalOpen && (
        <button
          onClick={onBackpropagation}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 px-5 py-2.5 rounded-full bg-[#050505]/90 border border-amber-400/60 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-mono font-bold tracking-wider flex items-center gap-2.5 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer backdrop-blur-xl"
        >
          <CornerDownLeft className="w-4 h-4 text-amber-400" />
          <span>BACKPROPAGATION (ESC)</span>
        </button>
      )}

      {/* 3. Bottom Left Navigation Guide */}
      <div className={`absolute bottom-6 left-6 z-20 flex flex-col gap-2 p-3.5 rounded-2xl glass-panel text-xs text-[#f0f0f0] border border-white/10 shadow-xl backdrop-blur-md max-w-xs font-mono ${hudVisibilityClass}`}>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1 border-b border-white/10">
          NAVIGATION GUIDE
        </div>

        <div className="flex flex-col gap-1 text-[10.5px] text-gray-300">
          <div className="flex items-center gap-2">
            <RotateCw className="w-3 h-3 text-[#00ff88]" />
            <span>Drag to rotate</span>
          </div>
          <div className="flex items-center gap-2">
            <ZoomIn className="w-3 h-3 text-[#00aaff]" />
            <span>Scroll to zoom</span>
          </div>
          <div className="flex items-center gap-2">
            <MousePointer className="w-3 h-3 text-[#ff007f]" />
            <span>Click node to open</span>
          </div>
          <div className="flex items-center gap-2">
            <CornerDownLeft className="w-3 h-3 text-amber-400" />
            <span>Esc to Backpropagate</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Right Neuron Indicator */}
      <div className={`absolute bottom-6 right-6 z-20 flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel border border-[#00ff88]/40 text-xs font-mono shadow-lg backdrop-blur-md ${hudVisibilityClass}`}>
        <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88] animate-pulse" />
        <span className="text-gray-400 uppercase tracking-wider text-[11px]">NEURON:</span>
        <span className="text-[#00ff88] font-bold uppercase tracking-wider">
          {selectedNode ? selectedNode.label : currentView.toUpperCase()}
        </span>
      </div>
    </>
  );
};
