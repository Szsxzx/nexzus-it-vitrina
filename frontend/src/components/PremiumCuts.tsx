"use client";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { api } from "@/lib/api";

interface PremiumSection {
  id: number;
  title: string;
  icon: string;
  color: string;
}

interface PremiumCut {
  id: number;
  section_id: number | null;
  name: string;
  price: string;
  unit_price: number;
  origin: string | null;
  img: string | null;
  badge: string | null;
  badge_color: string;
  text: string | null;
}

/** Hook: dispara cuando el elemento entra al viewport */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function CutCard({ c, index }: { c: PremiumCut; index: number }) {
  const { add } = useCart();
  const { ref, visible } = useInView(0.1);
  const [btnAdded, setBtnAdded] = useState(false);
  const [imgHover, setImgHover] = useState(false);

  function handleAdd() {
    add(c.name, c.price, c.unit_price);
    setBtnAdded(true);
    setTimeout(() => setBtnAdded(false), 1500);
  }

  return (
    <article
      ref={ref}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
      }}
    >
      {/* Imagen */}
      <div
        className="aspect-square rounded-xl overflow-hidden relative bg-gray-100"
        style={{
          boxShadow: imgHover ? "0 8px 28px rgba(0,0,0,0.18)" : "0 2px 8px rgba(0,0,0,0.07)",
          transition: "box-shadow 0.3s ease",
        }}
        onMouseEnter={() => setImgHover(true)}
        onMouseLeave={() => setImgHover(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.img ?? "/img/placeholder.jpg"}
          alt={c.name}
          className="w-full h-full object-cover"
          style={{
            transform: imgHover ? "scale(1.07)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
          onError={(e) => ((e.currentTarget.src = "/img/placeholder.jpg"))}
        />
        {c.badge && (
          <span
            className={`absolute top-3 left-3 text-white text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${c.badge_color}`}
          >
            {c.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col py-1">
        <h3
          className="text-lg font-semibold transition-colors duration-200"
          style={{ color: imgHover ? "#8B0000" : "#111" }}
        >
          {c.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1.5 flex-1 leading-relaxed">{c.text}</p>

        <div className="flex items-center justify-between mt-4">
          <span className="font-bold text-rojo text-lg">{c.price}</span>
          <span className="text-xs text-gray-400 italic">{c.origin}</span>
        </div>

        <button
          onClick={handleAdd}
          className="mt-3 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          style={{
            background: btnAdded ? "#059669" : "#3AA8C1",
            transform: btnAdded ? "scale(0.98)" : "scale(1)",
            boxShadow: btnAdded ? "0 4px 14px rgba(5,150,105,0.35)" : "0 4px 14px rgba(58,168,193,0.3)",
          }}
          onMouseEnter={(e) => {
            if (!btnAdded) (e.currentTarget as HTMLElement).style.background = "#2e8fa8";
          }}
          onMouseLeave={(e) => {
            if (!btnAdded) (e.currentTarget as HTMLElement).style.background = "#3AA8C1";
          }}
        >
          {btnAdded ? (
            <><i className="fa-solid fa-check text-xs" /> Añadido</>
          ) : (
            <><i className="fa-solid fa-basket-shopping text-xs" /> Añadir al carrito</>
          )}
        </button>
      </div>
    </article>
  );
}

function SectionBlock({ s, cuts, sectionIndex }: { s: PremiumSection; cuts: PremiumCut[]; sectionIndex: number }) {
  const { ref, visible } = useInView(0.1);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s ease ${sectionIndex * 0.15}s, transform 0.6s ease ${sectionIndex * 0.15}s`,
      }}
    >
      {/* Header de sección */}
      <header
        className={`${s.color} text-white px-5 py-4 rounded-t-2xl flex items-center gap-3`}
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
      >
        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <i className={`fa-solid ${s.icon} text-lg`} />
        </div>
        <h2 className="text-xl font-semibold tracking-wide">{s.title}</h2>
      </header>

      {/* Grid de cortes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-b-2xl border border-t-0 border-gray-100"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
      >
        {cuts.map((c, i) => (
          <CutCard key={c.id} c={c} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function PremiumCuts() {
  const [sections, setSections] = useState<PremiumSection[]>([]);
  const [cuts, setCuts]         = useState<PremiumCut[]>([]);
  const { ref: titleRef, visible: titleVisible } = useInView(0.2);

  useEffect(() => {
    api.get<PremiumSection[]>("/premium-sections").then(setSections).catch(() => {});
    api.get<PremiumCut[]>("/premium-cuts").then(setCuts).catch(() => {});
  }, []);

  return (
    <section id="premium" className="container mx-auto px-4 py-16">

      {/* Título */}
      <div
        ref={titleRef}
        className="text-center mb-12"
        style={{
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-px w-10 bg-rojo opacity-40" />
          <span className="text-xs font-semibold uppercase tracking-widest text-azul">Selección especial</span>
          <div className="h-px w-10 bg-rojo opacity-40" />
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
          Nuestros Cortes Premium
        </h2>
        <div className="mt-3 mx-auto w-12 h-0.5 rounded-full bg-rojo opacity-60" />
      </div>

      {/* Secciones */}
      <div className="space-y-10">
        {sections.map((s, i) => {
          const sectionCuts = cuts.filter((c) => c.section_id === s.id);
          if (sectionCuts.length === 0) return null;
          return (
            <SectionBlock key={s.id} s={s} cuts={sectionCuts} sectionIndex={i} />
          );
        })}
      </div>
    </section>
  );
}
