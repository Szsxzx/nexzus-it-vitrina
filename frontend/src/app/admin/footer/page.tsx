"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  PageShell, PageHeader, Card, SavedToast,
  BtnPrimary, BtnSecondary,
  Field, Input,
} from "@/components/AdminUI";
import { siteData, defaultFooter, type FooterData } from "@/lib/siteData";

export default function FooterPage() {
  const { user, logout } = useAdminAuth();
  const [form, setForm] = useState<FooterData>(defaultFooter);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm(siteData.getFooter()); }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    siteData.setFooter(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    if (!confirm("¿Restaurar pie de página por defecto?")) return;
    siteData.resetFooter();
    setForm(defaultFooter);
  }

  return (
      <PageShell>
        <PageHeader
          title="Pie de página"
          subtitle="Contacto, horarios y copyright"
          actions={
            <a
              href="/#contact"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:border-gray-300 hover:text-gray-800 transition-all"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" /> Ver sitio
            </a>
          }
        />

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contacto */}
            <Card title="Información de contacto" icon="fa-location-dot" className="p-6 space-y-4">
              <Field label="Dirección">
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Carrera 76 #20f-107, Medellín"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Teléfono">
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="316 401 3230"
                  />
                </Field>
                <Field label="WhatsApp (con código país)">
                  <Input
                    value={form.whatsappNumber}
                    onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                    placeholder="573164013230"
                  />
                </Field>
              </div>
              <Field label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
            </Card>

            {/* Horarios */}
            <Card title="Horarios de atención" icon="fa-clock" className="p-6 space-y-4">
              <Field label="Lunes a Sábado">
                <Input
                  value={form.scheduleWeek}
                  onChange={(e) => setForm({ ...form, scheduleWeek: e.target.value })}
                  placeholder="Lunes a Sábado: 7am – 8pm"
                />
              </Field>
              <Field label="Domingos">
                <Input
                  value={form.scheduleSunday}
                  onChange={(e) => setForm({ ...form, scheduleSunday: e.target.value })}
                  placeholder="Domingos: 8am – 2pm"
                />
              </Field>
            </Card>

            {/* Copyright */}
            <Card title="Copyright" icon="fa-copyright" className="p-6 space-y-4 lg:col-span-2">
              <Field label="Texto de copyright" hint="El año actual se agrega automáticamente al inicio.">
                <Input
                  value={form.copyright}
                  onChange={(e) => setForm({ ...form, copyright: e.target.value })}
                />
              </Field>
            </Card>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <BtnPrimary type="submit">
              <i className="fa-solid fa-floppy-disk text-xs" /> Guardar cambios
            </BtnPrimary>
            <BtnSecondary type="button" onClick={handleReset}>
              Restaurar defecto
            </BtnSecondary>
            <SavedToast visible={saved} />
          </div>
        </form>

        {/* Vista previa del footer */}
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Vista previa</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#141414" }}>
            <div className="px-8 py-8 grid grid-cols-3 gap-6 text-sm">
              <div>
                <p className="font-serif text-base text-white mb-3">Información de Contacto</p>
                <ul className="space-y-1.5 text-xs" style={{ color: "#888" }}>
                  <li>📍 {form.address}</li>
                  <li>📞 {form.phone}</li>
                  <li>📧 {form.email}</li>
                </ul>
              </div>
              <div>
                <p className="font-serif text-base text-white mb-3">Servicios</p>
                <ul className="space-y-1.5 text-xs" style={{ color: "#888" }}>
                  <li>🛒 Pedidos por WhatsApp</li>
                  <li>🚚 Domicilios el mismo día</li>
                  <li>📅 Reservas para eventos</li>
                </ul>
              </div>
              <div>
                <p className="font-serif text-base text-white mb-3">Horarios</p>
                <ul className="space-y-1.5 text-xs" style={{ color: "#888" }}>
                  <li>{form.scheduleWeek}</li>
                  <li>{form.scheduleSunday}</li>
                </ul>
              </div>
            </div>
            <div className="border-t px-8 py-3 text-center text-xs" style={{ borderColor: "#222", color: "#444" }}>
              © {new Date().getFullYear()} {form.copyright}
            </div>
          </div>
        </div>
      </PageShell>
  );
}
