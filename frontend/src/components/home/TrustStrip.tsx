import { trustItems } from "@/lib/data/home";

/** Franja de confianza: garantía, soporte, pagos seguros y envíos. */
export default function TrustStrip() {
  return (
    <section aria-label="Garantías de compra" className="border-b border-line bg-card">
      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 md:px-6 lg:grid-cols-4">
        {trustItems.map((f) => (
          <li key={f.title} className="flex gap-4">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <i className={`fa-solid ${f.icon}`} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-heading text-sm font-semibold text-primary">{f.title}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{f.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
