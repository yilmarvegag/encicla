// === Respuesta del endpoint /api/admin/users ===
export interface ApiResponse<T> {
  type: string;
  title: string;   // "OK"
  status: number;  // 200
  instance: string;
  message: string;
  data: T;
  errors: unknown[];
}