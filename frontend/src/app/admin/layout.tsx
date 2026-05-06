"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { AdminAuthContext } from "@/lib/AdminAuthContext";

/** Páginas que NO deben mostrar el sidebar */
const PUBLIC_PATHS = ["/admin/login", "/admin/reset-password"];

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f4f3f0" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "#8B0000" }}>
          🥩
        </div>
        <p className="text-sm text-gray-400 font-medium">Cargando...</p>
      </div>
    </div>
  );
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  const { user, loading, logout } = useAuth();

  /* Páginas públicas (login, reset) — sin sidebar */
  if (isPublic) return <>{children}</>;

  /* Mientras valida el token */
  if (loading) return <LoadingScreen />;

  /* Sin sesión — useAuth ya redirige a /admin/login */
  if (!user) return null;

  return (
    <AdminAuthContext.Provider value={{ user, logout }}>
      <AdminLayout user={user} onLogout={logout}>
        {children}
      </AdminLayout>
    </AdminAuthContext.Provider>
  );
}
