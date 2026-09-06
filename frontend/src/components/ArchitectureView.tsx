import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Layers, Sparkles, CheckCircle2, Copy, Check } from 'lucide-react';
import { api, Claim } from '../lib/api';
import { useAppStore } from '../lib/store';
import { ClaimChip } from './ClaimChip';
import { ContradictionWarningBanner } from './ContradictionWarningBanner';

export const ArchitectureView: React.FC = () => {
  const { currentWorkspace } = useAppStore();
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [svgContent, setSvgContent] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      themeVariables: {
        darkMode: false,
        background: '#FFFFFF',
        primaryColor: '#F4F5F5',
        primaryTextColor: '#232427',
        primaryBorderColor: '#232427',
        lineColor: '#E34A32',
        secondaryColor: '#FFFFFF',
        tertiaryColor: '#F4F5F5',
      },
    });
  }, []);

  const fetchArchitecture = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const res = await api.get(`/workspaces/${currentWorkspace.id}/artifacts/architecture`);
      setArtifact(res.data);

      const diagram = res.data?.content?.diagram || (
        "graph TD\n" +
        "    Client[Client Portal] --> Gateway[API Gateway]\n" +
        "    Gateway --> Service[Core Transformation Service]\n" +
        "    Service --> DB[(PostgreSQL + pgvector)]\n" +
        "    Service --> LLM[LLM Router]"
      );

      try {
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, diagram);
        setSvgContent(svg);
      } catch (err) {
        console.error('Mermaid render error:', err);
      }
    } catch (err) {
      console.error('Error fetching architecture:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchitecture();
  }, [currentWorkspace]);

  const handleCopyCode = () => {
    if (!artifact?.content?.diagram) return;
    navigator.clipboard.writeText(artifact.content.diagram);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentWorkspace) {
    return <div className="p-8 text-center text-[#55575c]">Select a workspace first.</div>;
  }

  const claims: Claim[] = artifact?.claims || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ContradictionWarningBanner artifactName="Architecture" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[#232427] flex items-center gap-2 font-sans tracking-tight">
              <Layers className="w-5 h-5 text-[#E34A32]" strokeWidth={1.5} />
              Architecture Blueprint Matrix
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20">
              SYNTHESIZED
            </span>
          </div>
          <p className="text-xs text-[#55575c]">
            Interactive system topology diagram grounded in validated workflow requirements.
          </p>
        </div>

        <button
          onClick={handleCopyCode}
          className="px-4 py-2 rounded-full bg-white hover:bg-black/5 text-[#232427] border border-black/10 text-xs font-semibold tracking-tight transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
              <span>Copied Diagram</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#55575c]" strokeWidth={1.5} />
              <span>Copy Mermaid Source</span>
            </>
          )}
        </button>
      </div>

      {/* Rendered Mermaid Diagram */}
      <div className="p-8 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)] overflow-x-auto flex items-center justify-center min-h-[320px]">
        {loading ? (
          <div className="text-center text-[#55575c] font-mono text-xs">
            Rendering architectural matrix...
          </div>
        ) : svgContent ? (
          <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
          />
        ) : (
          <div className="text-center text-xs text-[#55575c] font-mono">
            No architecture diagram synthesized yet.
          </div>
        )}
      </div>

      {/* Architecture Components & Claims */}
      <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
        <h3 className="text-sm font-bold text-[#232427] mb-4 flex items-center justify-between font-sans">
          <span>Grounded Architecture Claims</span>
          <span className="text-xs text-[#55575c] font-mono">
            {claims.length} claim{claims.length === 1 ? '' : 's'} linked
          </span>
        </h3>

        {claims.length === 0 ? (
          <p className="text-xs text-[#55575c] font-mono bg-[#F4F5F5] p-4 rounded-xl">
            Architecture claims will appear once the pipeline runs.
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
