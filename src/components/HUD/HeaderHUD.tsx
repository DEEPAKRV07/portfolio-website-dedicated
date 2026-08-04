import React from 'react';
import { LayoutState, LAYOUT_STATE_CONFIGS } from '../../utils/layoutManager';

interface HeaderHUDProps {
  layoutState?: LayoutState;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({ layoutState = 'HOME' }) => {
  const config = LAYOUT_STATE_CONFIGS[layoutState].hero;

  return (
    <div
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center text-center transition-all duration-500 ease-out"
      style={{
        opacity: config.opacity,
        transform: `translate(-50%, ${config.translateY}) scale(${config.scale})`,
        pointerEvents: config.pointerEvents
      }}
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
