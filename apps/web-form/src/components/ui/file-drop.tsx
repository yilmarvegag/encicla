'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpTrayIcon, DocumentIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

type FileDropProps = {
  id?: string;
  label: string;
  description?: string;
  accept?: string;           // e.g. "application/pdf,image/*"
  value?: File;
  error?: string;
  onChange: (file?: File) => void;
};

export function FileDrop({ id, label, description, accept, value, error, onChange }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // objectURL para preview (y cleanup)
  const previewUrl = useMemo(() => (value ? URL.createObjectURL(value) : ''), [value]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    onChange(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onChange(file);
  }

  const isImage = value?.type.startsWith('image/');
  const isPdf = value?.type === 'application/pdf';

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>

      <div
        onDragEnter={(e)=>{e.preventDefault(); setDragOver(true);}}
        onDragOver={(e)=>{e.preventDefault(); setDragOver(true);}}
        onDragLeave={(e)=>{e.preventDefault(); setDragOver(false);}}
        onDrop={handleDrop}
        className={[
          'relative rounded-xl border-2 border-dashed p-4 transition',
          dragOver ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 hover:border-slate-600',
          'bg-slate-800/50',
        ].join(' ')}
      >
        {/* Estado vacío */}
        {!value && (
          <button
            type="button"
            onClick={()=>inputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 py-6 text-slate-300 hover:text-slate-100"
          >
            <ArrowUpTrayIcon className="h-7 w-7" />
            <span className="text-sm">Arrastra y suelta el archivo aquí</span>
            <span className="text-xs opacity-70">o haz clic para seleccionar</span>
          </button>
        )}

        {/* Con archivo */}
        {value && (
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              {isImage ? (
                <img src={previewUrl} alt="preview" className="h-16 w-16 object-cover rounded-md border border-slate-700" />
              ) : isPdf ? (
                <div className="h-16 w-16 grid place-content-center rounded-md border border-slate-700">
                  <DocumentIcon className="h-8 w-8" />
                </div>
              ) : (
                <div className="h-16 w-16 grid place-content-center rounded-md border border-slate-700">
                  <PhotoIcon className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm">{value.name}</div>
              <div className="text-xs opacity-70">{(value.size/1024/1024).toFixed(2)} MB</div>
              {isPdf && (
                <a href={previewUrl} target="_blank" rel="noreferrer" className="text-xs text-sky-400 hover:underline">
                  Ver PDF
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={()=>inputRef.current?.click()}
                className="px-3 py-1 rounded-lg border border-slate-700 hover:border-slate-600 text-sm"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={()=>onChange(undefined)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700"
                aria-label="Quitar archivo"
                title="Quitar archivo"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          onChange={handleSelect}
          className="sr-only"
        />
      </div>

      {!!description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
      {!!error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
