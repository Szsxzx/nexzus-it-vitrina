"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface SiteContact {
  address: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  scheduleWeek: string;
  scheduleSunday: string;
  copyright: string;
}

// Datos de ejemplo (placeholders): se reemplazan con lo que haya en /settings.
export const defaultContact: SiteContact = {
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

export function useSiteContact(): SiteContact {
  const [data, setData] = useState<SiteContact>(defaultContact);
  useEffect(() => {
    api.get<SettingsOut>("/settings")
      .then((s) => setData({
        address: s.footer_address || defaultContact.address,
        phone: s.footer_phone || defaultContact.phone,
        email: s.footer_email || defaultContact.email,
        whatsappNumber: s.footer_whatsapp_number || defaultContact.whatsappNumber,
        scheduleWeek: s.footer_schedule_week ?? "",
        scheduleSunday: s.footer_schedule_sunday ?? "",
        copyright: s.footer_copyright || defaultContact.copyright,
      }))
      .catch(() => {});
  }, []);
  return data;
}
