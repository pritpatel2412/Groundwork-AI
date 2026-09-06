import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Target, CheckCircle2, TrendingUp, Clock, ShieldCheck } from 'lucide-react';
import { api, Claim } from '../lib/api';
import { useAppStore } from '../lib/store';
import { ClaimChip } from './ClaimChip';

export const RoadmapView: React.FC = () => {
  const { currentWorkspace } = useAppStore();
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEstimate = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const res = await api.get(`/workspaces/${currentWorkspace.id}/artifacts/estimate`);
      setArtifact(res.data);
    } catch (err) {
      console.error('Error fetching estimate:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimate();
  }, [currentWorkspace]);

  if (!currentWorkspace) {
    return <div className="p-8 text-center text-[#55575c]">Select a workspace first.</div>;
  }

  const estimate = artifact?.content?.estimate || {};
  const milestones = artifact?.content?.milestones || [];
  const claims: Claim[] = artifact?.claims || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[#232427] flex items-center gap-2 font-sans tracking-tight">
              <Calendar className="w-5 h-5 text-[#E34A32]" strokeWidth={1.5} />
              Delivery Roadmap & 3-Point Forecast
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20">
              CALIBRATED
            </span>
          </div>
          <p className="text-xs text-[#55575c]">
            Calibrated 3-point timeline ranges and budget forecasts anchored to benchmark reference cases.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-[#55575c] font-mono text-xs">
          Computing Bayesian timeline distribution...
        </div>
      ) : !artifact ? (
        <div className="p-10 text-center rounded-2xl border border-black/10 bg-white text-[#55575c] text-xs font-mono">
          Estimates have not been generated yet. Navigate to Ingestion and run "Synthesize Grounded Blueprint".
        </div>
      ) : (
        <>
          {/* 3-Point Estimate Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
              <div className="flex items-center justify-between text-[#55575c] text-xs font-mono mb-2">
                <span>OPTIMISTIC (P10)</span>
                <Clock className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
              </div>
              <p className="text-3xl font-bold text-[#232427] tracking-tight">
                {estimate.optimistic_weeks || '2.0'} <span className="text-sm font-normal text-[#55575c]">weeks</span>
              </p>
              <p className="text-xs text-[#55575c] mt-1.5">Best-case timeline with zero architectural blockers</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border-2 border-[#E34A32] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_32px_-12px_rgba(227,74,50,0.15)] relative">
              <div className="flex items-center justify-between text-[#E34A32] text-xs font-mono font-bold mb-2">
                <span>NOMINAL (P50)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32]">MOST LIKELY</span>
              </div>
              <p className="text-3xl font-bold text-[#232427] tracking-tight">
                {estimate.nominal_weeks || '3.5'} <span className="text-sm font-normal text-[#55575c]">weeks</span>
              </p>
              <p className="text-xs text-[#55575c] mt-1.5">Benchmarked against historical transformation sprint velocity</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
              <div className="flex items-center justify-between text-[#55575c] text-xs font-mono mb-2">
                <span>CONSERVATIVE (P90)</span>
                <Clock className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
              </div>
              <p className="text-3xl font-bold text-[#232427] tracking-tight">
                {estimate.conservative_weeks || '5.0'} <span className="text-sm font-normal text-[#55575c]">weeks</span>
              </p>
              <p className="text-xs text-[#55575c] mt-1.5">Safeguarded for legacy system integration delays</p>
            </div>
          </div>

          {/* Sprints / Milestones Timeline */}
          <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
            <h3 className="text-sm font-bold text-[#232427] mb-5 flex items-center justify-between font-sans">
              <span>Sprint Milestones & Execution Stages</span>
              <span className="text-xs text-[#55575c] font-mono">{milestones.length} milestones</span>
            </h3>

            <div className="space-y-3">
              {milestones.map((m: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#F4F5F5] border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-black/15 transition"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="p-2 rounded-xl bg-white border border-black/10 text-[#E34A32] font-mono text-xs font-bold shrink-0">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#232427]">{m.name || m.title}</h4>
                      <p className="text-xs text-[#55575c] mt-0.5">{m.description}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-[#232427] bg-white px-3 py-1 rounded-full border border-black/10">
                      {m.duration_days || '5'} days
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Ready
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Roadmap Claims */}
          <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
            <h3 className="text-sm font-bold text-[#232427] mb-4 flex items-center justify-between font-sans">
              <span>Grounded Estimation Claims</span>
              <span className="text-xs text-[#55575c] font-mono">{claims.length} claims</span>
            </h3>

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
          </div>
        </>
      )}
    </div>
  );
};
