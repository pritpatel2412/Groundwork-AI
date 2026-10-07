import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, Copy, Check, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Move, Sparkles, AlertCircle } from 'lucide-react';
import { api, Claim } from '../lib/api';
import { useAppStore } from '../lib/store';
import { ClaimChip } from './ClaimChip';
import { ContradictionWarningBanner } from './ContradictionWarningBanner';
import { renderMermaidSafe, cleanMermaidDOMArtifacts, initMermaid } from '../lib/mermaidRenderer';

export const ArchitectureView: React.FC = () => {
  const { currentWorkspace } = useAppStore();
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [svgContent, setSvgContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
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

  const fetchArchitecture = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      setRenderError(null);
      const res = await api.get(`/workspaces/${currentWorkspace.id}/artifacts/architecture`);
      setArtifact(res.data);

      const fallbackDiagram = (
        "graph TD\n" +
        "    Client[Client Portal] --> Gateway[API Gateway]\n" +
        "    Gateway --> Service[Core Transformation Service]\n" +
        "    Service --> DB[(PostgreSQL + pgvector)]\n" +
        "    Service --> LLM[LLM Router]"
      );

      const diagram = res.data?.content?.diagram || fallbackDiagram;

      try {
        const svg = await renderMermaidSafe('arch-canvas', diagram, fallbackDiagram);
        setSvgContent(svg);
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        setRenderError(err?.message || 'Failed to render architecture diagram');
        cleanMermaidDOMArtifacts();
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
    // Only drag on left click (button 0)
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
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20 shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <Layers className="w-5 h-5 text-[#E34A32]" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-0.5">
              <h2 className="text-lg sm:text-xl font-bold text-[#232427] font-sans tracking-tight">
                Architecture Blueprint Matrix
              </h2>
              <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20 shrink-0">
                SYNTHESIZED
              </span>
            </div>
            <p className="text-xs text-[#55575c]">
              Interactive system topology diagram grounded in validated workflow requirements.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyCode}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-black/5 text-[#232427] border border-black/10 text-xs font-semibold tracking-tight transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0 self-start sm:self-center"
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

      {/* Rendered Mermaid Diagram with Zoom & Pan Canvas */}
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
            : 'h-[520px] sm:h-[580px] p-6 flex items-center justify-center bg-[#FAFAFB]'
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
            Rendering architectural matrix...
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
