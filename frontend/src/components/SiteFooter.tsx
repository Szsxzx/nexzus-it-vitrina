"use client";
import { useEffect, useState } from "react";
import { siteData, defaultFooter, type FooterData } from "@/lib/siteData";

export default function SiteFooter() {
  const [data, setData] = useState<FooterData>(defaultFooter);

  useEffect(() => {
    setData(siteData.getFooter());
  }, []);

  return (
    <footer id="contact" className="bg-negro text-white mt-12">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-xl mb-3">Información de Contacto</h3>
          <ul className="text-sm space-y-1 text-white/80">
            <li>📍 {data.address}</li>
            <li>📞 {data.phone}</li>
            <li>
              📧{" "}
              <a href={`mailto:${data.email}`} className="hover:text-azul underline">
                {data.email}
              </a>
            </li>
          </ul>
          <div className="flex gap-3 mt-4">
            {["facebook-f", "twitter", "youtube", "pinterest-p", "instagram"].map((s) => (
              <a
                key={s}
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-rojo flex items-center justify-center transition"
                aria-label={s}
              >
                <i className={`fa-brands fa-${s}`} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-serif text-xl mb-3">Servicios</h3>
          <ul className="text-sm space-y-1 text-white/80">
            <li>
              🛒{" "}
              <a
                href={`https://wa.me/${data.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-azul"
              >
                Pedidos por WhatsApp
              </a>
            </li>
            <li>🚚 Domicilios el mismo día</li>
            <li>📅 Reservas para eventos o cortes especiales</li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-xl mb-3">Horarios</h3>
          <ul className="text-sm text-white/80 space-y-1">
            <li>{data.scheduleWeek}</li>
            <li>{data.scheduleSunday}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {data.copyright}
      </div>
    </footer>
  );
}
