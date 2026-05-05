"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import AdminLayout from "@/components/AdminLayout";
import {
  PageShell, PageHeader, ErrorBox, Badge,
  Table, Thead, Th, Tbody, Tr, Td, EmptyState,
  Modal, ModalBody, BtnGhost,
} from "@/components/AdminUI";
import { api, loadToken, type ApiError } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pendiente", "confirmado", "en_camino", "entregado", "cancelado"];
const fmtCOP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

const statusMeta: Record<OrderStatus, { color: "amber" | "blue" | "purple" | "green" | "gray"; label: string }> = {
  pendiente:  { color: "amber",  label: "Pendiente" },
  confirmado: { color: "blue",   label: "Confirmado" },
  en_camino:  { color: "purple", label: "En camino" },
  entregado:  { color: "green",  label: "Entregado" },
  cancelado:  { color: "gray",   label: "Cancelado" },
};

export default function OrdersPage() {
  const { user, loading, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [open, setOpen] = useState<Order | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function reload() {
    const path = filter === "all" ? "/orders" : `/orders?status_filter=${filter}`;
    api.get<Order[]>(path, loadToken()!).then(setOrders).catch((e: ApiError) => setErr(e.detail));
  }

  useEffect(() => { if (user) reload(); }, [user, filter]);

  async function changeStatus(id: number, status: OrderStatus) {
    try {
      const updated = await api.patch<Order>(`/orders/${id}/status`, { status }, loadToken()!);
      setOrders((p) => p.map((o) => (o.id === id ? updated : o)));
      if (open?.id === id) setOpen(updated);
    } catch (e) {
      setErr((e as ApiError).detail);
    }
  }

  if (loading) return <div className="p-8 text-gray-400 text-sm">Cargando...</div>;
  if (!user) return null;

  return (
    <AdminLayout user={user} onLogout={logout}>
      <PageShell>
        <PageHeader
          title="Pedidos"
          subtitle={`${orders.length} pedido${orders.length !== 1 ? "s" : ""} ${filter !== "all" ? `· ${statusMeta[filter as OrderStatus]?.label}` : ""}`}
          actions={
            <div className="flex items-center gap-1.5">
              {(["all", ...STATUSES] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    filter === s
                      ? "text-white"
                      : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                  style={filter === s ? { background: "#8B0000" } : {}}
                >
                  {s === "all" ? "Todos" : s.replace("_", " ")}
                </button>
              ))}
            </div>
          }
        />

        <ErrorBox message={err} />

        <Table>
          <Thead>
            <Th>#</Th>
            <Th>Cliente</Th>
            <Th>Teléfono</Th>
            <Th right>Total</Th>
            <Th>Estado</Th>
            <Th>Creado</Th>
            <Th />
          </Thead>
          <Tbody>
            {orders.map((o) => (
              <Tr key={o.id} onClick={() => setOpen(o)}>
                <Td muted>
                  <span className="font-mono">#{o.id}</span>
                </Td>
                <Td><span className="font-medium text-gray-900">{o.customer_name}</span></Td>
                <Td muted>{o.customer_phone}</Td>
                <Td right><span className="font-semibold">{fmtCOP.format(o.total)}</span></Td>
                <Td>
                  <Badge color={statusMeta[o.status].color}>
                    {statusMeta[o.status].label}
                  </Badge>
                </Td>
                <Td muted>
                  <span className="text-xs">{new Date(o.created_at).toLocaleString("es-CO")}</span>
                </Td>
                <Td>
                  <BtnGhost onClick={() => setOpen(o)}>
                    <i className="fa-solid fa-eye text-xs" /> Ver
                  </BtnGhost>
                </Td>
              </Tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7}><EmptyState message="Sin pedidos" /></td></tr>
            )}
          </Tbody>
        </Table>

        <Modal
          open={!!open}
          onClose={() => setOpen(null)}
          title={`Pedido #${open?.id ?? ""}`}
        >
          {open && (
            <ModalBody>
              {/* Info cliente */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Cliente", open.customer_name],
                  ["Teléfono", open.customer_phone],
                  open.customer_email ? ["Email", open.customer_email] : null,
                  open.address ? ["Dirección", open.address] : null,
                  ["Canal", open.channel],
                  open.notes ? ["Notas", open.notes] : null,
                ].filter((x): x is string[] => x !== null).map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{k}</p>
                    <p className="font-medium text-gray-800">{v}</p>
                  </div>
                ))}
              </div>

              {/* Items */}
              <div className="mt-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Productos</p>
                <div className="bg-gray-50 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {open.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-gray-700">{it.product_name} <span className="text-gray-400">× {it.qty}</span></span>
                      <span className="font-semibold">{fmtCOP.format(it.subtotal)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-4 py-3 font-bold text-gray-900 bg-white">
                    <span>Total</span>
                    <span>{fmtCOP.format(open.total)}</span>
                  </div>
                </div>
              </div>

              {/* Cambiar estado */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Cambiar estado</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => {
                    const m = statusMeta[s];
                    const isCurrent = open.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => changeStatus(open.id, s)}
                        disabled={isCurrent}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          isCurrent
                            ? "cursor-default opacity-80"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        style={isCurrent ? { background: "#8B0000", color: "#fff" } : {}}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </ModalBody>
          )}
        </Modal>
      </PageShell>
    </AdminLayout>
  );
}
