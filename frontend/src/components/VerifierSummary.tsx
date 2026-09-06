import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle, Bot, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { api, ClaimsSummary, Claim } from '../lib/api';
import { useAppStore } from '../lib/store';
import { ClaimChip } from './ClaimChip';

export const VerifierSummary: React.FC = () => {
  const { currentWorkspace } = useAppStore();
  const [summary, setSummary] = useState<ClaimsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'inferred' | 'contested' | 'unsupported'>('all');

  const fetchSummary = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const res = await api.get<ClaimsSummary>(`/workspaces/${currentWorkspace.id}/claims/summary`);
      setSummary(res.data);
    } catch (err) {
      console.error('Error fetching claims summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [currentWorkspace]);

  if (!currentWorkspace) {
    return <div className="p-12 text-center text-[#55575c] font-mono text-xs bg-white rounded-2xl border border-black/10">Select an active workspace first.</div>;
  }

  const claims = summary?.claims || [];
  const filteredClaims = filter === 'all' ? claims : claims.filter((c) => c.status === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[#232427] flex items-center gap-2 font-sans tracking-tight">
              <ShieldCheck className="w-5 h-5 text-[#E34A32]" strokeWidth={1.5} />
              Independent Verifier Ledger & Truth Gauge
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20">
              DUAL-MODEL CONSENSUS
            </span>
          </div>
          <p className="text-xs text-[#55575c]">
            Adversarial consensus verification executed independently across two NVIDIA NIM model families (Nemotron & Llama).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white border border-black/10 px-3.5 py-2 rounded-full shadow-xs">
          <Bot className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
          <span className="text-[#232427] font-mono text-[11px] font-semibold">NVIDIA NIM: Nemotron + Llama</span>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-[#55575c] font-mono text-xs">Auditing claims ledger...</div>
      ) : !summary ? (
        <div className="p-12 text-center text-xs text-[#55575c] font-mono bg-white rounded-2xl border border-black/10">
          No verification summary available yet.
        </div>
      ) : (
        <>
          {/* Truth Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs">
              <span className="text-[10px] font-mono text-[#55575c] uppercase">Grounding Ratio</span>
              <p className="text-2xl font-bold text-[#232427] mt-1">
                {Math.round((summary.verified_count / (summary.total_claims || 1)) * 100)}%
              </p>
              <div className="w-full bg-[#F4F5F5] h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-[#E34A32] h-full rounded-full"
                  style={{ width: `${(summary.verified_count / (summary.total_claims || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs">
              <span className="text-[10px] font-mono text-emerald-800 uppercase">Verified Claims</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{summary.verified_count}</p>
              <p className="text-[11px] text-[#55575c] mt-1">Both models agree verified</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs">
              <span className="text-[10px] font-mono text-amber-800 uppercase">Inferred Logic</span>
              <p className="text-2xl font-bold text-amber-700 mt-1">{summary.inferred_count}</p>
              <p className="text-[11px] text-[#55575c] mt-1">Calibrated cosine similarity</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-purple-200 bg-purple-50/20 shadow-xs">
              <span className="text-[10px] font-mono text-purple-800 uppercase">Contested Claims</span>
              <p className="text-2xl font-bold text-purple-700 mt-1">{summary.contested_count || 0}</p>
              <p className="text-[11px] text-[#55575c] mt-1">Model disagreement</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs">
              <span className="text-[10px] font-mono text-[#E34A32] uppercase">Ungrounded Claims</span>
              <p className="text-2xl font-bold text-[#E34A32] mt-1">{summary.unsupported_count}</p>
              <p className="text-[11px] text-[#55575c] mt-1">Blocked under Cite-or-Abstain</p>
            </div>
          </div>

          {/* Claims List with Filter Tabs */}
          <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-sm font-bold text-[#232427] font-sans">
                Comprehensive Verifier Ledger
              </h3>

              <div className="flex items-center gap-1.5 bg-[#F4F5F5] border border-black/5 p-1 rounded-full text-xs">
                {(['all', 'verified', 'inferred', 'contested', 'unsupported'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilter(mode)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition cursor-pointer ${
                      filter === mode
                        ? 'bg-[#232427] text-white shadow-xs'
                        : 'text-[#55575c] hover:text-[#232427]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-4 rounded-xl bg-[#F4F5F5] border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-black/15 transition"
                >
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#232427] leading-relaxed mb-1">
                      {claim.text}
                    </p>
                    {claim.explanation && (
                      <p className="text-[11px] text-[#55575c] italic">
                        Verifier: "{claim.explanation}"
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <ClaimChip claim={claim} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
