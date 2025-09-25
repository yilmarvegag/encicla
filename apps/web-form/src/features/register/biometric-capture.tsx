"use client";
import { CameraIcon } from "@heroicons/react/16/solid";
import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Unified detector interface + factory (Native FaceDetector → fallback MediaPipe)
// ─────────────────────────────────────────────────────────────────────────────
type FaceDetectorLike = {
  detect: (
    src: HTMLCanvasElement | HTMLVideoElement
  ) => Promise<{ detections: any[] }>;
  close?: () => void | Promise<void>;
};

let detectorPromise: Promise<FaceDetectorLike> | null = null;

async function getFaceDetector(): Promise<FaceDetectorLike> {
  if (detectorPromise) return detectorPromise;

  detectorPromise = (async () => {
    // 1) Nativo si existe
    const NativeFD: any = (window as any).FaceDetector;
    if (NativeFD) {
      const fd = new NativeFD({ fastMode: true, maxDetectedFaces: 1 });
      return {
        detect: async (src) => ({
          detections: (await fd.detect(src as any)) ?? [],
        }),
        close: () => {},
      };
    }

    // 2) Fallback MediaPipe (modelo correcto + delegate por env)
    const { FaceDetector, FilesetResolver } = await import(
      "@mediapipe/tasks-vision"
    );

    const wasmUrl =
      process.env.NEXT_PUBLIC_FACE_WASM_URL ??
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

    const modelUrl =
      process.env.NEXT_PUBLIC_FACE_MODEL_URL ??
      "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

    const delegate =
      (process.env.NEXT_PUBLIC_FACE_DELEGATE as "CPU" | "GPU" | undefined) ??
      "CPU";

    const filesetResolver = await FilesetResolver.forVisionTasks(wasmUrl);
    const det = await FaceDetector.createFromOptions(filesetResolver, {
      baseOptions: { modelAssetPath: modelUrl, delegate }, // CPU por defecto
      runningMode: "IMAGE",
      minDetectionConfidence: 0.5,
    });

    return {
      detect: async (src) => {
        const res = await det.detect(src as any);
        return { detections: res?.detections ?? [] };
      },
      close: () => det.close(),
    };
  })();

  return detectorPromise;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
export function BiometricCapture({
  onOk,
}: {
  onOk: (imgDataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Pide cámara
  useEffect(() => {
    // inicializa en background; silencia errores transitorios
    getFaceDetector().catch(() => {});
    let stream: MediaStream | undefined;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        // setError("No se pudo acceder a la cámara.");
      }
    })();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Contexto con willReadFrequently (adiós warning de getImageData)
  function ensureCtx() {
    if (!canvasRef.current) return null;
    if (!ctxRef.current) {
      ctxRef.current = canvasRef.current.getContext("2d", {
        willReadFrequently: true,
      }) as CanvasRenderingContext2D | null;
    }
    return ctxRef.current;
  }

  async function analyzeAndCapture() {
    setError(null);
    if (!videoRef.current || !canvasRef.current) return;

    const v = videoRef.current;
    const c = canvasRef.current;
    const ctx = ensureCtx();
    if (!ctx) return;

    // Pintamos frame actual
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    ctx.drawImage(v, 0, 0, c.width, c.height);

    // ── Chequeo de iluminación ───────────────────────────────────────────────
    const img = ctx.getImageData(0, 0, c.width, c.height);
    let sum = 0;
    for (let i = 0; i < img.data.length; i += 4) {
      sum +=
        0.2126 * img.data[i] +
        0.7152 * img.data[i + 1] +
        0.0722 * img.data[i + 2];
    }
    const lum = sum / (img.data.length / 4); // 0..255
    if (lum < 60) {
      setError("Iluminación insuficiente. Acércate a una fuente de luz.");
      return;
    }

    // ── Detección de rostro (Native → fallback MediaPipe) ────────────────────
    try {
      const detector = await getFaceDetector();
      const res = await detector.detect(c);
      if (!res.detections || res.detections.length === 0) {
        setError("No se detectó rostro. Centra tu cara en la cámara.");
        return;
      }
    } catch {
      setError("No se pudo cargar el detector de rostro. Verifica conexión.");
      return;
    }

    // OK → devolvemos imagen
    const dataUrl = c.toDataURL("image/jpeg", 0.9);
    setResult(dataUrl);
    onOk(dataUrl);
  }

  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-700 p-2 bg-slate-900 flex justify-center">
          <video
            ref={videoRef}
            className="rounded-md"
            playsInline
            muted
          />
        </div>
        {result && (
          <div className="rounded-xl border border-slate-700 p-2 bg-slate-900 flex justify-center">
            <img
              src={result}
              alt="biometría"
              className="mt-2  rounded-md border border-slate-700"
            />
          </div>
        )}

        {/* canvas oculto */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="gap-3 flex flex-col items-start md:flex-row md:items-center">
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!error && (
          <p className="text-xs opacity-70">
            Requiere buena iluminación y rostro centrado.
          </p>
        )}

        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={analyzeAndCapture}
            disabled={!ready}
            aria-label="Capturar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full
               bg-sky-600 hover:bg-sky-500 active:bg-sky-700
               disabled:opacity-50 disabled:cursor-not-allowed
               focus:outline-none focus:ring-2 focus:ring-sky-500"
            title="Capturar"
          >
            <CameraIcon className="h-5 w-5" />
            <span className="sr-only">Capturar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
