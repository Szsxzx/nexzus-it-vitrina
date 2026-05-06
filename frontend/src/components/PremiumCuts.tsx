"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { siteData, type PremiumSection, type PremiumCut } from "@/lib/siteData";

export default function PremiumCuts() {
  const { add } = useCart();
  const [sections, setSections] = useState<PremiumSection[]>([]);
  const [cuts, setCuts] = useState<PremiumCut[]>([]);

  useEffect(() => {
    setSections(siteData.getPremiumSections());
    setCuts(siteData.getPremiumCuts());
  }, []);

  return (
    <section id="premium" className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-center mb-10">Nuestros Cortes Premium</h1>
      <div className="space-y-12">
        {sections.map((s) => {
          const sectionCuts = cuts.filter((c) => c.sectionId === s.id);
          if (sectionCuts.length === 0) return null;
          return (
            <div key={s.id}>
              <header className={`${s.color} text-white p-4 rounded-t-xl flex items-center gap-3`}>
                <i className={`fa-solid ${s.icon} text-2xl`} />
                <h2 className="text-xl font-semibold">{s.title}</h2>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-b-xl border border-t-0">
                {sectionCuts.map((c) => (
                  <article key={c.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                    <div className="aspect-square rounded-lg overflow-hidden relative bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.img}
                        alt={c.name}
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.currentTarget.src = "/img/placeholder.jpg"))}
                      />
                      <span className={`absolute top-3 left-3 text-white text-xs px-2 py-1 rounded ${c.badgeColor}`}>
                        {c.badge}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold">{c.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 flex-1">{c.text}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-rojo">{c.price}</span>
                        <span className="text-xs text-gray-400">{c.origin}</span>
                      </div>
                      <button
                        onClick={() => add(c.name, c.price, c.unitPrice)}
                        className="mt-3 py-2 rounded bg-azul hover:bg-azul-dark text-white text-sm transition"
                      >
                        Añadir al carrito
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
