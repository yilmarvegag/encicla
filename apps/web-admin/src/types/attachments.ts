// types/attachments.ts
export type AttachmentFile = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  lastModified: string;
  url: string;
};

export type AttachmentsGrouped = Record<string, AttachmentFile[]>;

// Íconos y labels por categoría
export const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  signed:    { label: 'Contrato firmado', icon: '📄' },
  id:        { label: 'Documento de identidad', icon: '🪪' },
  passport:  { label: 'Pasaporte', icon: '📘' },
  guardian:  { label: 'Acudiente', icon: '👨‍👧' },
  biometric: { label: 'Foto biométrica', icon: '🤳' },
  signature: { label: 'Firma', icon: '✍️' },
};