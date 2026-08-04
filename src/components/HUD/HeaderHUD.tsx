import React from 'react';
import { SubNetworkType } from '../../App';

interface HeaderHUDProps {
  currentView?: SubNetworkType;
  isModalOpen?: boolean;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({ currentView = 'main', isModalOpen = false }) => {
  // Compute responsive position & visibility classes based on camera / viewport zoom state
  const getHeaderStyle = () => {
    if (isModalOpen) {
      return 'opacity-0 -translate-y-10 pointer-events-none';
    }
    if (currentView !== 'main') {
      return 'opacity-70 -translate-y-3 scale-90 pointer-events-none';
    }
    return 'opacity-100 translate-y-0 scale-100 pointer-events-none';
  };

  return (
    <div
      className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center text-center transition-all duration-500 ease-out ${getHeaderStyle()}`}
    >
      {/* Small top sub-header */}
      <span className="text-[11px] font-mono tracking-[0.35em] text-[#00ff88] uppercase mb-1 font-semibold opacity-90">
        INSIDE MY NEURAL NETWORK
      </span>

      {/* Main hero title with Cinzel (Delta display style font) */}
      <h1 className="text-3xl md:text-5xl font-extrabold font-delta tracking-tight text-[#f0f0f0] mb-2 drop-shadow-md">
        DEEPAK R V
      </h1>

      {/* Pill Badge */}
      <div className="px-4 py-1 rounded-full border border-[#00ff88]/50 bg-[#00ff88]/10 text-[#00ff88] text-xs font-mono tracking-wider font-semibold shadow-sm backdrop-blur-md">
        AI & MACHINE LEARNING ENGINEER
      </div>

      {/* Subtitle */}
      <p className="text-xs font-mono text-[#888888] tracking-widest uppercase mt-1">
        Computer Vision Developer &nbsp;|&nbsp; Flutter Developer
      </p>
    </div>
  );
};
