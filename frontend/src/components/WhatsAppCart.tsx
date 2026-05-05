"use client";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { api } from "@/lib/api";
import { siteData } from "@/lib/siteData";



const fmtCOP = new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0,
});

export default function WhatsAppCart() {
  const { items, count, inc, dec, clear } = useCart();
  const [open, setOpen]           = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [sending, setSending]     = useState(false);
  const [formErr, setFormErr]     = useState<string | null>(null);
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [notes, setNotes]         = useState("");

  const total = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  function buildMessage(customerName: string): string {
    let m = `¡Hola! Soy ${customerName} y quiero hacer el siguiente pedido 🥩\n\n`;
    items.forEach((i) => (m += `• ${i.name} — ${i.price} (x${i.qty})\n`));
    m += `\nTotal estimado: ${fmtCOP.format(total)}`;
    if (notes) m += `\n\nNotas: ${notes}`;
    m += "\n\n¿Me pueden confirmar disponibilidad? 😊";
    return m;
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) return;
    setSending(true);
    setFormErr(null);

    try {
      // 1. Registrar en la base de datos
      await api.post("/orders", {
        customer_name:  name.trim(),
        customer_phone: phone.trim(),
        notes:          notes.trim() || undefined,
        channel:        "whatsapp",
        items: items.map((i) => ({
          product_name: i.name,
          unit_price:   i.unitPrice,
          qty:          i.qty,
        })),
      });
    } catch {
      // Si el backend no está disponible, seguimos igual (no bloqueamos al cliente)
    }

    // 2. Abrir WhatsApp
    window.open(
      `https://wa.me/${siteData.getFooter().whatsappNumber || "573164013230"}?text=${encodeURIComponent(buildMessage(name.trim()))}`,
      "_blank"
    );

    // 3. Limpiar
    clear();
    setShowForm(false);
    setOpen(false);
    setName("");
    setPhone("");
    setNotes("");
    setSending(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[90]">
      {/* ── Carrito ─────────────────────────────────── */}
      {open && !showForm && (
        <div className="mb-3 w-80 bg-white rounded-xl shadow-2xl border overflow-hidden">
          <div className="flex items-center justify-between bg-rojo text-white px-4 py-2">
            <span className="font-semibold">🛒 Tu pedido</span>
            <button onClick={() => setOpen(false)} aria-label="Cerrar">✕</button>
          </div>

          <ul className="max-h-72 overflow-auto">
            {items.length === 0 ? (
              <li className="p-5 text-center text-gray-500 text-sm">Sin productos aún 🛒</li>
            ) : (
              items.map((it, idx) => (
                <li key={`${it.name}-${idx}`} className="flex items-center justify-between gap-3 px-4 py-2 border-b">
                  <span className="text-sm flex-1 truncate">{it.name}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => dec(idx)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-base leading-none">−</button>
                    <span className="w-5 text-center text-sm">{it.qty}</span>
                    <button onClick={() => inc(idx)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-base leading-none">+</button>
                  </div>
                  <span className="text-sm font-semibold flex-shrink-0">{it.price}</span>
                </li>
              ))
            )}
          </ul>

          {items.length > 0 && (
            <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b text-sm">
              <span className="text-gray-500">Total estimado</span>
              <span className="font-bold text-gray-900">{fmtCOP.format(total)}</span>
            </div>
          )}

          <div className="p-3 space-y-2">
            <button
              onClick={() => setShowForm(true)}
              disabled={!items.length}
              className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              <i className="fa-brands fa-whatsapp" /> Enviar pedido
            </button>
            {items.length > 0 && (
              <button onClick={clear} className="w-full py-1 text-xs text-gray-400 hover:text-rojo transition">
                Vaciar carrito
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Formulario de contacto ───────────────────── */}
      {open && showForm && (
        <form
          onSubmit={handleSend}
          className="mb-3 w-80 bg-white rounded-xl shadow-2xl border overflow-hidden"
        >
          <div className="flex items-center justify-between bg-rojo text-white px-4 py-2">
            <span className="font-semibold">📋 Tus datos</span>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Volver">✕</button>
          </div>

          <div className="px-4 py-4 space-y-3">
            <p className="text-xs text-gray-500">
              Para registrar tu pedido necesitamos tu nombre y teléfono.
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Teléfono / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="300 123 4567"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dirección, indicaciones especiales..."
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-700 resize-none"
              />
            </div>

            {/* Resumen rápido */}
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 space-y-0.5">
              {items.map((it) => (
                <div key={it.name} className="flex justify-between">
                  <span className="truncate">{it.name} x{it.qty}</span>
                  <span className="font-medium ml-2">{fmtCOP.format(it.unitPrice * it.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-gray-700 pt-1 border-t border-gray-200 mt-1">
                <span>Total</span>
                <span>{fmtCOP.format(total)}</span>
              </div>
            </div>

            {formErr && (
              <p className="text-xs text-red-600">{formErr}</p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              {sending
                ? <><i className="fa-solid fa-spinner fa-spin" /> Enviando...</>
                : <><i className="fa-brands fa-whatsapp" /> Confirmar y enviar</>
              }
            </button>
          </div>
        </form>
      )}

      {/* ── Botón flotante ───────────────────────────── */}
      <button
        onClick={() => { setOpen((o) => !o); setShowForm(false); }}
        className="relative bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 transition"
      >
        <i className="fa-brands fa-whatsapp text-xl" />
        <span className="font-semibold text-sm">¡Pide ya!</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-rojo text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {count}
          </span>
        )}
      </button>
    </div>
  );
}
