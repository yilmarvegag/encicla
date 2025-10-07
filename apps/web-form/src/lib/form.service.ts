// apps/web-form/src/lib/api.ts
import { ResponseData } from "@/types/api.type";
import { apiService } from "./api.service";
import { ensureFile } from "./formdata.util";

// ---------- STEP 1 ----------

export function checkDocumentExists(documentNumber: string) {
  return apiService.post<ResponseData<boolean>>(`/v1/registration/validate-document`, {
    DocumentNumber: documentNumber,
  });
}

export function sendOtp(email: string) {
  return apiService.post<ResponseData<boolean>>(`/v1/otp/send`, {
    email: email,
  });
}


// ---------- STEP 2 ----------

// ---------- STEP 3 ----------

// ---------- Catálogos ----------
export type Municipality = { id: number; name: string };
export function getMunicipalities() {
  return apiService.get<ResponseData<Municipality[]>>(`/v1/municipality`);
}

export type Neighborhood = { id: number; idMunicipality: number; name: string; commune: string };
export function getNeighborhoods(municipalityId: number | string) {
  return apiService.get<ResponseData<Neighborhood[]>>(`/v1/municipality/${encodeURIComponent(String(municipalityId))}/neighborhoods`);
}

export type VerifyOtpReq = { email: string; code: string };
export function verifyOtp(req: VerifyOtpReq) {
  return apiService.post<ResponseData<boolean>>(`/v1/otp/verify`, {
    email: req.email,
    otp: req.code,
  });
}

// AllFormValues: si no lo tienes, usa `any` o crea tu tipo unificado
export async function submitRegistration(allValues: any) {
  const f = new FormData();

  // STEP 1
  f.append("FirstName", allValues.firstName);
  f.append("SecondName", allValues.secondName ?? "");
  f.append("FirstLastName", allValues.firstLastName);
  f.append("SecondLastName", allValues.secondLastName ?? "");
  f.append("DocumentType", allValues.documentType);
  f.append("DocumentNumber", allValues.documentNumber);
  f.append("Email", allValues.email);
  f.append("Phone", allValues.phone);
  f.append("HabeasDataAccepted", String(!!allValues.habeas));
  f.append("TermsAccepted", String(!!allValues.terms));

  // STEP 2 (tipo + contrato + biometría)
  f.append("UserType", allValues.userType);
  f.append("HasCivicaPersonalizada", String(!!allValues.hasCivica));
  if (allValues.civicaNumber) f.append("CivicaNumber", allValues.civicaNumber);
  f.append("ContractAccepted", String(!!allValues.contractAccepted));

  // Firma (png dataURL) + PDF del contrato firmado (File)
  const signaturePng = ensureFile(allValues.signatureDataUrl, "signature.png", "image/png");
  if (signaturePng) f.append("SignatureImage", signaturePng);
  if (allValues.signedContract instanceof File) {
    f.append("SignedContractPdf", allValues.signedContract);
  }

  // Biometría (dataURL a File)
  const bio = ensureFile(allValues.biometricImage, "biometric.jpg", "image/jpeg");
  if (bio) f.append("BiometricImage", bio);
  f.append("BiometricOk", String(!!allValues.biometricOk));

  // Documentos de identidad (elige 1 archivo o anverso/reverso)
  // Web: `idDoc` (un solo archivo)
  // Móvil: `idFront` + `idBack`
  const idDoc = allValues.idDoc instanceof File ? allValues.idDoc : undefined;
  const idFront = allValues.idFront instanceof File ? allValues.idFront : undefined;
  const idBack = allValues.idBack instanceof File ? allValues.idBack : undefined;

  if (idDoc) {
    f.append("IdDoc", idDoc);
  } else {
    if (idFront) f.append("IdFront", idFront);
    if (idBack) f.append("IdBack", idBack);
  }

  // Pasaporte / Menor edad (adjuntos)
  if (allValues.passportFile instanceof File) f.append("PassportFile", allValues.passportFile);
  if (allValues.guardianId instanceof File) f.append("GuardianId", allValues.guardianId);
  if (allValues.authorizationLetter instanceof File) f.append("AuthorizationLetter", allValues.authorizationLetter);

  // STEP 3 (dirección + contacto)
  f.append("Address", allValues.address);
  f.append("Municipio", String(allValues.municipio));
  if (allValues.comuna) f.append("Comuna", allValues.comuna);
  if (allValues.barrio) f.append("Barrio", allValues.barrio);
  f.append("Ocupacion", allValues.ocupacion);
  f.append("EmergencyName", allValues.emergencyName);
  f.append("EmergencyPhone", allValues.emergencyPhone);
  f.append("EmergencyKinship", allValues.emergencyKinship);

  // (opcional) id de registro si manejas correlación en server
  if (allValues.registrationId) f.append("RegistrationId", allValues.registrationId);

  // Enviar
  return apiService.postForm<ResponseData<{ id: string }>>(`/v1/registration`, f);
}
