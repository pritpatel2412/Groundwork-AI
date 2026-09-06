import React from 'react';
import { Bot, CheckCircle2, Loader2, Sparkles, ShieldCheck, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import { useAppStore } from '../lib/store';

export const AgentTracePanel: React.FC = () => {
  const { stages, isGenerating } = useAppStore();

  return (
    <div className="bg-white/95 border border-black/10 rounded-2xl p-5 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_12px_28px_-12px_rgba(35,36,39,0.08)] flex flex-col h-full backdrop-blur-xl">
      <div className="flex items-center justify-between pb-4 border-b border-black/5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20 shadow-xs">
            <Activity className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#232427] flex items-center gap-2 tracking-tight">
              Groundwork AI Trace
              {isGenerating && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E34A32] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E34A32]"></span>
                </span>
              )}
            </h3>
            <p className="text-[10px] text-[#55575c] font-mono">Cognitive Execution Stream</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20">
          SSE • LIVE
        </span>
      </div>

      {/* Stages list */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {stages.map((stage, idx) => {
          const isDone = stage.status === 'done';
          const isRunning = stage.status === 'running';
          const isPending = stage.status === 'pending';
          const isError = stage.status === 'error';

          return (
            <div
              key={stage.id}
              className={`p-3.5 rounded-xl border transition-all duration-300 ${
                isError
                  ? 'bg-red-50/70 border-red-200 shadow-xs ring-1 ring-red-300'
                  : isRunning
                  ? 'bg-white border-[#E34A32] shadow-[0_4px_16px_rgba(227,74,50,0.12)] ring-1 ring-[#E34A32]/30'
                  : isDone
                  ? 'bg-[#F4F5F5] border-black/5 shadow-xs'
                  : 'bg-black/[0.02] border-black/5 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold ${isError ? 'text-red-600' : 'text-[#E34A32]'}`}>
                    0{idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-[#232427] tracking-tight">{stage.name}</h4>
                </div>
                <div>
                  {isError && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-300">
                      <AlertCircle className="w-2.5 h-2.5 text-red-600" strokeWidth={1.5} />
                      FAILED
                    </span>
                  )}
                  {isRunning && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-[#E34A32] bg-[#E34A32]/10 px-2 py-0.5 rounded-full border border-[#E34A32]/20">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" strokeWidth={1.5} />
                      ACTIVE
                    </span>
                  )}
                  {isDone && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={1.5} />
                      DONE
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] font-mono text-[#55575c] bg-black/5 px-2 py-0.5 rounded-full">
                      IDLE
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-[#2E3034] font-medium mb-1">{stage.label}</p>
              <p className={`text-[11px] leading-relaxed font-sans ${isError ? 'text-red-700 font-medium' : 'text-[#55575c]'}`}>
                {stage.message}
              </p>

              {/* Live badges if available */}
              {stage.claimsCount > 0 && (
                <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[10px]">
                  <span className="text-[#55575c] font-mono">Claims Grounded:</span>
                  <span className="font-mono font-semibold text-[#E34A32] bg-[#E34A32]/10 px-2.5 py-0.5 rounded-full border border-[#E34A32]/20">
                    {stage.claimsCount} claims
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Invariant Footer Badge */}
      <div className="mt-4 pt-3 border-t border-black/5 text-[11px] text-[#55575c] flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[#E34A32] font-mono text-[10px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
          CITE-OR-ABSTAIN
        </span>
        <span className="text-[10px] font-mono text-[#55575c]">NVIDIA NIM • NEMOTRON</span>
      </div>
    </div>
  );
};
