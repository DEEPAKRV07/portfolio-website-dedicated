import React from 'react';
import { X, User, FileText, Briefcase, Calendar, Award, GraduationCap, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { NodeData } from '../../types/neural';

interface NodeDetailModalProps {
  node: NodeData | null;
  onClose: () => void;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({ node, onClose }) => {
  if (!node) return null;

  // Render modal content based on node ID
  const renderContent = () => {
    switch (node.id) {
      case 'about-me':
        return (
          <div className="flex flex-col gap-5 text-xs">
            <div className="flex items-center gap-3 text-[#00ff88]">
              <User className="w-5 h-5" />
              <h3 className="text-lg font-bold font-sans text-white">About Deepak R V</h3>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-[#00ff88]/30 flex flex-col gap-2">
              <h4 className="font-mono font-bold text-[#00ff88] uppercase tracking-wider text-[11px]">
                Professional Summary & Vision
              </h4>
              <p className="text-gray-300 leading-relaxed font-sans text-sm">
                AI & Machine Learning Engineer specializing in Computer Vision, Deep Learning, and Cross-Platform Intelligent Applications. Dedicated to building end-to-end vision systems that process complex spatial data into real-time actionable intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5 font-mono">
                <span className="text-[#00ff88] font-bold">CORE PHILOSOPHY</span>
                <span className="text-gray-300">Software should behave like an inference engine — responsive, intelligent, and mathematically structured.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5 font-mono">
                <span className="text-[#00aaff] font-bold">PRIMARY FOCUS</span>
                <span className="text-gray-300">Real-Time Object Detection, Multi-Object Tracking, Edge AI Optimization, and Mobile Flutter Systems.</span>
              </div>
            </div>
          </div>
        );

      case 'resume':
        return (
          <div className="flex flex-col gap-5 text-xs">
            <div className="flex items-center gap-3 text-[#00ff88]">
              <FileText className="w-5 h-5" />
              <h3 className="text-lg font-bold font-sans text-white">Curriculum Vitae & Resume</h3>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-[#00ff88]/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-mono font-bold text-[#00ff88] uppercase tracking-wider text-[11px]">
                    Deepak R V — Resume Highlights
                  </h4>
                  <p className="text-gray-400 text-xs font-mono mt-0.5">AI & Machine Learning Specialist</p>
                </div>
                <button
                  onClick={() => alert("Downloading Deepak R V Resume PDF...")}
                  className="px-3.5 py-1.5 rounded-lg bg-[#00ff88]/20 hover:bg-[#00ff88]/30 text-[#00ff88] border border-[#00ff88]/40 font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 font-mono text-[11px]">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
                  <span>Computer Vision & Deep Learning Expertise</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
                  <span>Real-Time YOLOv8 & ByteTrack Pipelines</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
                  <span>Flutter Cross-Platform AI App Architecture</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
                  <span>IEEE Research Poster Author</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="flex flex-col gap-5 text-xs">
            <div className="flex items-center gap-3 text-[#00ff88]">
              <Briefcase className="w-5 h-5" />
              <h3 className="text-lg font-bold font-sans text-white">Experience & Academic Background</h3>
            </div>

            <div className="flex flex-col gap-3 font-mono">
              <div className="p-4 rounded-xl bg-white/5 border border border-white/10 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[#00ff88]">
                  <span className="font-bold flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> B.Tech in Artificial Intelligence & Machine Learning
                  </span>
                  <span className="text-gray-400 text-[11px]">2022 — Present</span>
                </div>
                <p className="text-gray-300 text-xs font-sans mt-1">
                  Focus on Neural Networks, Computer Vision, Linear Algebra, Autonomous Systems, and Software Engineering.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[#00aaff]">
                  <span className="font-bold flex items-center gap-2">
                    <Award className="w-4 h-4" /> AI & Vision Engineering Research
                  </span>
                  <span className="text-gray-400 text-[11px]">2023 — 2024</span>
                </div>
                <p className="text-gray-300 text-xs font-sans mt-1">
                  Engineered sports tracking pipelines, homography algorithms, and low-latency mobile inference systems.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        // Timeline Milestone Modal
        return (
          <div className="flex flex-col gap-4 text-xs font-mono">
            <div className="flex items-center gap-3 text-amber-400">
              <Calendar className="w-5 h-5" />
              <h3 className="text-lg font-bold font-sans text-white">{node.label} Milestone Overview</h3>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-amber-400/30 flex flex-col gap-2">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                {node.subLabel}
              </span>
              <p className="text-gray-300 text-xs font-sans leading-relaxed">
                Milestone node representation for {node.label}. Detailed accomplishments, research, and project deliverables integrated into the computational graph.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-white/20 p-6 shadow-2xl text-[#f0f0f0]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        {renderContent()}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-all"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
