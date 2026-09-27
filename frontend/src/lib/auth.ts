const USER_KEY = 'tillsync_user';

// ponytail: token lives in a readable cookie so proxy.ts can guard routes too;
// httpOnly would need a server-side login route (add when hardening)
export function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return m ? m[1] : null;
}

export function setToken(token: string): void {
  document.cookie = `token=${token}; path=/; max-age=604800; samesite=lax`;
}

export function clearToken(): void {
  document.cookie = 'token=; path=/; max-age=0';
  if (typeof window !== 'undefined') localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: object): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
