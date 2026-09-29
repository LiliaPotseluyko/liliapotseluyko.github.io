import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Zap,
  Target,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';
import { PortfolioData, InsightsData } from '../types';

interface InsightsTabProps {
  portfolioData: PortfolioData;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({ portfolioData }) => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePitchVariant, setActivePitchVariant] = useState<
    'linkedinBio' | 'elevatorPitch' | 'recruiterEmailIntro' | 'technicalLeadSummary'
  >('elevatorPitch');
  const [copiedPitch, setCopiedPitch] = useState(false);

  const handleGenerateInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioData }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to synthesize insights.');
      }

      const data = await res.json();
      if (data.insights) {
        setInsights(data.insights);
      }
    } catch (err: any) {
      alert(`Error generating insights: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPitch = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI UVP & Interview Synthesizer</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Personalized Candidate Insights & Pitch Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Analyzes project history, metric impact, and technical stack to extract your Unique Value Proposition, custom elevator pitches, and tailored interview Q&A.
          </p>
        </div>

        <button
          onClick={handleGenerateInsights}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all shrink-0 disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Synthesizing...' : 'Synthesize Insights'}</span>
        </button>
      </div>

      {/* Main Insights Content */}
      {!insights && !loading && (
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Insights Synthesized Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Click "Synthesize Insights" above to let Gemini AI evaluate **{portfolioData.developerName}**'s portfolio data and generate pitches, strengths, and behavioral Q&A!
            </p>
          </div>
          <button
            onClick={handleGenerateInsights}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
          >
            Generate Insights Now
          </button>
        </div>
      )}

      {loading && (
        <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Sparkles className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Synthesizing Unique Value Proposition & Interview Q&A with Gemini 3.6 Flash...
          </p>
        </div>
      )}

      {insights && (
        <div className="space-y-6">
          {/* Persona Summary & UVP Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Persona Summary */}
            <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Candidate Persona & Core Identity</span>
              </div>
              <p className="text-sm leading-relaxed text-indigo-50/90 font-medium">
                {insights.personaSummary}
              </p>
              <div className="pt-2 border-t border-indigo-800/60">
                <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                  Unique Value Proposition (UVP)
                </div>
                <p className="text-xs text-white font-medium italic">
                  "{insights.uniqueValueProp}"
                </p>
              </div>
            </div>

            {/* Strengths & Growth Areas */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span>Key Standout Strengths</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {insights.strengths?.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span>Growth Areas / Next Horizons</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {insights.growthAreas?.map((gro, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{gro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Tailored Pitch Variants */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <span>Tailored Pitch Variants</span>
              </h3>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs overflow-x-auto">
                <button
                  onClick={() => setActivePitchVariant('elevatorPitch')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activePitchVariant === 'elevatorPitch'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Elevator Pitch
                </button>
                <button
                  onClick={() => setActivePitchVariant('recruiterEmailIntro')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activePitchVariant === 'recruiterEmailIntro'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Recruiter Email
                </button>
                <button
                  onClick={() => setActivePitchVariant('linkedinBio')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activePitchVariant === 'linkedinBio'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  LinkedIn About
                </button>
                <button
                  onClick={() => setActivePitchVariant('technicalLeadSummary')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activePitchVariant === 'technicalLeadSummary'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Tech Lead Summary
                </button>
              </div>
            </div>

            <div className="relative p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                {insights.pitchVariants?.[activePitchVariant]}
              </p>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleCopyPitch(insights.pitchVariants?.[activePitchVariant] || '')
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors"
                >
                  {copiedPitch ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600">Copied Pitch</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Pitch Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Behavioral & Technical Interview Q&A Bank */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <span>Project-Mapped Behavioral Interview Q&A Bank</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {insights.interviewQA?.map((qa, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Q: {qa.question}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 shrink-0">
                      Mention: {qa.keyProjectToMention}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
                    <strong className="text-indigo-600 dark:text-indigo-400">Suggested STAR Answer: </strong>
                    {qa.suggestedAnswer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
