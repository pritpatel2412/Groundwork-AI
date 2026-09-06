import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Claim {
  id: string;
  text: string;
  status: 'verified' | 'inferred' | 'unsupported';
  citations: string[];
  confidence: number;
  explanation?: string;
}

export interface Contradiction {
  id: string;
  description: string;
  source_chunk_ids: string[];
}

export interface Workspace {
  id: string;
  name: string;
  created_at?: string;
}

export interface SourceDocument {
  id: string;
  workspace_id: string;
  filename: string;
  raw_text: string;
  source_type: string;
  uploaded_at?: string;
}

export interface ClaimsSummary {
  workspace_id: string;
  total_claims: number;
  verified_count: number;
  inferred_count: number;
  unsupported_count: number;
  grounded_rate_percent: number;
  claims: Claim[];
}
