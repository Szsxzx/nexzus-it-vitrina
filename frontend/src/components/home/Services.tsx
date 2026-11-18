import Reveal from "@/components/Reveal";
import SectionHeading from "./SectionHeading";
import { services } from "@/lib/data/home";

export default function Services() {
  return (
    <section id="servicios" className="border-y border-line bg-card py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Qué hacemos"
          title="Todo lo que su operación necesita en tecnología"
          description="Desde un equipo nuevo hasta la red completa de la oficina, con garantía y soporte."
        />
        <div className="grid gap-4 md:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06} className={s.wide ? "md:col-span-2" : "md:col-span-1"}>
              <article
                className={[
                  "group h-full rounded-xl border p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-md",
                  s.wide
                    ? "border-transparent bg-gradient-to-br from-primary to-secondary text-white"
                    : "border-line bg-background hover:border-accent",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-lg",
                    s.wide ? "bg-white/10 text-accent-light" : "bg-accent-soft text-accent",
                  ].join(" ")}
                >
                  <i className={`fa-solid ${s.icon}`} aria-hidden="true" />
                </span>
                <h3 className={`mt-4 font-heading text-lg font-semibold ${s.wide ? "text-white" : "text-primary"}`}>{s.title}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${s.wide ? "text-white/75" : "text-muted-foreground"}`}>{s.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
