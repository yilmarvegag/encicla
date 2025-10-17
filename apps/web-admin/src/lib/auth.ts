//apps\web-admin\src\lib\auth.ts
// Manejo simple de cookies en cliente (App Router)
export function setCookie(name: string, value: string, expires?: Date) {
  const exp = expires ? `; Expires=${expires.toUTCString()}` : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${exp}`;
}
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : null;
}
export function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export const TOKEN_COOKIE = 'encicla_token';
export const ROLES_COOKIE = 'encicla_roles';
export const EXP_COOKIE = 'encicla_exp'; // ISO

export function saveSession(token: string, expirationISO: string) {
  const exp = new Date(expirationISO);
  setCookie(TOKEN_COOKIE, token, exp);
  setCookie(EXP_COOKIE, expirationISO, exp);
}
export function clearSession() {
  deleteCookie(TOKEN_COOKIE);
  deleteCookie(EXP_COOKIE);
}
export function getToken(): string | null {
  return getCookie(TOKEN_COOKIE);
}
export function getExpiration(): Date | null {
  const s = getCookie(EXP_COOKIE);
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
export function isExpired(skewSeconds = 30): boolean {
  const exp = getExpiration();
  if (!exp) return true;
  return Date.now() > exp.getTime() - skewSeconds * 1000; // skew
}

export function saveRoles(roles: string[]) {
  const exp = getExpiration() ?? new Date(Date.now() + 3600_000);
  document.cookie =
    `encicla_roles=${encodeURIComponent(roles.join(','))}; Path=/; SameSite=Lax; Expires=${exp.toUTCString()}`;
}
export function getRoles(): string[] {
  if (typeof document === 'undefined') return [];
  const m = document.cookie.match(new RegExp(`(^| )${ROLES_COOKIE}=([^;]+)`));
  return m ? decodeURIComponent(m[2]).split(',').filter(Boolean) : [];
}

export async function logout() {
  // avisar al servidor para que borre cookies seguras (httpOnly)
  // try { await fetch('/logout', { method: 'POST' }); } catch {}
  // por si quedara algo en memoria del cliente:
  clearSession?.();
  location.replace('/auth/login');
}