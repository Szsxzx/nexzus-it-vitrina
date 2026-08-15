"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { api } from "@/lib/api";

interface PromoItem {
  id: number;
  name: string;
  price: string;
  old_price: string | null;
  unit_price: number;
  off: string;
  color: string;
  img: string | null;
}

const colorHex: Record<string, string> = {
  "bg-rojo":      "#8B0000",
  "bg-negro2":    "#1a1a1a",
  "bg-azul":      "#3AA8C1",
  "bg-green-700": "#15803d",
  "bg-amber-600": "#d97706",
};

export default function Promotions() {
  const { add } = useCart();
  const [promos, setPromos]   = useState<PromoItem[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [added, setAdded]     = useState<number | null>(null);

  useEffect(() => {
    api.get<PromoItem[]>("/promotions").then(setPromos).catch(() => {});
  }, []);

  function handleAdd(p: PromoItem) {
    add(p.name, p.price, p.unit_price);
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  }

  const hex = (color: string) => colorHex[color] ?? "#8B0000";

  return (
    <section id="promotions" style={{ background: "#faf9f7" }} className="py-16">
      <div className="container mx-auto px-4">

        {/* Encabezado */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-rojo mb-2">
            Ofertas limitadas
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
            Promociones Especiales
          </h2>
          <div className="mt-3 mx-auto w-12 h-0.5 bg-rojo rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {promos.map((p) => {
            const isHovered = hovered === p.id;
            const isAdded   = added   === p.id;
            const color     = hex(p.color);

            return (
              <div
                key={p.id}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                className="bg-white rounded-2xl overflow-hidden flex flex-col"
                style={{
                  border: `1.5px solid ${isHovered ? color : "#f0f0f0"}`,
                  boxShadow: isHovered
                    ? `0 16px 40px ${color}28, 0 2px 8px rgba(0,0,0,0.06)`
                    : "0 1px 4px rgba(0,0,0,0.06)",
                  transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Badge de descuento */}
                <div
                  className="relative overflow-hidden"
                  style={{ background: color }}
                >
                  <div className="px-4 py-3 flex items-center justify-between relative z-10">
                    <h3 className="font-semibold text-white text-sm truncate pr-2">{p.name}</h3>
                    <span
                      className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
                    >
                      {p.off}
                    </span>
                  </div>
                  {/* Círculo decorativo */}
                  <div
                    className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-20"
                    style={{ background: "#fff" }}
                  />
                </div>

                {/* Imagen */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.img ?? "/img/placeholder.jpg"}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    style={{
                      transform: isHovered ? "scale(1.07)" : "scale(1)",
                      transition: "transform 0.4s ease",
                    }}
                    onError={(e) => ((e.currentTarget.src = "/img/placeholder.jpg"))}
                  />
                  {/* Gradiente inferior */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-12"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.15), transparent)" }}
                  />
                </div>

                {/* Precios + botón */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-900">{p.price}</span>
                    {p.old_price && (
                      <span className="text-sm line-through text-gray-400">{p.old_price}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAdd(p)}
                    className="mt-auto w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                    style={{
                      background: isAdded ? "#15803d" : color,
                      color: "#fff",
                      transform: isAdded ? "scale(0.97)" : "scale(1)",
                    }}
                  >
                    {isAdded ? (
                      <><i className="fa-solid fa-check" /> Añadido</>
                    ) : (
                      <><i className="fa-solid fa-basket-shopping" /> Añadir al carrito</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
