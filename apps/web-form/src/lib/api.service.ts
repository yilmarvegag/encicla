// apps/web-form/src/lib/http.ts
const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://encicla-api-qa.onrender.com/api";
// const authToken = process.env.NEXT_PUBLIC_WS_AUTH_TOKEN ?? "";

import axios, { AxiosRequestConfig, AxiosError } from "axios";
import CircuitBreaker from "opossum";
import retry from "async-retry";
import { error } from "console";

if (!API_URL) {
  console.info("NEXT_PUBLIC_API_BASE_URL is not defined"); // Fallará en build si no está seteada
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // Aumentado a 8s (debe ser menor que el timeout del Circuit Breaker)
});

// Configuración mejorada del Circuit Breaker
const circuitBreakerOptions = {
  timeout: 45000, // Timeout mayor que el de Axios
  errorThresholdPercentage: 50,
  resetTimeout: 60000,
  rollingCountTimeout: 30000, // Ventana de evaluación de errores
  rollingCountBuckets: 15, // Más precisión en métricas
  errorFilter: (error: Error) => {
    // No contar ciertos errores como fallos
    if (axios.isAxiosError(error)) {
      // No abrir el circuito por errores 4xx (excepto 429)
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500 &&
        error.response.status !== 429
      ) {
        return true; // Filtrar estos errores
      }
    }
    return false; // Contar otros errores
  },
};

const requestBreaker = new CircuitBreaker(
  async (config: AxiosRequestConfig) => {
    return await apiClient.request(config);
  },
  circuitBreakerOptions
);

// Eventos para monitoreo (opcional pero recomendado)
// requestBreaker.on("open", () => console.warn("Circuit Breaker abierto - Servicio no disponible"));
// requestBreaker.on("halfOpen", () => console.info("Circuit Breaker medio abierto - Probando recuperación"));
// requestBreaker.on("close", () => console.info("Circuit Breaker cerrado - Servicio recuperado"));

requestBreaker.on("failure", (err) =>
  console.error("CB Failure:", err.message)
);
requestBreaker.on("timeout", () => console.warn("CB Timeout exceeded"));

requestBreaker.fallback(() =>
  Promise.reject(
    Object.assign(
      new Error(
        "Servicio no disponible temporalmente. Por favor intente más tarde."
      ),
      { isCircuitBreakerError: true }
    )
  )
);

// si se necesita el interceptor de request, para autenticación, descomentar
// const PUBLIC_ENDPOINTS = ["/auth/login"];
// apiClient.interceptors.request.use(
//   (config) => {
//     const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
//       config.url?.startsWith(endpoint)
//     );
//     if (!isPublicEndpoint) {
//       const token = localStorage.getItem("token");
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// si se necesita el interceptor de response, para manejo global de errores de autenticación, si se activa, descomentar
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       window.location.href = "/auth";
//     }
//     return Promise.reject(error);
//   }
// );

function isCircuitBreakerError(
  error: unknown
): error is Error & { isCircuitBreakerError: boolean } {
  return error instanceof Error && "isCircuitBreakerError" in error;
}

const handleRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    return await retry(
      async (bail) => {
        try {
          const response = await requestBreaker.fire(config);
          return response.data;
        } catch (error: unknown) {
          // Manejo específico de errores de Axios
          if (axios.isAxiosError(error)) {
            // No reintentar para timeouts explícitos
            if (error.code === "ECONNABORTED") {
              bail(
                new Error(
                  `Timeout: La petición excedió los ${apiClient.defaults.timeout}ms`
                )
              );
              return;
            }

            // No reintentar para errores 4xx (excepto 429)
            if (error.response) {
              if (error.response.status === 429) {
                // Manejo especial para rate limiting
                const retryAfter = error.response.headers["retry-after"] || 5;
                await new Promise((resolve) =>
                  setTimeout(resolve, retryAfter * 1000)
                );
                throw error; // Reintentar después de esperar
              }

              if (
                error.response.status >= 400 &&
                error.response.status <= 500
              ) {
                console.error("Server 4xx payload:", {
                  url: config.url,
                  status: error.response.status,
                  data: error.response.data,
                });
                bail(error|| error);
                return;
              }
            }
          }

          // No reintentar para errores del Circuit Breaker
          if (isCircuitBreakerError(error)) {
            bail(error);
            return;
          }

          // No reintentar para errores de red sin respuesta
          if (
            !axios.isAxiosError(error) &&
            error instanceof Error &&
            error.message.includes("Network Error")
          ) {
            bail(new Error("Error de conexión de red"));
            return;
          }

          throw error; // Solo reintentar para errores 5xx
        }
      },
      {
        retries: 2, // 2 reintentos = 3 intentos totales
        minTimeout: 2000, // Primer reintento después de 2s
        maxTimeout: 10000, // Tiempo máximo entre reintentos
        factor: 2, // Backoff exponencial
        onRetry: (error: Error, attempt: number) => {
          console.warn(
            `Reintento ${attempt} para ${config.method?.toUpperCase()} ${config.url}: ${error.message}`
          );
        },
      }
    );
  } catch (error: unknown) {
    // console.error(
    //   `Error final ${config.method?.toUpperCase()} ${config.url}:`,
    //   error instanceof Error ? error.message : "Error desconocido"
    // );

    // Manejo especial para errores del Circuit Breaker
    if (isCircuitBreakerError(error)) {
      // Aquí puedes agregar notificaciones al usuario
      console.warn(
        "El servicio está temporalmente inaccesible (Circuito abierto)"
      );
    }

    throw error;
  }
};

export const apiService = {
  get: <T>(endpoint: string, params?: Record<string, unknown>) =>
    handleRequest<T>({ method: "get", url: endpoint, params }),

  post: <T>(endpoint: string, data: unknown) =>
    handleRequest<T>({ method: "post", url: endpoint, data }),

  postForm: <T>(endpoint: string, form: FormData) =>
    handleRequest<T>({
      method: "post",
      url: endpoint,
      data: form,
      // headers: { "Content-Type": "multipart/form-data" }, // axios detecta boundaries
      // headers: {
      //   "Content-Type": "application/json",
      //   "Authorization": authToken
      // },
      headers: {}, 
      transformRequest: (d) => d,
      timeout: 60000,
    }),

  put: <T>(endpoint: string, data: unknown) =>
    handleRequest<T>({ method: "put", url: endpoint, data }),

  delete: <T>(endpoint: string) =>
    handleRequest<T>({ method: "delete", url: endpoint }),
};
