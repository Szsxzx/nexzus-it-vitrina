const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiError = { status: number; detail: string; isNetwork?: boolean };

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw { status: 0, detail: "No se pudo conectar con el servidor.", isNetwork: true } as ApiError;
  }

  if (res.status === 204) return undefined as T;

  let data: any = null;
  try { data = await res.json(); } catch { /* sin body */ }

  if (!res.ok) {
    throw {
      status: res.status,
      detail: data?.detail || data?.message || "Error desconocido",
    } as ApiError;
  }
  return data as T;
}

export const api = {
  get:    <T>(p: string, token?: string) => request<T>(p, { method: "GET" }, token),
  post:   <T>(p: string, body?: unknown, token?: string) =>
    request<T>(p, { method: "POST", body: JSON.stringify(body ?? {}) }, token),
  patch:  <T>(p: string, body?: unknown, token?: string) =>
    request<T>(p, { method: "PATCH", body: JSON.stringify(body ?? {}) }, token),
  delete: <T>(p: string, token?: string) =>
    request<T>(p, { method: "DELETE" }, token),
};

export const TOKEN_KEY = "incodol_token";
export function saveToken(t: string) { if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, t); }
export function loadToken(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
}
export function clearToken() { if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY); }
