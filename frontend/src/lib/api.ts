import axios, { AxiosError } from 'axios';
import type { ApiError } from './types';

// same-origin only — Next rewrites /api/v1/* to the backend, and the session
// cookie rides along automatically (httpOnly, so JS never sees the token)
export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 means the session expired — send them back to login
    if (error.response?.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fetcher = (url: string) => api.get(url).then((r) => r.data);

export function apiError(e: unknown): string {
  const d = (e as AxiosError<ApiError>).response?.data;
  if (!d) return 'Network error';
  return d.details?.[0]?.message ?? d.error;
}