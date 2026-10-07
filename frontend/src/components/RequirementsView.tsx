import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FileCheck, AlertOctagon, HelpCircle, Languages, RefreshCw, CheckCircle2, ShieldAlert, Search, X, ArrowUp, Filter, Edit3, Check, RotateCcw } from 'lucide-react';
import { api, Claim, Contradiction, resolveContradiction, updateRequirement } from '../lib/api';
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

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'contested' | 'unsupported'>('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Contradiction resolution state
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);

  // In-place requirement edit state
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [editReqText, setEditReqText] = useState('');
  const [isSavingReq, setIsSavingReq] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  const handleListScroll = () => {
    if (!listContainerRef.current) return;
    setShowScrollTop(listContainerRef.current.scrollTop > 200);
  };

  const scrollToTop = () => {
    listContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartResolve = (c: Contradiction) => {
    setResolvingId(c.id);
    setResolutionText(c.resolution_notes || `Override applied: resolved based on stakeholder policy review.`);
  };

  const handleConfirmResolve = async (contradictionId: string) => {
    if (!currentWorkspace || !resolutionText.trim()) return;
    try {
      setIsSubmittingResolution(true);
      await resolveContradiction(currentWorkspace.id, contradictionId, resolutionText.trim());
      setContradictions((prev) =>
        prev.map((item) =>
          item.id === contradictionId
            ? { ...item, status: 'resolved', resolution_notes: resolutionText.trim() }
            : item
        )
      );
      setResolvingId(null);
      setToast({ message: 'Contradiction successfully resolved and saved.', type: 'success' });
    } catch (err: any) {
      console.error('Error resolving contradiction:', err);
      setToast({ message: err?.response?.data?.detail || 'Failed to resolve contradiction.', type: 'error' });
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  const handleStartEditReq = (req: Claim) => {
    setEditingReqId(req.id);
    setEditReqText(req.text);
  };

  const handleSaveReq = async (reqId: string) => {
    if (!currentWorkspace || !editReqText.trim()) return;
    try {
      setIsSavingReq(true);
      await updateRequirement(currentWorkspace.id, reqId, editReqText.trim());
      setRequirements((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, text: editReqText.trim() } : r))
      );
      setEditingReqId(null);
      setToast({ message: 'Requirement updated successfully.', type: 'success' });
    } catch (err: any) {
      console.error('Error saving requirement:', err);
      setToast({ message: err?.response?.data?.detail || 'Failed to update requirement.', type: 'error' });
    } finally {
      setIsSavingReq(false);
    }
  };

  // Status counts
  const verifiedCount = useMemo(() => requirements.filter((r) => r.status === 'verified').length, [requirements]);
  const contestedCount = useMemo(() => requirements.filter((r) => r.status === 'contested').length, [requirements]);
  const unsupportedCount = useMemo(() => requirements.filter((r) => r.status === 'unsupported').length, [requirements]);

  // Filtered requirements
  const filteredRequirements = useMemo(() => {
    return requirements
      .map((req, originalIndex) => ({ req, originalIndex }))
      .filter(({ req, originalIndex }) => {
        // Status filter
        if (statusFilter !== 'all' && req.status !== statusFilter) {
          return false;
        }
        // Search text filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const idStr = `req-0${originalIndex + 1}`.toLowerCase();
          const textMatch = req.text.toLowerCase().includes(q);
          const idMatch = idStr.includes(q);
          const citationMatch = req.citations.some((c) => c.toLowerCase().includes(q));
          return textMatch || idMatch || citationMatch;
        }
        return true;
      });
  }, [requirements, statusFilter, searchQuery]);

  if (!currentWorkspace) {
    return <div className="p-8 text-center text-[#55575c]">Select a workspace first.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Multilingual Translation Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20 shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <FileCheck className="w-5 h-5 text-[#E34A32]" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-0.5">
              <h2 className="text-lg sm:text-xl font-bold text-[#232427] font-sans tracking-tight">
                Requirements & Grounding Ledger
              </h2>
              <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/20 shrink-0">
                AUDITED
              </span>
            </div>
            <p className="text-xs text-[#55575c]">
              Every requirement is anchored to verified chunk citations or explicitly flagged.
            </p>
          </div>
        </div>

        {/* Sarvam Translation Bar */}
        <div className="flex items-center gap-2 bg-white border border-black/10 p-1.5 rounded-xl text-xs shadow-xs flex-wrap sm:flex-nowrap shrink-0 self-start lg:self-center">
          <div className="flex items-center gap-1.5 pl-1 shrink-0">
            <Languages className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
            <span className="text-[11px] font-medium text-[#55575c] hidden sm:inline">Translate:</span>
          </div>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-[#F4F5F5] border border-black/5 text-[#232427] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#E34A32] font-mono shrink-0 cursor-pointer"
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
            className="px-3 py-1 rounded-lg bg-[#232427] hover:bg-[#171719] text-white font-mono text-[11px] font-semibold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <RefreshCw className={`w-3 h-3 text-[#E34A32] ${isTranslating ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            <span>{isTranslating ? 'Translating...' : 'Mayura Translate'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Alert */}
      {toast && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-red-600" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 hover:bg-black/5 rounded-md cursor-pointer text-current"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Contradictions Alert & Resolution Section (FR-ANLY-04) */}
      {contradictions.length > 0 && (
        <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-[#E34A32] font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
              <span>Contradictions Detected by Verifier Agent ({contradictions.length})</span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white text-[#55575c] border border-black/5">
              NVIDIA NIM DUAL-CONSENSUS
            </span>
          </div>
          <p className="text-xs text-[#55575c] leading-relaxed">
            Independent checker models identified conflicting business logic across ingested documents. Review and resolve each conflict below:
          </p>
          <div className="space-y-2.5">
            {contradictions.map((c, i) => {
              const isResolved = c.status === 'resolved';
              const isResolving = resolvingId === c.id;

              return (
                <div
                  key={c.id || i}
                  className={`p-4 rounded-xl text-xs transition border ${
                    isResolved
                      ? 'bg-emerald-50/60 border-emerald-200/80 shadow-xs'
                      : 'bg-white border-red-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px] mb-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isResolved ? 'text-emerald-700' : 'text-[#E34A32]'}`}>
                        DISCREPANCY #{i + 1}
                      </span>
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          RESOLVED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100/80 text-red-700 text-[10px] font-bold">
                          OPEN CONFLICT
                        </span>
                      )}
                    </div>
                    <span className="text-[#55575c]">
                      CHUNKS: {c.source_chunk_ids?.join(', ') || 'N/A'}
                    </span>
                  </div>

                  <p className="text-xs text-[#232427] leading-relaxed mb-2">{c.description}</p>

                  {isResolved && c.resolution_notes && (
                    <div className="p-2.5 rounded-lg bg-emerald-100/50 border border-emerald-200 text-[11px] text-emerald-900 mt-2">
                      <span className="font-semibold font-mono uppercase text-[10px] text-emerald-700 block mb-0.5">
                        Resolution Override:
                      </span>
                      {c.resolution_notes}
                    </div>
                  )}

                  {!isResolved && !isResolving && (
                    <div className="mt-2.5 pt-2 border-t border-red-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleStartResolve(c)}
                        className="px-3 py-1 rounded-lg bg-[#232427] hover:bg-black text-white font-mono text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5 text-[#E34A32]" />
                        <span>Resolve Conflict</span>
                      </button>
                    </div>
                  )}

                  {isResolving && (
                    <div className="mt-3 p-3 rounded-lg bg-[#F4F5F5] border border-black/10 space-y-2">
                      <label className="block text-[11px] font-semibold text-[#232427]">
                        Resolution Decision / Policy Override:
                      </label>
                      <textarea
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        placeholder="Specify which policy prevails or state explicit threshold override..."
                        rows={2}
                        className="w-full p-2.5 rounded-lg bg-white border border-black/10 text-xs text-[#232427] focus:outline-none focus:border-[#E34A32] focus:ring-1 focus:ring-[#E34A32]/20 resize-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setResolvingId(null)}
                          disabled={isSubmittingResolution}
                          className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:bg-black/5 text-[#55575c] font-mono text-[11px] transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmResolve(c.id)}
                          disabled={isSubmittingResolution || !resolutionText.trim()}
                          className="px-3 py-1 rounded-lg bg-[#E34A32] hover:bg-[#d03d26] text-white font-mono text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isSubmittingResolution ? 'Saving...' : 'Apply Resolution'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Requirements Ledger Card with Search, Filter Chips & Scrollable Container */}
      <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_28px_-14px_rgba(35,36,39,0.08)] relative">
        {/* Ledger Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#232427] flex items-center gap-2 font-sans">
              Verified Requirements Ledger
            </h3>
            <p className="text-[11px] text-[#55575c]">
              Audited business rules extracted from uploaded documents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#55575c] font-mono bg-[#F4F5F5] px-3 py-1 rounded-full border border-black/5">
              {filteredRequirements.length === requirements.length
                ? `${requirements.length} items committed`
                : `Showing ${filteredRequirements.length} of ${requirements.length} items`}
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-black/5">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full font-mono text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'all'
                  ? 'bg-[#232427] text-white font-semibold shadow-xs'
                  : 'bg-[#F4F5F5] text-[#55575c] hover:text-[#232427] border border-black/5'
              }`}
            >
              <span>All</span>
              <span className="opacity-70">({requirements.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('verified')}
              className={`px-3 py-1 rounded-full font-mono text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'verified'
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'bg-[#F4F5F5] text-[#55575c] hover:text-emerald-700 border border-black/5'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Verified</span>
              <span className="opacity-70">({verifiedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('contested')}
              className={`px-3 py-1 rounded-full font-mono text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'contested'
                  ? 'bg-purple-700 text-white font-semibold shadow-xs'
                  : 'bg-[#F4F5F5] text-[#55575c] hover:text-purple-700 border border-black/5'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>Contested</span>
              <span className="opacity-70">({contestedCount})</span>
            </button>

            {unsupportedCount > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('unsupported')}
                className={`px-3 py-1 rounded-full font-mono text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'unsupported'
                    ? 'bg-red-700 text-white font-semibold shadow-xs'
                    : 'bg-[#F4F5F5] text-[#55575c] hover:text-red-700 border border-black/5'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Unsupported</span>
                <span className="opacity-70">({unsupportedCount})</span>
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#8C9097] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search text, REQ-ID, or chunk..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#F4F5F5] border border-black/10 text-xs text-[#232427] placeholder:text-[#8C9097] focus:outline-none focus:border-[#E34A32] focus:bg-white focus:ring-2 focus:ring-[#E34A32]/10 transition shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C9097] hover:text-[#232427] p-1 rounded-lg hover:bg-black/5 transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Requirements Scrollable List Container */}
        {loading ? (
          <div className="p-12 text-center text-[#55575c] font-mono text-xs">
            Loading requirements matrix...
          </div>
        ) : requirements.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#55575c] font-mono bg-[#F4F5F5] rounded-xl">
            No requirements generated yet. Navigate to Ingestion Console to synthesize.
          </div>
        ) : filteredRequirements.length === 0 ? (
          <div className="p-8 text-center bg-[#F4F5F5] rounded-xl border border-black/5 space-y-2">
            <p className="text-xs text-[#55575c] font-mono">No requirements match your active filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="text-xs text-[#E34A32] font-semibold hover:underline"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div
            ref={listContainerRef}
            onScroll={handleListScroll}
            className="max-h-[580px] sm:max-h-[660px] overflow-y-auto custom-scrollbar pr-2 sm:pr-3 space-y-3 scroll-smooth"
          >
            {filteredRequirements.map(({ req, originalIndex }) => {
              const isEditing = editingReqId === req.id;

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-[#F4F5F5] border border-black/5 hover:border-black/15 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-xs hover:bg-[#F0F2F2]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-[#E34A32]">
                        REQ-0{originalIndex + 1}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white text-[#55575c] border border-black/5">
                        {req.citations.length > 0 ? `${req.citations.length} Citations` : 'Direct Rule'}
                      </span>
                      {req.explanation?.includes('Modified by human') && (
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          HUMAN EDITED
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 mt-1">
                        <textarea
                          value={editReqText}
                          onChange={(e) => setEditReqText(e.target.value)}
                          rows={3}
                          className="w-full p-2.5 rounded-lg bg-white border border-black/15 text-sm font-medium text-[#232427] focus:outline-none focus:border-[#E34A32] focus:ring-1 focus:ring-[#E34A32]/20 resize-none"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveReq(req.id)}
                            disabled={isSavingReq || !editReqText.trim()}
                            className="px-3 py-1 rounded-lg bg-[#232427] hover:bg-black text-white font-mono text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5 text-[#E34A32]" />
                            <span>{isSavingReq ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingReqId(null)}
                            disabled={isSavingReq}
                            className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:bg-black/5 text-[#55575c] font-mono text-[11px] transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-[#232427] leading-relaxed mb-1">
                          {req.text}
                        </p>
                        {translatedMap[req.id] && (
                          <p className="text-xs text-[#E34A32] font-medium bg-white/70 p-2 rounded-lg border border-black/5 mt-1.5">
                            <span className="font-mono text-[10px] uppercase text-[#55575c] mr-1">[MAYURA]:</span>
                            {translatedMap[req.id]}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-start sm:self-center mt-2 sm:mt-0">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartEditReq(req)}
                        className="p-1.5 rounded-lg hover:bg-black/5 text-[#55575c] hover:text-[#232427] transition cursor-pointer"
                        title="Edit requirement in-place"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ClaimChip claim={req} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Scroll To Top floating action button */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="absolute bottom-8 right-8 z-20 p-2.5 rounded-full bg-[#232427] text-white hover:bg-[#171719] shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            title="Scroll back to top of ledger"
          >
            <ArrowUp className="w-3.5 h-3.5 text-[#E34A32]" />
            <span className="text-[10px] pr-1">TOP</span>
          </button>
        )}
      </div>
    </div>
  );
};

