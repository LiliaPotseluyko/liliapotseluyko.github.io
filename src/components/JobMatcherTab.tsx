import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  FolderGit2,
  ListChecks,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { PortfolioData, JobMatchResult } from '../types';

interface JobMatcherTabProps {
  portfolioData: PortfolioData;
}

export const JobMatcherTab: React.FC<JobMatcherTabProps> = ({ portfolioData }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  const sampleJobDescription = `Senior AI & Full-Stack Engineer
Company: CloudNexus AI

Responsibilities:
- Build high-performance React & Node.js web applications with AI API integrations.
- Architect real-time document search, retrieval augmented generation (RAG), and vector embeddings.
- Optimize web application latency, microservices architecture, and cloud deployment on Cloud Run.
- Lead engineering decisions, mentor team members, and ensure high code quality with TypeScript.

Requirements:
- 5+ years experience with TypeScript, React, and Node.js.
- Hands-on experience with Gemini API / LLM frameworks and vector search (PGVector).
- Proven track record with microservices, Docker, and CI/CD pipelines.
- Strong communication skills and cross-functional team leadership.`;

  const handleMatchJob = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/match-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioData, jobDescription }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Job matching failed.');
      }

      const data = await res.json();
      if (data.matchResult) {
        setMatchResult(data.matchResult);
      }
    } catch (err: any) {
      alert(`Error matching job: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPitchBullets = () => {
    if (!matchResult) return;
    const bulletsText = matchResult.customPitchBulletPoints?.join('\n• ') || '';
    navigator.clipboard.writeText(`• ${bulletsText}`);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50">
          <Target className="w-3.5 h-3.5" />
          <span>Tailored Job Description Matcher</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Compare Portfolio against Target Role Requirements
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Paste any job posting or requirement document. Gemini AI computes a compatibility match score, aligns candidate project history, identifies skill matches & gaps, and drafts tailored pitch bullet points.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Target Job Description (JD)
          </label>
          <button
            onClick={() => setJobDescription(sampleJobDescription)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Load Sample Senior AI Engineer JD</span>
          </button>
        </div>

        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
          placeholder="Paste job posting text, responsibilities, or required tech stack here..."
          className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <div className="flex justify-end">
          <button
            onClick={handleMatchJob}
            disabled={!jobDescription.trim() || loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing Compatibility...' : 'Compute Match & Tailored Pitch'}</span>
          </button>
        </div>
      </div>

      {/* Results Section */}
      {matchResult && (
        <div className="space-y-6">
          {/* Match Score Gauge & Overall Verdict */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center justify-center w-32 h-32 rounded-full border-4 border-emerald-400 bg-slate-900/80 text-center shrink-0 shadow-lg">
              <div>
                <div className="text-3xl font-extrabold text-emerald-400">
                  {matchResult.matchScore}%
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  Match Score
                </div>
              </div>
            </div>

            <div className="space-y-2 flex-1 text-center md:text-left">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Fit Evaluation
              </span>
              <h3 className="text-lg font-bold">Overall Role Fit Assessment</h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {matchResult.overallVerdict}
              </p>
            </div>
          </div>

          {/* Skills Alignment Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Matching Candidate Qualifications ({matchResult.matchingSkills?.length || 0})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.matchingSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing / Additional Skills */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <XCircle className="w-4 h-4 text-amber-500" />
                <span>Gaps / Quick Learning Horizons</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.missingSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60"
                  >
                    • {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Top Recommended Projects to Highlight */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-emerald-600" />
              <span>Recommended Projects to Showcase for this Role</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchResult.topProjectsToHighlight?.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                >
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {proj.projectTitle}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong className="text-emerald-600 dark:text-emerald-400">Why it fits: </strong>
                    {proj.relevanceReason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Tailored Pitch Bullet Points */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-emerald-600" />
                <span>Tailored Pitch Bullet Points for Cover Letter / Intro</span>
              </h3>
              <button
                onClick={handleCopyPitchBullets}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {copiedPitch ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Bullets</span>
                  </>
                )}
              </button>
            </div>

            <ul className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
              {matchResult.customPitchBulletPoints?.map((bp, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
