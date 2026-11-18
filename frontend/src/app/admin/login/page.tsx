"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const VERSION = "2.0";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<{ msg: string; warn?: boolean } | null>(null);
  const [versionLabel, setVersionLabel] = useState("");

  useEffect(() => {
    const d = new Date();
    setVersionLabel(
      `v${VERSION} · ${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`
    );
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(usuario.trim(), contrasena);
      setSuccess(true);
      setTimeout(() => router.push("/admin/dashboard"), 1200);
    } catch (err) {
      const e = err as ApiError;
      if (e.isNetwork) {
        setError({ msg: "No se pudo conectar con el servidor.", warn: true });
      } else {
        const map: Record<number, string> = {
          400: "Completa usuario y contraseña.",
          401: "Usuario o contraseña incorrectos.",
          403: "Tu cuenta está inactiva.",
          500: "Error en el servidor. Intenta más tarde.",
        };
        setError({ msg: map[e.status] ?? e.detail, warn: e.status === 500 });
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0B0712" }}>
      {/* Panel izquierdo */}
      <aside className="hidden lg:flex w-[600px] flex-col items-center justify-center flex-shrink-0 relative overflow-hidden">
        {/* Glow de fondo */}
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(ellipse at 40% 50%, #7C3AED 0%, transparent 65%)" }}
        />
        <div className="relative z-10 flex flex-col items-center text-center px-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/logo-nexzus.png"
            alt="NEXZUS IT SERVICE"
            className="w-40 h-40 rounded-3xl mb-8 shadow-2xl"
          />
          <div className="space-y-3 w-full">
            {[
              { icon: "fa-shield-halved", text: "Acceso seguro con JWT" },
              { icon: "fa-bolt",          text: "Panel de gestión en tiempo real" },
              { icon: "fa-sliders",       text: "Control total del sitio" },
            ].map((f) => (
              <div
                key={f.icon}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left"
                style={{ background: "rgba(255,255,255,0.04)", color: "#666" }}
              >
                <i className={`fa-solid ${f.icon} w-4 text-center flex-shrink-0`} style={{ color: "#7C3AED" }} />
                {f.text}
              </div>
            ))}
          </div>
        </div>
        <p className="absolute bottom-6 text-[10px]" style={{ color: "#333" }}>{versionLabel}</p>
      </aside>

      {/* Panel derecho */}
      <main
        className="flex-1 flex items-center justify-center p-8"
        style={{ background: "#f4f3f0" }}
      >
        {!success ? (
          <div className="w-full max-w-sm">
            {/* Logo mobile */}
            <div className="lg:hidden flex justify-center mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/logo-nexzus.png" alt="NEXZUS IT SERVICE" className="h-14 w-14 rounded-xl" />
            </div>

            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-1">Iniciar sesión</h2>
            <p className="text-sm text-gray-400 mb-8">Panel de administración</p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Usuario o correo
                </label>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                  autoFocus
                  placeholder="admin"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-red-700 focus:ring-2 focus:ring-red-700/10 bg-white placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-red-700 focus:ring-2 focus:ring-red-700/10 bg-white placeholder:text-gray-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 mt-2"
                style={{ background: "#7C3AED" }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#6D28D9"; }}
                onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#7C3AED"; }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  "Entrar al panel"
                )}
              </button>
            </form>

            <div className="text-center mt-5">
              <Link
                href="/admin/reset-password"
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {error && (
              <div
                className={`mt-5 flex items-start gap-3 p-3.5 rounded-xl text-sm border ${
                  error.warn
                    ? "bg-amber-50 border-amber-100 text-amber-800"
                    : "bg-red-50 border-red-100 text-red-700"
                }`}
              >
                <i className={`fa-solid ${error.warn ? "fa-triangle-exclamation" : "fa-circle-exclamation"} mt-0.5 flex-shrink-0`} />
                {error.msg}
              </div>
            )}

            <p className="text-center text-[10px] text-gray-300 mt-10 lg:hidden">{versionLabel}</p>
          </div>
        ) : (
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-4"
              style={{ background: "#dcfce7" }}
            >
              ✓
            </div>
            <h2 className="text-xl font-bold text-gray-900">¡Sesión iniciada!</h2>
            <p className="text-sm text-gray-400 mt-1 mb-6">Redirigiendo...</p>
            <div
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto"
              style={{ borderColor: "#7C3AED", borderTopColor: "transparent" }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
