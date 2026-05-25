//apps\web-admin\src\components\edit-user-dialog.tsx
import { getUser, updateUser } from "@/lib/admin.service";
import { EnciclaUserDto } from "@/types/user";
import { useState } from "react";


export function EditUserDialog({
  userId,
  onSaved
}: {
  userId: string;
  onSaved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<EnciclaUserDto | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    direccion: '',
    municipio: '',
    departamento: '',
    ocupacion: '',
    documento: '',
    telefono: '',
  });

  async function openDialog() {
    setOpen(true);
    if (!data) {
      const u = await getUser(userId);
      setData(u);
      setForm({
        firstName: u.firstName ?? '',
        lastName:  u.lastName ?? '',
        email:     u.email ?? '',
        direccion: u.direccion ?? '',
        municipio: u.municipio ?? '',
        departamento: u.departamento ?? '',
        ocupacion: u.ocupacion ?? '',
        documento: u.documento ?? '',
        telefono:  u.telefono ?? u.phoneNumber ?? '',
      });
    }
  }

  async function save() {
    setBusy(true);
    try {
      const response = await updateUser(userId, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        address: form.direccion,
        ocupation: form.ocupacion,
        document: form.documento,
        phone: form.telefono,
        id: userId,
      });
      alert(response.message || 'Usuario actualizado correctamente.');
      setOpen(false);
      onSaved?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="btn bg-sky-600 hover:bg-sky-500" onClick={openDialog}>Editar</button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Editar usuario</h3>
              <button className="btn" onClick={() => setOpen(false)}>Cerrar</button>
            </div>

            <div className="grid gap-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Nombre</label>
                  <input className="input" value={form.firstName}
                         onChange={e=>setForm(f=>({...f, firstName:e.target.value}))}/>
                </div>
                <div>
                  <label className="text-sm">Apellido</label>
                  <input className="input" value={form.lastName}
                         onChange={e=>setForm(f=>({...f, lastName:e.target.value}))}/>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Correo</label>
                  <input className="input" value={form.email}
                         onChange={e=>setForm(f=>({...f, email:e.target.value}))}/>
                </div>
                <div>
                  <label className="text-sm">Documento</label>
                  <input className="input" value={form.documento}
                         onChange={e=>setForm(f=>({...f, documento:e.target.value}))}/>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Celular/Teléfono</label>
                  <input className="input" value={form.telefono}
                         onChange={e=>setForm(f=>({...f, telefono:e.target.value}))}/>
                </div>
                <div>
                  <label className="text-sm">Ocupación</label>
                  <input className="input" value={form.ocupacion}
                         onChange={e=>setForm(f=>({...f, ocupacion:e.target.value}))}/>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className='w-full'>
                  <label className="text-sm">Dirección</label>
                  <input className="input" value={form.direccion}
                         onChange={e=>setForm(f=>({...f, direccion:e.target.value}))}/>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button className="btn bg-slate-700 hover:bg-slate-600" onClick={() => setOpen(false)}>Cancelar</button>
                <button className="btn" onClick={save} disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
