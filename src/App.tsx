import React, { useState, useEffect } from 'react';
import { PortfolioData, Project } from './types';
import { defaultPortfolioData } from './data/defaultPortfolio';
import { Navbar } from './components/Navbar';
import { ChatTab } from './components/ChatTab';
import { IngestTab } from './components/IngestTab';
import { InsightsTab } from './components/InsightsTab';
import { JobMatcherTab } from './components/JobMatcherTab';
import { WidgetTab } from './components/WidgetTab';
import { ProjectModal } from './components/ProjectModal';
import { WidgetPreviewOverlay } from './components/WidgetPreviewOverlay';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'ingest' | 'insights' | 'job_matcher' | 'widget'>('chat');
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(() => {
    try {
      const saved = localStorage.getItem('portfolio_ai_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.developerName && parsed.developerName.includes("Dr Lilia")) {
          return parsed;
        }
      }
      return defaultPortfolioData;
    } catch {
      return defaultPortfolioData;
    }
  });

  const [selectedProjectForModal, setSelectedProjectForModal] = useState<Project | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isOverlayActive, setIsOverlayActive] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch {
        setServerStatus('offline');
      }
    };
    checkServer();
  }, []);

  // Sync portfolio data to localStorage
  const handleUpdatePortfolioData = (newData: PortfolioData) => {
    setPortfolioData(newData);
    try {
      localStorage.setItem('portfolio_ai_data', JSON.stringify(newData));
    } catch {
      // ignore quota errors
    }
  };

  const handleResetData = () => {
    if (confirm("Reset knowledge base back to Dr Lilia Potseluyko's default portfolio records?")) {
      setPortfolioData(defaultPortfolioData);
      localStorage.setItem('portfolio_ai_data', JSON.stringify(defaultPortfolioData));
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] text-slate-100 flex flex-col font-sans selection:bg-[#1DCD9F] selection:text-slate-950">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        portfolioData={portfolioData}
        onResetData={handleResetData}
        serverStatus={serverStatus}
      />

      {/* Main View Area */}
      <main className="flex-1 py-6 px-3 sm:px-6">
        {activeTab === 'chat' && (
          <ChatTab
            portfolioData={portfolioData}
            onOpenProject={(proj) => setSelectedProjectForModal(proj)}
          />
        )}

        {activeTab === 'ingest' && (
          <IngestTab
            portfolioData={portfolioData}
            onUpdatePortfolioData={handleUpdatePortfolioData}
            onOpenProject={(proj) => setSelectedProjectForModal(proj)}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsTab portfolioData={portfolioData} />
        )}

        {activeTab === 'job_matcher' && (
          <JobMatcherTab portfolioData={portfolioData} />
        )}

        {activeTab === 'widget' && (
          <WidgetTab
            portfolioData={portfolioData}
            onToggleLiveOverlay={() => setIsOverlayActive(!isOverlayActive)}
            isOverlayActive={isOverlayActive}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222938] bg-[#0c0e12] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Dr Lilia Potseluyko AI Portfolio Assistant • Powered by Google Cloud
          </span>
          <span className="text-[11px] font-mono text-[#1DCD9F]">
            Cambridge, UK
          </span>
        </div>
      </footer>

      {/* Project Details Modal */}
      <ProjectModal
        project={selectedProjectForModal}
        onClose={() => setSelectedProjectForModal(null)}
      />

      {/* Optional Floating Widget Live Simulator */}
      {isOverlayActive && (
        <WidgetPreviewOverlay
          portfolioData={portfolioData}
          onCloseOverlay={() => setIsOverlayActive(false)}
        />
      )}
    </div>
  );
};
