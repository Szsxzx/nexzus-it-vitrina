"use client";
import { useEffect, useState } from "react";
import { siteData, defaultCategories, type CatalogCategory } from "@/lib/siteData";

/** Fusiona las categorías guardadas con los defaults para añadir campos nuevos (ej: image). */
function mergeWithDefaults(stored: CatalogCategory[]): CatalogCategory[] {
  return stored.map((cat) => {
    const def = defaultCategories.find((d) => d.id === cat.id);
    return {
      ...cat,
      image: cat.image || def?.image || "",   // usa el default si no tiene imagen propia
    };
  });
}

export default function Categories({ onPick }: { onPick: (c: string) => void }) {
  const [cats, setCats] = useState<CatalogCategory[]>(defaultCategories);

  useEffect(() => {
    const stored = siteData.getCategories();
    setCats(mergeWithDefaults(stored));
  }, []);

  return (
    <section id="categories" className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-center mb-10">Nuestros Cortes</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => onPick(c.id)}
            className="group relative rounded-2xl aspect-square overflow-hidden shadow-md hover:scale-[1.02] hover:shadow-xl transition-all duration-300 text-left"
          >
            {/* Imagen de fondo */}
            {c.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.image}
                alt={c.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            )}

            {/* Overlay degradado */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${c.cssClass} ${
                c.image ? "opacity-55 group-hover:opacity-45" : "opacity-100"
              } transition-opacity duration-300`}
            />

            {/* Texto */}
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <p className="font-semibold text-lg text-white leading-tight drop-shadow-md">{c.label}</p>
              <span className="text-xs uppercase tracking-wider text-white/80 group-hover:text-white transition mt-0.5 drop-shadow">
                Ver más →
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
