// Config global (ajustar segun necesidad, por ahora 2 minutos de inactividad)
export const IDLE_MINUTES = Number(process.env.NEXT_PUBLIC_IDLE_MINUTES ?? 20);
export const EXP_SOON_SECONDS = 120; // si faltan < 2 min para expirar, cerrar

import { logout, getExpiration } from '@/lib/auth';
// Hook para usar en el layout del admin
import { useEffect, useRef } from 'react';


export function useIdleLogout() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beat = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => logout(), IDLE_MINUTES * 60 * 1000);
    }

    function onActivity() { reset(); }

    // Eventos que consideramos actividad, pueden ajustarse
    const evs: (keyof DocumentEventMap | keyof WindowEventMap)[] = [
      'mousemove','mousedown','keydown','scroll','touchstart','visibilitychange'
    ];
    evs.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    // pulso para revisar expiración del token
    beat.current = setInterval(() => {
      const exp = getExpiration();
      if (!exp) return;
      const left = exp.getTime() - Date.now();
      if (left <= EXP_SOON_SECONDS * 1000) logout(); // o mostrar modal de renovar, pero en este caso cerramos, no se comtemplo el modal
    }, 60 * 1000);

    reset(); // inicia

    return () => {
      evs.forEach((e) => window.removeEventListener(e, onActivity));
      if (timer.current) clearTimeout(timer.current);
      if (beat.current) clearInterval(beat.current);
    };
  }, []);
}
