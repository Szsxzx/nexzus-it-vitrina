"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Product, Category } from "@/lib/types";
import { useCart } from "@/lib/cart";

const filters: { id: "all" | Category; label: string }[] = [
  { id: "all",       label: "Todos" },
  { id: "res",       label: "Res" },
  { id: "cerdo",     label: "Cerdo" },
  { id: "pollo",     label: "Pollo" },
  { id: "embutidos", label: "Embutidos" },
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
          <i
            key={i}
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
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section id="products" className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-center mb-8">Catálogo de Productos</h1>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${
              activeFilter === f.id ? "bg-rojo text-white border-rojo" : "bg-white border-gray-300 hover:border-rojo"
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          type="search"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-full text-sm border border-gray-300 focus:border-rojo outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-16">
          <i className="fa-solid fa-spinner fa-spin text-2xl mb-3 block" />
          Cargando productos...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visible.map((p) => {
            const priceStr    = fmtCOP.format(p.price);
            const oldPriceStr = p.old_price ? fmtCOP.format(p.old_price) : null;
            const imgSrc      = p.image_url || "/img/placeholder.jpg";
            const tags        = p.tags ? p.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

            return (
              <article key={p.slug} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition border flex flex-col">
                <div className="relative aspect-square bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = "/img/placeholder.jpg"; }}
                  />
                  {p.discount && (
                    <span className="absolute top-3 left-3 bg-rojo text-white text-xs px-2 py-1 rounded">
                      {p.discount}
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <Stars n={p.rating} />
                  <span className="text-xs text-gray-400">({p.review_count})</span>
                  <h3 className="font-semibold mt-2">{p.name}</h3>
                  <p className="text-sm text-gray-600 flex-1">{p.description}</p>

                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => add(p.name, priceStr, p.price)}
                      className="w-9 h-9 rounded-full bg-rojo text-white flex items-center justify-center hover:bg-rojo-mid transition"
                      aria-label={`Añadir ${p.name}`}
                    >
                      <i className="fa-solid fa-basket-shopping" />
                    </button>
                    <p className="font-bold text-lg">
                      {priceStr}
                      {oldPriceStr && (
                        <span className="ml-2 text-xs line-through text-gray-400">{oldPriceStr}</span>
                      )}
                    </p>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {tags.map((t) => (
                        <span key={t} className="text-[10px] uppercase bg-crema border border-gray-200 px-2 py-0.5 rounded">
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
            <p className="col-span-full text-center text-gray-500 py-12">
              No hay productos para esta categoría todavía.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
