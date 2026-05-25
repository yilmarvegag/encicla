// apps/web-admin/src/types/types.ts
// === DTO exacto del backend ===
export interface EnciclaUserDto {
  idMigracion: number;
  firstName: string;
  lastName: string;
  telefono: string | null;
  documento: string | null;            // CCnnn / TI... / Pasaporte
  phoneNumber: string | null;
  photo: string | null;
  imageFullPath: string | null;
  enabled: boolean;
  direccion: string | null;
  fechaAlta: string | null;      // ISO
  fechaCreacion: string | null;      // ISO
  pin: string | null;
  fullName: string | null;
  fechaNacimiento: string | null;
  sexo: string | null;           // "M"/"F"?
  estrato: number | null;
  ocupacion: string | null;
  empresa: string | null;
  telefonoFijo: string | null;
  entidad: string | null;
  departamento: string | null;
  municipio: string | null;
  pais: string | null;
  contacto: string | null;
  telefonoContacto: string | null;
  numeroTarjeta: string | null;
  tipoUso: number | null;
  habilitadoBE: boolean;
  fechaAltaBE: string | null;
  aceptaTerminos: boolean;
  aceptaHabeasData: boolean;
  id: string;                    // Guid
  userName: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}

// === Fila para la tabla ===
export type UserOutputDto = {
  id: string;
  fullName: string;
  nombres: string;
  apellidos: string;
  email: string;
  documento: string;
  telefono: string;
  direccion: string;
  ocupacion: string;
  municipio: string;
  fechaAlta: string;
  fechaCreacion: string;
  estado: 'Habilitado' | 'Deshabilitado';
  avatarUrl: string;
};

export type UserInputDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  document: string;
  phone: string;
  address: string;
  ocupation: string;
};