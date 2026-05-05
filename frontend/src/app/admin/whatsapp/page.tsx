"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import AdminLayout from "@/components/AdminLayout";
import {
  PageShell, PageHeader, Card, SavedToast,
  BtnPrimary, BtnSecondary, Field, Input,
} from "@/components/AdminUI";
import { siteData } from "@/lib/siteData";

export default function WhatsAppPage() {
  const { user, loading, logout } = useAuth();
  const [number, setNumber]   = useState("");
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setNumber(siteData.getFooter().whatsappNumber);
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const clean = number.replace(/\D/g, "");
    if (clean.length < 10) {
      setError("Ingresa un número válido (mínimo 10 dígitos).");
      return;
    }
    setError(null);
    const footer = siteData.getFooter();
    siteData.setFooter({ ...footer, whatsappNumber: clean });
    setNumber(clean);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    if (!confirm("¿Restaurar el número por defecto?")) return;
    const footer = siteData.getFooter();
    siteData.setFooter({ ...footer, whatsappNumber: "573164013230" });
    setNumber("573164013230");
  }

  const preview = number.replace(/\D/g, "");
  const displayNumber = preview
    ? `+${preview.slice(0, 2)} ${preview.slice(2, 5)} ${preview.slice(5, 8)} ${preview.slice(8)}`
    : "—";

  if (loading) return <div className="p-8 text-sm text-gray-400">Cargando...</div>;
  if (!user) return null;

  return (
    <AdminLayout user={user} onLogout={logout}>
      <PageShell>
        <PageHeader
          title="WhatsApp de pedidos"
          subtitle="Número al que llegan los mensajes del carrito"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-2xl">
          <form onSubmit={handleSave}>
            <Card className="p-6 space-y-5">
              <Field
                label="Número WhatsApp"
                required
                hint="Con código de país, sin + ni espacios. Colombia: 57 + número sin 0 inicial."
              >
                <Input
                  value={number}
                  onChange={(e) => { setNumber(e.target.value); setError(null); }}
                  placeholder="573164013230"
                  required
                />
              </Field>

              {/* Ejemplo formato */}
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
                <i className="fa-solid fa-circle-info mt-0.5 flex-shrink-0" />
                <span>
                  Formato Colombia: <strong>57</strong> + número sin 0 inicial →{" "}
                  <strong>573164013230</strong>
                </span>
              </div>

              {error && (
                <p className="text-xs text-red-600 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-exclamation" /> {error}
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <BtnPrimary type="submit">
                  <i className="fa-solid fa-floppy-disk text-xs" /> Guardar
                </BtnPrimary>
                <BtnSecondary type="button" onClick={handleReset}>
                  Restaurar defecto
                </BtnSecondary>
                <SavedToast visible={saved} />
              </div>
            </Card>
          </form>

          {/* Vista previa */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Vista previa</p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <i className="fa-brands fa-whatsapp text-white text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Carnicería Fuente de Vida</p>
                  <p className="text-xs text-gray-400">{displayNumber}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 leading-relaxed">
                ¡Hola! Soy <span className="font-medium">Juan</span> y quiero hacer el siguiente pedido 🥩<br />
                <br />
                • Lomo Fino Angus — $32.000 (x2)<br />
                • Costillas BBQ — $25.900 (x1)<br />
                <br />
                Total estimado: $89.900
              </div>
              <a
                href={`https://wa.me/${preview}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition"
              >
                <i className="fa-brands fa-whatsapp" /> Probar número
              </a>
            </div>
          </div>
        </div>
      </PageShell>
    </AdminLayout>
  );
}
