import React, { useState } from 'react';
import {
  ShieldCheck,
  FolderKanban,
  UploadCloud,
  FileCheck,
  Layers,
  Layout,
  Database,
  Calendar,
  Sparkles,
  Download,
  Cpu,
  Activity,
  ArrowLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from './lib/store';
import { SprintForgeLanding } from './components/SprintForgeLanding';
import { WorkspaceHome } from './components/WorkspaceHome';
import { IngestionPanel } from './components/IngestionPanel';
import { RequirementsView } from './components/RequirementsView';
import { ArchitectureView } from './components/ArchitectureView';
import { WireframeView } from './components/WireframeView';
import { DataView } from './components/DataView';
import { RoadmapView } from './components/RoadmapView';
import { VerifierSummary } from './components/VerifierSummary';
import { ExportPanel } from './components/ExportPanel';
import { AgentTracePanel } from './components/AgentTracePanel';
import { ClaimModal } from './components/ClaimModal';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'copilot'>('landing');
  const { currentWorkspace, activeTab, setActiveTab, isGenerating } = useAppStore();
  const [showTracePanel, setShowTracePanel] = useState(true);

  const navItems = [
    { id: 'home', label: 'Workspaces', icon: FolderKanban },
    { id: 'ingestion', label: 'Neural Ingestion', icon: UploadCloud },
    { id: 'requirements', label: 'Requirements Ledger', icon: FileCheck },
    { id: 'architecture', label: 'Architecture Matrix', icon: Layers },
    { id: 'wireframes', label: 'Wireframe Canvas', icon: Layout },
    { id: 'data', label: 'Data & Schema', icon: Database },
    { id: 'roadmap', label: 'Roadmap & Forecast', icon: Calendar },
    { id: 'verifier', label: 'Verifier Ledger', icon: ShieldCheck },
    { id: 'export', label: 'Verified Export', icon: Download },
  ] as const;

  // View 1: High-Fidelity SprintForge Landing Page
  if (viewMode === 'landing') {
    return <SprintForgeLanding onOpenCopilot={() => setViewMode('copilot')} />;
  }

  // View 2: Groundwork AI Transformation Copilot Workspace
  return (
    <div className="min-h-screen flex flex-col bg-[#ECEDEE] text-[#232427] relative selection:bg-[#E34A32]/20 selection:text-[#E34A32]">
      {/* Top Application Header styled to Groundwork AI aesthetics */}
      <header className="border-b border-black/10 bg-[#F4F5F5]/90 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('landing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#232427] border border-black/10 text-xs font-semibold tracking-tight transition cursor-pointer shadow-sm hover:shadow"
            title="Return to Groundwork AI Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#E34A32]" strokeWidth={1.5} />
            <span>Groundwork AI Landing</span>
          </button>

          <div className="h-4 w-px bg-black/15 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="relative flex items-center h-5 w-7">
              <span className="w-3.5 h-3.5 rounded-full bg-[#232427] block shadow-xs" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#E34A32] block -ml-1.5 shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-[#232427] flex items-center gap-1.5 font-sans">
                  Groundwork <span className="font-serif-accent italic font-normal text-base text-[#E34A32]">Copilot</span>
                </h1>
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/25">
                  DUAL-VERIFIED
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#55575c]">
                COGNITIVE ARCHITECTURE ENGINE • CITE-OR-ABSTAIN LEDGER
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Workspace Indicator & Trace Toggle */}
        <div className="flex items-center gap-3">
          {currentWorkspace ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/10 text-xs shadow-sm">
              <span className="text-[#55575c] font-mono text-[10px]">WORKSPACE:</span>
              <span className="font-semibold text-[#232427] truncate max-w-[200px]">{currentWorkspace.name}</span>
            </div>
          ) : (
            <span className="text-xs text-[#55575c] font-mono italic hidden sm:inline">[NO WORKSPACE SELECTED]</span>
          )}

          <button
            onClick={() => setShowTracePanel(!showTracePanel)}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              showTracePanel
                ? 'bg-[#232427] text-white border-[#232427] shadow-sm'
                : 'bg-white/80 border-black/10 text-[#55575c] hover:text-[#232427]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#E34A32]" strokeWidth={1.5} />
            <span>AGENT TRACE</span>
            {isGenerating ? (
              <span className="w-2 h-2 rounded-full bg-[#E34A32] animate-ping" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar Navigation */}
      <div className="flex-1 flex overflow-hidden relative z-10 max-w-[1440px] mx-auto w-full px-2 sm:px-4 py-4">
        {/* Navigation Sidebar */}
        <aside className="w-64 rounded-[28px] border border-black/10 bg-white/90 backdrop-blur-xl p-4 flex flex-col justify-between shrink-0 mr-4 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_12px_28px_-12px_rgba(35,36,39,0.08)]">
          <nav className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#55575c] mb-1">
              Transformation Pipeline
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isVerifierTab = item.id === 'verifier';

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#232427] text-white font-semibold shadow-sm'
                      : 'text-[#55575c] hover:text-[#232427] hover:bg-black/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#E34A32]' : 'text-[#55575c]'}`} strokeWidth={1.5} />
                  <span className="tracking-tight">{item.label}</span>
                  {isVerifierTab && (
                    <span className={`ml-auto text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-[#E34A32]/20 text-[#E34A32]' : 'bg-black/5 text-[#55575c]'
                    }`}>
                      GATE
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Model Family Badge */}
          <div className="p-3.5 rounded-2xl bg-[#F4F5F5] border border-black/5 text-[10px] text-[#55575c] space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between text-[#232427] font-semibold font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-[#E34A32]" strokeWidth={1.5} />
                NEURAL ENGINES
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E34A32] animate-pulse" />
            </div>
            <div className="text-[10px] text-[#55575c] flex items-center justify-between">
              <span>Primary LLM:</span>
              <span className="font-mono text-[#232427] font-semibold">Groq 70B</span>
            </div>
            <div className="text-[10px] text-[#55575c] flex items-center justify-between">
              <span>Independent Verifier:</span>
              <span className="font-mono text-[#E34A32] font-semibold">NVIDIA NIM</span>
            </div>
            <div className="text-[10px] text-[#55575c] flex items-center justify-between">
              <span>Acoustic STT:</span>
              <span className="font-mono text-[#232427] font-semibold">Sarvam Saaras</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 rounded-[28px] border border-black/10 bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_36px_-16px_rgba(35,36,39,0.08)]">
          {activeTab === 'home' && <WorkspaceHome />}
          {activeTab === 'ingestion' && <IngestionPanel />}
          {activeTab === 'requirements' && <RequirementsView />}
          {activeTab === 'architecture' && <ArchitectureView />}
          {activeTab === 'wireframes' && <WireframeView />}
          {activeTab === 'data' && <DataView />}
          {activeTab === 'roadmap' && <RoadmapView />}
          {activeTab === 'verifier' && <VerifierSummary />}
          {activeTab === 'export' && <ExportPanel />}
        </main>

        {/* Persistent Agent Trace Side Panel */}
        {showTracePanel && (
          <aside className="w-80 rounded-[28px] border border-black/10 p-4 shrink-0 hidden lg:block overflow-y-auto bg-white/90 backdrop-blur-md ml-4 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_12px_28px_-12px_rgba(35,36,39,0.08)]">
            <AgentTracePanel />
          </aside>
        )}
      </div>

      {/* Global Claim Modal for Cite-or-Abstain Inspection */}
      <ClaimModal />
    </div>
  );
}
