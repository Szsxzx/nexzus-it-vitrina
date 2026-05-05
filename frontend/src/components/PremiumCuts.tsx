"use client";
/**
 * Cortes Premium — bugs M1 y M2 corregidos:
 * cada botón añade el producto correcto al carrito.
 */
import { useCart } from "@/lib/cart";

interface Cut {
  name: string;
  price: string;
  unitPrice: number;
  origin: string;
  img: string;
  badge: string;
  badgeColor: string;
  text: string;
}

interface Section {
  title: string;
  icon: string;
  color: string;
  cuts: Cut[];
}

const sections: Section[] = [
  {
    title: "Cortes de Res", icon: "fa-cow", color: "bg-rojo",
    cuts: [
      { name: "Lomo Fino Angus", price: "$32.000/kg", unitPrice: 32000, origin: "Origen: Argentina",
        img: "/img/lomo-fino.jpg", badge: "TOP VENTAS", badgeColor: "bg-azul",
        text: "Corte premium ideal para filetes, con marmoleo perfecto que garantiza terneza y sabor." },
      { name: "Tomahawk", price: "$68.000/unidad", unitPrice: 68000, origin: "Origen: Colombia",
        img: "/img/tomahawk.jpg", badge: "NUEVO", badgeColor: "bg-rojo",
        text: "Filete grueso con hueso, perfecto para parrilla. Peso aproximado 1.2kg por unidad." },
    ],
  },
  {
    title: "Cortes de Cerdo", icon: "fa-piggy-bank", color: "bg-negro2",
    cuts: [
      { name: "Chuleta de Cerdo", price: "$18.500/kg", unitPrice: 18500, origin: "Origen: Antioquia",
        img: "/img/chuleta-cerdo.jpg", badge: "-15%", badgeColor: "bg-rojo",
        text: "Corte fresco y jugoso, ideal para asar o freír. Presentación en paquetes de 1kg." },
      { name: "Costillas BBQ", price: "$25.900/paquete", unitPrice: 25900, origin: "Origen: Valle",
        img: "/img/costillas-bbq.jpg", badge: "RECOMENDADO", badgeColor: "bg-azul",
        text: "Paquete de costillas marinadas listas para la parrilla. Incluye salsa BBQ artesanal." },
    ],
  },
  {
    title: "Cortes de Pollo", icon: "fa-drumstick-bite", color: "bg-azul",
    cuts: [
      { name: "Pechuga de Pollo", price: "$12.900/bandeja", unitPrice: 12900, origin: "Origen: Santander",
        img: "/img/pechuga-pollo.jpg", badge: "ORGÁNICO", badgeColor: "bg-negro2",
        text: "Pechuga deshuesada y sin piel, de crianza orgánica. Bandeja de 500g." },
      { name: "Alitas Picantes", price: "$15.500/paquete", unitPrice: 15500, origin: "Origen: Cundinamarca",
        img: "/img/alitas-picantes.jpg", badge: "ESPECIAL", badgeColor: "bg-azul",
        text: "Alitas marinadas en salsa picante artesanal, listas para hornear. Paquete de 1kg." },
    ],
  },
];

export default function PremiumCuts() {
  const { add } = useCart();
  return (
    <section id="premium" className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-center mb-10">Nuestros Cortes Premium</h1>
      <div className="space-y-12">
        {sections.map((s) => (
          <div key={s.title}>
            <header className={`${s.color} text-white p-4 rounded-t-xl flex items-center gap-3`}>
              <i className={`fa-solid ${s.icon} text-2xl`} />
              <h2 className="text-xl font-semibold">{s.title}</h2>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-b-xl border border-t-0">
              {s.cuts.map((c) => (
                <article key={c.name} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                  <div className="aspect-square rounded-lg overflow-hidden relative bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.img} alt={c.name} className="w-full h-full object-cover"
                      onError={(e) => ((e.currentTarget.src = "/img/placeholder.jpg"))} />
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
        ))}
      </div>
    </section>
  );
}
