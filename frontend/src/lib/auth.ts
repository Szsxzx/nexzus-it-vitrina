"use client";
import { create } from "zustand";
import { api, saveToken, loadToken, clearToken, type ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (usuario: string, contrasena: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (usuario, contrasena) => {
    const data = await api.post<{ access_token: string; user: User }>("/auth/login", { usuario, contrasena });
    saveToken(data.access_token);
    set({ user: data.user, loading: false });
  },

  logout: () => {
    clearToken();
    set({ user: null });
  },

  // Restaura la sesion al cargar la app a partir del token guardado en
  // localStorage (no hace falta persistir `user` aparte: se resuelve con
  // /auth/me, que de paso valida que el token siga siendo valido).
  fetchMe: async () => {
    const token = loadToken();
    if (!token) { set({ user: null, loading: false }); return; }
    try {
      const user = await api.get<User>("/auth/me");
      set({ user, loading: false });
    } catch (e) {
      if ((e as ApiError).status === 401) clearToken();
      set({ user: null, loading: false });
    }
  },
}));

/** Atajo para las paginas del admin: siempre se usa despues de que
 * admin/layout.tsx ya confirmo que hay sesion, asi que `user` nunca es null. */
export function useAdminAuth(): { user: User; logout: () => void } {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  if (!user) throw new Error("useAdminAuth usado fuera del layout de admin (sin sesion)");
  return { user, logout };
}
