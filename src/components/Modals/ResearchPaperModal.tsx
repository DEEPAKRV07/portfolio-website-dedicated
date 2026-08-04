import React from 'react';
import { ProjectDetail } from '../../data/subNetworksData';
import { X, ExternalLink, Github, FileText, Cpu, Award, Zap, CheckCircle2 } from 'lucide-react';

interface ResearchPaperModalProps {
  project: ProjectDetail | null;
  onClose: () => void;
}

export const ResearchPaperModal: React.FC<ResearchPaperModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel rounded-2xl border border-[#00aaff]/40 shadow-[0_0_50px_rgba(0,170,255,0.2)] p-6 md:p-8 text-[#f0f0f0] font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Paper Header */}
        <div className="flex flex-col gap-2 pb-5 border-b border-white/10 pr-10">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded bg-[#00aaff]/20 text-[#00aaff] text-[10px] font-mono font-bold tracking-widest uppercase border border-[#00aaff]/40 flex items-center gap-1">
              <FileText className="w-3 h-3" /> IEEE RESEARCH PAPER MODE
            </span>
            <span className="text-xs font-mono text-gray-400">
              {project.conference} ({project.date})
            </span>
          </div>

          <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight leading-snug mt-1">
            {project.title}
          </h2>

          <p className="text-xs font-mono text-[#00ff88]">
            Author: <span className="text-white font-medium">{project.authors}</span>
          </p>
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-2 my-4">
          {project.techStack.map((tech, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-md bg-white/5 text-gray-300 text-xs font-mono border border-white/10"
            >
              #{tech}
            </span>
          ))}
        </div>

        {/* IEEE Paper Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-xs leading-relaxed">
          
          {/* Section 1: Problem Statement */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1.5">
            <h4 className="font-mono font-bold text-[#00ff88] uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4" /> 1. Problem Statement
            </h4>
            <p className="text-gray-300">{project.problemStatement}</p>
          </div>

          {/* Section 2: Dataset & Inputs */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1.5">
            <h4 className="font-mono font-bold text-[#00aaff] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4" /> 2. Dataset & Benchmark
            </h4>
            <p className="text-gray-300">{project.dataset}</p>
          </div>

          {/* Section 3: Architecture & Pipeline */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
            <h4 className="font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4" /> 3. System Architecture & Pipeline
            </h4>
            <div className="flex flex-col gap-1.5 font-mono text-[11px]">
              {project.pipeline.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-300">
                  <span className="text-amber-400 font-bold">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Training & Results */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
            <h4 className="font-mono font-bold text-[#ff007f] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> 4. Empirical Performance & Results
            </h4>
            <p className="text-gray-300 font-semibold">{project.results}</p>
            <p className="text-gray-400 mt-1">{project.method}</p>
          </div>

          {/* Section 5: Key Learnings */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1.5">
            <h4 className="font-mono font-bold text-emerald-400 uppercase tracking-wider">
              5. Key Engineering Learnings
            </h4>
            <p className="text-gray-300">{project.learnings}</p>
          </div>

          {/* Section 6: Future Work */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1.5">
            <h4 className="font-mono font-bold text-indigo-400 uppercase tracking-wider">
              6. Future Improvements
            </h4>
            <p className="text-gray-300">{project.futureImprovements}</p>
          </div>

        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#00ff88]/15 hover:bg-[#00ff88]/25 text-[#00ff88] border border-[#00ff88]/40 font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,255,136,0.2)]"
            >
              <Github className="w-4 h-4" /> GitHub Repository <ExternalLink className="w-3 h-3" />
            </a>

            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#00aaff]/15 hover:bg-[#00aaff]/25 text-[#00aaff] border border-[#00aaff]/40 font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,170,255,0.2)]"
              >
                <ExternalLink className="w-4 h-4" /> Live Demo / Paper Video
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-all"
          >
            Close Paper (Backpropagation)
          </button>
        </div>

      </div>
    </div>
  );
};
