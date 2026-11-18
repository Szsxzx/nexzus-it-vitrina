import Reveal from "@/components/Reveal";
import SectionHeading from "./SectionHeading";
import { whyUs, stats } from "@/lib/data/home";

export default function WhyUs() {
  return (
    <section className="bg-gradient-to-br from-primary to-secondary py-16 text-white md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading dark eyebrow="Por qué elegirnos" title="Compre con respaldo, no solo con precio" />
        <div className="grid gap-4 sm:grid-cols-2">
          {whyUs.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.06} className="h-full">
              <article className="flex h-full gap-4 rounded-xl border border-white/10 bg-white/5 p-5 transition-colors duration-200 hover:border-accent-light/50">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-accent/25 text-accent-light">
                  <i className={`fa-solid ${w.icon}`} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-heading font-semibold text-white">{w.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">{w.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Cifras de ejemplo, editables en src/lib/data/home.ts */}
        <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-white/10 pt-10 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse text-center">
              <dt className="mt-1 text-sm text-white/70">{s.label}</dt>
              <dd className="font-heading text-4xl font-bold text-accent-light">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
