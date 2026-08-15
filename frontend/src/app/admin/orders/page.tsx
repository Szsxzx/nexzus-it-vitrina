"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  PageShell, PageHeader, ErrorBox, Badge,
  Table, Thead, Th, Tbody, Tr, Td, EmptyState,
  Modal, ModalBody,
} from "@/components/AdminUI";
import { api, type ApiError } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pendiente", "confirmado", "en_camino", "entregado", "cancelado"];
const fmtCOP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

const statusMeta: Record<OrderStatus, {
  color: "amber"|"blue"|"purple"|"green"|"gray";
  label: string; icon: string; bg: string; text: string;
}> = {
  pendiente:  { color: "amber",  label: "Pendiente",  icon: "fa-clock",             bg: "#fffbeb", text: "#d97706" },
  confirmado: { color: "blue",   label: "Confirmado", icon: "fa-circle-check",      bg: "#eff6ff", text: "#2563eb" },
  en_camino:  { color: "purple", label: "En camino",  icon: "fa-truck-fast",        bg: "#faf5ff", text: "#7c3aed" },
  entregado:  { color: "green",  label: "Entregado",  icon: "fa-house-circle-check",bg: "#ecfdf5", text: "#059669" },
  cancelado:  { color: "gray",   label: "Cancelado",  icon: "fa-ban",               bg: "#f9f9f9", text: "#9ca3af" },
};

const STATUS_ORDER: OrderStatus[] = ["pendiente", "confirmado", "en_camino", "entregado"];

export default function OrdersPage() {
  const { user } = useAdminAuth();
  const [orders, setOrders]     = useState<Order[]>([]);
  const [filter, setFilter]     = useState<"all" | OrderStatus>("all");
  const [open, setOpen]         = useState<Order | null>(null);
  const [err, setErr]           = useState<string | null>(null);
  const [changing, setChanging] = useState(false);

  function reload() {
    const path = filter === "all" ? "/orders" : `/orders?status_filter=${filter}`;
    api.get<Order[]>(path).then(setOrders).catch((e: ApiError) => setErr(e.detail));
  }
  useEffect(() => { if (user) reload(); }, [user, filter]);

  async function changeStatus(id: number, status: OrderStatus) {
    setChanging(true);
    try {
      const updated = await api.patch<Order>(`/orders/${id}/status`, { status });
      setOrders((p) => p.map((o) => (o.id === id ? updated : o)));
      if (open?.id === id) setOpen(updated);
    } catch (e) { setErr((e as ApiError).detail); }
    finally { setChanging(false); }
  }

  const pendientes   = orders.filter((o) => o.status === "pendiente").length;
  const hoy          = orders.filter((o) => {
    const d = new Date(o.created_at); const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
  }).length;
  const totalVentas  = orders.filter((o) => o.status === "entregado").reduce((s, o) => s + o.total, 0);

  return (
    <PageShell>
      <PageHeader title="Pedidos" subtitle="Seguimiento de órdenes de clientes" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Pendientes",         value: pendientes,                     icon: "fa-clock",          color: "#d97706", bg: "#fffbeb" },
          { label: "Hoy",                value: hoy,                            icon: "fa-calendar-day",   color: "#3b82f6", bg: "#eff6ff" },
          { label: "Ventas entregadas",  value: fmtCOP.format(totalVentas),     icon: "fa-circle-check",   color: "#059669", bg: "#ecfdf5" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.color }}>
              <i className={`fa-solid ${s.icon} text-sm`} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 truncate">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <ErrorBox message={err} />

      {/* Filtros */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-white border border-gray-100 rounded-xl shadow-sm w-fit">
        {(["all", ...STATUSES] as const).map((s) => {
          const isActive = filter === s;
          const meta = s !== "all" ? statusMeta[s] : null;
          const count = s !== "all" ? orders.filter((o) => o.status === s).length : orders.length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: isActive ? "#8B0000" : "transparent", color: isActive ? "#fff" : "#777" }}
            >
              {meta && <i className={`fa-solid ${meta.icon} text-[10px]`} />}
              {s === "all" ? "Todos" : meta!.label}
              <span className="text-[9px] font-bold px-1 py-0.5 rounded-md"
                style={{ background: isActive ? "rgba(255,255,255,0.2)" : "#f0f0f0", color: isActive ? "#fff" : "#aaa" }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabla */}
      <Table>
        <Thead>
          <Th>#</Th><Th>Cliente</Th><Th>Teléfono</Th>
          <Th right>Total</Th><Th>Estado</Th><Th>Fecha</Th><Th />
        </Thead>
        <Tbody>
          {orders.map((o) => {
            const meta = statusMeta[o.status];
            return (
              <Tr key={o.id} onClick={() => setOpen(o)}>
                <Td muted>
                  <span className="font-mono text-xs bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">#{o.id}</span>
                </Td>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: "#8B0000" }}>
                      {o.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{o.customer_name}</span>
                  </div>
                </Td>
                <Td muted>{o.customer_phone}</Td>
                <Td right><span className="font-semibold text-gray-900">{fmtCOP.format(o.total)}</span></Td>
                <Td><Badge color={meta.color} dot>{meta.label}</Badge></Td>
                <Td muted>
                  <span className="text-xs">
                    {new Date(o.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </Td>
                <Td>
                  <button onClick={(e) => { e.stopPropagation(); setOpen(o); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all">
                    <i className="fa-solid fa-eye text-[10px]" /> Ver
                  </button>
                </Td>
              </Tr>
            );
          })}
          {orders.length === 0 && <tr><td colSpan={7}><EmptyState message="Sin pedidos" /></td></tr>}
        </Tbody>
      </Table>

      {/* Modal detalle */}
      <Modal open={!!open} onClose={() => setOpen(null)} title={`Pedido #${open?.id ?? ""}`}>
        {open && (
          <ModalBody>
            {/* Timeline */}
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Progreso del pedido</p>
            <div className="flex items-start">
              {STATUS_ORDER.map((s, i) => {
                const currentIdx = STATUS_ORDER.indexOf(open.status as OrderStatus);
                const isDone     = i <= currentIdx;
                const isCurrent  = i === currentIdx;
                const meta = statusMeta[s];
                return (
                  <div key={s} className="flex items-center flex-1">
                    <button
                      onClick={() => !changing && changeStatus(open.id, s)}
                      disabled={changing}
                      className="flex flex-col items-center gap-1.5 flex-shrink-0 transition-transform hover:scale-105"
                      title={`Marcar como ${meta.label}`}
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all duration-200"
                        style={{
                          background: isCurrent ? "#8B0000" : isDone ? "#d1fae5" : "#f3f4f6",
                          color:      isCurrent ? "#fff"     : isDone ? "#059669" : "#d1d5db",
                          boxShadow:  isCurrent ? "0 0 0 3px rgba(139,0,0,0.2)" : "none",
                          transform:  isCurrent ? "scale(1.1)" : "scale(1)",
                        }}>
                        <i className={`fa-solid ${meta.icon}`} />
                      </div>
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-center leading-tight"
                        style={{ color: isCurrent ? "#8B0000" : isDone ? "#059669" : "#d1d5db" }}>
                        {meta.label}
                      </span>
                    </button>
                    {i < STATUS_ORDER.length - 1 && (
                      <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all duration-500"
                        style={{ background: i < currentIdx ? "#a7f3d0" : "#e5e7eb" }} />
                    )}
                  </div>
                );
              })}
            </div>
            {open.status !== "cancelado" && open.status !== "entregado" && (
              <button onClick={() => changeStatus(open.id, "cancelado")} disabled={changing}
                className="mt-1 text-[11px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                <i className="fa-solid fa-ban text-[10px]" /> Cancelar pedido
              </button>
            )}

            {/* Info cliente */}
            <div className="rounded-2xl border border-gray-100 overflow-hidden mt-4">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "#8B0000" }}>
                  {open.customer_name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-gray-800 text-sm">{open.customer_name}</span>
                <span className="ml-auto text-xs text-gray-400 font-mono">{open.customer_phone}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3 text-sm">
                {([
                  open.customer_email && ["Email", open.customer_email],
                  open.address        && ["Dirección", open.address],
                  ["Canal", open.channel],
                  open.notes          && ["Notas", open.notes],
                ] as any[]).filter(Boolean).map(([k, v]: [string, string]) => (
                  <div key={k}>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{k}</p>
                    <p className="font-medium text-gray-800">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Productos</span>
              </div>
              {open.items.map((it) => (
                <div key={it.id} className="flex justify-between items-center px-4 py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{it.product_name}</span>
                    <span className="text-xs text-gray-400 ml-1.5">× {it.qty}</span>
                  </div>
                  <span className="font-semibold text-sm">{fmtCOP.format(it.subtotal)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 font-bold text-gray-900">
                <span>Total</span>
                <span style={{ color: "#8B0000" }}>{fmtCOP.format(open.total)}</span>
              </div>
            </div>
          </ModalBody>
        )}
      </Modal>
    </PageShell>
  );
}
