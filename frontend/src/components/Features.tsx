"use client";
import { useState } from "react";

const features = [
  { icon: "fa-truck",       title: "Envío gratuito",      text: "En pedidos superiores a $100.000 en Medellín" },
  { icon: "fa-certificate", title: "Calidad garantizada", text: "Certificación INVIMA y trazabilidad completa" },
  { icon: "fa-percent",     title: "Descuentos",          text: "Programa de fidelidad para clientes frecuentes" },
  { icon: "fa-clock",       title: "Horario extendido",   text: "Lunes a Sábado 7am - 8pm" },
];

export default function Features() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="container mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((f) => {
        const isHovered = hovered === f.title;
        return (
          <div
            key={f.title}
            onMouseEnter={() => setHovered(f.title)}
            onMouseLeave={() => setHovered(null)}
            className="bg-white rounded-xl p-5 border flex gap-4 cursor-default"
            style={{
              boxShadow: isHovered
                ? "0 12px 32px rgba(139,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)"
                : "0 1px 4px rgba(0,0,0,0.07)",
              transform: isHovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
              borderColor: isHovered ? "rgba(139,0,0,0.2)" : "#f0f0f0",
            }}
          >
            <div
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-250"
              style={{
                background: isHovered ? "#8B0000" : "rgba(139,0,0,0.08)",
                transform: isHovered ? "rotate(-8deg) scale(1.1)" : "rotate(0) scale(1)",
                transition: "all 0.25s ease",
              }}
            >
              <i
                className={`fa-solid ${f.icon} text-xl`}
                style={{ color: isHovered ? "#fff" : "#8B0000", transition: "color 0.2s" }}
              />
            </div>
            <div>
              <div
                className="font-semibold transition-colors duration-200"
                style={{ color: isHovered ? "#8B0000" : "#1a1a1a" }}
              >
                {f.title}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{f.text}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
