import React, { useState, useEffect, useRef } from 'react';
import { Database, Server, CheckCircle2, Code2, Copy, Check, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Move, AlertCircle } from 'lucide-react';
import { api, Claim } from '../lib/api';
import { useAppStore } from '../lib/store';
import { ClaimChip } from './ClaimChip';
import { ContradictionWarningBanner } from './ContradictionWarningBanner';
import { renderMermaidSafe, cleanMermaidDOMArtifacts, initMermaid } from '../lib/mermaidRenderer';

export const DataView: React.FC = () => {
  const { currentWorkspace } = useAppStore();
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);

  // Interactive Zoom & Pan states
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initMermaid();
    cleanMermaidDOMArtifacts();
    return () => {
      cleanMermaidDOMArtifacts();
    };
  }, []);

  const fetchDataArtifact = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      setRenderError(null);
      const res = await api.get(`/workspaces/${currentWorkspace.id}/artifacts/erd`);
      setArtifact(res.data);

      const fallbackErd = (
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

      const erdDiagram = res.data?.content?.erd_mermaid || fallbackErd;

      try {
        const svg = await renderMermaidSafe('erd-canvas', erdDiagram, fallbackErd);
        setSvgContent(svg);
      } catch (err: any) {
        console.error('Mermaid ERD render error:', err);
        setRenderError(err?.message || 'Failed to render entity relationship diagram');
        cleanMermaidDOMArtifacts();
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

  // Non-passive wheel event listener for smooth zoom without page scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
      setZoom((prev) => {
        const next = Math.min(4.0, Math.max(0.25, Number((prev * zoomFactor).toFixed(2))));
        return next;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const handleZoomIn = () => {
    setZoom((z) => Math.min(4.0, Number((z + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0.25, Number((z - 0.25).toFixed(2))));
  };

  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20 shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <Database className="w-5 h-5 text-[#E34A32]" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-0.5">
              <h2 className="text-lg sm:text-xl font-bold text-[#232427] font-sans tracking-tight">
                Data Model & API Schema
              </h2>
              <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20 shrink-0">
                SYNTHESIZED
              </span>
            </div>
            <p className="text-xs text-[#55575c]">
              Relational entity diagrams and OpenAPI contract endpoints grounded in verified business logic.
            </p>
          </div>
        </div>
      </div>

      {/* ERD Diagram Visualizer with Zoom & Pan */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleReset}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        className={`relative overflow-hidden rounded-2xl border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)] select-none blueprint-grid transition-all duration-200 ${
          isFullscreen
            ? 'fixed inset-4 z-50 rounded-3xl bg-white shadow-2xl flex flex-col p-6'
            : 'h-[480px] sm:h-[540px] p-6 flex items-center justify-center bg-[#FAFAFB]'
        }`}
      >
        {/* Floating Zoom & Pan Controls Toolbar */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-black/10 shadow-lg select-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            className="p-2 rounded-xl text-[#232427] hover:bg-black/5 hover:text-[#E34A32] active:scale-95 transition cursor-pointer"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="px-2 py-1 rounded-lg text-xs font-mono font-semibold text-[#232427] hover:bg-black/5 transition cursor-pointer"
            title="Click to reset zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            className="p-2 rounded-xl text-[#232427] hover:bg-black/5 hover:text-[#E34A32] active:scale-95 transition cursor-pointer"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" strokeWidth={1.75} />
          </button>

          <div className="h-4 w-px bg-black/10 mx-0.5" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="p-2 rounded-xl text-[#55575c] hover:bg-black/5 hover:text-[#232427] active:scale-95 transition cursor-pointer"
            title="Reset Position & Zoom"
            aria-label="Reset View"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(!isFullscreen);
            }}
            className="p-2 rounded-xl text-[#55575c] hover:bg-black/5 hover:text-[#232427] active:scale-95 transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-[#E34A32]" strokeWidth={1.75} />
            ) : (
              <Maximize2 className="w-4 h-4" strokeWidth={1.75} />
            )}
          </button>
        </div>

        {/* Micro-hint bottom badge */}
        <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/10 text-[11px] font-mono text-[#55575c] shadow-xs pointer-events-none select-none">
          <Move className="w-3 h-3 text-[#E34A32]" />
          <span>Drag canvas to pan • Scroll or buttons to zoom • Double-click to reset</span>
        </div>

        {/* Diagram Canvas */}
        {loading ? (
          <div className="text-center text-[#55575c] font-mono text-xs">
            Compiling Entity Relationship Diagram...
          </div>
        ) : svgContent ? (
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.12s ease-out',
            }}
            className="w-full h-full flex items-center justify-center pointer-events-none"
          >
            <div
              dangerouslySetInnerHTML={{ __html: svgContent }}
              className="flex items-center justify-center [&_svg]:max-w-none [&_svg]:h-auto [&_svg]:drop-shadow-sm"
            />
          </div>
        ) : (
          <div className="text-center text-xs text-[#55575c] font-mono">
            No ERD diagram generated yet.
          </div>
        )}
      </div>

      {/* API Endpoints & Entities Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
            <div className="space-y-3">
              {endpoints.map((ep: any, idx: number) => {
                const methodUpper = (ep.method || 'GET').toUpperCase();
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F8F9FA] border border-black/5 hover:border-black/15 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${
                          methodUpper === 'GET'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : methodUpper === 'POST'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : methodUpper === 'PUT' || methodUpper === 'PATCH'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          {methodUpper}
                        </span>
                        <span className="text-xs font-mono font-semibold text-[#232427] truncate select-all" title={ep.path}>
                          {ep.path}
                        </span>
                      </div>
                    </div>
                    {ep.summary && (
                      <p className="text-[11px] text-[#55575c] leading-relaxed break-words pl-0.5">
                        {ep.summary}
                      </p>
                    )}
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
            <div className="space-y-3">
              {entities.map((ent: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#F8F9FA] border border-black/5 hover:border-black/15 transition space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#232427] font-mono tracking-tight truncate">{ent.name}</h4>
                    <span className="text-[10px] text-[#55575c] font-mono bg-white px-2 py-0.5 rounded-full border border-black/5 shrink-0">
                      {ent.fields?.length || 0} fields
                    </span>
                  </div>
                  <p className="text-[11px] text-[#55575c] leading-relaxed break-words">{ent.description}</p>
                  {ent.fields && ent.fields.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {ent.fields.slice(0, 5).map((f: any, fIdx: number) => {
                        const fieldName = typeof f === 'string' ? f : (f.name || f.field_name || `field_${fIdx}`);
                        return (
                          <span key={fIdx} className="text-[9px] font-mono text-[#55575c] bg-white border border-black/5 px-1.5 py-0.5 rounded">
                            {fieldName}
                          </span>
                        );
                      })}
                      {ent.fields.length > 5 && (
                        <span className="text-[9px] font-mono text-[#55575c] px-1 py-0.5">
                          +{ent.fields.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
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
