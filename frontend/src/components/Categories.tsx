"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface CatalogCategory {
  id: number;
  slug: string;
  label: string;
  css_class: string;
  image: string | null;
}

export default function Categories({ onPick }: { onPick: (c: string) => void }) {
  const [cats, setCats]     = useState<CatalogCategory[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    api.get<CatalogCategory[]>("/catalog-categories").then(setCats).catch(() => {});
  }, []);

  return (
    <section id="categories" className="py-16">
      <div className="container mx-auto px-4">

        {/* Encabezado */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-rojo mb-2">
            Selección del día
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
            Nuestros Cortes
          </h2>
          <div className="mt-3 mx-auto w-12 h-0.5 bg-rojo rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cats.map((c, i) => {
            const isHovered = hovered === c.slug;
            return (
              <button
                key={c.id}
                onClick={() => onPick(c.slug)}
                onMouseEnter={() => setHovered(c.slug)}
                onMouseLeave={() => setHovered(null)}
                className="relative rounded-2xl aspect-square overflow-hidden text-left focus:outline-none"
                style={{
                  boxShadow: isHovered
                    ? "0 20px 50px rgba(0,0,0,0.25)"
                    : "0 4px 16px rgba(0,0,0,0.12)",
                  transform: isHovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {/* Imagen de fondo */}
                {c.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image}
                    alt={c.label}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      transform: isHovered ? "scale(1.1)" : "scale(1)",
                      transition: "transform 0.5s ease",
                    }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                )}

                {/* Overlay degradado */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${c.css_class}`}
                  style={{
                    opacity: c.image ? (isHovered ? 0.5 : 0.6) : 1,
                    transition: "opacity 0.3s ease",
                  }}
                />

                {/* Overlay oscuro extra al hover */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 60%)",
                    opacity: isHovered ? 1 : 0.7,
                    transition: "opacity 0.3s ease",
                  }}
                />

                {/* Número decorativo */}
                <div
                  className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    backdropFilter: "blur(4px)",
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? "scale(1)" : "scale(0.5)",
                    transition: "all 0.25s ease",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* Texto */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <p
                    className="font-bold text-white leading-tight drop-shadow-lg"
                    style={{
                      fontSize: isHovered ? "1.1rem" : "1rem",
                      transition: "font-size 0.2s ease",
                    }}
                  >
                    {c.label}
                  </p>

                  {/* "Ver productos" aparece en hover */}
                  <div
                    className="flex items-center gap-1.5 mt-1"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? "translateY(0)" : "translateY(6px)",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                      Ver productos
                    </span>
                    <i className="fa-solid fa-arrow-right text-white text-[10px]" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
