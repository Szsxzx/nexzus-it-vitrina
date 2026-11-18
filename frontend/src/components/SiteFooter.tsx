"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
  address: "Bogotá, Colombia",
  phone: "+57 300 000 0000",
  email: "contacto@nexzusit.com",
  whatsappNumber: "573000000000",
  scheduleWeek: "Lunes a viernes: 8:00 am – 6:00 pm",
  scheduleSunday: "Sábados: 9:00 am – 1:00 pm",
  copyright: "NEXZUS IT SERVICE — Todos los derechos reservados.",
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
          background: "#7C3AED",
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
    <footer id="contact" className="bg-primary text-white mt-12">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Contacto */}
        <div>
          <h3 className="font-heading text-xl mb-4">Información de Contacto</h3>
          <ul className="text-sm space-y-2 text-white/75">
            <li><i className="fa-solid fa-location-dot w-4 mr-1.5 text-accent-light" /> {data.address}</li>
            <li><i className="fa-solid fa-phone w-4 mr-1.5 text-accent-light" /> {data.phone}</li>
            <li>
              <i className="fa-solid fa-envelope w-4 mr-1.5 text-accent-light" />{" "}
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
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#7C3AED")}
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
          <h3 className="font-heading text-xl mb-4">Servicios</h3>
          <ul className="text-sm space-y-2 text-white/75">
            <li>
              <i className="fa-solid fa-cart-shopping w-4 mr-1.5 text-accent-light" />{" "}
              <FooterLink href={`https://wa.me/${data.whatsappNumber}`} external>
                Pedidos por WhatsApp
              </FooterLink>
            </li>
            <li><i className="fa-solid fa-truck w-4 mr-1.5 text-accent-light" /> Envíos a todo Colombia</li>
            <li><i className="fa-solid fa-headset w-4 mr-1.5 text-accent-light" /> Soporte técnico y asesoría</li>
          </ul>
        </div>

        {/* Horarios */}
        <div>
          <h3 className="font-heading text-xl mb-4">Horarios</h3>
          <ul className="text-sm text-white/75 space-y-2">
            <li>{data.scheduleWeek}</li>
            <li>{data.scheduleSunday}</li>
          </ul>
        </div>
      </div>

      <div className="border-t py-4 text-center text-xs" style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
        <div className="container mx-auto px-4 flex flex-col items-center gap-2">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <Link href="/pqr" className="hover:text-white transition-colors">PQR</Link>
            <Link href="/pqr#datos" className="hover:text-white transition-colors">Política de tratamiento de datos</Link>
          </div>
          <div className="flex items-center gap-3 text-lg" aria-label="Medios de pago">
            <i className="fa-brands fa-cc-visa" aria-hidden="true" />
            <i className="fa-brands fa-cc-mastercard" aria-hidden="true" />
            <i className="fa-brands fa-cc-amex" aria-hidden="true" />
            <span className="text-[11px] font-bold tracking-wider">PSE</span>
          </div>
          <div>© {new Date().getFullYear()} {data.copyright}</div>
        </div>
      </div>
    </footer>
  );
}
