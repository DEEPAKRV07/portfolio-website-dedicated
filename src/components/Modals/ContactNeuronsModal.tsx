import React from 'react';
import { X, Github, Linkedin, Mail, FileText, CheckCircle, Sparkles } from 'lucide-react';

interface ContactNeuronsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactNeuronsModal: React.FC<ContactNeuronsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md glass-panel rounded-2xl border border-[#ff007f]/50 p-6 shadow-[0_0_60px_rgba(255,0,127,0.3)] text-[#f0f0f0] font-sans flex flex-col gap-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex flex-col gap-1 pr-6">
          <div className="flex items-center gap-2 text-[#ff007f] font-mono text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-4 h-4" /> INFERENCE COMPLETE — OUTPUT NEURONS FIRED
          </div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Let's Connect & Build AI Systems
          </h3>
          <p className="text-xs text-gray-400 font-mono">
            Model activated successfully. Choose an output neuron to establish communication.
          </p>
        </div>

        {/* Output Neurons Links */}
        <div className="flex flex-col gap-3">
          
          {/* GitHub Neuron */}
          <a
            href="https://github.com/deepakrv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-[#00ff88]/15 border border-white/10 hover:border-[#00ff88]/50 transition-all group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 group-hover:bg-[#00ff88]/20 text-white group-hover:text-[#00ff88] transition-colors">
                <Github className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white group-hover:text-[#00ff88] transition-colors">
                  GitHub Profile
                </span>
                <span className="text-xs font-mono text-gray-400">
                  github.com/deepakrv
                </span>
              </div>
            </div>
            <CheckCircle className="w-4 h-4 text-gray-500 group-hover:text-[#00ff88] transition-colors" />
          </a>

          {/* LinkedIn Neuron */}
          <a
            href="https://linkedin.com/in/deepak-rv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-[#00aaff]/15 border border-white/10 hover:border-[#00aaff]/50 transition-all group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 group-hover:bg-[#00aaff]/20 text-white group-hover:text-[#00aaff] transition-colors">
                <Linkedin className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white group-hover:text-[#00aaff] transition-colors">
                  LinkedIn Network
                </span>
                <span className="text-xs font-mono text-gray-400">
                  linkedin.com/in/deepak-rv
                </span>
              </div>
            </div>
            <CheckCircle className="w-4 h-4 text-gray-500 group-hover:text-[#00aaff] transition-colors" />
          </a>

          {/* Email Neuron */}
          <a
            href="mailto:deepakrv.work@gmail.com"
            className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-amber-400/15 border border-white/10 hover:border-amber-400/50 transition-all group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 group-hover:bg-amber-400/20 text-white group-hover:text-amber-400 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                  Direct Email
                </span>
                <span className="text-xs font-mono text-gray-400">
                  deepakrv.work@gmail.com
                </span>
              </div>
            </div>
            <CheckCircle className="w-4 h-4 text-gray-500 group-hover:text-amber-400 transition-colors" />
          </a>

          {/* Download Resume Neuron */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Downloading Deepak R V Resume...");
            }}
            className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-[#ff007f]/15 border border-white/10 hover:border-[#ff007f]/50 transition-all group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 group-hover:bg-[#ff007f]/20 text-white group-hover:text-[#ff007f] transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white group-hover:text-[#ff007f] transition-colors">
                  Download Full CV / Resume
                </span>
                <span className="text-xs font-mono text-gray-400">
                  PDF Format (AI & Vision Focused)
                </span>
              </div>
            </div>
            <CheckCircle className="w-4 h-4 text-gray-500 group-hover:text-[#ff007f] transition-colors" />
          </a>

        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-all mt-2"
        >
          Return to Neural Graph
        </button>

      </div>
    </div>
  );
};
