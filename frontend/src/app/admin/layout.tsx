"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";

/** Páginas que NO deben mostrar el sidebar */
const PUBLIC_PATHS = ["/admin/login", "/admin/reset-password"];

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8F7FB" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "#7C3AED" }}>
          🥩
        </div>
        <p className="text-sm text-gray-400 font-medium">Cargando...</p>
      </div>
    </div>
  );
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);
  const logout = useAuth((s) => s.logout);
  const fetchMe = useAuth((s) => s.fetchMe);

  useEffect(() => {
    if (!isPublic) fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPublic]);

  useEffect(() => {
    if (!isPublic && !loading && !user) {
      router.replace(`/admin/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isPublic, loading, user, pathname, router]);

  /* Páginas públicas (login, reset) — sin sidebar */
  if (isPublic) return <>{children}</>;

  /* Mientras valida el token, o mientras redirige por falta de sesión */
  if (loading || !user) return <LoadingScreen />;

  return (
    <AdminLayout user={user} onLogout={logout}>
      {children}
    </AdminLayout>
  );
}
