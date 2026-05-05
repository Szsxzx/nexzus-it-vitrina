"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { siteData, defaultPromos, type PromoItem } from "@/lib/siteData";

export default function Promotions() {
  const { add } = useCart();
  const [promos, setPromos] = useState<PromoItem[]>(defaultPromos);

  useEffect(() => {
    setPromos(siteData.getPromos());
  }, []);

  return (
    <section id="promotions" className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-center mb-8">Promociones Especiales</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {promos.map((p) => (
          <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow border flex flex-col">
            <div className={`${p.color} text-white p-4 flex items-center justify-between`}>
              <h3 className="font-semibold">{p.name}</h3>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{p.off}</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.img}
              alt={p.name}
              className="aspect-square w-full object-cover bg-gray-100"
              onError={(e) => ((e.currentTarget.src = "/img/placeholder.jpg"))}
            />
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xl font-bold">{p.price}</span>
                {p.oldPrice && (
                  <span className="text-sm line-through text-gray-400">{p.oldPrice}</span>
                )}
              </div>
              <button
                onClick={() => add(p.name, p.price, parseInt(p.price.replace(/[^0-9]/g, '')) || 0)}
                className="mt-auto w-full py-2 rounded-lg bg-rojo text-white hover:bg-rojo-mid transition text-sm font-semibold"
              >
                Añadir al carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
