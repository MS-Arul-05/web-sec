import axios, { type AxiosError } from 'axios';
import { supabase } from '@/lib/supabase';
import type { User, ScanRecord, ScanSummary, PlatformStats } from '@/types';

// In dev, Vite proxies /api -> backend (:4000). In production on Vercel, the
// backend service is mounted under /_/backend (see root vercel.json).
const API_BASE =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '/_/backend/api' : '/api');

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the current Supabase access token to every request.
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiErrorMessage(err: unknown): string {
  const e = err as AxiosError<{ error?: string; details?: { field: string; message: string }[] }>;
  if (e.response?.data?.details?.length) {
    return e.response.data.details.map((d) => d.message).join(' • ');
  }
  return e.response?.data?.error ?? e.message ?? 'Something went wrong';
}

// ---- Profile (syncs the local DB row for the Supabase user) ----
export const profileApi = {
  sync: (profile?: { fullName?: string; company?: string }) =>
    api.post<{ user: User }>('/auth/me', { profile }).then((r) => r.data.user),
  me: () => api.get<{ user: User }>('/auth/me').then((r) => r.data.user),
};

// ---- Scans ----
export const scansApi = {
  create: (url: string) => api.post<{ scan: ScanRecord }>('/scans', { url }).then((r) => r.data.scan),
  list: () => api.get<{ scans: ScanSummary[] }>('/scans').then((r) => r.data.scans),
  get: (id: string) => api.get<{ scan: ScanRecord }>(`/scans/${id}`).then((r) => r.data.scan),
  remove: (id: string) => api.delete(`/scans/${id}`).then(() => undefined),
  exportJsonUrl: (id: string) => `/api/scans/${id}/export/json`,
  exportPdfUrl: (id: string) => `/api/scans/${id}/export/pdf`,
};

// ---- Stats ----
export const statsApi = {
  get: () => api.get<PlatformStats>('/stats').then((r) => r.data),
};

/** Downloads an authenticated file (PDF/JSON) via the JWT-bearing axios client. */
export async function downloadAuthed(url: string, filename: string): Promise<void> {
  const res = await api.get(url.replace('/api', ''), { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(res.data as Blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}
