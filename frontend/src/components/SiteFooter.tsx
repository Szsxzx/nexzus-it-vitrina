"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

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
  address: "Carrera 76 #20f-107, Barrio París, Medellín",
  phone: "316 401 3230",
  email: "contacto@fuentedevida.co",
  whatsappNumber: "573164013230",
  scheduleWeek: "Lunes a Sábado: 7am – 8pm",
  scheduleSunday: "Domingos: 8am – 2pm",
  copyright: "Carnicería Expendio Fuente de Vida — Todos los derechos reservados.",
};

interface SettingsOut {
  footer_address: string; footer_phone: string; footer_email: string; footer_whatsapp_number: string;
  footer_schedule_week: string; footer_schedule_sunday: string; footer_copyright: string;
}

function FooterLink({
  href, children, external = false,
}: { href: string; children: React.ReactNode; external?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative inline-flex flex-col"
      style={{ color: hovered ? "#fff" : "rgba(255,255,255,0.75)" }}
    >
      {children}
      <span
        className="h-[2px] rounded-full transition-transform duration-200 origin-left"
        style={{
          background: "#8B0000",
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
        }}
      />
    </a>
  );
}

export default function SiteFooter() {
  const [data, setData] = useState<FooterData>(defaultFooter);

  useEffect(() => {
    api.get<SettingsOut>("/settings")
      .then((s) => setData({
        address: s.footer_address, phone: s.footer_phone, email: s.footer_email,
        whatsappNumber: s.footer_whatsapp_number, scheduleWeek: s.footer_schedule_week,
        scheduleSunday: s.footer_schedule_sunday, copyright: s.footer_copyright,
      }))
      .catch(() => {});
  }, []);

  return (
    <footer id="contact" className="bg-negro text-white mt-12">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Contacto */}
        <div>
          <h3 className="font-serif text-xl mb-4">Información de Contacto</h3>
          <ul className="text-sm space-y-2 text-white/75">
            <li>📍 {data.address}</li>
            <li>📞 {data.phone}</li>
            <li>
              📧{" "}
              <FooterLink href={`mailto:${data.email}`}>{data.email}</FooterLink>
            </li>
          </ul>
          <div className="flex gap-3 mt-5">
            {["facebook-f", "twitter", "youtube", "pinterest-p", "instagram"].map((s) => (
              <a
                key={s}
                href="#"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.1)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#8B0000")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)")}
                aria-label={s}
              >
                <i className={`fa-brands fa-${s} text-sm`} />
              </a>
            ))}
          </div>
        </div>

        {/* Servicios */}
        <div>
          <h3 className="font-serif text-xl mb-4">Servicios</h3>
          <ul className="text-sm space-y-2 text-white/75">
            <li>
              🛒{" "}
              <FooterLink href={`https://wa.me/${data.whatsappNumber}`} external>
                Pedidos por WhatsApp
              </FooterLink>
            </li>
            <li>🚚 Domicilios el mismo día</li>
            <li>📅 Reservas para eventos o cortes especiales</li>
          </ul>
        </div>

        {/* Horarios */}
        <div>
          <h3 className="font-serif text-xl mb-4">Horarios</h3>
          <ul className="text-sm text-white/75 space-y-2">
            <li>{data.scheduleWeek}</li>
            <li>{data.scheduleSunday}</li>
          </ul>
        </div>
      </div>

      <div className="border-t py-4 text-center text-xs" style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
        © {new Date().getFullYear()} {data.copyright}
      </div>
    </footer>
  );
}
