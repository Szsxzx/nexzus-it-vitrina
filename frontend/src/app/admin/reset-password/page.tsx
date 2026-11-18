"use client";
/**
 * Solicitar restablecimiento de contraseña.
 * El backend siempre responde éxito por seguridad (no revela si el email existe).
 */
import { useState } from "react";
import Link from "next/link";
import { api, type ApiError } from "@/lib/api";

export default function ResetPasswordPage() {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/reset-password/request", { correo: correo.trim() });
      setDone(true);
    } catch (err) {
      const e = err as ApiError;
      setError(e.isNetwork ? "El servicio no está disponible." : e.detail);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-primary text-white">
      <aside className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo-nexzus.png" alt="NEXZUS IT SERVICE" className="w-32 h-32 rounded-2xl mx-auto shadow-2xl shadow-accent/40" />
          <h1 className="mt-6 text-4xl font-heading font-bold">NEXZUS IT SERVICE</h1>
        </div>
      </aside>

      <main className="flex-1 flex flex-col justify-center p-8 md:p-16 bg-background text-primary">
        <div className="max-w-md mx-auto w-full">
          {!done ? (
            <>
              <h1 className="text-3xl font-heading font-bold mb-3">Restablecer contraseña</h1>
              <p className="text-sm text-gray-600 mb-6">
                Introduce el correo con el que inicias sesión en NEXZUS IT SERVICE para recibir las
                instrucciones.
              </p>

              <form onSubmit={onSubmit} className="space-y-4">
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-accent outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-60 text-white font-semibold transition"
                >
                  {loading ? "Enviando..." : "Enviar"}
                </button>
              </form>

              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 mt-5 text-sm text-accent hover:underline"
              >
                ← Volver al inicio de sesión
              </Link>

              {error && (
                <div className="mt-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                  ⚠️ {error}
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center text-3xl text-green-600">
                ✓
              </div>
              <h2 className="text-2xl font-bold mt-4">¡Correo enviado!</h2>
              <p className="text-gray-600 mt-2">
                Si el correo existe, recibirás instrucciones para restablecer la contraseña.
              </p>
              <Link
                href="/admin/login"
                className="inline-block mt-6 px-5 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover transition"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
