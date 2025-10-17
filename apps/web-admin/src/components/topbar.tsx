// apps/web-admin/src/components/topbar.tsx
'use client';
import { getToken, logout } from '@/lib/auth';
import { useState, useEffect } from 'react';

export function TopBar() {
    
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const check = () => setVisible(!!getToken());
    check();
    const i = setInterval(check, 1000); // o escucha 'visibilitychange'
    return () => clearInterval(i);
  }, []);
  if (!visible) return null;

  async function onLogout() {
    await logout();
    // router.replace('/auth/login')  // opcional, location.replace ya redirige
  }
  
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold">Encicla — Admin</h1>
        <button onClick={onLogout} className="rounded-lg bg-slate-800 px-3 py-1.5 hover:bg-red-500">
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
