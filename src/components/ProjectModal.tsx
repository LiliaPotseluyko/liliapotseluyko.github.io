import React from 'react';
import { X, ExternalLink, Github, Code2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Project } from '../types';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#131722] rounded-2xl shadow-2xl border border-[#222938] p-6 overflow-hidden max-h-[90vh] flex flex-col text-white">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#222938] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1DCD9F]/10 text-[#1DCD9F] border border-[#1DCD9F]/30 uppercase tracking-wider">
                {project.role}
              </span>
              {project.featured && (
                <span className="flex items-center gap-1 text-xs font-bold text-[#ff2a85] bg-[#ff2a85]/10 px-2 py-0.5 rounded-full border border-[#ff2a85]/30">
                  <Sparkles className="w-3 h-3" /> Featured Research
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-white mt-2">{project.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1f2638] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Overview */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#ff2a85] mb-1.5">Overview</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{project.description}</p>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1DCD9F] mb-2">Tech Stack & Tools</h4>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0c0e12] text-slate-200 border border-[#222938]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Key Impact & Evidence */}
          {project.impactMetrics && project.impactMetrics.length > 0 && (
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1DCD9F] mb-2">Key Impact & Deliverables</h4>
              <ul className="space-y-1.5">
                {project.impactMetrics.map((metric, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#1DCD9F] shrink-0 mt-0.5" />
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenge Solved */}
          {project.challengesSolved && (
            <div className="bg-[#0c0e12] p-4 rounded-xl border border-[#222938]">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#ff2a85] mb-1">
                Technical / Design Challenge
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{project.challengesSolved}</p>
            </div>
          )}

          {/* Code Snippet */}
          {project.codeSnippet && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                <Code2 className="w-4 h-4 text-[#1DCD9F]" />
                <span>Code / Architecture Snippet</span>
              </div>
              <pre className="p-3 bg-[#0c0e12] text-[#1DCD9F] rounded-xl text-xs font-mono overflow-x-auto border border-[#222938] leading-relaxed">
                <code>{project.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="pt-3 border-t border-[#222938] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-[#1DCD9F] hover:underline transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Evidence</span>
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Live Demo</span>
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0c0e12] text-white hover:bg-[#1f2638] border border-[#222938] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
