import React from 'react';
import { User, FileText, Briefcase, Mail } from 'lucide-react';

export const OverviewHUD: React.FC = () => {
  return (
    <div className="absolute top-4 left-6 z-20 hidden xl:flex flex-col gap-3 w-80 p-4 rounded-xl glass-panel text-xs text-[#f0f0f0] border border-[#00ff88]/20 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col">
        <h3 className="text-xs font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
          <span className="text-[#00ff88]">1. HOME</span> — NEURAL NETWORK OVERVIEW
        </h3>
        <p className="text-[11px] text-gray-400 font-mono mt-1 leading-relaxed">
          After loading, a neural network appears.<br />
          <span className="text-[#00ff88]">4 Input Nodes</span> → <span className="text-[#00aaff]">3 Feature Nodes</span> → <span className="text-[#ff007f]">1 Output Node</span><br />
          Subtle ambient motion, activation pulses flow through edges.
        </p>
      </div>

      <div className="border-t border-white/10 pt-2 flex flex-col gap-2">
        <span className="text-[11px] font-mono font-bold text-[#00ff88] tracking-wider uppercase">
          INPUT LAYER <span className="text-gray-400 font-normal">(About Me Information)</span>
        </span>

        <div className="flex items-start gap-2.5 bg-[#00ff88]/5 p-2 rounded-lg border border-[#00ff88]/20">
          <div className="p-1 rounded bg-[#00ff88]/20 text-[#00ff88]">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white text-xs">About Me</span>
            <span className="text-[10px] text-gray-400 font-mono">Name, Role, Introduction</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-[#00ff88]/5 p-2 rounded-lg border border-[#00ff88]/20">
          <div className="p-1 rounded bg-[#00ff88]/20 text-[#00ff88]">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white text-xs">Resume</span>
            <span className="text-[10px] text-gray-400 font-mono">Download Resume, CV Highlights</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-[#00ff88]/5 p-2 rounded-lg border border-[#00ff88]/20">
          <div className="p-1 rounded bg-[#00ff88]/20 text-[#00ff88]">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white text-xs">Experience</span>
            <span className="text-[10px] text-gray-400 font-mono">Education, Experience, Key Achievements</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-[#00ff88]/5 p-2 rounded-lg border border-[#00ff88]/20">
          <div className="p-1 rounded bg-[#00ff88]/20 text-[#00ff88]">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white text-xs">Contact</span>
            <span className="text-[10px] text-gray-400 font-mono">Email, GitHub, LinkedIn, Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};
