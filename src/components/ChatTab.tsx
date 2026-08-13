import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  UserCheck,
  Cpu,
  Target,
  MessageSquare,
  Sparkles,
  Trash2,
  FolderGit2,
  Bot,
  User,
  ArrowRight,
  ChevronRight,
  FlaskConical,
  Search,
  ArrowLeft,
  Wand2,
  CheckCircle2
} from 'lucide-react';
import { PortfolioData, ChatMessage, ChatMode, Project } from '../types';
import { MarkdownViewer } from './MarkdownViewer';

interface ChatTabProps {
  portfolioData: PortfolioData;
  onOpenProject: (project: Project) => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({ portfolioData, onOpenProject }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: `Hello! I am **Dr Lilia Potseluyko**'s AI Portfolio Assistant.

I search her growing portfolio knowledge base to answer questions regarding her experience in **spatial data, digital twins, 3D computer vision, user experience design (RoadGP), and research leadership**.

Try asking a question below or click one of the suggested topics!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: 'general',
      suggestedFollowups: [
        `What experience does Dr Lilia Potseluyko have with digital twins?`,
        `How was the RoadGP AI decision support platform designed?`,
        `Tell me about the 12km tunnel schematic mapping project.`,
        `What publications and datasets has Lilia authored?`
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ChatMode>('general');
  const [targetRoleInput, setTargetRoleInput] = useState('Spatial Data & Digital Twin Specialist');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: history,
          portfolioData,
          mode: selectedMode,
          targetRole: targetRoleInput,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to get AI response.');
      }

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowups: data.suggestedFollowups || [],
        referencedProjects: data.referencedProjects || [],
        mode: selectedMode,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        sender: 'bot',
        text: `⚠️ **Notice**: ${err.message || 'Unable to connect to Portfolio AI service.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearThread = () => {
    setMessages([
      {
        id: `m-reset-${Date.now()}`,
        sender: 'bot',
        text: `Thread reset. Ask me anything grounded strictly in **Dr Lilia Potseluyko**'s portfolio knowledge base!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: selectedMode,
        suggestedFollowups: [
          `What experience does Lilia have with digital twins?`,
          `What software engineering skills does Lilia have?`,
          `Which projects demonstrate user research and product design?`,
        ],
      },
    ]);
  };

  const sampleQuestions = [
    { label: 'Digital twins', query: 'What experience does Lilia have with digital twins?' },
    { label: 'Software engineering', query: 'What software engineering skills does Lilia have?' },
    { label: 'Product & UX', query: 'Which projects demonstrate user research and product design?' },
    { label: 'RoadGP & National Highways', query: 'What role did Lilia play in the RoadGP decision-support platform?' },
    { label: 'Tunnel Mapping', query: 'Tell me about the 12km tunnel automated schematic mapping project for Trafikverket.' },
    { label: 'Publications & Research', query: 'What research publications and datasets has Dr Lilia Potseluyko authored?' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Back Link matching her screenshot */}
      <div className="flex items-center justify-between">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#1DCD9F] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to main page</span>
        </a>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearThread}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 bg-[#131722] hover:bg-[#1a2030] border border-[#222938] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Thread</span>
          </button>
        </div>
      </div>

      {/* Intro Hero Section matching her screenshot */}
      <section className="space-y-3">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#ff2a85]">
          BETA PREVIEW
        </p>

        <h1 className="text-3xl sm:text-5xl font-black text-[#1DCD9F] tracking-tight">
          Ask Lilia AI
        </h1>

        <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-3xl">
          Explore my professional experience, projects, research and technical skills through an AI-powered portfolio assistant.
        </p>

        {/* Beta Notice Box with Pink Border */}
        <div className="bg-[#131722] rounded-2xl p-5 border-l-4 border-[#ff2a85] border-y border-r border-[#ff2a85]/20 flex items-start gap-4 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-[#ff2a85]/10 text-[#ff2a85] flex items-center justify-center shrink-0 mt-0.5">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
            <h2 className="text-sm font-extrabold text-white">This is a beta version</h2>
            <p>
              This assistant is powered by Google Cloud and searches a growing portfolio knowledge base. More CVs, project evidence, publications and technical documents will be added as the portfolio develops.
            </p>
            <p className="text-slate-400 italic">
              Some answers may therefore be incomplete. When evidence is unavailable, the assistant should say that it could not find supporting information in the current portfolio knowledge base.
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Search Panel Section matching her screenshot */}
      <section className="bg-[#131722] rounded-2xl border border-[#222938] p-6 shadow-xl space-y-6">
        {/* Heading Header */}
        <div className="flex items-center justify-between border-b border-[#222938] pb-4">
          <div>
            <p className="text-[11px] font-extrabold text-[#ff2a85] uppercase tracking-widest">
              GOOGLE CLOUD PORTFOLIO SEARCH
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              What would you like to know?
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1DCD9F]/10 text-[#1DCD9F] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Communication Persona Mode Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Communication Persona Mode:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setSelectedMode('general')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left ${
                selectedMode === 'general'
                  ? 'bg-[#1DCD9F]/15 border-[#1DCD9F] text-[#1DCD9F]'
                  : 'bg-[#0c0e12] border-[#222938] text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <div>
                <div>General Overview</div>
                <div className="text-[10px] text-slate-400 font-normal">Standard Q&A</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMode('recruiter')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left ${
                selectedMode === 'recruiter'
                  ? 'bg-[#ff2a85]/15 border-[#ff2a85] text-[#ff2a85]'
                  : 'bg-[#0c0e12] border-[#222938] text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <div>
                <div>Recruiter / Lead</div>
                <div className="text-[10px] text-slate-400 font-normal">Impact & Research</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMode('tech_deepdive')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left ${
                selectedMode === 'tech_deepdive'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                  : 'bg-[#0c0e12] border-[#222938] text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <div>
                <div>Technical Deep-Dive</div>
                <div className="text-[10px] text-slate-400 font-normal">Code & Spatial Systems</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMode('job_match')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left ${
                selectedMode === 'job_match'
                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400'
                  : 'bg-[#0c0e12] border-[#222938] text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4 shrink-0" />
              <div>
                <div>Job Fit Matcher</div>
                <div className="text-[10px] text-slate-400 font-normal">Role Alignment</div>
              </div>
            </button>
          </div>
        </div>

        {/* Input Bar with Search Icon & Mint Border matching her screenshot */}
        <div className="space-y-2">
          <label className="text-xs text-slate-300 font-medium">
            Ask about my skills, projects, research or professional experience
          </label>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative"
          >
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="For example: What experience does Lilia have with digital twins?"
              disabled={loading}
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl border-2 border-[#1DCD9F] bg-[#0c0e12] text-white text-sm outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-[#1DCD9F]/40 shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-[#1DCD9F] hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Suggested Question Buttons matching her screenshot */}
        <div className="space-y-2">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <span>Try asking:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q.query)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1a2030] hover:bg-[#252f48] text-slate-200 border border-[#2e3956] hover:border-[#1DCD9F] transition-all text-left shadow-xs"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="pt-4 border-t border-[#222938] space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-white text-slate-950 font-bold'
                    : 'bg-[#1DCD9F] text-slate-950 font-bold'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[88%] space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1DCD9F] text-slate-950 font-medium rounded-tr-none'
                      : 'bg-[#0c0e12] text-slate-100 border border-[#222938] rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <MarkdownViewer content={msg.text} />
                  )}

                  {/* Referenced Research / Project Badges */}
                  {msg.referencedProjects && msg.referencedProjects.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#222938]">
                      <div className="text-[10px] font-extrabold text-[#ff2a85] uppercase tracking-wider mb-2 flex items-center gap-1">
                        <FolderGit2 className="w-3.5 h-3.5 text-[#ff2a85]" />
                        <span>Referenced Knowledge Base Evidence</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.referencedProjects.map((projId) => {
                          const proj = portfolioData.projects?.find((p) => p.id === projId);
                          if (!proj) return null;
                          return (
                            <button
                              key={projId}
                              onClick={() => onOpenProject(proj)}
                              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131722] hover:bg-[#1a2030] border border-[#1DCD9F]/40 text-xs font-bold text-[#1DCD9F] transition-all text-left"
                            >
                              <span>{proj.title}</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested Follow-ups */}
                {msg.sender === 'bot' && msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Suggested Follow-up Queries
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowups.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSendMessage(q)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#131722] hover:bg-[#1f2638] text-slate-200 border border-[#222938] hover:border-[#1DCD9F] transition-colors text-left"
                        >
                          <span>{q}</span>
                          <ArrowRight className="w-3 h-3 text-[#1DCD9F]" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-slate-500 px-1">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Skeleton */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1DCD9F] text-slate-950 flex items-center justify-center font-bold">
                <Wand2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-[#0c0e12] border border-[#222938] rounded-tl-none space-y-2 min-w-[220px]">
                <div className="h-3 bg-[#1a2030] rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-[#1a2030] rounded w-1/2 animate-pulse" />
                <p className="text-xs text-[#1DCD9F] font-bold pt-1">
                  Searching Dr Lilia Potseluyko's portfolio knowledge base...
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </section>

      {/* Grounding Footer Notice */}
      <p className="text-center text-xs text-slate-500 pt-2">
        Powered by Google Cloud AI Applications and a structured portfolio knowledge base for Dr Lilia Potseluyko.
      </p>
    </div>
  );
};
