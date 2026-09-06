import React, { useState } from 'react';
import { Download, ShieldAlert, CheckCircle2, FileText, Lock, Unlock, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useAppStore } from '../lib/store';

export const ExportPanel: React.FC = () => {
  const { currentWorkspace } = useAppStore();
  const [humanConfirmed, setHumanConfirmed] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerateExport = async () => {
    if (!currentWorkspace || !humanConfirmed) return;
    try {
      setIsExporting(true);
      const res = await api.post(`/workspaces/${currentWorkspace.id}/export`, {
        human_confirmed: true,
      });
      setMarkdownContent(res.data.markdown);
      setFilename(res.data.filename);
      setHasGenerated(true);
    } catch (err: any) {
      alert(`Export error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadFile = () => {
    if (!markdownContent) return;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'Groundwork_AI_Audited_Blueprint.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentWorkspace) {
    return <div className="p-12 text-center text-[#55575c] font-mono text-xs bg-white rounded-2xl border border-black/10">Select an active workspace first.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[#232427] flex items-center gap-2 font-sans tracking-tight">
              <Download className="w-5 h-5 text-[#E34A32]" strokeWidth={1.5} />
              Audited Blueprint Export Console
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20">
              0xSECURE
            </span>
          </div>
          <p className="text-xs text-[#55575c]">
            Export production-ready architectural artifacts, Mermaid matrices, and OpenAPI specifications.
          </p>
        </div>
      </div>

      {/* Human Confirmation Gate Box */}
      <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border ${humanConfirmed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-black/5 border-black/10 text-[#55575c]'}`}>
            {humanConfirmed ? <Unlock className="w-5 h-5" strokeWidth={1.5} /> : <Lock className="w-5 h-5" strokeWidth={1.5} />}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#232427] mb-1 font-sans">
              Human-in-the-Loop Audit Protocol Gate
            </h3>
            <p className="text-xs text-[#55575c] leading-relaxed mb-4">
              The Cite-or-Abstain contract requires an operator to acknowledge that ungrounded statements have been audited before generating the verified deliverable bundle.
            </p>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={humanConfirmed}
                onChange={(e) => setHumanConfirmed(e.target.checked)}
                className="w-4 h-4 rounded text-[#E34A32] focus:ring-[#E34A32]"
              />
              <span className="text-xs font-semibold text-[#232427]">
                I verify that the ungrounded requirements have been reviewed and approved for engineering delivery.
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-black/5 flex items-center justify-between">
          <span className="text-xs text-[#55575c] font-mono">
            Status: {humanConfirmed ? 'Gate unlocked' : 'Locked (confirmation required)'}
          </span>
          <button
            onClick={handleGenerateExport}
            disabled={!humanConfirmed || isExporting}
            className="px-6 py-2.5 rounded-full bg-[#232427] hover:bg-[#171719] text-white font-semibold text-xs tracking-tight flex items-center gap-2 transition disabled:opacity-40 cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5 text-[#E34A32]" strokeWidth={1.5} />
            <span>{isExporting ? 'Packaging Blueprint...' : 'Package Verified Deliverable'}</span>
          </button>
        </div>
      </div>

      {/* Generated Deliverable Package */}
      {hasGenerated && (
        <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#232427]">{filename}</h4>
                <p className="text-[11px] text-[#55575c] font-mono">Complete Audit Bundle Ready</p>
              </div>
            </div>

            <button
              onClick={handleDownloadFile}
              className="px-5 py-2 rounded-full bg-[#E34A32] hover:bg-[#F05A3C] text-white text-xs font-semibold tracking-tight transition cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Download .MD Blueprint</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F5F5] border border-black/5 font-mono text-xs text-[#232427] max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {markdownContent}
          </div>
        </div>
      )}
    </div>
  );
};
