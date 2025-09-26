// apps/web-form/src/lib/api.ts
import { get, post } from "./http";

// Envoltorio que usa tu API (según muestras)
export type ResponseAPI<T> = {
  type?: string;
  title?: string;
  status?: number;
  instance?: string;
  message?: string;
  data: T;
  errors?: unknown[];
};

// ---------- STEP 1 ----------

export function checkDocumentExists(documentNumber: string) {
  return post<ResponseAPI<boolean>>(`/v1/registration/validate-document`, {
    DocumentNumber: documentNumber,
  });
}

export function sendOtp(email: string) {
  return post<ResponseAPI<boolean>>(`/v1/otp/send`, {
    email: email,
  });
}

export type StartRegistrationReq = {
  firstName: string; lastName: string;
  documentType: string; documentNumber: string;
  email: string; phone: string;
  habeas: boolean; terms: boolean;
};
export type StartRegistrationRes = ResponseAPI<{ registrationId: string }>;

export function startRegistration(req: StartRegistrationReq) {
  return post<StartRegistrationRes>(`/v1/registration/start`, {
    FirstName: req.firstName,
    LastName: req.lastName,
    DocumentType: req.documentType,
    DocumentNumber: req.documentNumber,
    Email: req.email,
    Phone: req.phone,
    HabeasDataAccepted: req.habeas,
    TermsAccepted: req.terms,
  });
}

export type VerifyOtpReq = { email: string; code: string };
export type VerifyOtpRes = ResponseAPI<boolean>;

export function verifyOtp(req: VerifyOtpReq) {
  return post<VerifyOtpRes>(`/v1/registration/verify-otp`, {
    Email: req.email,
    Code: req.code,
  });
}

// ---------- STEP 2 ----------
export type SaveStep2Req = {
  registrationId: string;
  userType: "Residente" | "MenorEdad" | "VisitanteNacional" | "VisitanteExtranjero";
  hasCivica: boolean;
  civicaNumber?: string | null;
  contractAccepted: boolean;
  // ids de archivos o nombres (mock)
  documents: string[];
};
export type SaveStep2Res = ResponseAPI<boolean>;

export function saveStep2(req: SaveStep2Req) {
  return post<SaveStep2Res>(`/v1/registration/${req.registrationId}/type`, {
    UserType: req.userType,
    HasCivicaPersonalizada: req.hasCivica,
    CivicaNumber: req.civicaNumber ?? null,
    ContractAccepted: req.contractAccepted,
    Documents: req.documents,
  });
}

// ---------- STEP 3 ----------
export type SaveStep3Req = {
  registrationId: string;
  address: string;
  municipioId: number | string; // ID seleccionado
  comuna?: string | null;
  barrio?: string | null;
  ocupacion: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyKinship: string;
};
export type SaveStep3Res = ResponseAPI<string>;

export function saveStep3(req: SaveStep3Req) {
  return post<SaveStep3Res>(`/v1/registration/${req.registrationId}/extra`, {
    Address: req.address,
    MunicipioId: String(req.municipioId), // si tu API recibe nombre, cambia aquí
    Comuna: req.comuna ?? null,
    Barrio: req.barrio ?? null,
    Ocupacion: req.ocupacion,
    EmergencyName: req.emergencyName,
    EmergencyPhone: req.emergencyPhone,
    EmergencyKinship: req.emergencyKinship,
  });
}

// ---------- Catálogos ----------
export type Municipality = { id: number; name: string };
export function getMunicipalities() {
  return get<ResponseAPI<Municipality[]>>(`/v1/municipality`);
}

export type Neighborhood = { id: number; idMunicipality: number; name: string; commune: string };
export function getNeighborhoods(municipalityId: number | string) {
  return get<ResponseAPI<Neighborhood[]>>(`/v1/municipality/${encodeURIComponent(String(municipalityId))}/neighborhoods`);
}
