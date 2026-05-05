"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import AdminLayout from "@/components/AdminLayout";
import {
  PageShell, PageHeader, Card, SavedToast,
  BtnPrimary, BtnSecondary,
  Field, Input,
} from "@/components/AdminUI";
import { siteData, defaultBanner, type BannerData } from "@/lib/siteData";

export default function BannerPage() {
  const { user, loading, logout } = useAuth();
  const [form, setForm] = useState<BannerData>(defaultBanner);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm(siteData.getBanner()); }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    siteData.setBanner(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    if (!confirm("¿Restaurar valores por defecto?")) return;
    siteData.resetBanner();
    setForm(defaultBanner);
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">Cargando...</div>;
  if (!user) return null;

  return (
    <AdminLayout user={user} onLogout={logout}>
      <PageShell>
        <PageHeader
          title="Banner principal"
          subtitle="Texto y botón del hero del sitio"
          actions={
            <a
              href="/#top"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:border-gray-300 hover:text-gray-800 transition-all"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" /> Ver sitio
            </a>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario */}
          <form onSubmit={handleSave}>
            <Card className="p-6 space-y-5">
              <Field label="Subtítulo">
                <Input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="La mejor carne de la ciudad"
                />
              </Field>
              <Field label="Título principal">
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="100% Natural"
                />
              </Field>
              <Field label="Texto destacado" hint="Segunda línea, aparece en color rojo">
                <Input
                  value={form.highlight}
                  onChange={(e) => setForm({ ...form, highlight: e.target.value })}
                  placeholder="Carne Premium"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Texto del botón">
                  <Input
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    placeholder="Ver catálogo"
                  />
                </Field>
                <Field label="Enlace del botón">
                  <Input
                    value={form.ctaHref}
                    onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
                    placeholder="#products"
                  />
                </Field>
              </div>
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
            <div
              className="relative rounded-2xl overflow-hidden flex items-center justify-center text-white text-center p-10 min-h-[280px]"
              style={{ background: "linear-gradient(135deg, #0f0f0f 0%, rgba(139,0,0,0.35) 50%, #0f0f0f 100%)" }}
            >
              <div className="relative z-10">
                <p className="text-[11px] uppercase tracking-[0.4em] font-medium" style={{ color: "#3AA8C1" }}>
                  {form.subtitle || "—"}
                </p>
                <h2 className="font-serif text-3xl mt-2 leading-tight text-white">
                  {form.title || "—"}
                </h2>
                <h2 className="font-serif text-3xl leading-tight" style={{ color: "#c0392b" }}>
                  {form.highlight || "—"}
                </h2>
                <span
                  className="inline-block mt-5 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
                  style={{ background: "#8B0000" }}
                >
                  {form.ctaText || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </AdminLayout>
  );
}
