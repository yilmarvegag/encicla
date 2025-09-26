// apps/web-form/src/lib/http.ts
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://encicla-api-qa.onrender.com/api";

if (!API) {
  console.info("NEXT_PUBLIC_API_BASE_URL is not defined");  // Fallará en build si no está seteada
}

type FetchOptions = RequestInit & { timeoutMs?: number; signal?: AbortSignal };

async function fetchWithTimeout(input: RequestInfo | URL, opts: FetchOptions = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), opts.timeoutMs ?? 10_000);
  try {
    console.log("[HTTP] Fetching", input, opts);
    const res = await fetch(input, { signal: controller.signal, ...opts });
    console.log("[HTTP]", res);
    // if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text().catch(()=>res.statusText)}`);
    return res;
  } catch (err) {
    console.error("[HTTP] Error", err);
    throw err;
  }
   finally {
    clearTimeout(id);
  }
}

export async function http<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const res = await fetchWithTimeout(`${API}${path}`, { method: "GET", headers: { Accept: "application/json", ...(opts.headers ?? {}) }, ...opts });
  return res.json() as Promise<T>;
}

export async function get<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  return http<T>(path, opts);
}

export async function post<T>(path: string, body: object, opts: FetchOptions = {}): Promise<T> {
  const res = await fetchWithTimeout(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
    body: JSON.stringify(body),
    ...opts,
  });
  return res.json() as Promise<T>;
}
