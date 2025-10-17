//formdata.util.ts
export function dataUrlToFile(dataUrl: string, filename: string, mime = "image/png") {
  const arr = dataUrl.split(",");
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  return new File([u8], filename, { type: mime });
}

// Si pasas string (dataURL) o File | undefined ⇒ devuelve File | undefined
export function ensureFile(v: unknown, filename: string, mime?: string): File | undefined {
  if (!v) return undefined;
  if (typeof v === "string" && v.startsWith("data:")) return dataUrlToFile(v, filename, mime);
  if (v instanceof File) return v;
  return undefined;
}
