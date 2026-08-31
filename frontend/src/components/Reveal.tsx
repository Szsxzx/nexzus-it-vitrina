"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Hook: `visible` sigue en tiempo real si el elemento está o no dentro del
 * viewport. Así la animación se repite cada vez que se hace scroll hacia la
 * sección (no solo la primera vez).
 *
 * El observer usa threshold 0 (basta con que asome un píxel): en móvil las
 * tarjetas ocupan todo el ancho y son altas, así que un threshold del 12%
 * podía no alcanzarse nunca para las últimas tarjetas —las de la sección de
 * recetas, justo encima del footer— y quedaban con `opacity: 0`, invisibles y
 * sin poder tocarse. El escalonado de la animación se hace con el prop `delay`.
 */
export function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Si el usuario pidió reducir movimiento, mostrar sin animar.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    // Navegadores sin IntersectionObserver: mostrar todo directamente.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    // Red de seguridad: si por lo que sea el observer no dispara, revelar el
    // contenido que ya esté dentro del viewport para no dejarlo inaccesible.
    const failsafe = window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) setVisible(true);
    }, 1000);
    return () => { obs.disconnect(); window.clearTimeout(failsafe); };
  }, []);
  return { ref, visible };
}

/**
 * Envoltorio que hace aparecer su contenido con un fade + subida cuando entra
 * al viewport al hacer scroll. Se usa igual en productos, promociones, premium
 * y consejos para que la animación sea consistente en todo el sitio.
 */
export default function Reveal({
  children,
  className,
  style,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** retardo en segundos, útil para escalonar tarjetas de un grid */
  delay?: number;
  /** desplazamiento vertical inicial en px */
  y?: number;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
