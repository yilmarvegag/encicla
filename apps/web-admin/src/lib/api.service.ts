 
// apps/web-form/src/lib/api.service.ts
const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://webapp.metropol.gov.co/wsencicla/api";
// const authToken = process.env.NEXT_PUBLIC_WS_AUTH_TOKEN ?? "";

import axios, { AxiosError, AxiosRequestConfig } from "axios";
import CircuitBreaker from "opossum";
import retry from "async-retry";
import { clearSession, getToken, isExpired } from "./auth";

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
        error.response.status < 503 &&
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
const PUBLIC_ENDPOINTS = ["/auth/login", "/users/createtoken"];
apiClient.interceptors.request.use(
  (config) => {
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
      config.url?.startsWith(endpoint)
    );
    if (!isPublicEndpoint) {
      const token = getToken();
      if (token && !isExpired()) {
        config.headers = config.headers ?? {};
        (config.headers).Authorization = `Bearer ${token}`;
        // config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// si se necesita el interceptor de response, para manejo global de errores de autenticación, si se activa, descomentar
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // Extrae mensaje del server si viene con los campos comunes
    const serverMsg =
      (error.response?.data?.message as string) ||
      (error.response?.data?.title as string) ||
      (typeof error.response?.data === "string" ? error.response?.data : "");

    // 401 / 403: no redirigir desde el interceptor
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Limpia sesión para que el middleware te saque en el siguiente render
      try {
        clearSession();
      } catch {}
      // agrega una marca para que arriba puedas distinguirlo si quieres
      (error as any).__auth = true;
    }

    // Adjunta un mensaje legible siempre
    (error as any).__friendly =
      serverMsg ||
      `Error ${error.response?.status ?? ""} en ${error.config?.url ?? ""}`;

    return Promise.reject(error);
  }
);

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
                bail(error || error);
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
    // Si es Circuit Breaker (fallback), deja un mensaje uniforme
    if (isCircuitBreakerError(error)) {
      const e = new Error(
        "Servicio no disponible temporalmente. Intenta más tarde."
      );
      (e as any).__cb = true;
      throw e;
    }

    // Si es Axios, propaga el mensaje normalizado que metimos en el interceptor
    if (axios.isAxiosError(error)) {
      const e = new Error((error as any).__friendly || "Error de red");
      if ((error as any).__auth) (e as any).__auth = true;
      throw e;
    }

    // Caso genérico
    throw error instanceof Error ? error : new Error("Error desconocido");
  }
};

export const apiService = {
  get: <T>(endpoint: string, params?: Record<string, unknown>, signal?: AbortSignal) =>
    handleRequest<T>({ method: "get", url: endpoint, params, signal }),

  post: <T>(endpoint: string, data: unknown, signal?: AbortSignal) =>
    handleRequest<T>({ method: "post", url: endpoint, data, signal }),

  put: <T>(endpoint: string, data: unknown, signal?: AbortSignal) =>
    handleRequest<T>({ method: "put", url: endpoint, data, signal }),

  delete: <T>(endpoint: string, signal?: AbortSignal) =>
    handleRequest<T>({ method: "delete", url: endpoint, signal }),
};
