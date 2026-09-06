import React, { useState, useEffect } from 'react';
import { Layout, CheckCircle2, ChevronRight, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { api, Claim } from '../lib/api';
import { useAppStore } from '../lib/store';
import { ClaimChip } from './ClaimChip';

export const WireframeView: React.FC = () => {
  const { currentWorkspace } = useAppStore();
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);

  const fetchWireframes = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const res = await api.get(`/workspaces/${currentWorkspace.id}/artifacts/wireframe`);
      setArtifact(res.data);
    } catch (err) {
      console.error('Error fetching wireframes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWireframes();
  }, [currentWorkspace]);

  if (!currentWorkspace) {
    return <div className="p-8 text-center text-[#55575c]">Select a workspace first.</div>;
  }

  const screens = artifact?.content?.screens || [];
  const currentScreen = screens[activeScreenIndex] || screens[0];
  const claims: Claim[] = artifact?.claims || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[#232427] flex items-center gap-2 font-sans tracking-tight">
              <Layout className="w-5 h-5 text-[#E34A32]" strokeWidth={1.5} />
              Interactive Wireframe Canvas
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20">
              SYNTHESIZED
            </span>
          </div>
          <p className="text-xs text-[#55575c]">
            Synthesized interface screens mapped directly to validated enterprise user journeys.
          </p>
        </div>

        {screens.length > 1 && (
          <div className="flex gap-1.5 bg-white border border-black/10 p-1.5 rounded-full shadow-xs">
            {screens.map((s: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveScreenIndex(idx)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold tracking-tight transition cursor-pointer ${
                  activeScreenIndex === idx
                    ? 'bg-[#232427] text-white shadow-xs'
                    : 'text-[#55575c] hover:text-[#232427]'
                }`}
              >
                {s.title || `Screen 0${idx + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Wireframe Mockup Shell */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-[#F4F5F5] border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_30px_-16px_rgba(35,36,39,0.1)]">
        {loading ? (
          <div className="p-16 text-center text-[#55575c] font-mono text-xs">
            Synthesizing high-fidelity wireframe canvas...
          </div>
        ) : !currentScreen ? (
          <div className="p-12 text-center text-xs text-[#55575c] font-mono bg-white rounded-2xl border border-black/5">
            Wireframes have not been generated yet. Navigate to Ingestion and synthesize.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-6 max-w-4xl mx-auto">
            {/* Window Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-mono text-[#55575c]">
                  https://app.enterprise-core.internal/blueprint
                </span>
              </div>
              <span className="text-xs font-semibold text-[#232427]">{currentScreen.title}</span>
            </div>

            {/* Wireframe UI Content */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#232427]">{currentScreen.title}</h3>
                  <p className="text-xs text-[#55575c] mt-0.5">{currentScreen.description}</p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] text-xs font-semibold">
                  Live Preview
                </div>
              </div>

              {/* Mockup Elements */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#F4F5F5] border border-black/5">
                  <span className="text-[10px] font-mono text-[#55575c] uppercase">Requests</span>
                  <p className="text-2xl font-bold text-[#232427] mt-1">1,248</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F4F5F5] border border-black/5">
                  <span className="text-[10px] font-mono text-[#55575c] uppercase">Auto-Approved</span>
                  <p className="text-2xl font-bold text-[#E34A32] mt-1">94.2%</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F4F5F5] border border-black/5">
                  <span className="text-[10px] font-mono text-[#55575c] uppercase">Audit Latency</span>
                  <p className="text-2xl font-bold text-[#232427] mt-1">0.8s</p>
                </div>
              </div>

              {/* Elements List */}
              {currentScreen.elements && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-mono font-semibold uppercase text-[#55575c]">
                    UI Components & Controls
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentScreen.elements.map((el: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-[#F4F5F5] text-xs flex items-center justify-between">
                        <span className="font-medium text-[#232427]">{el.name || el}</span>
                        <span className="text-[10px] font-mono text-[#55575c]">{el.type || 'component'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Wireframe Claims */}
      <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
        <h3 className="text-sm font-bold text-[#232427] mb-4 flex items-center justify-between font-sans">
          <span>Grounded Wireframe Claims</span>
          <span className="text-xs text-[#55575c] font-mono">
            {claims.length} claim{claims.length === 1 ? '' : 's'} verified
          </span>
        </h3>

        {claims.length === 0 ? (
          <p className="text-xs text-[#55575c] font-mono bg-[#F4F5F5] p-4 rounded-xl">
            Wireframe claims will be listed here after generation.
          </p>
        ) : (
          <div className="space-y-2.5">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="p-3.5 rounded-xl bg-[#F4F5F5] border border-black/5 flex items-center justify-between"
              >
                <p className="text-xs text-[#232427] font-medium">{claim.text}</p>
                <ClaimChip claim={claim} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
