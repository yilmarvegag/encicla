// components/AttachmentsViewer.tsx
"use client";
import { useState } from "react";
import type { AttachmentsGrouped, AttachmentFile } from "@/types/attachments";
import { CATEGORY_META } from "@/types/attachments";
import { getAttachments } from "@/lib/admin.service";
import { ArrowDownTrayIcon, DocumentIcon, PaperClipIcon, XMarkIcon } from "@heroicons/react/24/outline";

// ── helpers ──────────────────────────────────────────────────────────────────
const isImage = (ct: string) => ct.startsWith("image/");
const isPdf = (ct: string) => ct === "application/pdf";
const fmtSize = (b: number) =>
  b < 1024
    ? `${b} B`
    : b < 1048576
      ? `${(b / 1024).toFixed(1)} KB`
      : `${(b / 1048576).toFixed(1)} MB`;

// ── sub-componente: preview de un archivo ────────────────────────────────────
function FileCard({ file }: { file: AttachmentFile }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-lg border border-slate-700 bg-encicla
                   hover:border-slate-300 transition-colors overflow-hidden"
      >
        {/* Thumbnail */}
        <div className="flex h-32 items-center justify-center bg-slate-900">
          {isImage(file.contentType) ? (
            <img
              src={file.url}
              alt={file.fileName}
              className="h-full w-full object-cover"
            />
          ) : isPdf(file.contentType) ? (
            <span className="text-4xl"><DocumentIcon /></span>
          ) : (
            <span className="text-4xl"><PaperClipIcon /></span>
          )}
        </div>

        {/* Info */}
        <div className="p-2">
          <p className="truncate text-xs font-medium text-slate-200">
            {file.fileName}
          </p>
          <p className="text-xs text-black">{fmtSize(file.sizeBytes)}</p>
        </div>
      </div>

      {/* Modal preview */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl w-full mx-4 rounded-xl
                       bg-slate-900 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <span className="text-sm font-medium text-slate-200">
                {file.fileName}
              </span>
              <div className="flex gap-2">
                <a
                  href={file.url}
                  download={file.fileName}
                  className="rounded px-3 py-1 text-xs bg-slate-700 hover:bg-green-500 text-slate-200 gap-2 flex items-center"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Descargar
                </a>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded px-3 py-1 text-xs bg-slate-700 hover:bg-red-500 text-slate-200 gap-2 flex items-center"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cerrar
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex items-center justify-center p-4 overflow-auto max-h-[80vh]">
              {isImage(file.contentType) && (
                <img
                  src={file.url}
                  alt={file.fileName}
                  className="max-h-[75vh] object-contain rounded"
                />
              )}
              {isPdf(file.contentType) && (
                <iframe
                  src={file.url}
                  className="w-full h-[75vh] rounded"
                  title={file.fileName}
                />
              )}
              {!isImage(file.contentType) && !isPdf(file.contentType) && (
                <div className="text-center text-slate-400">
                  <p className="text-5xl mb-3"><PaperClipIcon /></p>
                  <p className="text-sm">Vista previa no disponible</p>
                  <a
                    href={file.url}
                    download
                    className="mt-3 inline-block text-blue-400 underline text-sm"
                  >
                    Descargar archivo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── componente principal ──────────────────────────────────────────────────────
export function AttachmentsViewer({ userId }: { userId: string }) {
  const [data, setData]       = useState<AttachmentsGrouped | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [opened, setOpened]   = useState(false);

  async function handleOpen() {
    setOpened(true);
    if (data) return; // ya cargado, no vuelve a pedir

    setLoading(true);
    setError(null);
    try {
      const result = await getAttachments(userId);
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Botón que dispara la carga */}
      <button
        onClick={handleOpen}
        className="rounded px-3 py-1 text-xs font-bold bg-slate-700 hover:bg-encicla text-slate-200"
      >
        {/* <PaperClipIcon className="h-4 w-4" /> */}
        Ver adjuntos
      </button>

      {/* Panel / modal — solo se monta si se hizo clic */}
      {opened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
             onClick={() => setOpened(false)}>
          <div className="relative w-full max-w-3xl mx-4 rounded-xl bg-slate-900
                          shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
               onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <span className="text-lg font-semibold text-slate-200">Adjuntos del usuario</span>
              <button onClick={() => setOpened(false)}
                      className="text-slate-400 hover:text-slate-200 text-lg leading-none">✕</button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-4 space-y-6">
              {loading && <p className="text-slate-400 text-sm">Cargando adjuntos…</p>}
              {error   && <p className="text-rose-400 text-sm">Error: {error}</p>}
              {!loading && !error && data && Object.keys(data).length === 0 && (
                <p className="text-slate-500 text-sm">Sin adjuntos registrados.</p>
              )}
              {data && Object.entries(data).map(([category, files]) => {
                const meta = CATEGORY_META[category] ?? { label: category, icon: '📁' };
                return (
                  <section key={category}>
                    <h3 className="mb-3 text-sm font-semibold text-slate-300 flex items-center gap-2">
                      {meta.icon} {meta.label}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {files.map(f => <FileCard key={f.fileName} file={f} />)}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}