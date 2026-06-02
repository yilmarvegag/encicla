// apps/web-form/src/lib/api.ts
import { ResponseData, ApiResponseLegacy } from "@/types/api.type";
import { apiService } from "./api.service";

export function extractIdFromResponse(
  resp: ApiResponseLegacy<{ id?: string | number } | { Id?: string | number } | any>
): string {
  const payload = resp?.result ?? resp?.result ?? {};
  const raw = payload.id ?? payload.Id;
  if (raw == null) throw new Error('La respuesta no contiene id');
  return String(raw);
}

// ---------- STEP 1 ----------
// GET {{baseURL}}/Users/ExistsByDni?dni=CC1007053620
// dni = tipoDocumento + númeroDocumento (ej: "CC1007053620")

export async function getUserByDni(
  documentType: string,
  documentNumber: string,
  email: string
): Promise<ResponseData<boolean>> {

  const dni = `${documentType}${documentNumber}`.trim();

  // Llamamos al endpoint del backend
  const response = await apiService.get<ResponseData<boolean>>(`/Users/ExistsByDni?dni=${encodeURIComponent(dni)}&email=${encodeURIComponent(email)}`);

  // Validamos la respuesta
  if (!response.status || response.status >= 400) {
    throw new Error(response?.message ?? "Error validando el documento");
  }

  // Devuelve true si existe, false si no
  return response;
}

// ---------- STEP 2 ----------

export async function getSerial(documentType: string,documentNumber: string
): Promise<ResponseData<string>> {
  const resp = await apiService.get<ResponseData<string>>(
    `/users/GetSerial?dni=${encodeURIComponent(documentNumber)}&typeDni=${encodeURIComponent(documentType)}`
  );

  if (resp.status !== 200) {
    throw new Error(resp.message || "Error consultando la tarjeta Cívica");
  }

  return resp;
}

// ---------- STEP 3 ----------

export type UserByDniResponse = {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  telephone: string;
  dni: string;
};



// ---------- Catálogos ----------
export type Municipality = { id: number; nombre: string };
export function getMunicipalities() {
  // return apiService.get<ResponseData<Municipality[]>>(`/v1/municipality`);
  return apiService.get<ResponseData<Municipality[]>>(`/municipio`);
}

export type Neighborhood = { id: number; idMunicipio: number; nombre: string; tipoDivision: string };
export function getNeighborhoods(municipalityId: number | string) {
  // return apiService.get<ResponseData<Neighborhood[]>>(`/v1/municipality/${encodeURIComponent(String(municipalityId))}/neighborhoods`);
  return apiService.get<ResponseData<Neighborhood[]>>(`/barrio/pormunicipio/${encodeURIComponent(String(municipalityId))}`);
}

// export type VerifyOtpReq = { email: string; code: string };
// export function verifyOtp(req: VerifyOtpReq) {
//   return apiService.post<ResponseData<boolean>>(`/v1/otp/verify`, {
//     email: req.email,
//     otp: req.code,
//   });
// }

// AllFormValues: si no lo tienes, usa `any` o crea tu tipo unificado
export async function submitRegistration(allValues: any):Promise<ApiResponseLegacy> {
  // const f = new FormData();

  // // STEP 1
  // f.append("FirstName", allValues.firstName);

  const data = JSON.stringify(allValues);
  return apiService.post<ApiResponseLegacy>(`/account/postregisteruser`, data);
}

// export async function attachRoleToUser(attachData: any) {
//   return apiService.postForm<any>(`/usuariorols/postusuariorol`, attachData);
// }

export async function uploadRegistrationFiles(idUser: string, files: Partial<Record<string, File>>) {
  const fd = new FormData();
  if (files.signedContract)      fd.append("SignedContract", files.signedContract);
  if (files.idFront)             fd.append("IdFront", files.idFront);
  if (files.idBack)              fd.append("IdBack", files.idBack);
  if (files.passportFile)        fd.append("PassportFile", files.passportFile);
  if (files.guardianId)          fd.append("GuardianId", files.guardianId);
  if (files.authorizationLetter) fd.append("AuthorizationLetter", files.authorizationLetter);
  if (files.biometricImage)      fd.append("BiometricImage", files.biometricImage);
  if (files.signaturePng)        fd.append("SignaturePng", files.signaturePng);

  return apiService.postForm<any>(`/uploads/user/${idUser}`, fd);
}
