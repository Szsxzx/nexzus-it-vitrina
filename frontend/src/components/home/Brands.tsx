import SectionHeading from "./SectionHeading";
import { brands } from "@/lib/data/home";

export default function Brands() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <SectionHeading
        eyebrow="Ecosistema"
        title="Marcas y plataformas con las que trabajamos"
        description="Soluciones compatibles con las plataformas que su equipo ya usa."
      />
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {brands.map((b) => (
          <li
            key={b.name}
            className="flex min-h-[88px] items-center justify-center gap-3 rounded-xl border border-line bg-card px-4 text-muted-foreground transition duration-200 hover:border-accent hover:text-primary hover:shadow-md"
          >
            <i className={`${b.icon} text-2xl`} aria-hidden="true" />
            <span className="font-heading text-sm font-medium">{b.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
