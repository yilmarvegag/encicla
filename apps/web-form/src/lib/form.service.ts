// apps/web-form/src/lib/api.ts
import { ResponseData } from "@/types/api.type";
import { apiService } from "./api.service";
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

export type StartRegistrationReq = {
  firstName: string; lastName: string;
  documentType: string; documentNumber: string;
  email: string; phone: string;
  habeas: boolean; terms: boolean;
};
export type StartRegistrationRes = ResponseData<{ registrationId: string }>;

export function startRegistration(req: StartRegistrationReq) {
  return apiService.post<StartRegistrationRes>(`/v1/registration/start`, {
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
export type VerifyOtpRes = ResponseData<boolean>;

export function verifyOtp(req: VerifyOtpReq) {
  return apiService.post<VerifyOtpRes>(`/v1/registration/verify-otp`, {
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
export type SaveStep2Res = ResponseData<boolean>;

export function saveStep2(req: SaveStep2Req) {
  return apiService.post<SaveStep2Res>(`/v1/registration/${req.registrationId}/type`, {
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
export type SaveStep3Res = ResponseData<string>;

export function saveStep3(req: SaveStep3Req) {
  return apiService.post<SaveStep3Res>(`/v1/registration/${req.registrationId}/extra`, {
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
  return apiService.get<ResponseData<Municipality[]>>(`/v1/municipality`);
}

export type Neighborhood = { id: number; idMunicipality: number; name: string; commune: string };
export function getNeighborhoods(municipalityId: number | string) {
  return apiService.get<ResponseData<Neighborhood[]>>(`/v1/municipality/${encodeURIComponent(String(municipalityId))}/neighborhoods`);
}
