"use client";
import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  PageShell, PageHeader, ErrorBox, Badge, Table, Thead, Th, Tbody, Tr, Td, EmptyState,
  Modal, ModalBody, ModalFooter, Field, Textarea, Select, BtnPrimary, BtnSecondary,
} from "@/components/AdminUI";
import type { ApiError } from "@/lib/api";
import {
  PQR_ESTADOS, PQR_TIPOS, actualizarPqr, businessDaysLeft, estadoLabel, fmtFecha, listarPqr, tipoLabel,
  type PqrAdmin, type PqrEstado,
} from "@/lib/pqr";

const estadoColor: Record<PqrEstado, "blue" | "amber" | "green" | "gray"> = {
  radicado: "blue", en_tramite: "amber", respondido: "green", cerrado: "gray",
};

/** Indicador de vencimiento: solo aplica mientras la PQR no esté respondida/cerrada. */
function Vencimiento({ p }: { p: PqrAdmin }) {
  if (p.estado === "respondido" || p.estado === "cerrado") return <span className="text-xs text-gray-400">—</span>;
  const d = businessDaysLeft(p.fecha_limite_respuesta);
  if (d < 0) return <Badge color="red" dot>Vencida ({Math.abs(d)} {Math.abs(d) === 1 ? "día hábil" : "días hábiles"})</Badge>;
  if (d <= 3) return <Badge color="amber" dot>{d} {d === 1 ? "día hábil" : "días hábiles"}</Badge>;
  return <Badge color="green" dot>{d} días hábiles</Badge>;
}

export default function AdminPqrPage() {
  const { user } = useAdminAuth();
  const [rows, setRows] = useState<PqrAdmin[]>([]);
  const [estado, setEstado] = useState("");
  const [tipo, setTipo] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<PqrAdmin | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<PqrEstado>("en_tramite");
  const [respuesta, setRespuesta] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    listarPqr(estado || undefined, tipo || undefined)
      .then((r) => { setRows(r); setErr(null); })
      .catch((e: ApiError) => setErr(e.detail))
      .finally(() => setLoading(false));
  }, [estado, tipo]);

  useEffect(() => { if (user) reload(); }, [user, reload]);

  function openDetail(p: PqrAdmin) {
    setOpen(p); setNuevoEstado(p.estado); setRespuesta(p.respuesta ?? "");
  }

  async function save() {
    if (!open) return;
    setSaving(true); setErr(null);
    try {
      const body: { estado?: PqrEstado; respuesta?: string } = {};
      if (respuesta.trim() && respuesta.trim() !== (open.respuesta ?? "")) body.respuesta = respuesta.trim();
      else if (nuevoEstado !== open.estado) body.estado = nuevoEstado;
      if (!body.respuesta && !body.estado) { setOpen(null); return; }
      const upd = await actualizarPqr(open.id, body);
      setRows((p) => p.map((r) => (r.id === upd.id ? upd : r)));
      setOpen(null);
    } catch (e) { setErr((e as ApiError).detail); }
    finally { setSaving(false); }
  }

  const vencidas = rows.filter((p) => (p.estado === "radicado" || p.estado === "en_tramite") && businessDaysLeft(p.fecha_limite_respuesta) < 0).length;
  const abiertas = rows.filter((p) => p.estado === "radicado" || p.estado === "en_tramite").length;

  return (
    <PageShell>
      <PageHeader title="PQR" subtitle="Peticiones, quejas, reclamos y sugerencias (Ley 1755 de 2015: 15 días hábiles)" />

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: rows.length, icon: "fa-headset" },
          { label: "Abiertas", value: abiertas, icon: "fa-clock" },
          { label: "Vencidas", value: vencidas, icon: "fa-triangle-exclamation" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-600">
              <i className={`fa-solid ${s.icon} text-sm`} aria-hidden="true" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <ErrorBox message={err} />

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <label className="block">
          <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Estado</span>
          <Select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            {PQR_ESTADOS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tipo</span>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {PQR_TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </label>
      </div>

      <Table>
        <Thead>
          <Th>Radicado</Th><Th>Tipo</Th><Th>Solicitante</Th><Th>Asunto</Th><Th>Estado</Th><Th>Vencimiento</Th><Th />
        </Thead>
        <Tbody>
          {rows.map((p) => (
            <Tr key={p.id} onClick={() => openDetail(p)}>
              <Td><span className="font-mono text-xs">{p.radicado}</span></Td>
              <Td>{tipoLabel(p.tipo)}</Td>
              <Td><span className="font-medium text-gray-900">{p.nombre}</span></Td>
              <Td muted><span className="block max-w-[220px] truncate">{p.asunto}</span></Td>
              <Td><Badge color={estadoColor[p.estado]} dot>{estadoLabel(p.estado)}</Badge></Td>
              <Td><Vencimiento p={p} /></Td>
              <Td>
                <button onClick={(e) => { e.stopPropagation(); openDetail(p); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <i className="fa-solid fa-eye text-[10px]" aria-hidden="true" /> Ver
                </button>
              </Td>
            </Tr>
          ))}
          {!loading && rows.length === 0 && <tr><td colSpan={7}><EmptyState message="Sin PQR para estos filtros" /></td></tr>}
        </Tbody>
      </Table>

      <Modal open={!!open} onClose={() => setOpen(null)} title={`PQR ${open?.radicado ?? ""}`} width="max-w-2xl">
        {open && (
          <>
            <ModalBody>
              <div className="flex flex-wrap items-center gap-2">
                <Badge color={estadoColor[open.estado]} dot>{estadoLabel(open.estado)}</Badge>
                <Badge color="purple">{tipoLabel(open.tipo)}</Badge>
                <Vencimiento p={open} />
              </div>

              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3 text-sm">
                  {([
                    ["Solicitante", open.nombre],
                    ["Documento", `${open.tipo_documento} ${open.numero_documento}`],
                    ["Correo", open.email],
                    ["Teléfono", open.telefono],
                    ["Radicada", fmtFecha(open.fecha_radicacion)],
                    ["Fecha límite", fmtFecha(open.fecha_limite_respuesta)],
                    ["Pedido", open.referencia_pedido],
                  ] as [string, string | null][]).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{k}</p>
                      <p className="font-medium text-gray-800 break-words">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">Asunto</p>
                <p className="font-semibold text-gray-900 text-sm">{open.asunto}</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mt-3 mb-1">Descripción</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{open.descripcion}</p>
              </div>

              <div className="grid gap-4">
                <Field label="Estado">
                  <Select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value as PqrEstado)}>
                    {PQR_ESTADOS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </Select>
                </Field>
                <Field label="Respuesta al solicitante" hint="Al enviar una respuesta el estado pasa a Respondido y se registra la fecha de respuesta.">
                  <Textarea rows={5} value={respuesta} onChange={(e) => setRespuesta(e.target.value)} />
                </Field>
              </div>
            </ModalBody>
            <ModalFooter>
              <BtnSecondary onClick={() => setOpen(null)}>Cancelar</BtnSecondary>
              <BtnPrimary onClick={save} loading={saving}>Guardar cambios</BtnPrimary>
            </ModalFooter>
          </>
        )}
      </Modal>
    </PageShell>
  );
}
