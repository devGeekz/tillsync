import axios, { AxiosError } from 'axios';
import { getToken, clearToken } from './auth';
import type { ApiError } from './types';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 with a token means it expired → re-login; 401 without one is a failed login attempt
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const fetcher = (url: string) => api.get(url).then((r) => r.data);

export function apiError(e: unknown): string {
  const d = (e as AxiosError<ApiError>).response?.data;
  if (!d) return 'Network error — is the API running on :4000?';
  return d.details?.[0]?.message ?? d.error;
}
