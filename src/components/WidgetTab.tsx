import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Globe,
  Terminal,
  Play,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  MessageSquare,
  Github,
  Link,
  ArrowRight
} from 'lucide-react';
import { PortfolioData } from '../types';

interface WidgetTabProps {
  portfolioData: PortfolioData;
  onToggleLiveOverlay: () => void;
  isOverlayActive: boolean;
}

export const WidgetTab: React.FC<WidgetTabProps> = ({
  portfolioData,
  onToggleLiveOverlay,
  isOverlayActive,
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [devName, setDevName] = useState(portfolioData.developerName || 'Dr Lilia Potseluyko');
  const [widgetColor, setWidgetColor] = useState('#1DCD9F');

  // Interactive REST API Tester state
  const [testQuery, setTestQuery] = useState('What experience does Lilia have with digital twins?');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const currentBackendUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-cloud-run-app.run.app';

  const embedScriptCode = `<!-- Paste this 1-line script tag into your ask-portfolio.html file before </body> on your GitHub Pages repo -->
<script 
  src="${currentBackendUrl}/portfolio-ai-widget.js"
  data-api-url="${currentBackendUrl}"
  data-dev-name="${devName}"
  data-color="${widgetColor}"
></script>`;

  const directApiSnippet = `// Direct JavaScript fetch example for ask-portfolio.html
async function queryPortfolioAI(userPrompt) {
  const response = await fetch("${currentBackendUrl}/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: userPrompt,
      mode: "general"
    })
  });
  const data = await response.json();
  console.log("AI Answer:", data.text);
  console.log("Followups:", data.suggestedFollowups);
  return data;
}`;

  const curlCommand = `curl -X POST "${currentBackendUrl}/api/chat" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "${testQuery}",
    "mode": "general"
  }'`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(embedScriptCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleRunApiTest = async () => {
    setTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testQuery,
          portfolioData,
          mode: 'general',
        }),
      });
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131722] rounded-2xl border border-[#222938] p-6 text-white shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#1DCD9F]/10 text-[#1DCD9F] border border-[#1DCD9F]/30">
              <Github className="w-3.5 h-3.5 text-[#1DCD9F]" />
              <span>GitHub Pages Integration Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Link Your GitHub Pages Website with this Cloud Run Backend
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Step-by-step instructions to connect your hosted static site (<code className="text-[#1DCD9F] font-bold">ask-portfolio.html</code>) with Dr Lilia Potseluyko's real-time AI knowledge base.
            </p>
          </div>

          <button
            onClick={onToggleLiveOverlay}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs shadow-lg transition-all shrink-0 ${
              isOverlayActive
                ? 'bg-[#ff2a85] hover:bg-rose-600 text-white'
                : 'bg-[#1DCD9F] hover:bg-emerald-400 text-slate-950 font-extrabold'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isOverlayActive ? 'Hide Widget Test' : 'Test Floating Widget Live'}</span>
          </button>
        </div>
      </div>

      {/* STEP-BY-STEP INSTRUCTIONS CARD */}
      <div className="bg-[#131722] p-6 rounded-2xl border border-[#222938] shadow-md space-y-5">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Link className="w-4 h-4 text-[#1DCD9F]" />
          <span>Steps to Link your GitHub Pages Website</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#222938] space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#1DCD9F] text-slate-950 font-black flex items-center justify-center text-xs">
              1
            </div>
            <h4 className="font-extrabold text-white">Open `ask-portfolio.html`</h4>
            <p className="text-slate-400 leading-relaxed">
              In your GitHub Pages repository, open the file <code className="text-[#1DCD9F]">ask-portfolio.html</code> or your main index file.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#222938] space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#1DCD9F] text-slate-950 font-black flex items-center justify-center text-xs">
              2
            </div>
            <h4 className="font-extrabold text-white">Paste Widget or Fetch Call</h4>
            <p className="text-slate-400 leading-relaxed">
              Paste the 1-line script tag before <code className="text-[#1DCD9F]">&lt;/body&gt;</code>, or use direct <code className="text-[#1DCD9F]">fetch('/api/chat')</code> calls from your existing search box UI.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#222938] space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#1DCD9F] text-slate-950 font-black flex items-center justify-center text-xs">
              3
            </div>
            <h4 className="font-extrabold text-white">Commit & Push to GitHub</h4>
            <p className="text-slate-400 leading-relaxed">
              Commit your changes and push to GitHub. GitHub Pages will build and immediately serve real-time AI answers!
            </p>
          </div>
        </div>
      </div>

      {/* OPTION A: 1-Line Embed Widget */}
      <div className="bg-[#131722] p-6 rounded-2xl border border-[#222938] shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-[#222938] pb-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#1DCD9F]" />
            <span>Option A: 1-Line Floating Chatbot Widget Script</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1DCD9F]/10 text-[#1DCD9F] border border-[#1DCD9F]/30">
            CORS Enabled
          </span>
        </div>

        {/* Customization Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0c0e12] p-4 rounded-xl border border-[#222938]">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Display Name:
            </label>
            <input
              type="text"
              value={devName}
              onChange={(e) => setDevName(e.target.value)}
              className="w-full p-2 rounded-xl border border-[#222938] bg-[#131722] text-white text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Accent Color:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={widgetColor}
                onChange={(e) => setWidgetColor(e.target.value)}
                className="w-8 h-8 rounded border border-[#222938] cursor-pointer"
              />
              <input
                type="text"
                value={widgetColor}
                onChange={(e) => setWidgetColor(e.target.value)}
                className="flex-1 p-2 rounded-xl border border-[#222938] bg-[#131722] text-white text-xs font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Copyable Script Tag */}
        <div className="relative rounded-2xl bg-[#0c0e12] p-4 text-slate-100 font-mono text-xs border border-[#222938] overflow-x-auto">
          <div className="flex items-center justify-between mb-2 text-slate-400 text-[11px] font-bold border-b border-[#222938] pb-2">
            <span>HTML Integration Snippet for ask-portfolio.html</span>
            <button
              onClick={handleCopySnippet}
              className="flex items-center gap-1 text-[#1DCD9F] hover:underline"
            >
              {copiedSnippet ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1DCD9F]" />
                  <span className="text-[#1DCD9F]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Script Tag</span>
                </>
              )}
            </button>
          </div>
          <pre className="leading-relaxed whitespace-pre-wrap text-[#1DCD9F]">
            <code>{embedScriptCode}</code>
          </pre>
        </div>
      </div>

      {/* OPTION B: Direct REST API & JS Code */}
      <div className="bg-[#131722] p-6 rounded-2xl border border-[#222938] shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-[#222938] pb-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#ff2a85]" />
            <span>Option B: Direct JS `fetch()` Call for Custom UI</span>
          </h3>
          <span className="text-xs text-slate-400">POST {currentBackendUrl}/api/chat</span>
        </div>

        <div className="relative rounded-2xl bg-[#0c0e12] p-4 text-slate-100 font-mono text-xs border border-[#222938] overflow-x-auto space-y-2">
          <pre className="leading-relaxed text-slate-300">
            <code>{directApiSnippet}</code>
          </pre>
        </div>

        {/* cURL Tester */}
        <div className="bg-[#0c0e12] p-4 rounded-2xl border border-[#222938] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1DCD9F]">
            Test API Endpoint Directly
          </h4>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Enter question..."
              className="flex-1 p-2.5 rounded-xl border border-[#222938] bg-[#131722] text-xs text-white"
            />
            <button
              onClick={handleRunApiTest}
              disabled={testing}
              className="px-4 py-2.5 rounded-xl bg-[#1DCD9F] hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{testing ? 'Testing...' : 'Test Request'}</span>
            </button>
          </div>

          {testResponse && (
            <div className="p-3 bg-[#0c0e12] text-[#1DCD9F] font-mono text-xs rounded-xl overflow-x-auto border border-[#222938]">
              <div className="text-[10px] text-slate-400 mb-1">Cloud Run Response (200 OK):</div>
              <pre><code>{testResponse}</code></pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
