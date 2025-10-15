"use client";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { Step2Values } from "./schemas";
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
// import Image from "next/image";

type UploadName = "idDoc" | "passportFile" | "guardianId" | "authorizationLetter";

type SpecItem = {
  name: UploadName;
  label: string;
  accept: string; // "application/pdf,image/*" o "application/pdf"
  hint?: string;
  maxSizeMB?: number;
};

// Campos obligatorios por tipo de usuario (para asterisco y UX)
const REQUIRED_BY_TYPE: Record<Step2Values["userType"], UploadName[]> = {
  Residente: ["idDoc"],
  VisitanteNacional: ["idDoc"],
  VisitanteExtranjero: ["passportFile"],
  MenorEdad: ["idDoc", "guardianId", "authorizationLetter"],
};

// Especificación de campos por tipo de usuario
const SPEC_BY_TYPE: Record<Step2Values["userType"], SpecItem[]> = {
  Residente: [
    { name: "idDoc", label: "Documento de identidad", accept: "application/pdf,image/*" },
  ],
  VisitanteNacional: [
    { name: "idDoc", label: "Documento de identidad", accept: "application/pdf,image/*" },
  ],
  VisitanteExtranjero: [
    { name: "passportFile", label: "Pasaporte (PDF o imagen)", accept: "application/pdf,image/*" },
  ],
  MenorEdad: [
    { name: "idDoc", label: "Tarjeta de identidad", accept: "application/pdf,image/*" },
    { name: "guardianId", label: "Documento del acudiente", accept: "application/pdf,image/*" },
    { name: "authorizationLetter", label: "Carta de autorización (PDF)", accept: "application/pdf" },
  ],
};

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
function isImage(file?: File) {
  return !!file && file.type.startsWith("image/");
}

/** Campo individual con drag & drop + preview + validación inmediata */
function UploadField({ name, label, accept, hint, maxSizeMB = 10 }: SpecItem) {
  const {
    setValue,
    watch,
    trigger,
    formState: { errors },
    clearErrors,
  } = useFormContext<Step2Values>();
  const file = watch(name) as File | undefined;

  const [dragOver, setDragOver] = useState(false);
  const inputId = useMemo(() => `up-${name}`, [name]);
  const [, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isImage(file)) {
      const url = URL.createObjectURL(file!);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  function handleFiles(fs: FileList | null) {
    if (!fs?.[0]) return;
    const f = fs[0];

    // Validaciones rápidas (client)
    const okType = accept.split(",").some((a) =>
      a.trim() === "image/*"
        ? f.type.startsWith("image/")
        : a.trim() === "application/pdf"
        ? f.type === "application/pdf"
        : true
    );
    if (!okType) {
      alert("Tipo de archivo no permitido.");
      return;
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      alert(`Tamaño máximo ${maxSizeMB}MB`);
      return;
    }

    setValue(name, f as object, { shouldValidate: true });
    clearErrors(name);
    void trigger(name);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  const hasError = !!errors[name];

  return (
    <div className="grid gap-1">
      <label htmlFor={inputId} className="text-sm">
        {label}
      </label>

      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          "relative flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition",
          dragOver
            ? "border-sky-500 bg-sky-500/10"
            : hasError
            ? "border-red-600 bg-red-900/10"
            : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50",
        ].join(" ")}
        aria-invalid={hasError}
      >
        <div className="shrink-0">
          <ArrowUpTrayIcon className="h-6 w-6 opacity-80" />
        </div>

        <div className="flex-1 text-sm">
          <p className="font-medium">
            {file ? "Archivo seleccionado" : "Arrastra y suelta o haz clic para subir"}
          </p>
          <p className="opacity-70 text-xs">
            {file ? `${file.name} — ${formatBytes(file.size)}` : hint ?? "PDF o imagen (máx. 10MB)"}
          </p>
        </div>

        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setValue(name, undefined as any, { shouldValidate: true });
              void trigger(name);
            }}
            className="rounded-lg p-1.5 hover:bg-slate-700"
            aria-label="Quitar archivo"
            title="Quitar archivo"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}

        {/* Preview imagen */}
        {/* {file && isImage(file) && previewUrl && (
          <Image
            src={previewUrl}
            width={100}
            height={100}
            alt="preview"
            className="absolute right-12 top-1/2 -translate-y-1/2 h-10 w-10 rounded-md object-cover border border-slate-700"
          />
        )} */}

        {/* Indicador PDF */}
        {/* {file && !isImage(file) && (
          <DocumentArrowDownIcon
            className="absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8 opacity-70"
            aria-hidden
          />
        )} */}

        {file && (
          <DocumentArrowDownIcon
            className="absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8 opacity-70"
            aria-hidden
          />
        )}

      </label>

      <input
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {hasError && (
        <p className="text-xs text-red-400">
          {String(errors[name]?.message ?? "Archivo requerido")}
        </p>
      )}
    </div>
  );
}

export function IdDocsUploader() {
  const { watch } = useFormContext<Step2Values>();
  const userType = watch("userType");

  const items = useMemo<SpecItem[]>(() => {
    const spec = SPEC_BY_TYPE[userType] ?? SPEC_BY_TYPE.Residente;
    const requiredSet = new Set(REQUIRED_BY_TYPE[userType] ?? []);
    // agrega asterisco a los obligatorios
    return spec.map((s) => ({
      ...s,
      label: `${s.label}${requiredSet.has(s.name) ? " *" : ""}`,
      maxSizeMB: s.maxSizeMB ?? 10,
    }));
  }, [userType]);

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <UploadField key={it.name} {...it} />
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs opacity-70 mt-1">
        <PhotoIcon className="h-4 w-4" />
        <span>Admite JPG/PNG y PDF — máximo 10MB por archivo.</span>
      </div>
    </div>
  );
}
