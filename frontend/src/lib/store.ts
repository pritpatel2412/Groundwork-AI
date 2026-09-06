import { create } from 'zustand';
import { Claim, Workspace } from './api';

export interface StageTrace {
  id: string;
  name: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  message: string;
  claimsCount: number;
  data?: any;
}

interface AppState {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  activeTab: 'home' | 'ingestion' | 'requirements' | 'architecture' | 'wireframes' | 'data' | 'roadmap' | 'verifier' | 'export';
  isGenerating: boolean;
  selectedClaim: Claim | null;
  stages: StageTrace[];
  
  // Actions
  setCurrentWorkspace: (ws: Workspace | null) => void;
  setWorkspaces: (list: Workspace[]) => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setIsGenerating: (generating: boolean) => void;
  setSelectedClaim: (claim: Claim | null) => void;
  updateStage: (stageId: string, updates: Partial<StageTrace>) => void;
  resetStages: () => void;
}

const DEFAULT_STAGES: StageTrace[] = [
  { id: 'discovery', name: 'Discovery Agent', label: 'Domain & Actor Structuring', status: 'pending', message: 'Waiting to start', claimsCount: 0 },
  { id: 'analyst', name: 'Analyst Agent', label: 'Requirements & Contradiction Audit', status: 'pending', message: 'Cite-or-abstain contract enforcement', claimsCount: 0 },
  { id: 'architect', name: 'Solution Architect', label: 'Architecture & System Topology', status: 'pending', message: 'Mermaid flowchart generation', claimsCount: 0 },
  { id: 'ux', name: 'UX Designer', label: 'Interactive Wireframe Schemas', status: 'pending', message: 'Component hierarchy & layouts', claimsCount: 0 },
  { id: 'data', name: 'Data Engineer', label: 'Entity-Relationship & Schemas', status: 'pending', message: 'Postgres & vector store schemas', claimsCount: 0 },
  { id: 'estimator', name: 'Estimator Agent', label: 'Delivery Range Calibration', status: 'pending', message: '3-point estimation calculation', claimsCount: 0 },
  { id: 'verifier', name: 'Dual Verifier (NVIDIA NIM)', label: 'Consensus Truth & Grounding Audit', status: 'pending', message: 'Nemotron + Llama consensus check', claimsCount: 0 },
];

export const useAppStore = create<AppState>((set) => ({
  currentWorkspace: null,
  workspaces: [],
  activeTab: 'home',
  isGenerating: false,
  selectedClaim: null,
  stages: DEFAULT_STAGES,

  setCurrentWorkspace: (ws) => set({ currentWorkspace: ws }),
  setWorkspaces: (list) => set({ workspaces: list }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setSelectedClaim: (claim) => set({ selectedClaim: claim }),
  updateStage: (stageId, updates) => set((state) => ({
    stages: state.stages.map((s) => s.id === stageId ? { ...s, ...updates } : s)
  })),
  resetStages: () => set({ stages: DEFAULT_STAGES.map(s => ({ ...s, status: 'pending', message: 'Ready', claimsCount: 0 })) }),
}));
