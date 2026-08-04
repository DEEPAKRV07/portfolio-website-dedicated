import React from 'react';
import { MousePointer, Scroll, Move, CornerDownLeft, Sparkles, Folder, Calendar } from 'lucide-react';

export const BottomOverlayHUD: React.FC = () => {
  return (
    <>
      {/* Left Panel: How to Navigate & AI Mechanics Mapping */}
      <div className="absolute bottom-16 left-6 z-20 hidden xl:flex flex-col gap-3 w-80 p-4 rounded-xl glass-panel text-xs text-[#f0f0f0] border border-white/10 shadow-2xl backdrop-blur-md">
        <h4 className="text-[11px] font-bold font-mono text-white uppercase tracking-wider">
          HOW TO NAVIGATE
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-300">
          <div className="flex items-center gap-1.5">
            <MousePointer className="w-3 h-3 text-[#00ff88]" />
            <span><strong>Click:</strong> Activate node</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Scroll className="w-3 h-3 text-[#00aaff]" />
            <span><strong>Scroll:</strong> Zoom in/out</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Move className="w-3 h-3 text-[#ff007f]" />
            <span><strong>Drag:</strong> Rotate scene</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CornerDownLeft className="w-3 h-3 text-amber-400" />
            <span><strong>Esc:</strong> Backpropagate</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-2 flex flex-col gap-1.5">
          <h4 className="text-[11px] font-bold font-mono text-amber-400 uppercase tracking-wider">
            AI MECHANICS MAPPING
          </h4>
          <table className="w-full text-[10px] font-mono text-left border-collapse">
            <thead>
              <tr className="text-gray-400 border-b border-white/10">
                <th className="pb-1">Interaction</th>
                <th className="pb-1">AI Concept</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              <tr>
                <td className="py-1">Initial Loading</td>
                <td className="py-1 text-[#00ff88]">Model Training</td>
              </tr>
              <tr>
                <td className="py-1">Navigation</td>
                <td className="py-1 text-[#00ff88]">Feed-Forward Propagation</td>
              </tr>
              <tr>
                <td className="py-1">Back Button</td>
                <td className="py-1 text-[#00aaff]">Backpropagation</td>
              </tr>
              <tr>
                <td className="py-1">Hover Node</td>
                <td className="py-1 text-[#00aaff]">Attention Mechanism</td>
              </tr>
              <tr>
                <td className="py-1">Hire Me Journey</td>
                <td className="py-1 text-[#ff007f]">Final Inference</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Middle Bottom Box: 2. SUB-NETWORKS (Feature Extraction) */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20 hidden md:flex items-start gap-4 p-3.5 rounded-xl glass-panel text-xs text-[#f0f0f0] border border-[#00aaff]/30 shadow-2xl backdrop-blur-md max-w-2xl">
        <div className="flex flex-col gap-1">
          <h4 className="text-[11px] font-bold font-mono text-[#00aaff] uppercase tracking-wider">
            2. SUB-NETWORKS <span className="text-gray-400 font-normal">(Feature Extraction)</span>
          </h4>
          <div className="grid grid-cols-3 gap-3 text-[10px] font-mono mt-1">
            <div className="bg-[#00aaff]/10 p-2 rounded-lg border border-[#00aaff]/20 flex flex-col">
              <span className="font-semibold text-[#00aaff] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> SKILLS
              </span>
              <span className="text-gray-400 text-[9px] mt-0.5">Programming, CV, AI/ML, Tools</span>
            </div>
            <div className="bg-[#00aaff]/10 p-2 rounded-lg border border-[#00aaff]/20 flex flex-col">
              <span className="font-semibold text-[#00aaff] flex items-center gap-1">
                <Folder className="w-3 h-3" /> PROJECTS
              </span>
              <span className="text-gray-400 text-[9px] mt-0.5">Football Analysis, SightMate, Paper Mode</span>
            </div>
            <div className="bg-[#00aaff]/10 p-2 rounded-lg border border-[#00aaff]/20 flex flex-col">
              <span className="font-semibold text-[#00aaff] flex items-center gap-1">
                <Calendar className="w-3 h-3" /> TIMELINE
              </span>
              <span className="text-gray-400 text-[9px] mt-0.5">2022 → 2025 Career Journey</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: 3. NAVIGATION FLOW */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 hidden lg:flex items-center gap-3 px-4 py-2 rounded-full glass-panel text-[10px] font-mono text-gray-300 border border-white/10 shadow-xl backdrop-blur-md">
        <span className="text-[#00ff88] font-bold uppercase">3. NAVIGATION FLOW:</span>
        <span className="text-white">Home Overview</span>
        <span className="text-gray-500">→</span>
        <span className="text-[#00aaff]">Click Skills</span>
        <span className="text-gray-500">→</span>
        <span className="text-[#00aaff]">Skills Network</span>
        <span className="text-gray-500">→</span>
        <span className="text-amber-400">Backpropagate</span>
        <span className="text-gray-500">→</span>
        <span className="text-[#00aaff]">Click Projects</span>
        <span className="text-gray-500">→</span>
        <span className="text-[#00aaff]">Research Paper</span>
        <span className="text-gray-500">→</span>
        <span className="text-[#ff007f]">Click Hire Me</span>
        <span className="text-gray-500">→</span>
        <span className="text-[#ff007f] font-bold">Inference Complete</span>
      </div>
    </>
  );
};
