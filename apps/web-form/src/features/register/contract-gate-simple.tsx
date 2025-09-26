'use client';
import { useEffect, useRef, useState } from 'react';
import { getReadSecondsFromEnv } from '@/lib/env';

type Props = {
  onAccept: () => void;
  /** override opcional; si no lo pasas, se toma del env */
  minSeconds?: number;
  /** qué tan cerca del fondo cuenta como “fin” (0–1) */
  bottomEpsilon?: number;
  /** alto del contenedor */
  height?: number;
};

export function ContractGateSimple({
  onAccept,
  minSeconds = getReadSecondsFromEnv(), // ← usa env por defecto
  bottomEpsilon = 8,                     // px desde el fondo
  height = 450,                          // 72 * 4 = 288px
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [timeOk, setTimeOk] = useState(false);
  const [endOk, setEndOk] = useState(false);
  const [done, setDone] = useState(false); // evita múltiples llamadas

  // reloj mínimo de lectura
  useEffect(() => {
    const t = setTimeout(() => setTimeOk(true), minSeconds * 1000);
    return () => clearTimeout(t);
  }, [minSeconds]);

  // detectar scroll cercano al final
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - bottomEpsilon;
      if (nearBottom) setEndOk(true);
    };

    // chequeo inicial (por si ya está al fondo)
    onScroll();
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [bottomEpsilon]);

  // habilitar cuando se cumplan ambas condiciones
  useEffect(() => {
    if (!done && timeOk && endOk) {
      setDone(true);
      onAccept();
    }
  }, [timeOk, endOk, done, onAccept]);

  return (
    <div className="rounded-xl border border-slate-700">
      <div ref={boxRef} className="overflow-auto bg-slate-950 rounded-xl" style={{ height }}>
        {/* Usamos <object>; el gate lo controla el contenedor */}
        <object data="/contract/encicla-contract.pdf" type="application/pdf" className="w-full ro" style={{ height }} />
        {/* “Relleno” para asegurar que haya algo tras el <object> en el flujo del scroll */}
        <div style={{ height: 1 }} />
      </div>
      <p className="p-3 text-sm opacity-80">
        Lee el documento y desplázate hasta el final. (Tiempo mínimo: {minSeconds}s)
      </p>
    </div>
  );
}
