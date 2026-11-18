import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiError = { status: number; detail: string; isNetwork?: boolean };

export const TOKEN_KEY = "nexzus_token";
export function saveToken(t: string) { if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, t); }
export function loadToken(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
}
export function clearToken() { if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY); }

const client = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" } });

// El token se agrega solo desde localStorage — las paginas ya no lo pasan a mano
// en cada llamada.
client.interceptors.request.use((config) => {
  const token = loadToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normaliza cualquier error de axios (red, HTTP, lo que sea) al mismo shape
// que ya usan todos los `.catch((e: ApiError) => ...)` del resto del codigo.
client.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ detail?: string; message?: string }>) => {
    if (!err.response) {
      return Promise.reject({ status: 0, detail: "No se pudo conectar con el servidor.", isNetwork: true } as ApiError);
    }
    return Promise.reject({
      status: err.response.status,
      detail: err.response.data?.detail || err.response.data?.message || "Error desconocido",
    } as ApiError);
  },
);

export const api = {
  get:    <T>(path: string) => client.get<T>(path).then((r) => r.data),
  post:   <T>(path: string, body?: unknown) => client.post<T>(path, body ?? {}).then((r) => r.data),
  patch:  <T>(path: string, body?: unknown) => client.patch<T>(path, body ?? {}).then((r) => r.data),
  delete: <T>(path: string) => client.delete<T>(path).then((r) => r.data),
};
