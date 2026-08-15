"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { api } from "@/lib/api";

const fmtCOP = new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0,
});

function InputField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-rojo">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rojo focus:ring-2 focus:ring-rojo/10 transition-all";

export default function WhatsAppCart() {
  const { items, count, inc, dec, clear } = useCart();
  const [open, setOpen]         = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending]   = useState(false);
  const [formErr, setFormErr]   = useState<string | null>(null);
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [notes, setNotes]       = useState("");
  const [btnHover, setBtnHover] = useState(false);
  const [wppNumber, setWppNumber] = useState("573164013230");

  useEffect(() => {
    api.get<{ footer_whatsapp_number: string }>("/settings")
      .then((s) => { if (s.footer_whatsapp_number) setWppNumber(s.footer_whatsapp_number); })
      .catch(() => {});
  }, []);

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
      await api.post("/orders", {
        customer_name:  name.trim(),
        customer_phone: phone.trim(),
        notes:          notes.trim() || undefined,
        channel:        "whatsapp",
        items: items.map((i) => ({ product_name: i.name, unit_price: i.unitPrice, qty: i.qty })),
      });
    } catch { /* continuar aunque el backend no responda */ }

    window.open(
      `https://wa.me/${wppNumber}?text=${encodeURIComponent(buildMessage(name.trim()))}`,
      "_blank"
    );
    clear(); setShowForm(false); setOpen(false);
    setName(""); setPhone(""); setNotes("");
    setSending(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end">

      {/* ── Panel ────────────────────────────────────── */}
      <div
        className="mb-3 w-[340px] bg-white rounded-2xl overflow-hidden flex flex-col"
        style={{
          boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
          maxHeight: "80vh",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.96)",
          pointerEvents: open ? "auto" : "none",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #1a1a1a, #2d0000)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <i className="fa-solid fa-basket-shopping text-white text-sm" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Tu pedido</p>
              <p className="text-white/50 text-xs">{count} {count === 1 ? "producto" : "productos"}</p>
            </div>
          </div>
          <button
            onClick={() => { setOpen(false); setShowForm(false); }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* ── Vista: Carrito ── */}
        {!showForm && (
          <>
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                    <i className="fa-solid fa-basket-shopping text-2xl text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">Tu carrito está vacío</p>
                  <p className="text-gray-300 text-xs mt-1">Agrega productos para hacer tu pedido</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50 px-3 py-2">
                  {items.map((it, idx) => (
                    <li key={`${it.name}-${idx}`} className="flex items-center gap-3 py-3">
                      <div className="w-8 h-8 rounded-lg bg-rojo/10 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-drumstick-bite text-rojo text-xs" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{it.name}</p>
                        <p className="text-xs text-gray-400">{it.price}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => dec(idx)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-500 hover:bg-rojo hover:text-white transition-all text-sm font-bold"
                          style={{ background: "#f5f5f5" }}
                        >−</button>
                        <span className="w-5 text-center text-sm font-semibold text-gray-700">{it.qty}</span>
                        <button
                          onClick={() => inc(idx)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-500 hover:bg-rojo hover:text-white transition-all text-sm font-bold"
                          style={{ background: "#f5f5f5" }}
                        >+</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Total + botones */}
            {items.length > 0 && (
              <div className="flex-shrink-0 border-t border-gray-100 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total estimado</span>
                  <span className="text-lg font-bold text-gray-900">{fmtCOP.format(total)}</span>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{ background: "#16a34a" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#15803d")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#16a34a")}
                >
                  <i className="fa-brands fa-whatsapp text-base" /> Enviar por WhatsApp
                </button>
                <button
                  onClick={clear}
                  className="w-full py-1.5 text-xs text-gray-400 hover:text-rojo transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Vista: Formulario ── */}
        {showForm && (
          <form onSubmit={handleSend} className="flex flex-col flex-1 overflow-y-auto">
            <div className="flex-1 px-5 py-4 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
                >
                  <i className="fa-solid fa-arrow-left text-gray-500 text-xs" />
                </button>
                <p className="text-sm font-semibold text-gray-700">Completa tu pedido</p>
              </div>

              <InputField label="Nombre" required>
                <input required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre completo" className={inputClass} />
              </InputField>

              <InputField label="Teléfono / WhatsApp" required>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="300 123 4567" className={inputClass} />
              </InputField>

              <InputField label="Notas (opcional)">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dirección, indicaciones especiales..."
                  rows={2} className={`${inputClass} resize-none`} />
              </InputField>

              {/* Resumen */}
              <div className="rounded-xl overflow-hidden border border-gray-100">
                <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Resumen
                </div>
                <div className="px-3 py-2 space-y-1">
                  {items.map((it) => (
                    <div key={it.name} className="flex justify-between text-xs text-gray-600">
                      <span className="truncate">{it.name} ×{it.qty}</span>
                      <span className="font-medium ml-2 flex-shrink-0">{fmtCOP.format(it.unitPrice * it.qty)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100 mt-1">
                    <span>Total</span>
                    <span>{fmtCOP.format(total)}</span>
                  </div>
                </div>
              </div>

              {formErr && <p className="text-xs text-rojo">{formErr}</p>}
            </div>

            <div className="flex-shrink-0 border-t border-gray-100 p-4">
              <button
                type="submit" disabled={sending}
                className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{ background: "#16a34a" }}
                onMouseEnter={(e) => { if (!sending) (e.currentTarget as HTMLElement).style.background = "#15803d"; }}
                onMouseLeave={(e) => { if (!sending) (e.currentTarget as HTMLElement).style.background = "#16a34a"; }}
              >
                {sending
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Enviando...</>
                  : <><i className="fa-brands fa-whatsapp text-base" /> Confirmar y enviar</>}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Botón flotante ───────────────────────────── */}
      <button
        onClick={() => { setOpen((o) => !o); setShowForm(false); }}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        className="relative flex items-center gap-2.5 rounded-full text-white font-bold text-sm transition-all duration-300"
        style={{
          background: btnHover ? "#15803d" : "#16a34a",
          padding: "12px 22px",
          boxShadow: btnHover
            ? "0 8px 30px rgba(22,163,74,0.5)"
            : "0 4px 20px rgba(22,163,74,0.35)",
          transform: btnHover ? "scale(1.05)" : "scale(1)",
        }}
      >
        <i className={`fa-brands fa-whatsapp text-xl transition-transform duration-300 ${btnHover ? "rotate-12" : ""}`} />
        <span>¡Pide ya!</span>
        {count > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold"
            style={{ background: "#8B0000", boxShadow: "0 2px 6px rgba(139,0,0,0.4)" }}
          >
            {count}
          </span>
        )}
      </button>
    </div>
  );
}
