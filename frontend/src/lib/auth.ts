const USER_KEY = 'tillsync_user';

// display-only cache of the signed-in user (name, role) — the session token
// lives in an httpOnly cookie and is deliberately not reachable from JS
export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: object): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(USER_KEY);
}