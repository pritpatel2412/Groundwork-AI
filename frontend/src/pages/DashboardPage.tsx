import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api, Workspace } from '../lib/api';
import { useAppStore } from '../lib/store';
import {
  FolderKanban,
  Plus,
  ArrowRight,
  LogOut,
  ShieldCheck,
  Sparkles,
  Layers,
  FileCheck,
  Calendar,
  AlertCircle,
  Loader2,
  Cpu,
  X
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { setWorkspaces, setCurrentWorkspace } = useAppStore();

  const [workspaceList, setWorkspaceList] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<Workspace[]>('/workspaces');
      setWorkspaceList(res.data);
      setWorkspaces(res.data);
    } catch (err: any) {
      console.error('Error fetching workspaces:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch workspaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const res = await api.post<Workspace>('/workspaces', {
        name: newWorkspaceName.trim(),
      });
      const created = res.data;
      setWorkspaceList((prev) => [created, ...prev]);
      setCurrentWorkspace(created);
      setIsCreateModalOpen(false);
      setNewWorkspaceName('');
      navigate(`/workspace/${created.id}`);
    } catch (err: any) {
      console.error('Error creating workspace:', err);
      setCreateError(err.response?.data?.detail || err.message || 'Failed to create workspace.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenWorkspace = (ws: Workspace) => {
    setCurrentWorkspace(ws);
    navigate(`/workspace/${ws.id}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#ECEDEE] text-[#232427] flex flex-col selection:bg-[#E34A32]/20 selection:text-[#E34A32]">
      {/* Top Header */}
      <header className="border-b border-black/10 bg-[#F4F5F5]/90 backdrop-blur-xl px-6 py-4 sticky top-0 z-40 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center h-5 w-7">
              <span className="w-3.5 h-3.5 rounded-full bg-[#232427] block shadow-xs" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#E34A32] block -ml-1.5 shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-[#232427] flex items-center gap-1.5 font-sans">
                  Groundwork <span className="font-serif-accent italic font-normal text-base text-[#E34A32]">Dashboard</span>
                </h1>
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/25">
                  RLS PROTECTED
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/10 text-xs shadow-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[#55575c] font-mono text-[11px] truncate max-w-[200px]">
                {user?.email}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white border border-black/10 text-[#55575c] hover:text-[#232427] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-[#E34A32]" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-[32px] bg-[#F4F5F5] border border-black/5 p-8 sm:p-10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_40px_-20px_rgba(35,36,39,0.08)]">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,_rgba(227,74,50,0.15)_0%,_transparent_70%)] pointer-events-none blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-black/5 text-xs font-semibold text-[#2E3034] mb-3 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E34A32]" />
                <span>Enterprise Architecture Synthesis</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#232427] tracking-tight mb-2 font-sans">
                Architectural Workspaces
              </h2>
              <p className="text-xs sm:text-sm text-[#55575c] leading-relaxed max-w-xl">
                Each workspace isolates documents, neural vector embeddings, cite-or-abstain verification ledgers, and generated wireframes behind Row Level Security.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3.5 rounded-full bg-[#232427] hover:bg-[#171719] text-white font-semibold text-xs tracking-tight flex items-center justify-center gap-2 transition cursor-pointer shadow-md hover:shadow-lg shrink-0 self-start md:self-center"
            >
              <Plus className="w-4 h-4 text-[#E34A32]" strokeWidth={2} />
              <span>Create New Workspace</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchWorkspaces}
              className="underline font-semibold hover:text-red-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Workspaces Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#55575c] flex items-center gap-2">
              <FolderKanban className="w-3.5 h-3.5 text-[#E34A32]" />
              Active Workspaces ({workspaceList.length})
            </h3>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#E34A32]" />
              <span className="text-xs font-mono text-[#55575c]">Loading your encrypted workspaces...</span>
            </div>
          ) : workspaceList.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center rounded-[32px] border border-black/10 bg-white/80 backdrop-blur-xl shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F5F5] border border-black/5 flex items-center justify-center mx-auto mb-4 text-[#E34A32]">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-[#232427] mb-1">
                No transformation workspaces yet
              </h4>
              <p className="text-xs text-[#55575c] max-w-md mx-auto mb-6">
                Initialize your first workspace to ingest SOP documents, PRDs, or voice notes and generate dual-verified architectures.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#232427] hover:bg-[#171719] text-white font-semibold text-xs inline-flex items-center gap-2 transition cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5 text-[#E34A32]" />
                <span>Initialize First Workspace</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workspaceList.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => handleOpenWorkspace(ws)}
                  className="group p-6 rounded-[24px] bg-white/90 hover:bg-white border border-black/10 hover:border-[#E34A32]/40 transition-all duration-200 cursor-pointer shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_10px_25px_-10px_rgba(35,36,39,0.06)] hover:shadow-[0_12px_30px_-10px_rgba(227,74,50,0.15)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-xl bg-[#F4F5F5] border border-black/5 flex items-center justify-center text-[#E34A32] group-hover:scale-105 transition">
                        <FolderKanban className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-[#55575c] bg-[#F4F5F5] px-2 py-0.5 rounded-full border border-black/5">
                        {ws.created_at ? new Date(ws.created_at).toLocaleDateString() : 'Active'}
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-[#232427] group-hover:text-[#E34A32] transition line-clamp-1 mb-2">
                      {ws.name}
                    </h4>

                    <p className="text-xs text-[#55575c] line-clamp-2 mb-4 font-sans">
                      Isolated multi-agent context with independent verification gate.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/5 flex items-center justify-between text-xs font-semibold text-[#232427]">
                    <span className="text-[11px] font-mono text-[#55575c]">OPEN COPILOT</span>
                    <div className="w-6 h-6 rounded-full bg-[#F4F5F5] group-hover:bg-[#232427] group-hover:text-white flex items-center justify-center transition">
                      <ArrowRight className="w-3.5 h-3.5 text-[#E34A32]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Workspace Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-[28px] border border-black/10 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-5 top-5 text-[#55575c] hover:text-[#232427] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-[#E34A32]">
              <FolderKanban className="w-5 h-5" />
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                Initialize Workspace
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-[#232427] mb-2 font-sans">
              Name your project
            </h3>
            <p className="text-xs text-[#55575c] mb-5 font-sans">
              Enter a descriptive name for your transformation workspace (e.g. "Global Logistics Core Migration").
            </p>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#232427] mb-1.5">
                  Workspace Title
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Autonomous Fleet Telemetry"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F4F5F5] border border-black/10 text-sm text-[#232427] placeholder-[#55575c]/60 focus:bg-white focus:outline-none focus:border-[#E34A32] focus:ring-2 focus:ring-[#E34A32]/20 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-black/10 text-xs font-semibold text-[#55575c] hover:bg-black/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newWorkspaceName.trim()}
                  className="px-5 py-2.5 rounded-full bg-[#232427] hover:bg-[#171719] text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E34A32]" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-[#E34A32]" />
                      <span>Create Workspace</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 border-t border-black/5 text-center text-[11px] font-mono text-[#55575c]">
        GROUNDWORK AI • SECURE AUDITED WORKSPACES • SUPABASE RLS ACTIVE
      </footer>
    </div>
  );
};
