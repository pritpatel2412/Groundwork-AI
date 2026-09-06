import React, { useState, useEffect } from 'react';
import { Plus, ArrowRight, FolderKanban, Sparkles, AlertCircle, FileCheck, Layers, CheckCircle2, Zap } from 'lucide-react';
import { api, Workspace } from '../lib/api';
import { useAppStore } from '../lib/store';

export const WorkspaceHome: React.FC = () => {
  const { currentWorkspace, setCurrentWorkspace, workspaces, setWorkspaces, setActiveTab } = useAppStore();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const res = await api.get<Workspace[]>('/workspaces');
      setWorkspaces(res.data);
      if (!currentWorkspace && res.data.length > 0) {
        setCurrentWorkspace(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      setIsCreating(true);
      const res = await api.post<Workspace>('/workspaces', { name: newWorkspaceName.trim() });
      setWorkspaces([res.data, ...workspaces]);
      setCurrentWorkspace(res.data);
      setNewWorkspaceName('');
      setActiveTab('ingestion');
    } catch (err) {
      console.error('Error creating workspace:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectWorkspace = (ws: Workspace) => {
    setCurrentWorkspace(ws);
    setActiveTab('requirements');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* SprintForge Hero Banner */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#F4F5F5] border border-black/5 p-8 sm:p-10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_40px_-20px_rgba(35,36,39,0.08)]">
        {/* Subtle Brand Atmosphere Gradients */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,_rgba(227,74,50,0.18)_0%,_transparent_70%)] pointer-events-none blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-[radial-gradient(circle,_rgba(240,90,60,0.12)_0%,_transparent_70%)] pointer-events-none blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-black/5 text-xs font-semibold text-[#2E3034] mb-5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#E34A32] animate-pulse" />
            <span>Groundwork AI Cognitive Engine</span>
            <span className="text-black/20 font-mono text-[10px]">•</span>
            <span className="text-[#E34A32] font-semibold">Dual-Model Verification</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#232427] tracking-tight leading-[1.08] mb-4 font-sans">
            Speak Naturally. Across Domains.{' '}
            <span className="font-serif-accent italic font-normal text-[#E34A32] block sm:inline">
              Limitless Reach.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#55575c] leading-relaxed mb-8 max-w-xl font-sans">
            Synthesize unstructured enterprise input (SOP PDFs, Sarvam voice-note transcripts, scanned documents, and raw chat) into an audited blueprint—where every claim is cited and verified.
          </p>

          <form onSubmit={handleCreateWorkspace} className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <input
              type="text"
              placeholder="e.g. Global Supply Chain Logistics Automation"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-full bg-white border border-black/10 text-sm text-[#232427] placeholder-[#55575c]/60 focus:outline-none focus:border-[#E34A32] focus:ring-2 focus:ring-[#E34A32]/20 transition shadow-sm font-sans"
            />
            <button
              type="submit"
              disabled={isCreating || !newWorkspaceName.trim()}
              className="px-6 py-3 rounded-full bg-[#232427] hover:bg-[#171719] text-white font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
              <span>Initialize Workspace</span>
            </button>
          </form>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mt-8 pt-6 border-t border-black/5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-black/5 text-[11px] font-medium text-[#55575c] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E34A32]" />
              <span>01 Fluid Ingestion</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-black/5 text-[11px] font-medium text-[#55575c] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#232427]" />
              <span>02 Dual-Model Verification</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-black/5 text-[11px] font-medium text-[#55575c] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F05A3C]" />
              <span>03 Production Mermaid Matrix</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace List Section */}
      <div>
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white border border-black/10 shadow-xs">
              <FolderKanban className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-[#232427] tracking-tight font-sans">
              Transformation Workspaces
            </h3>
          </div>
          <span className="text-xs font-mono text-[#55575c] px-3 py-1 rounded-full bg-black/5">
            {workspaces.length} active
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#55575c] font-mono text-xs">
            Polling cognitive ledger...
          </div>
        ) : workspaces.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-black/15 bg-white/50">
            <AlertCircle className="w-8 h-8 text-[#E34A32] mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-[#232427] mb-1">No active workspaces located.</p>
            <p className="text-xs text-[#55575c]">Initialize a workspace above to begin the transformation sprint.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workspaces.map((ws, idx) => {
              const isSelected = currentWorkspace?.id === ws.id;
              const isNormal = ws.name.includes("Normal Case");
              const isDiff = ws.name.includes("Difficult Case");
              const isEdge = ws.name.includes("Edge Case");

              // Subtle rotation quirk: rotate-[-0.5deg] or rotate-[0.5deg]
              const tiltClass = idx % 2 === 0 ? 'hover:rotate-[-0.5deg]' : 'hover:rotate-[0.5deg]';

              return (
                <div
                  key={ws.id}
                  onClick={() => handleSelectWorkspace(ws)}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${tiltClass} ${
                    isSelected
                      ? 'bg-white border-[#E34A32] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_32px_-12px_rgba(227,74,50,0.18)] ring-2 ring-[#E34A32]/20'
                      : 'bg-white border-black/10 hover:border-black/20 hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.1)]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {isDiff ? (
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-50 text-[#E34A32] border border-red-200">
                            Contradiction Test
                          </span>
                        ) : isEdge ? (
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            OCR Fallback
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Verified SOP
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#E34A32] bg-[#E34A32]/10 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E34A32] animate-pulse" />
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-[#232427] group-hover:text-[#E34A32] transition mb-2 font-sans leading-snug">
                      {ws.name}
                    </h4>

                    <p className="text-xs text-[#55575c] font-mono">
                      ID: {ws.id.slice(0, 8)}...
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-xs text-[#55575c]">
                    <span className="font-semibold text-[#232427] group-hover:text-[#E34A32] transition">
                      Open Blueprint
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#E34A32] group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
