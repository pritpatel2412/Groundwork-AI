import React, { useState, useEffect } from 'react';
import { Layout } from 'lucide-react';
import { api, Claim } from '../lib/api';
import { useAppStore } from '../lib/store';
import { ClaimChip } from './ClaimChip';
import { WireframeRenderer, WireframeSpec } from './WireframeRenderer';
import { ContradictionWarningBanner } from './ContradictionWarningBanner';

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

  const screens: WireframeSpec[] = artifact?.content?.screens || [];
  const currentScreen = screens[activeScreenIndex] || screens[0];
  const claims: Claim[] = artifact?.claims || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Contradiction Warning Banner */}
      <ContradictionWarningBanner artifactName="Wireframe" />

      {/* Header & Screen Tabs */}
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
            Grounded low-fidelity interface screens mapped directly to validated enterprise requirements.
          </p>
        </div>

        {screens.length > 1 && (
          <div className="flex flex-wrap gap-1.5 bg-white border border-black/10 p-1.5 rounded-full shadow-xs">
            {screens.map((s: any, idx: number) => {
              const name = s.screen_name || s.title || `Screen 0${idx + 1}`;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveScreenIndex(idx)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold tracking-tight transition cursor-pointer ${
                    activeScreenIndex === idx
                      ? 'bg-[#232427] text-white shadow-xs'
                      : 'text-[#55575c] hover:text-[#232427]'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Wireframe Canvas Container */}
      <div className="p-4 sm:p-6 rounded-[28px] bg-[#F4F5F5] border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_30px_-16px_rgba(35,36,39,0.1)]">
        {loading ? (
          <div className="p-16 text-center text-[#55575c] font-mono text-xs">
            Synthesizing low-fidelity wireframe canvas...
          </div>
        ) : !currentScreen ? (
          <div className="p-12 text-center text-xs text-[#55575c] font-mono bg-white rounded-2xl border border-black/5">
            Wireframes have not been generated yet. Navigate to Ingestion and synthesize.
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <WireframeRenderer spec={currentScreen} claims={claims} />
          </div>
        )}
      </div>

      {/* Wireframe Claims Ledger */}
      <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
        <h3 className="text-sm font-bold text-[#232427] mb-4 flex items-center justify-between font-sans">
          <span>Grounded Wireframe Claims</span>
          <span className="text-xs text-[#55575c] font-mono">
            {claims.length} claim{claims.length === 1 ? '' : 's'} tracked
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
