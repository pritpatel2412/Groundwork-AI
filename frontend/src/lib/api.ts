import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Supabase session token to every outgoing API request
api.interceptors.request.use(async (config) => {
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      config.headers.Authorization = `Bearer ${data.session.access_token}`;
    }
  } catch (err) {
    console.error('Error attaching auth token:', err);
  }
  return config;
});

export interface Claim {
  id: string;
  text: string;
  status: 'verified' | 'inferred' | 'contested' | 'unsupported';
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
  user_id?: string;
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
  contested_count: number;
  unsupported_count: number;
  grounded_rate_percent: number;
  claims: Claim[];
}
