import React from 'react';
import { X, ShieldCheck, AlertTriangle, HelpCircle, FileText, Bot, Sparkles } from 'lucide-react';
import { useAppStore } from '../lib/store';

export const ClaimModal: React.FC = () => {
  const { selectedClaim, setSelectedClaim } = useAppStore();

  if (!selectedClaim) return null;

  const isVerified = selectedClaim.status === 'verified';
  const isInferred = selectedClaim.status === 'inferred';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-black/10 rounded-[28px] max-w-lg w-full p-7 shadow-[0_24px_60px_-15px_rgba(35,36,39,0.2),0_1px_0_rgba(255,255,255,0.9)_inset] relative text-[#232427]">
        <button
          onClick={() => setSelectedClaim(null)}
          className="absolute top-5 right-5 text-[#55575c] hover:text-[#232427] p-2 rounded-full hover:bg-black/5 transition cursor-pointer"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          {isVerified && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
            </div>
          )}
          {isInferred && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 shadow-sm">
              <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
            </div>
          )}
          {!isVerified && !isInferred && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-[#E34A32] shadow-sm">
              <HelpCircle className="w-5 h-5" strokeWidth={1.5} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg capitalize text-[#232427]">
                {selectedClaim.status} Claim Audit
              </h3>
              <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20">
                Audited
              </span>
            </div>
            <p className="text-xs text-[#55575c] mt-0.5">Dual-Evaluated: NVIDIA NIM (Nemotron-3) + Groq 70B</p>
          </div>
        </div>

        {/* Claim Text */}
        <div className="p-4 rounded-2xl bg-[#F4F5F5] border border-black/5 mb-5 shadow-inner">
          <p className="text-[10px] font-mono font-semibold text-[#55575c] uppercase tracking-wider mb-1.5">
            Claim Statement
          </p>
          <p className="text-sm text-[#232427] font-medium leading-relaxed">{selectedClaim.text}</p>
        </div>

        {/* Verifier Reasoning */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2E3034] uppercase tracking-wider mb-2">
            <Bot className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
            <span>Independent Verifier Assessment</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-black/10 text-xs text-[#55575c] leading-relaxed shadow-sm">
            {selectedClaim.explanation || (
              isVerified
                ? "Directly matches statements in cited source chunks with high semantic fidelity."
                : isInferred
                ? "Synthesized architectural or delivery inference (deduced from context, not verbatim)."
                : "No supporting source chunk found in ingested documents. Flagged under Cite-or-Abstain contract."
            )}
          </div>
        </div>

        {/* Citations & Evidence */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-[#2E3034] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
              Cited Source Evidence
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-black/5 text-[#55575c]">
              {selectedClaim.citations.length} Citation(s)
            </span>
          </div>
          {selectedClaim.citations.length > 0 ? (
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {selectedClaim.citations.map((cid, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#F4F5F5] border border-black/5 text-xs text-[#232427]">
                  <span className="text-[10px] font-mono text-[#E34A32] font-semibold block mb-0.5">CHUNK_ID: {cid}</span>
                  <span className="italic text-[#55575c]">"Referenced in ingested business transformation document"</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#E34A32] italic">
              No citations attached. GroundWork contract prohibits committing without human verification.
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-black/10 flex items-center justify-between">
          <div className="text-[11px] text-[#55575c] font-mono">
            Confidence: <span className="font-bold text-[#232427]">{Math.round(selectedClaim.confidence * 100)}%</span>
          </div>
          <button
            onClick={() => setSelectedClaim(null)}
            className="px-5 py-2 rounded-full bg-[#232427] hover:bg-[#171719] text-white text-xs font-semibold tracking-tight transition cursor-pointer shadow-sm"
          >
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  );
};
