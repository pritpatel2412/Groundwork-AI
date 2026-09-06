import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import { Database, Server, CheckCircle2, Code2, Copy, Check } from 'lucide-react';
import { api, Claim } from '../lib/api';
import { useAppStore } from '../lib/store';
import { ClaimChip } from './ClaimChip';
import { ContradictionWarningBanner } from './ContradictionWarningBanner';

export const DataView: React.FC = () => {
  const { currentWorkspace } = useAppStore();
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [svgContent, setSvgContent] = useState<string>('');

  const fetchDataArtifact = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const res = await api.get(`/workspaces/${currentWorkspace.id}/artifacts/erd`);
      setArtifact(res.data);

      const erdDiagram = res.data?.content?.erd_mermaid || (
        "erDiagram\n" +
        "  REQUEST ||--o{ APPROVAL : tracks\n" +
        "  REQUEST {\n" +
        "    uuid id PK\n" +
        "    numeric amount\n" +
        "    string status\n" +
        "  }\n" +
        "  APPROVAL {\n" +
        "    uuid id PK\n" +
        "    string approver\n" +
        "    boolean approved\n" +
        "  }"
      );

      try {
        const id = `mermaid-erd-${Date.now()}`;
        const { svg } = await mermaid.render(id, erdDiagram);
        setSvgContent(svg);
      } catch (err) {
        console.error('Mermaid ERD render error:', err);
      }
    } catch (err) {
      console.error('Error loading data artifact:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataArtifact();
  }, [currentWorkspace]);

  if (!currentWorkspace) {
    return <div className="p-12 text-center text-[#55575c] font-mono text-xs bg-white rounded-2xl border border-black/10">Select an active workspace first.</div>;
  }

  const endpoints = artifact?.content?.endpoints || [];
  const entities = artifact?.content?.entities || [];
  const claims: Claim[] = artifact?.claims || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ContradictionWarningBanner artifactName="Data & API" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[#232427] flex items-center gap-2 font-sans tracking-tight">
              <Database className="w-5 h-5 text-[#E34A32]" strokeWidth={1.5} />
              Data Model & API Schema
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20">
              SYNTHESIZED
            </span>
          </div>
          <p className="text-xs text-[#55575c]">
            Relational entity diagrams and OpenAPI contract endpoints grounded in verified business logic.
          </p>
        </div>
      </div>

      {/* ERD Diagram Visualizer */}
      <div className="p-8 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)] overflow-x-auto flex items-center justify-center min-h-[300px]">
        {loading ? (
          <div className="text-center text-[#55575c] font-mono text-xs">
            Compiling Entity Relationship Diagram...
          </div>
        ) : svgContent ? (
          <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
          />
        ) : (
          <div className="text-center text-xs text-[#55575c] font-mono">
            No ERD diagram generated yet.
          </div>
        )}
      </div>

      {/* API Endpoints & Entities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Endpoints */}
        <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
          <h3 className="text-sm font-bold text-[#232427] mb-4 flex items-center justify-between font-sans">
            <span className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
              REST API Contract Endpoints
            </span>
            <span className="text-xs text-[#55575c] font-mono">{endpoints.length} routes</span>
          </h3>

          {endpoints.length === 0 ? (
            <p className="text-xs text-[#55575c] font-mono bg-[#F4F5F5] p-4 rounded-xl">
              Endpoints will populate once the pipeline runs.
            </p>
          ) : (
            <div className="space-y-2.5">
              {endpoints.map((ep: any, idx: number) => {
                const isGet = ep.method === 'GET';
                return (
                  <div key={idx} className="p-3 rounded-xl bg-[#F4F5F5] border border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isGet ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#232427]">{ep.path}</span>
                    </div>
                    <span className="text-[11px] text-[#55575c] truncate max-w-[150px]">{ep.summary}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Entities */}
        <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
          <h3 className="text-sm font-bold text-[#232427] mb-4 flex items-center justify-between font-sans">
            <span className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
              Domain Data Entities
            </span>
            <span className="text-xs text-[#55575c] font-mono">{entities.length} models</span>
          </h3>

          {entities.length === 0 ? (
            <p className="text-xs text-[#55575c] font-mono bg-[#F4F5F5] p-4 rounded-xl">
              Entities will populate once the pipeline runs.
            </p>
          ) : (
            <div className="space-y-2.5">
              {entities.map((ent: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-[#F4F5F5] border border-black/5">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-[#232427] font-mono">{ent.name}</h4>
                    <span className="text-[10px] text-[#55575c] font-mono">{ent.fields?.length || 0} fields</span>
                  </div>
                  <p className="text-[11px] text-[#55575c]">{ent.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Data Claims */}
      <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
        <h3 className="text-sm font-bold text-[#232427] mb-4 flex items-center justify-between font-sans">
          <span>Grounded Data Claims</span>
          <span className="text-xs text-[#55575c] font-mono">{claims.length} claims</span>
        </h3>

        {claims.length === 0 ? (
          <p className="text-xs text-[#55575c] font-mono bg-[#F4F5F5] p-4 rounded-xl">
            Data claims will be listed here after generation.
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
