"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, clearToken, loadToken, type ApiError } from "@/lib/api";
import type { User, Role } from "@/lib/types";

interface UseAuthOpts {
  /** Si se especifica, redirige a /admin/login si el usuario no tiene uno de esos roles */
  requireRoles?: Role[];
}

export function useAuth(opts: UseAuthOpts = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = loadToken();
    if (!token) {
      setLoading(false);
      router.replace(`/admin/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    api
      .get<User>("/auth/me", token)
      .then((u) => {
        if (opts.requireRoles && !opts.requireRoles.includes(u.role)) {
          router.replace("/admin/dashboard");
          return;
        }
        setUser(u);
      })
      .catch((e: ApiError) => {
        if (e.status === 401) {
          clearToken();
          router.replace("/admin/login");
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    clearToken();
    router.push("/admin/login");
  }

  return { user, loading, logout };
}
