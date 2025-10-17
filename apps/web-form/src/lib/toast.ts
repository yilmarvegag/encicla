// apps\web-form\src\lib\toast.ts
import { toast } from "react-toastify";

export const notify = {
  success: (msg: string) => toast.success(msg),
  error:   (msg: string) => toast.error(msg),
  info:    (msg: string) => toast.info(msg),
  warn:    (msg: string) => toast.warn(msg),
  // Para promesas (loading->success/error)
  promise<T>(p: Promise<T>, msgs: { pending: string; success: string; error: string; }) {
    return toast.promise(p, {
      pending: msgs.pending,
      success: msgs.success,
      error:   msgs.error,
    });
  },
};
