import React, { useState, useEffect } from 'react';
import { FileCheck, AlertOctagon, HelpCircle, Languages, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api, Claim, Contradiction } from '../lib/api';
import { useAppStore } from '../lib/store';
import { ClaimChip } from './ClaimChip';

export const RequirementsView: React.FC = () => {
  const { currentWorkspace } = useAppStore();
  const [requirements, setRequirements] = useState<Claim[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetLang, setTargetLang] = useState('hi-IN');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedMap, setTranslatedMap] = useState<Record<string, string>>({});

  const fetchData = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const [reqRes, contRes] = await Promise.all([
        api.get<Claim[]>(`/workspaces/${currentWorkspace.id}/requirements`),
        api.get<Contradiction[]>(`/workspaces/${currentWorkspace.id}/contradictions`),
      ]);
      setRequirements(reqRes.data);
      setContradictions(contRes.data);
    } catch (err) {
      console.error('Error loading requirements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentWorkspace]);

  const handleTranslateAll = async () => {
    if (!currentWorkspace || requirements.length === 0) return;
    try {
      setIsTranslating(true);
      const newTranslations: Record<string, string> = {};
      for (const req of requirements.slice(0, 5)) {
        const res = await api.post(`/workspaces/${currentWorkspace.id}/translate`, {
          text: req.text,
          target_language_code: targetLang,
        });
        newTranslations[req.id] = res.data.translated_text;
      }
      setTranslatedMap(newTranslations);
    } catch (err) {
      console.error('Sarvam translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  if (!currentWorkspace) {
    return <div className="p-8 text-center text-[#55575c]">Select a workspace first.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Multilingual Translation Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[#232427] flex items-center gap-2 font-sans tracking-tight">
              <FileCheck className="w-5 h-5 text-[#E34A32]" strokeWidth={1.5} />
              Requirements & Grounding Ledger
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20">
              AUDITED
            </span>
          </div>
          <p className="text-xs text-[#55575c]">
            Every requirement is anchored to verified chunk citations or explicitly flagged.
          </p>
        </div>

        {/* Sarvam Translation Bar */}
        <div className="flex items-center gap-2 bg-white border border-black/10 p-1.5 rounded-full text-xs shadow-sm">
          <Languages className="w-4 h-4 text-[#E34A32] ml-2" strokeWidth={1.5} />
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-[#F4F5F5] border border-black/5 text-[#232427] rounded-full px-3 py-1 text-xs focus:outline-none focus:border-[#E34A32] font-mono"
          >
            <option value="hi-IN">Hindi (हिंदी)</option>
            <option value="gu-IN">Gujarati (ગુજરાતી)</option>
            <option value="mr-IN">Marathi (मराठी)</option>
            <option value="ta-IN">Tamil (தமிழ்)</option>
            <option value="bn-IN">Bengali (বাংলা)</option>
          </select>
          <button
            onClick={handleTranslateAll}
            disabled={isTranslating}
            className="px-3.5 py-1 rounded-full bg-[#232427] hover:bg-[#171719] text-white font-mono text-[11px] font-semibold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3 h-3 text-[#E34A32] ${isTranslating ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            <span>{isTranslating ? 'Translating...' : 'Mayura Translate'}</span>
          </button>
        </div>
      </div>

      {/* Contradictions Alert Section */}
      {contradictions.length > 0 && (
        <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-[#E34A32] font-bold text-sm mb-2">
            <ShieldAlert className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
            <span>Contradictions Detected by Verifier Agent ({contradictions.length})</span>
          </div>
          <p className="text-xs text-[#55575c] mb-3 leading-relaxed">
            NVIDIA NIM identified conflicting business logic in ingested source documents. Review conflicting statements below:
          </p>
          <div className="space-y-2">
            {contradictions.map((c, i) => (
              <div key={c.id || i} className="p-3.5 rounded-xl bg-white border border-red-200/60 text-xs">
                <div className="flex items-center justify-between font-mono text-[11px] text-[#E34A32] font-semibold mb-1">
                  <span>DISCREPANCY #{i + 1}</span>
                  <span>CHUNKS: {c.source_chunk_ids?.join(', ') || 'N/A'}</span>
                </div>
                <p className="text-xs text-[#232427] mt-1 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements List */}
      <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-[#232427] flex items-center gap-2 font-sans">
            Verified Requirements Ledger
          </h3>
          <span className="text-xs text-[#55575c] font-mono">
            {requirements.length} item{requirements.length === 1 ? '' : 's'} committed
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#55575c] font-mono text-xs">
            Loading requirements matrix...
          </div>
        ) : requirements.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#55575c] font-mono bg-[#F4F5F5] rounded-xl">
            No requirements generated yet. Navigate to Ingestion Console to synthesize.
          </div>
        ) : (
          <div className="space-y-3">
            {requirements.map((req, idx) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-[#F4F5F5] border border-black/5 hover:border-black/15 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#E34A32]">
                      REQ-0{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white text-[#55575c] border border-black/5">
                      {req.citations.length > 0 ? `${req.citations.length} Citations` : 'Direct Rule'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#232427] leading-relaxed mb-1">
                    {req.text}
                  </p>
                  {translatedMap[req.id] && (
                    <p className="text-xs text-[#E34A32] font-medium bg-white/70 p-2 rounded-lg border border-black/5 mt-1.5">
                      <span className="font-mono text-[10px] uppercase text-[#55575c] mr-1">[MAYURA]:</span>
                      {translatedMap[req.id]}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <ClaimChip claim={req} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
