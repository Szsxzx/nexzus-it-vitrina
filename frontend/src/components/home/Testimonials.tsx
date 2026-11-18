import Reveal from "@/components/Reveal";
import SectionHeading from "./SectionHeading";
import { testimonials } from "@/lib/data/home";

export default function Testimonials() {
  return (
    <section className="border-y border-line bg-card py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading eyebrow="Reseñas" title="Lo que dicen nuestros clientes" />
        <div className="grid gap-5 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06} className="h-full">
              <figure className="flex h-full flex-col rounded-xl border border-line bg-background p-6">
                <div className="flex gap-0.5 text-accent" aria-label="5 de 5 estrellas" role="img">
                  {Array.from({ length: 5 }).map((_, k) => <i key={k} className="fa-solid fa-star text-sm" />)}
                </div>
                <blockquote className="mt-3 flex-1 leading-relaxed text-foreground">&ldquo;{t.text}&rdquo;</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-heading text-sm font-semibold text-accent-light" aria-hidden="true">
                    {t.name[0]}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-primary">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Reseñas de ejemplo; se reemplazarán por opiniones reales de clientes.</p>
      </div>
    </section>
  );
}
