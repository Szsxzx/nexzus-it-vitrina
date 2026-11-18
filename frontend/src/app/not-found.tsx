import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary to-secondary px-4 text-center text-white">
      <BrandLogo size={48} className="mb-12" />
      <p className="font-heading text-7xl font-bold text-accent-light md:text-8xl">404</p>
      <h1 className="mt-4 font-heading text-2xl font-semibold">Página no encontrada</h1>
      <p className="mt-3 max-w-sm text-white/70">
        La dirección que busca no existe o fue movida. Vuelva al inicio o visite nuestra tienda.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-accent px-6 font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          <i className="fa-solid fa-house text-sm" aria-hidden="true" />
          Ir al inicio
        </Link>
        <Link
          href="/tienda"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-white/25 px-6 font-semibold text-white transition-colors hover:bg-white/10"
        >
          <i className="fa-solid fa-store text-sm" aria-hidden="true" />
          Ver tienda
        </Link>
      </div>
    </main>
  );
}
