import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Code2,
  FolderGit2,
  Briefcase,
  User,
  Wand2,
  RefreshCw,
  Upload,
  Database
} from 'lucide-react';
import { PortfolioData, Project, SkillCategory, WorkExperience } from '../types';

interface IngestTabProps {
  portfolioData: PortfolioData;
  onUpdatePortfolioData: (newData: PortfolioData) => void;
  onOpenProject: (project: Project) => void;
}

export const IngestTab: React.FC<IngestTabProps> = ({
  portfolioData,
  onUpdatePortfolioData,
  onOpenProject,
}) => {
  const [rawText, setRawText] = useState(portfolioData.rawUnstructuredText || '');
  const [parsing, setParsing] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'unstructured' | 'structured'>('unstructured');

  const handleParseText = async (textToParse?: string) => {
    const content = textToParse || rawText;
    if (!content.trim()) return;
    setParsing(true);
    setParseSuccess(false);

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: content }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Parsing failed.');
      }

      const data = await res.json();
      if (data.parsedData) {
        const updated: PortfolioData = {
          ...data.parsedData,
          developerName: data.parsedData.developerName || portfolioData.developerName || "Dr Lilia Potseluyko",
          rawUnstructuredText: content,
        };
        onUpdatePortfolioData(updated);
        setParseSuccess(true);
        setActiveSubTab('structured');
      }
    } catch (err: any) {
      alert(`Error parsing input data: ${err.message}`);
    } finally {
      setParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawText(text);
        handleParseText(text);
      }
    };
    reader.readAsText(file);
  };

  const sampleCsvData = `Project / Item,Role,Description / Evidence,Tech Stack,Impact Metrics
RoadGP AI Platform,Product Design & AI Lead,AI-assisted decision support platform developed for National Highways for defect diagnoses and repair priorities.,Figma, UX Research, Python, REST API, Python Dash, Dovetail,Sequential workflow design system; Dovetail interview research repository
12km Tunnel Schematic Mapping,Computational Lead & Digital Twin Developer,Mathematical coordinate transformation algorithms to automate schematic map interface generation for Trafikverket 12km tunnel with 20000 IoT assets.,Mathematical Transformation, Python, Unreal Engine, GIS,C++,"Replaced manual mapping; adopted by Trafikverket over in-house alternative"
CAMHighways & Unreal Digital Twin,Spatial Data Lead,Processed Trimble MX9 LiDAR and 360 imagery to build interactive Unreal Engine digital twins.,Trimble MX9, LiDAR, Unreal Engine, VR, QGIS,Featured on BBC News International Pothole Day 2023; presented at Highways UK & CONVR Florence
DfT Cyclist Safety Simulation,Lead Simulation Researcher,Immersive video simulation platform for Department for Transport transport planning research with 4000+ UK participants.,Video Simulation, UX Research, Transport Planning,Nationwide study informing DfT decisions on London cycling infrastructure`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131722] rounded-2xl border border-[#222938] p-6 text-white shadow-xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1DCD9F]/10 text-[#1DCD9F] border border-[#1DCD9F]/30">
          <Database className="w-3.5 h-3.5 text-[#1DCD9F]" />
          <span>Knowledge Base & Document Ingestion</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white">
          Upload Documents & Ingest Unstructured / CSV Data
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Upload CSV files, paste raw research evidence, project logs, or publication abstracts. The Gemini ingestion engine will automatically extract structured entities for <strong className="text-[#1DCD9F]">Dr Lilia Potseluyko</strong>'s portfolio chatbot knowledge base.
        </p>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#222938] pb-2">
        <button
          onClick={() => setActiveSubTab('unstructured')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeSubTab === 'unstructured'
              ? 'bg-[#1DCD9F] text-slate-950 shadow-md'
              : 'bg-[#131722] text-slate-300 hover:text-white border border-[#222938]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Upload CSV & Documents</span>
        </button>

        <button
          onClick={() => setActiveSubTab('structured')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeSubTab === 'structured'
              ? 'bg-[#1DCD9F] text-slate-950 shadow-md'
              : 'bg-[#131722] text-slate-300 hover:text-white border border-[#222938]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Extracted Knowledge Base ({portfolioData.projects?.length || 0} Evidence Items)</span>
        </button>
      </div>

      {/* SUB-TAB 1: CSV & Unstructured Upload */}
      {activeSubTab === 'unstructured' && (
        <div className="space-y-6">
          {/* File Upload Box */}
          <div className="bg-[#131722] p-6 rounded-2xl border border-[#222938] shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#1DCD9F]" />
                  <span>Upload CSV or Text File</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  CSV format is fully accepted. You can upload multiple CSV files or documents to expand the knowledge base.
                </p>
              </div>

              <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1DCD9F] hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-md">
                <Upload className="w-4 h-4" />
                <span>Choose .CSV File</span>
                <input
                  type="file"
                  accept=".csv,.txt,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Raw Text / CSV Editor */}
            <div className="space-y-2 pt-2 border-t border-[#222938]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#ff2a85]">
                  Document Content / CSV Data
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRawText(sampleCsvData);
                  }}
                  className="text-xs font-semibold text-[#1DCD9F] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Load Sample CSV Data</span>
                </button>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={12}
                placeholder="Paste CSV rows (e.g. Project, Role, Description, Tech Stack, Metrics) or unstructured text here..."
                className="w-full p-4 rounded-xl border border-[#222938] bg-[#0c0e12] text-slate-100 text-xs font-mono leading-relaxed outline-none focus:border-[#1DCD9F]"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400">
                  {rawText.length} characters loaded in buffer
                </div>
                <button
                  type="button"
                  onClick={() => handleParseText()}
                  disabled={!rawText.trim() || parsing}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1DCD9F] hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-md transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{parsing ? 'Ingesting Data...' : 'Ingest into Knowledge Base'}</span>
                </button>
              </div>

              {parseSuccess && (
                <div className="p-3 bg-[#1DCD9F]/10 border border-[#1DCD9F]/40 rounded-xl text-[#1DCD9F] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1DCD9F]" />
                    <span>Successfully ingested records into Dr Lilia Potseluyko's knowledge base!</span>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('structured')}
                    className="font-bold underline text-xs"
                  >
                    View Extracted Records →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Extracted Structured View */}
      {activeSubTab === 'structured' && (
        <div className="space-y-6">
          {/* Candidate Profile Summary */}
          <div className="bg-[#131722] p-6 rounded-2xl border border-[#222938] shadow-md space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#1DCD9F]" />
              <span>Knowledge Base Subject Identity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={portfolioData.developerName || 'Dr Lilia Potseluyko'}
                  onChange={(e) =>
                    onUpdatePortfolioData({ ...portfolioData, developerName: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#222938] bg-[#0c0e12] text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Professional Title</label>
                <input
                  type="text"
                  value={portfolioData.title || ''}
                  onChange={(e) =>
                    onUpdatePortfolioData({ ...portfolioData, title: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#222938] bg-[#0c0e12] text-white font-bold"
                />
              </div>
            </div>
          </div>

          {/* Extracted Project Evidence Items */}
          <div className="bg-[#131722] p-6 rounded-2xl border border-[#222938] shadow-md space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#1DCD9F]" />
              <span>Ingested Projects & Research Evidence ({portfolioData.projects?.length || 0})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolioData.projects?.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl border border-[#222938] bg-[#0c0e12] space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#ff2a85] uppercase tracking-wider">
                        {proj.role}
                      </span>
                      <h4 className="text-sm font-extrabold text-white">
                        {proj.title}
                      </h4>
                    </div>
                    <button
                      onClick={() => onOpenProject(proj)}
                      className="text-xs font-bold text-[#1DCD9F] hover:underline"
                    >
                      View Details →
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.techStack?.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#131722] text-[#1DCD9F] border border-[#1DCD9F]/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
