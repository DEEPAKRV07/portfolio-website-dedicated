import React from 'react';

export const HeaderHUD: React.FC = () => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center text-center pointer-events-none">
      {/* Small top sub-header */}
      <span className="text-[11px] font-mono tracking-[0.35em] text-[#00ff88] uppercase mb-1 font-semibold opacity-90 drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]">
        INSIDE MY NEURAL NETWORK
      </span>

      {/* Main title */}
      <h1 className="text-3xl md:text-5xl font-extrabold font-sans tracking-tight text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
        DEEPAK R V
      </h1>

      {/* Pill Badge */}
      <div className="px-4 py-1 rounded-full border border-[#00ff88]/50 bg-[#00ff88]/10 text-[#00ff88] text-xs font-mono tracking-wider font-semibold shadow-[0_0_15px_rgba(0,255,136,0.25)] mb-1.5 backdrop-blur-md">
        AI & MACHINE LEARNING ENGINEER
      </div>

      {/* Subtitle */}
      <p className="text-xs font-mono text-[#888888] tracking-widest uppercase">
        Computer Vision Developer &nbsp;|&nbsp; Flutter Developer
      </p>
    </div>
  );
};
