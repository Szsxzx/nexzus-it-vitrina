import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary pt-16 text-white">
      {/* Retícula sutil */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div aria-hidden="true" className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-accent-light">
            <i className="fa-solid fa-circle-check" aria-hidden="true" />
            Software, hardware y servicios TI en Colombia
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.25rem]">
            Tecnología confiable para que su empresa no se detenga
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
            Equipos, licencias originales, redes y soporte técnico con un solo proveedor. Le asesoramos, instalamos y
            seguimos a su lado después de la venta.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/tienda"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-accent px-6 font-semibold text-white transition-colors duration-150 hover:bg-accent-hover"
            >
              Ver tienda
              <i className="fa-solid fa-arrow-right text-sm" aria-hidden="true" />
            </Link>
            <Link
              href="/#contacto"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-white/25 px-6 font-semibold text-white transition-colors duration-150 hover:bg-white/10"
            >
              <i className="fa-solid fa-headset text-sm" aria-hidden="true" />
              Hablar con un asesor
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            {["Licencias originales", "Garantía en equipos", "Factura electrónica"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <i className="fa-solid fa-check text-accent-light" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-sm lg:max-w-none">
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
            <Image
              src="/img/logo-nexzus.png"
              alt="Logo de NEXZUS IT SERVICE"
              fill
              priority
              sizes="(min-width: 1024px) 420px, 80vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
