"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** Hook: se activa una sola vez cuando el elemento entra al viewport */
export function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
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
  const { ref, visible } = useInView(0.12);
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
