"use client";
/**
 * Carrito global con Context. Persistido en localStorage para que sobreviva al recargar
 * (mejora respecto al original que se perdía).
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  productId?: number; // id en BD: el backend toma el precio real
  name: string;
  price: string;      // formateado para mostrar
  unitPrice: number;  // numérico para el backend
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  add: (name: string, price: string, unitPrice: number, productId?: number) => void;
  inc: (idx: number) => void;
  dec: (idx: number) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const STORAGE = "nexzus_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify(items)); } catch {}
  }, [items]);

  const value: CartCtx = {
    items,
    count: items.reduce((s, i) => s + i.qty, 0),
    add: (name, price, unitPrice, productId) =>
      setItems((prev) => {
        const i = prev.findIndex((p) => p.name === name);
        if (i >= 0) {
          const copy = [...prev];
          copy[i] = { ...copy[i], qty: copy[i].qty + 1 };
          return copy;
        }
        return [...prev, { name, price, unitPrice, qty: 1, ...(productId != null ? { productId } : {}) }];
      }),
    inc: (idx) => setItems((p) => p.map((it, i) => (i === idx ? { ...it, qty: it.qty + 1 } : it))),
    dec: (idx) =>
      setItems((p) =>
        p.flatMap((it, i) =>
          i === idx ? (it.qty - 1 <= 0 ? [] : [{ ...it, qty: it.qty - 1 }]) : [it]
        )
      ),
    clear: () => setItems([]),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart fuera de CartProvider");
  return v;
}
