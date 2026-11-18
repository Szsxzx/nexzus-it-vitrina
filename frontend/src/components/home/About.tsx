import Reveal from "@/components/Reveal";
import SectionHeading from "./SectionHeading";
import { values } from "@/lib/data/home";

export default function About() {
  return (
    <section id="nosotros" className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading align="left" eyebrow="Quiénes somos" title="Un aliado tecnológico, no solo un proveedor" />
          <Reveal className="-mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              NEXZUS IT SERVICE es una empresa colombiana dedicada a la venta de software y hardware y a los servicios de
              tecnología de la información. Acompañamos a pymes y profesionales en la compra, instalación y
              mantenimiento de sus herramientas de trabajo.
            </p>
            <p>
              Combinamos una tienda en línea con atención de ingenieros: usted puede comprar por su cuenta o pedirnos
              que diseñemos la solución completa, desde los equipos hasta la red y las licencias.
            </p>
          </Reveal>
        </div>
        <ul className="grid gap-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <li className="flex gap-4 rounded-xl border border-line bg-card p-5 shadow-sm transition duration-200 hover:border-accent hover:shadow-md">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <i className={`fa-solid ${v.icon}`} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-semibold text-primary">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
