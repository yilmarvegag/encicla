//formdata.util.ts
export function dataUrlToFile(dataUrl: string, filename: string): File {
  // data:[mime];base64,XXXX
  const [header, base64] = dataUrl.split(',');
  const match = /^data:(.*?);base64$/.exec(header);
  const mime = match?.[1] ?? 'application/octet-stream';
  const bin = atob(base64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  return new File([blob], filename, { type: mime });
}

// Si pasas string (dataURL) o File | undefined ⇒ devuelve File | undefined
export function ensureFile(v: unknown, filename: string, mime?: string): File | undefined {
  if (!v) return undefined;
  if (typeof v === "string" && v.startsWith("data:")) return dataUrlToFile(v, filename);
  if (v instanceof File) return v;
  return undefined;
}
