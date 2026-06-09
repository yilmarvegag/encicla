// apps\web-form\src\lib\toast.ts
import { toast } from "react-toastify";

// Definimos un tipo para reutilizar las opciones comunes si lo deseas
interface NotifyOptions {
  autoClose?: boolean;
}

export const notify = {
  // Si autoClose es false, pasamos false. Si es true o no se envía, pasamos undefined (usa el valor por defecto de la librería)
  success: (msg: string, options?: NotifyOptions) => 
    toast.success(msg, { autoClose: options?.autoClose ?? true ? undefined : false }),

  error: (msg: string, options?: NotifyOptions) => 
    toast.error(msg, { autoClose: options?.autoClose ?? true ? undefined : false }),

  info: (msg: string, options?: NotifyOptions) => 
    toast.info(msg, { autoClose: options?.autoClose ?? true ? undefined : false }),

  warn: (msg: string, options?: NotifyOptions) => 
    toast.warn(msg, { autoClose: options?.autoClose ?? true ? undefined : false }),
  
  // Para promesas aplicamos la misma lógica a cada estado
  promise<T>(
    p: Promise<T>, 
    msgs: { pending: string; success: string; error: string; },
    options?: NotifyOptions
  ) {
    const shouldClose = options?.autoClose ?? true ? undefined : false;

    return toast.promise(p, {
      pending: {
        render: msgs.pending,
        autoClose: shouldClose,
      },
      success: {
        render: msgs.success,
        autoClose: shouldClose,
      },
      error: {
        render: msgs.error,
        autoClose: shouldClose,
      },
    });
  },
};
