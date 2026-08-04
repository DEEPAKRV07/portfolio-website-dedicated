import React, { useState } from 'react';
import { MousePointer, Scroll, Move, CornerDownLeft, Activity } from 'lucide-react';

export const CompactNavigationHUD: React.FC = () => {
  const [recruiterMode, setRecruiterMode] = useState<boolean>(true);

  return (
    <>
      {/* Top Right Compact Badge: FPS & Recruiter Mode */}
      <div className="absolute top-4 right-6 z-20 flex items-center gap-3">
        <div className="px-3 py-1 rounded-full glass-panel border border-[#00ff88]/30 text-[#00ff88] text-[10px] font-mono font-bold tracking-wider flex items-center gap-2 shadow-lg backdrop-blur-md">
          <Activity className="w-3 h-3 text-[#00ff88] animate-pulse" />
          <span>60 FPS &nbsp;|&nbsp; GPU ACTIVE</span>
        </div>

        <button
          onClick={() => setRecruiterMode(!recruiterMode)}
          className={`px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider transition-all border shadow-lg backdrop-blur-md ${
            recruiterMode
              ? 'bg-[#00aaff]/15 border-[#00aaff]/50 text-[#00aaff]'
              : 'bg-white/5 border-white/15 text-gray-400'
          }`}
        >
          RECRUITER MODE: {recruiterMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Bottom Left Compact "How to Navigate" Card */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2 p-3 rounded-xl glass-panel text-xs text-[#f0f0f0] border border-white/10 shadow-xl backdrop-blur-md max-w-xs font-mono">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
          <span>NAVIGATION MECHANICS</span>
          <span className="text-[#00ff88]">AI ENGINE</span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-gray-300">
          <div className="flex items-center gap-1.5">
            <MousePointer className="w-3 h-3 text-[#00ff88]" />
            <span>Click to expand</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Scroll className="w-3 h-3 text-[#00aaff]" />
            <span>Scroll to zoom</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Move className="w-3 h-3 text-[#ff007f]" />
            <span>Drag to rotate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CornerDownLeft className="w-3 h-3 text-amber-400" />
            <span>Esc: Backpropagate</span>
          </div>
        </div>
      </div>
    </>
  );
};
