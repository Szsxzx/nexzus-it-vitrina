import Link from "next/link";
import Reveal from "@/components/Reveal";

export default function PqrCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <Reveal>
        <div className="flex flex-col items-start gap-6 rounded-2xl border border-line bg-accent-soft p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="flex gap-5">
            <span className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-white sm:flex">
              <i className="fa-solid fa-file-pen" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-primary">¿Tiene una petición, queja o reclamo?</h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Radíquela en línea y reciba un número de seguimiento. Respondemos dentro de los plazos de la Ley 1755 de 2015.
              </p>
            </div>
          </div>
          <Link
            href="/pqr"
            className="inline-flex min-h-[48px] flex-shrink-0 items-center gap-2 rounded-lg bg-primary px-6 font-semibold text-white transition-colors duration-150 hover:bg-secondary"
          >
            Radicar o consultar PQR
            <i className="fa-solid fa-arrow-right text-sm" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
