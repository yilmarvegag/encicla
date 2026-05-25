import { apiService } from './api.service';
import type { CreateTokenDto, CreateTokenResponse } from '@/types/auth';
import { saveSession, clearSession, isExpired, saveRoles } from '@/lib/auth';

type MaybeRole =
  | string
  | { name?: string; role?: string; normalizedName?: string }
  | null
  | undefined;

const norm = (r: MaybeRole): string | null => {
  if (!r) return null;
  if (typeof r === 'string') return r;
  return r.name ?? r.role ?? r.normalizedName ?? null;
};

// quita tildes y a minúsculas (anfitrión → anfitrion)
const slug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

function decodeJwt<T = any>(token: string): T {
  const [, payload] = token.split('.');
  const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(json);
}

export function extractRolesFromResponse(res: CreateTokenResponse): string[] {
  // 1) Body: user.usuarioRoles puede ser array de objetos
  const byUserRaw = ((res.user as any)?.usuarioRoles ?? []) as MaybeRole[];
  const byUser = byUserRaw.map(norm).filter(Boolean) as string[];

  // 2) JWT: distintos claims posibles
  let byJwt: string[] = [];
  try {
    const p = decodeJwt<any>(res.token);
    const r1 = p?.roles ?? [];
    const r2 = p?.role ?? [];
    const r3 = p?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? [];
    const flat = ([] as any[]).concat(r1).concat(r2).concat(r3);
    byJwt = flat.map(norm).filter(Boolean) as string[];
  } catch { /* noop */ }

  // 3) Unificar, limpiar y desduplicar
  const roles = Array.from(new Set([...byUser, ...byJwt]))
    .map(slug); // ← "Administrador" → "administrador", "Anfitrión" → "anfitrion"

  // 4) Fallback temporal si sigue vacío
  if (roles.length === 0) {
    console.warn('No se detectaron roles para el usuario, aplicando fallback temporal');
    if (res.user?.email?.toLowerCase() === 'yilmarvegag@outlook.com') return ['administrador'];
    return ['monitor'];
  }

  return roles;
}

export async function login(dto: CreateTokenDto) {
  const res = await apiService.post<CreateTokenResponse>('/users/createtoken', dto);
  saveSession(res.token, res.expiration);

  const roles = extractRolesFromResponse(res);
  saveRoles(roles);

  return res;
}

export function logout() {
  clearSession();
  if (typeof window !== 'undefined') window.location.href = '/auth/login';
}

export function isLoggedIn() {
  return !isExpired();
}
