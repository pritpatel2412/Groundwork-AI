import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { api, Contradiction } from '../lib/api';
import { useAppStore } from '../lib/store';

interface ContradictionWarningBannerProps {
  artifactName?: string;
}

export const ContradictionWarningBanner: React.FC<ContradictionWarningBannerProps> = ({ artifactName }) => {
  const { currentWorkspace } = useAppStore();
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);

  useEffect(() => {
    if (!currentWorkspace) return;
    api.get<Contradiction[]>(`/workspaces/${currentWorkspace.id}/contradictions`)
      .then((res) => setContradictions(res.data || []))
      .catch((err) => console.error('Error fetching contradictions:', err));
  }, [currentWorkspace]);

  if (!contradictions || contradictions.length === 0) return null;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-red-50/90 border border-red-200 shadow-sm animate-in fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-red-100 text-[#E34A32] shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5 text-[#E34A32]" strokeWidth={1.5} />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[#E34A32]">
              Unresolved Contradictions Detected in Source Requirements ({contradictions.length})
            </h4>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-200/80 text-red-900 uppercase tracking-tight">
              Action Required
            </span>
          </div>
          <p className="text-xs text-red-900/80 leading-relaxed">
            {artifactName 
              ? `Downstream ${artifactName} designs may be affected by contradictory requirements in your source material.`
              : 'Direct conflicts were surfaced between different stakeholders or documents in your source material.'}
          </p>
          <div className="space-y-1.5 pt-1.5">
            {contradictions.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-white/90 border border-red-200/60 text-xs text-[#232427] flex items-start gap-2.5 shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#E34A32] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="flex-1">
                  <span className="font-semibold text-red-950">Conflict: </span>
                  <span className="text-[#333539]">{c.description}</span>
                  {c.source_chunk_ids && c.source_chunk_ids.length > 0 && (
                    <span className="block mt-1 font-mono text-[10px] text-[#55575c]">
                      Cited Source Chunks: {c.source_chunk_ids.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
