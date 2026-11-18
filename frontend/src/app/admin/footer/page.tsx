"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  PageShell, PageHeader, Card, SavedToast, ErrorBox,
  BtnPrimary, BtnSecondary,
  Field, Input,
} from "@/components/AdminUI";
import { api, type ApiError } from "@/lib/api";

interface FooterData {
  address: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  scheduleWeek: string;
  scheduleSunday: string;
  copyright: string;
}

const defaultFooter: FooterData = {
  address: "Bogotá, Colombia",
  phone: "+57 300 000 0000",
  email: "contacto@nexzusit.com",
  whatsappNumber: "573000000000",
  scheduleWeek: "Lunes a viernes: 8:00 am – 6:00 pm",
  scheduleSunday: "Sábados: 9:00 am – 1:00 pm",
  copyright: "NEXZUS IT SERVICE — NIT 000.000.000-0. Todos los derechos reservados.",
};

interface SettingsOut {
  footer_address: string; footer_phone: string; footer_email: string; footer_whatsapp_number: string;
  footer_schedule_week: string; footer_schedule_sunday: string; footer_copyright: string;
}

const toForm = (s: SettingsOut): FooterData => ({
  address: s.footer_address, phone: s.footer_phone, email: s.footer_email,
  whatsappNumber: s.footer_whatsapp_number, scheduleWeek: s.footer_schedule_week,
  scheduleSunday: s.footer_schedule_sunday, copyright: s.footer_copyright,
});
const toPayload = (f: FooterData) => ({
  footer_address: f.address, footer_phone: f.phone, footer_email: f.email,
  footer_whatsapp_number: f.whatsappNumber, footer_schedule_week: f.scheduleWeek,
  footer_schedule_sunday: f.scheduleSunday, footer_copyright: f.copyright,
});

export default function FooterPage() {
  const { user, logout } = useAdminAuth();
  const [form, setForm] = useState<FooterData>(defaultFooter);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.get<SettingsOut>("/settings").then((s) => setForm(toForm(s))).catch((e: ApiError) => setErr(e.detail));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const s = await api.patch<SettingsOut>("/settings", toPayload(form));
      setForm(toForm(s));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setErr((e as ApiError).detail);
    }
  }

  async function handleReset() {
    if (!confirm("¿Restaurar pie de página por defecto?")) return;
    try {
      const s = await api.patch<SettingsOut>("/settings", toPayload(defaultFooter));
      setForm(toForm(s));
    } catch (e) {
      setErr((e as ApiError).detail);
    }
  }

  return (
      <PageShell>
        <PageHeader
          title="Pie de página"
          subtitle="Contacto, horarios y copyright"
          actions={
            <a
              href="/#contacto"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:border-gray-300 hover:text-gray-800 transition-all"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" /> Ver sitio
            </a>
          }
        />

        <ErrorBox message={err} />

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contacto */}
            <Card title="Información de contacto" icon="fa-location-dot" className="p-6 space-y-4">
              <Field label="Dirección">
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Bogotá, Colombia"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Teléfono">
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+57 300 000 0000"
                  />
                </Field>
                <Field label="WhatsApp (con código país)">
                  <Input
                    value={form.whatsappNumber}
                    onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                    placeholder="573000000000"
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
              <Field label="Lunes a viernes">
                <Input
                  value={form.scheduleWeek}
                  onChange={(e) => setForm({ ...form, scheduleWeek: e.target.value })}
                  placeholder="Lunes a viernes: 8:00 am – 6:00 pm"
                />
              </Field>
              <Field label="Sábados">
                <Input
                  value={form.scheduleSunday}
                  onChange={(e) => setForm({ ...form, scheduleSunday: e.target.value })}
                  placeholder="Sábados: 9:00 am – 1:00 pm"
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
          <div className="rounded-2xl overflow-hidden" style={{ background: "#0B0712" }}>
            <div className="px-8 py-8 grid grid-cols-3 gap-6 text-sm">
              <div>
                <p className="font-heading text-base text-white mb-3">Información de Contacto</p>
                <ul className="space-y-1.5 text-xs" style={{ color: "#A78BFA" }}>
                  <li>{form.address}</li>
                  <li>{form.phone}</li>
                  <li>{form.email}</li>
                </ul>
              </div>
              <div>
                <p className="font-heading text-base text-white mb-3">Servicios</p>
                <ul className="space-y-1.5 text-xs" style={{ color: "#A78BFA" }}>
                  <li>Pedidos por WhatsApp</li>
                  <li>Envíos a toda Colombia</li>
                  <li>Soporte técnico</li>
                </ul>
              </div>
              <div>
                <p className="font-heading text-base text-white mb-3">Horarios</p>
                <ul className="space-y-1.5 text-xs" style={{ color: "#A78BFA" }}>
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
