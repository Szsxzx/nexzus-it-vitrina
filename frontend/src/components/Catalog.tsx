"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Product, Category } from "@/lib/types";
import { useCart } from "@/lib/cart";

const filters: { id: "all" | Category; label: string; icon: string; emoji: string }[] = [
  { id: "all",       label: "Todos",     icon: "fa-border-all",     emoji: "🥩" },
  { id: "res",       label: "Res",       icon: "fa-cow",            emoji: "🐄" },
  { id: "cerdo",     label: "Cerdo",     icon: "fa-piggy-bank",     emoji: "🐷" },
  { id: "pollo",     label: "Pollo",     icon: "fa-drumstick-bite", emoji: "🍗" },
  { id: "embutidos", label: "Embutidos", icon: "fa-fire-burner",    emoji: "🌭" },
];

const fmtCOP = new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0,
});

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5 text-yellow-500 text-sm">
      {Array.from({ length: 5 }).map((_, i) => {
        const v = n - i;
        return (
          <i key={i}
            className={`fa-${v >= 1 ? "solid" : v > 0 ? "solid fa-star-half-stroke" : "regular"} fa-star`}
          />
        );
      })}
    </div>
  );
}

export default function Catalog({ activeFilter, onFilter }: {
  activeFilter: "all" | Category;
  onFilter: (f: "all" | Category) => void;
}) {
  const { add } = useCart();
  const [search, setSearch]     = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [focused, setFocused]   = useState(false);

  useEffect(() => {
    api.get<Product[]>("/products?only_active=true")
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      if (activeFilter !== "all" && p.category !== activeFilter) return false;
      if (term && !`${p.name} ${p.description}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [products, activeFilter, search]);

  // Contar productos por categoría
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    products.forEach((p) => { c[p.category] = (c[p.category] ?? 0) + 1; });
    return c;
  }, [products]);

  return (
    <section id="products" className="container mx-auto px-4 py-12">

      {/* Título */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-px w-10 bg-rojo opacity-40" />
          <span className="text-xs font-semibold uppercase tracking-widest text-azul">Selección del día</span>
          <div className="h-px w-10 bg-rojo opacity-40" />
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">Catálogo de Productos</h2>
        <div className="mt-3 mx-auto w-12 h-0.5 rounded-full bg-rojo opacity-60" />
      </div>

      {/* ── Barra de filtros ── */}
      <div className="flex flex-col items-center gap-4 mb-10">

        {/* Contenedor tipo segmented control */}
        <div
          className="inline-flex items-center gap-1 p-1.5 rounded-2xl"
          style={{
            background: "#fff",
            border: "1.5px solid #ececec",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          {filters.map((f) => {
            const isActive = activeFilter === f.id;
            const count = counts[f.id] ?? 0;
            return (
              <button
                key={f.id}
                onClick={() => onFilter(f.id)}
                className="relative inline-flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl text-xs font-semibold select-none transition-all duration-200"
                style={{
                  background: isActive ? "#8B0000" : "transparent",
                  color: isActive ? "#fff" : "#777",
                  boxShadow: isActive ? "0 4px 14px rgba(139,0,0,0.3)" : "none",
                  transform: isActive ? "scale(1.04)" : "scale(1)",
                  minWidth: "64px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(139,0,0,0.06)";
                    (e.currentTarget as HTMLElement).style.color = "#8B0000";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#777";
                  }
                }}
              >
                <span className="text-base leading-none">{f.emoji}</span>
                <span className="leading-none">{f.label}</span>
                {!loading && (
                  <span
                    className="text-[9px] font-bold leading-none mt-0.5"
                    style={{ opacity: isActive ? 0.7 : 0.4 }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Buscador */}
        <div
          className="relative flex items-center w-full max-w-sm"
          style={{
            background: "#fff",
            border: `1.5px solid ${focused ? "#8B0000" : "#e8e8e8"}`,
            borderRadius: "9999px",
            boxShadow: focused ? "0 0 0 3px rgba(139,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)" : "0 2px 8px rgba(0,0,0,0.05)",
            transition: "all 0.2s ease",
          }}
        >
          <i
            className="fa-solid fa-magnifying-glass absolute left-4 text-xs"
            style={{ color: focused ? "#8B0000" : "#bbb", transition: "color 0.2s" }}
          />
          <input
            type="search"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full pl-9 pr-9 py-2.5 rounded-full text-sm bg-transparent outline-none"
            style={{ color: "#333" }}
          />
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 w-4 h-4 rounded-full flex items-center justify-center transition-all"
              style={{ background: "#ddd", color: "#666" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#8B0000"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#ddd"; (e.currentTarget as HTMLElement).style.color = "#666"; }}
            >
              <i className="fa-solid fa-xmark text-[9px]" />
            </button>
          ) : (
            <span className="absolute right-4 text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: "#f0f0f0", color: "#bbb" }}>
              /
            </span>
          )}
        </div>
      </div>

      {/* ── Grid de productos ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              {/* Imagen skeleton */}
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-shine" />
              </div>
              {/* Contenido skeleton */}
              <div className="p-4 space-y-3">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-3 w-3 rounded bg-gray-100 relative overflow-hidden">
                      <div className="absolute inset-0 skeleton-shine" />
                    </div>
                  ))}
                </div>
                <div className="h-4 bg-gray-100 rounded-lg w-3/4 relative overflow-hidden">
                  <div className="absolute inset-0 skeleton-shine" />
                </div>
                <div className="h-3 bg-gray-100 rounded-lg w-full relative overflow-hidden">
                  <div className="absolute inset-0 skeleton-shine" />
                </div>
                <div className="h-3 bg-gray-100 rounded-lg w-2/3 relative overflow-hidden">
                  <div className="absolute inset-0 skeleton-shine" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="w-9 h-9 rounded-full bg-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 skeleton-shine" />
                  </div>
                  <div className="h-5 w-24 bg-gray-100 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 skeleton-shine" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <style jsx>{`
            .skeleton-shine {
              background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%);
              background-size: 200% 100%;
              animation: shine 1.4s infinite;
            }
            @keyframes shine {
              0%   { background-position: -200% 0; }
              100% { background-position:  200% 0; }
            }
          `}</style>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visible.map((p) => {
            const priceStr    = fmtCOP.format(p.price);
            const oldPriceStr = p.old_price ? fmtCOP.format(p.old_price) : null;
            const imgSrc      = p.image_url || "/img/placeholder.jpg";
            const tags        = p.tags ? p.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

            return (
              <article
                key={p.slug}
                className="bg-white rounded-2xl overflow-hidden border flex flex-col group"
                style={{
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)";
                }}
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = "/img/placeholder.jpg"; }}
                  />
                  {p.discount && (
                    <span className="absolute top-3 left-3 bg-rojo text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                      {p.discount}
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <Stars n={p.rating} />
                    <span className="text-xs text-gray-400">({p.review_count})</span>
                  </div>
                  <h3 className="font-semibold mt-2 text-gray-900">{p.name}</h3>
                  <p className="text-sm text-gray-500 flex-1 mt-0.5">{p.description}</p>

                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => add(p.name, priceStr, p.price)}
                      className="w-9 h-9 rounded-full text-white flex items-center justify-center transition-all duration-200"
                      style={{ background: "#8B0000" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "#6b0000";
                        (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "#8B0000";
                        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                      }}
                      aria-label={`Añadir ${p.name}`}
                    >
                      <i className="fa-solid fa-basket-shopping text-sm" />
                    </button>
                    <p className="font-bold text-lg text-gray-900">
                      {priceStr}
                      {oldPriceStr && (
                        <span className="ml-2 text-xs line-through text-gray-400">{oldPriceStr}</span>
                      )}
                    </p>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {tags.map((t) => (
                        <span key={t} className="text-[10px] uppercase tracking-wide bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-gray-500">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {visible.length === 0 && (
            <div className="col-span-full text-center py-16">
              <i className="fa-solid fa-box-open text-4xl text-gray-200 mb-3 block" />
              <p className="text-gray-400 text-sm">No hay productos para esta categoría todavía.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
