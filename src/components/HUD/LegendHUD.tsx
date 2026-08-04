import React from 'react';

export const LegendHUD: React.FC = () => {
  return (
    <div className="absolute top-4 right-6 z-20 hidden lg:flex flex-col gap-2 p-3.5 rounded-xl glass-panel text-xs font-mono text-[#f0f0f0] border border-white/10 shadow-2xl backdrop-blur-md">
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 pb-1 border-b border-white/10">
        LEGEND
      </div>

      <div className="flex items-center gap-2.5">
        <span className="w-3 h-3 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]" />
        <span className="text-gray-300">
          <strong className="text-white font-semibold">Input Layer</strong> (Raw Information)
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="w-3 h-3 rounded-full bg-[#00aaff] shadow-[0_0_8px_#00aaff]" />
        <span className="text-gray-300">
          <strong className="text-white font-semibold">Hidden Layer</strong> (Feature Extraction)
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="w-3 h-3 rounded-full bg-[#ff007f] shadow-[0_0_8px_#ff007f]" />
        <span className="text-gray-300">
          <strong className="text-white font-semibold">Output Layer</strong> (Inference)
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rotate-45 bg-[#00ffff] shadow-[0_0_8px_#00ffff]" />
        <span className="text-gray-300">
          <strong className="text-white font-semibold">Activation Pulse</strong>
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="w-4 h-[2px] bg-emerald-400/60" />
        <span className="text-gray-300">
          <strong className="text-white font-semibold">Learned Connection</strong> (Weight)
        </span>
      </div>
    </div>
  );
};
