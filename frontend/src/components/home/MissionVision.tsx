import Reveal from "@/components/Reveal";
import SectionHeading from "./SectionHeading";
import { mission, vision } from "@/lib/data/home";

const items = [
  { icon: "fa-bullseye", title: "Misión", text: mission },
  { icon: "fa-binoculars", title: "Visión", text: vision },
];

export default function MissionVision() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <SectionHeading eyebrow="Nuestro propósito" title="Misión y visión" />
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 0.1} className="h-full">
            <article className="h-full rounded-xl border border-line bg-card p-7 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-accent-light">
                <i className={`fa-solid ${it.icon}`} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-heading text-xl font-semibold text-primary">{it.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{it.text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
