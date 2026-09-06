import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Mic, Sparkles, CheckCircle2, AlertTriangle, Layers, Play, ArrowRight } from 'lucide-react';
import { api, SourceDocument } from '../lib/api';
import { useAppStore } from '../lib/store';

export const IngestionPanel: React.FC = () => {
  const { currentWorkspace, isGenerating, setIsGenerating, updateStage, resetStages, setActiveTab } = useAppStore();
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [isSubmittingText, setIsSubmittingText] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fetchSources = async () => {
    if (!currentWorkspace) return;
    try {
      const res = await api.get<SourceDocument[]>(`/workspaces/${currentWorkspace.id}/sources`);
      setSources(res.data);
    } catch (err) {
      console.error('Error fetching sources:', err);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [currentWorkspace]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentWorkspace) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      setUploadStatus(`Uploading & ingesting ${file.name}...`);
      await api.post(`/workspaces/${currentWorkspace.id}/sources/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus(`Successfully ingested ${file.name}!`);
      fetchSources();
    } catch (err: any) {
      setUploadStatus(`Upload failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim() || !currentWorkspace) return;

    try {
      setIsSubmittingText(true);
      await api.post(`/workspaces/${currentWorkspace.id}/sources/text`, {
        text: pastedText.trim(),
        filename: 'Direct Business Note',
        source_type: 'free_text',
      });
      setPastedText('');
      fetchSources();
    } catch (err: any) {
      alert(`Ingestion error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsSubmittingText(false);
    }
  };

  const handleTriggerPipeline = async () => {
    if (!currentWorkspace) return;
    setIsGenerating(true);
    resetStages();

    const eventSource = new EventSource(
      `${api.defaults.baseURL || 'http://localhost:8000'}/workspaces/${currentWorkspace.id}/generate`
    );

    eventSource.addEventListener('trace', (event) => {
      try {
        const data = JSON.parse(event.data);
        updateStage(data.stage, {
          status: data.status,
          message: data.message,
          claimsCount: data.claims_count,
          data: data.data,
        });
      } catch (err) {
        console.error('SSE trace parse error:', err);
      }
    });

    eventSource.addEventListener('complete', () => {
      setIsGenerating(false);
      eventSource.close();
      setActiveTab('requirements');
    });

    eventSource.addEventListener('error', (err) => {
      console.error('SSE stream error:', err);
      setIsGenerating(false);
      eventSource.close();
    });
  };

  if (!currentWorkspace) {
    return (
      <div className="p-12 text-center text-[#55575c] font-mono text-xs bg-white rounded-2xl border border-black/10">
        [SYS::WARN] Select or initialize an active workspace first.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[#232427] flex items-center gap-2 font-sans tracking-tight">
              <UploadCloud className="w-5 h-5 text-[#E34A32]" strokeWidth={1.5} />
              Evidence Ingestion Console
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20">
              0xVAULT
            </span>
          </div>
          <p className="text-xs text-[#55575c]">
            Active Workspace: <span className="text-[#232427] font-semibold">{currentWorkspace.name}</span>
          </p>
        </div>

        <button
          onClick={handleTriggerPipeline}
          disabled={isGenerating || sources.length === 0}
          className="px-6 py-2.5 rounded-full bg-[#232427] hover:bg-[#171719] text-white font-semibold text-xs tracking-tight flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg"
        >
          <Play className="w-3.5 h-3.5 text-[#E34A32] fill-current" strokeWidth={1.5} />
          <span>{isGenerating ? 'Synthesizing Pipeline...' : 'Synthesize Grounded Blueprint'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Upload Box */}
        <div className="p-6 rounded-2xl bg-white border border-black/10 flex flex-col justify-between shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
          <div>
            <h3 className="text-sm font-semibold text-[#232427] mb-1.5 flex items-center gap-2 font-sans">
              <FileText className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
              Upload Enterprise Files, Scans & Voice
            </h3>
            <p className="text-xs text-[#55575c] mb-4 leading-relaxed font-sans">
              Native support for SOP PDFs, DOCX, scans via OCR, and acoustic voice-notes (Sarvam Saaras STT with 22 Indic dialects).
            </p>

            <label className="border-2 border-dashed border-black/15 hover:border-[#E34A32] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-[#F4F5F5]/60 hover:bg-[#F4F5F5] transition group">
              <UploadCloud className="w-8 h-8 text-[#55575c] group-hover:text-[#E34A32] mb-2 transition" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-[#232427] group-hover:text-[#E34A32]">
                Drag and drop files or click to browse
              </span>
              <span className="text-[10px] text-[#55575c] mt-1 font-mono">
                PDF, DOCX, PNG, JPG, WAV, MP3
              </span>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading || isGenerating}
                className="hidden"
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.wav,.mp3"
              />
            </label>

            {uploadStatus && (
              <p className="mt-3 text-xs text-[#E34A32] font-mono bg-[#E34A32]/10 p-2.5 rounded-xl border border-[#E34A32]/20">
                {uploadStatus}
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-[11px] text-[#55575c] font-mono">
            <span className="flex items-center gap-1.5 text-[#E34A32]">
              <Mic className="w-3.5 h-3.5" strokeWidth={1.5} />
              Sarvam Saaras Acoustic STT
            </span>
            <span>Local BGE Embeddings</span>
          </div>
        </div>

        {/* Free Text / Transcript Box */}
        <div className="p-6 rounded-2xl bg-white border border-black/10 flex flex-col justify-between shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
          <form onSubmit={handleTextSubmit} className="flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-[#232427] mb-1.5 flex items-center gap-2 font-sans">
              <Layers className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
              Raw Notes & Stakeholder Transcripts
            </h3>
            <p className="text-xs text-[#55575c] mb-3 leading-relaxed font-sans">
              Input unstructured stakeholder notes or verbatim requirements. Groundwork AI chunks and establishes verifiable truth citations.
            </p>

            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="e.g. In the executive procurement sync, CFO confirmed purchase approvals under $2,500 can be automated via Slack webhooks..."
              rows={5}
              className="w-full flex-1 p-3.5 rounded-xl bg-[#F4F5F5] border border-black/10 text-xs text-[#232427] placeholder-[#55575c]/60 focus:outline-none focus:border-[#E34A32] focus:bg-white transition resize-none mb-3 font-sans"
            />

            <button
              type="submit"
              disabled={isSubmittingText || !pastedText.trim() || isGenerating}
              className="w-full py-2.5 rounded-full bg-black/5 hover:bg-black/10 text-[#232427] text-xs font-semibold transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isSubmittingText ? 'Ingesting note...' : 'Ingest Business Note'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E34A32]" strokeWidth={1.5} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-[11px] text-[#55575c] font-mono">
            <span>Cite-or-Abstain Chunking</span>
            <span className="text-[#232427] font-semibold">{sources.length} Documents Attached</span>
          </div>
        </div>
      </div>

      {/* Ingested Source List */}
      <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)]">
        <h3 className="text-sm font-bold text-[#232427] mb-4 flex items-center justify-between font-sans">
          <span>Ingested Documents & Acoustic Chunks</span>
          <span className="text-xs text-[#55575c] font-mono font-normal">
            {sources.length} item{sources.length === 1 ? '' : 's'} registered
          </span>
        </h3>

        {sources.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#55575c] font-mono bg-[#F4F5F5] rounded-xl">
            No source documents uploaded yet. Upload an SOP PDF or enter meeting notes above.
          </div>
        ) : (
          <div className="space-y-2.5">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-3.5 rounded-xl bg-[#F4F5F5] border border-black/5 flex items-center justify-between hover:border-black/15 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white border border-black/10 text-[#E34A32]">
                    {src.source_type === 'audio' ? (
                      <Mic className="w-4 h-4" strokeWidth={1.5} />
                    ) : (
                      <FileText className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#232427]">{src.filename}</h4>
                    <p className="text-[10px] text-[#55575c] font-mono">
                      Type: {src.source_type} • Characters: {src.raw_text?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    INGESTED
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
