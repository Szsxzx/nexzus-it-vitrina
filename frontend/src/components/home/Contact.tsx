"use client";
import Reveal from "@/components/Reveal";
import SectionHeading from "./SectionHeading";
import { useSiteContact } from "@/lib/siteContact";

export default function Contact() {
  const d = useSiteContact();
  const rows = [
    { icon: "fa-location-dot", label: "Ubicación", value: d.address, href: undefined as string | undefined },
    { icon: "fa-phone", label: "Teléfono", value: d.phone, href: `tel:${d.phone.replace(/\s/g, "")}` },
    { icon: "fa-envelope", label: "Correo", value: d.email, href: `mailto:${d.email}` },
  ];
  const schedule = [d.scheduleWeek, d.scheduleSunday].filter(Boolean);

  return (
    <section id="contacto" className="mx-auto max-w-6xl px-4 pb-4 pt-16 md:px-6 md:pt-20">
      <SectionHeading eyebrow="Contacto" title="Hablemos de lo que necesita" description="Cuéntenos su caso y un asesor le responderá con una propuesta." />
      <Reveal>
        <div className="grid gap-6 rounded-2xl border border-line bg-card p-6 shadow-sm md:grid-cols-[1.2fr_0.8fr] md:p-10">
          <ul className="space-y-5">
            {rows.map((r) => (
              <li key={r.label} className="flex gap-4">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <i className={`fa-solid ${r.icon}`} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{r.label}</p>
                  {r.href ? (
                    <a href={r.href} className="text-primary hover:text-accent">{r.value}</a>
                  ) : (
                    <p className="text-primary">{r.value}</p>
                  )}
                </div>
              </li>
            ))}
            {schedule.length > 0 && (
              <li className="flex gap-4">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <i className="fa-solid fa-clock" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Horario de atención</p>
                  {schedule.map((s) => <p key={s} className="text-primary">{s}</p>)}
                </div>
              </li>
            )}
          </ul>
          <div className="flex flex-col justify-center rounded-xl bg-gradient-to-br from-primary to-secondary p-6 text-white">
            <h3 className="font-heading text-xl font-semibold">Escríbanos por WhatsApp</h3>
            <p className="mt-2 text-sm text-white/75">La forma más rápida de resolver dudas o pedir una cotización.</p>
            <a
              href={`https://wa.me/${d.whatsappNumber}?text=${encodeURIComponent("Hola, quiero información sobre sus productos y servicios.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-accent px-5 font-semibold text-white transition-colors duration-150 hover:bg-accent-hover"
            >
              <i className="fa-brands fa-whatsapp text-lg" aria-hidden="true" />
              Abrir WhatsApp
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
