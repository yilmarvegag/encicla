"use client";
import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";
import { PDFDocument } from "pdf-lib";
import { notify } from "@/lib/toast";

type Props = {
  onChange: (dataUrl: string) => void; // PNG de la firma
  onPdf: (file: File) => void; // PDF firmado
  contractUrl?: string; // pdf base
};

export function ContractSign({
  onChange,
  onPdf,
  contractUrl = "/contract/encicla-contract.pdf",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const pad = new SignaturePad(canvasRef.current, {
      minWidth: 1.2,
      maxWidth: 2.6,
      backgroundColor: "rgba(0,0,0,0)",
    });
    sigRef.current = pad;
    const resize = () => {
      const c = canvasRef.current!;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      c.width = c.offsetWidth * ratio;
      c.height = 160 * ratio;
      c.getContext("2d")!.scale(ratio, ratio);
      pad.clear();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  async function handleSave() {
    const pad = sigRef.current!;
    if (pad.isEmpty()) return alert("Firma vacía");
    const dataUrl = pad.toDataURL("image/png");
    onChange(dataUrl);

    // 1) Cargar y firmar el PDF
    const base = await fetch(contractUrl).then((r) => r.arrayBuffer());
    const pdf = await PDFDocument.load(base);
    const png = await pdf.embedPng(dataUrl);
    const last = pdf.getPage(pdf.getPageCount() - 1);
    const { width } = last.getSize();
    const imgW = 220,
      imgH = (png.height / png.width) * imgW;
    last.drawImage(png, {
      x: (width - imgW) / 2,
      y: 80,
      width: imgW,
      height: imgH,
    });

    // 2) Guardar => Uint8Array
    const bytes = await pdf.save(); // Uint8Array<ArrayBufferLike>

    // 3) Convertir a ArrayBuffer "puro" (respetando offset y length)
    const ab = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;

    // 4) Crear Blob/File sin quejarse TS
    const blob = new Blob([ab], { type: "application/pdf" });
    const file = new File([blob], "contract-signed.pdf", {
      type: "application/pdf",
    });

    onPdf(file);
    // console.log("PDF firmado", file, blob, ab, bytes);
    notify.success("¡Firma guardada!");
  }

  function clear() {
    sigRef.current?.clear();
  }

  return (
    <div className="grid gap-2">
      <div className="rounded-xl border border-slate-700 bg-white p-2">
        <canvas ref={canvasRef} className="w-full h-40" />
      </div>
      <div className="flex gap-2">
        <button type="button" className="btn" onClick={handleSave}>
          Guardar firma
        </button>
        <button type="button" className="btn" onClick={clear}>
          Limpiar
        </button>
      </div>
      <p className="text-xs opacity-70">
        Traza tu firma y presiona “Guardar firma”.
      </p>
    </div>
  );
}
