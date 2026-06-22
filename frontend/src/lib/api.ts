import axios, { type AxiosError } from 'axios';
import type {
  User,
  ScanRecord,
  ScanSummary,
  PlatformStats,
} from '@/types';

const TOKEN_KEY = 'secure-web:token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request.
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize backend error messages.
export function apiErrorMessage(err: unknown): string {
  const e = err as AxiosError<{ error?: string; details?: { field: string; message: string }[] }>;
  if (e.response?.data?.details?.length) {
    return e.response.data.details.map((d) => d.message).join(' • ');
  }
  return e.response?.data?.error ?? e.message ?? 'Something went wrong';
}

// ---- Auth ----
export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register: (data: { fullName: string; email: string; password: string; company?: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
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

/**
 * Downloads an authenticated file (PDF/JSON) by fetching with the JWT and
 * triggering a browser download from the resulting blob.
 */
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
