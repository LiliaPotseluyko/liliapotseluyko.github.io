import React from 'react';
import {
  Sparkles,
  MessageSquare,
  FileSpreadsheet,
  Target,
  Code2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Wand2,
  FlaskConical,
  GraduationCap,
  FolderGit2
} from 'lucide-react';
import { PortfolioData } from '../types';

interface NavbarProps {
  activeTab: 'chat' | 'ingest' | 'insights' | 'job_matcher' | 'widget';
  setActiveTab: (tab: 'chat' | 'ingest' | 'insights' | 'job_matcher' | 'widget') => void;
  portfolioData: PortfolioData;
  onResetData: () => void;
  serverStatus: 'checking' | 'online' | 'offline';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  portfolioData,
  onResetData,
  serverStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0e12]/95 backdrop-blur-md border-b border-[#222938]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1DCD9F] to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-[#1DCD9F]/20">
              <span className="text-base font-extrabold tracking-tighter">LP</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white leading-tight tracking-wide">
                  {portfolioData.developerName || 'Dr Lilia Potseluyko'}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff2a85]/10 text-[#ff2a85] border border-[#ff2a85]/30 uppercase tracking-widest">
                  Portfolio AI
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{portfolioData.projects?.length || 0} Research Evidence Items</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {serverStatus === 'online' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-[#1DCD9F]" />
                      <span className="text-[#1DCD9F] font-semibold">Knowledge Base Live</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-rose-500" />
                      <span className="text-rose-400 font-medium">Connecting...</span>
                    </>
                  )}
                </span>
              </p>
            </div>
          </div>

          {/* Navigation Links matching her website header */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'chat'
                  ? 'bg-[#1DCD9F] text-slate-950 shadow-md shadow-[#1DCD9F]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#131722]'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>Ask Portfolio</span>
            </button>

            <button
              onClick={() => setActiveTab('ingest')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ingest'
                  ? 'bg-[#1DCD9F] text-slate-950 shadow-md shadow-[#1DCD9F]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#131722]'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>CSV & Data Ingestion</span>
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'insights'
                  ? 'bg-[#1DCD9F] text-slate-950 shadow-md shadow-[#1DCD9F]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#131722]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Insights</span>
            </button>

            <button
              onClick={() => setActiveTab('job_matcher')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'job_matcher'
                  ? 'bg-[#1DCD9F] text-slate-950 shadow-md shadow-[#1DCD9F]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#131722]'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Job Matcher</span>
            </button>

            <button
              onClick={() => setActiveTab('widget')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'widget'
                  ? 'bg-[#1DCD9F] text-slate-950 shadow-md shadow-[#1DCD9F]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#131722]'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>GitHub Pages Integration</span>
            </button>
          </nav>

          {/* Reset Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetData}
              title="Reset Knowledge Base to Dr Lilia Potseluyko default records"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-[#131722] hover:bg-[#1f2638] border border-[#222938] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset KB Data</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-[#222938] overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-[#1DCD9F] text-slate-950'
                : 'text-slate-300 bg-[#131722]'
            }`}
          >
            Ask Portfolio
          </button>
          <button
            onClick={() => setActiveTab('ingest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'ingest'
                ? 'bg-[#1DCD9F] text-slate-950'
                : 'text-slate-300 bg-[#131722]'
            }`}
          >
            CSV Upload
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'insights'
                ? 'bg-[#1DCD9F] text-slate-950'
                : 'text-slate-300 bg-[#131722]'
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('job_matcher')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'job_matcher'
                ? 'bg-[#1DCD9F] text-slate-950'
                : 'text-slate-300 bg-[#131722]'
            }`}
          >
            Job Matcher
          </button>
          <button
            onClick={() => setActiveTab('widget')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'widget'
                ? 'bg-[#1DCD9F] text-slate-950'
                : 'text-slate-300 bg-[#131722]'
            }`}
          >
            GitHub Pages
          </button>
        </div>
      </div>
    </header>
  );
};
