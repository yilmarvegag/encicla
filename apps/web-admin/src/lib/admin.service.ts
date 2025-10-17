import { apiService } from '@/lib/api.service';
import type { ApiResponse } from '@/types/api-response';
import { Paged } from '@/types/paging';
import { AdminSummary } from '@/types/summary';
import type { EnciclaUserDto, UserInputDto, UserOutputDto } from '@/types/user';

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-CO') : '—';

// Mapper 1:1 dto -> fila de tabla
export function mapUserToRow(u: EnciclaUserDto): UserOutputDto {
  return {
    id: u.id,
    fullName: u.fullName ?? '', // ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
    nombres: u.firstName ?? '',
    apellidos: u.lastName ?? '',
    email: (u.email ?? '').toLowerCase(),
    documento: u.documento ?? '',
    telefono: u.telefono ?? u.phoneNumber ?? '',
    direccion: u.direccion ?? '',
    municipio: u.municipio ?? '',
    fechaAlta: fmt(u.fechaAlta),
    fechaCreacion: fmt(u.fechaCreacion),
    estado: u.enabled ? 'Habilitado' : 'Deshabilitado',
    avatarUrl: u.imageFullPath ?? "/profile/avatar-fallback.jpg",
    ocupacion: u.ocupacion ?? '',
  };
}

// Listado paginado (server-side)
export async function fetchUsersPaged(
  page = 1,
  pageSize = 20,
  q = '', 
  signal?: AbortSignal
): Promise<Paged<UserOutputDto>> {
  const res = await apiService.get<ApiResponse<{
    items: EnciclaUserDto[]; page: number; pageSize: number; total: number;
  }>>('/admin/users', { page, pageSize, q }, signal );

  const payload = res.data!;
  return {
    items: (payload.items ?? []).map(mapUserToRow),
    page: payload.page,
    pageSize: payload.pageSize,
    total: payload.total,
  };
}

export async function fetchUsersSummary(): Promise<AdminSummary> {
  const r = await apiService.get<ApiResponse<AdminSummary>>('/admin/users/summary');
  return r.data;
}

// Payload para actualizar usuario
// editar campos básicos del usuario
export type UpdateUserPayload = Partial<Pick<
  EnciclaUserDto,
  'firstName' | 'lastName' | 'documento' | 'email' | 'telefono' | 'fechaAlta' |
  'direccion' | 'municipio' | 'departamento' | 'ocupacion'
>>;

// PATCH/PUT actualizar datos básicos
export async function updateUser(id: string, payload: UserInputDto): Promise<ApiResponse<null>> {
  return apiService.put<ApiResponse<null>>(`/admin/users/${id}`, payload);
}

// activar o desactivar
export async function setUserStatus(id: string, enabled: boolean) {
  console.log(`setUserStatus: ${id} -> ${enabled}`);
  return apiService.put<ApiResponse<null>>(`/admin/users/${id}/status`, { enabled });
}

export async function enableUser(id: string) {
  return setUserStatus(id, true);
}

export async function disableUser(id: string) {
  return setUserStatus(id, false);
}

// Traer por id (para edición puntual)
export async function getUser(userId: string): Promise<EnciclaUserDto> {
  const r = await apiService.get<{ data: EnciclaUserDto }>(`/admin/users/${userId}`);
  return r.data;
}