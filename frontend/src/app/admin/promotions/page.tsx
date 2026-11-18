"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  PageShell, PageHeader, SavedToast, ErrorBox, EmptyState,
  Table, Thead, Th, Tbody, Tr, Td,
  Modal, ModalBody, ModalFooter,
  BtnPrimary, BtnSecondary, BtnGhost, BtnDanger,
  SortButtons, Field, Input, Select,
} from "@/components/AdminUI";
import ImageUpload from "@/components/ImageUpload";
import { api, type ApiError } from "@/lib/api";

interface PromoItem {
  id: number;
  name: string;
  price: string;
  old_price: string | null;
  unit_price: number;
  off: string;
  color: string;
  img: string | null;
  sort_order: number;
}

const COLOR_OPTIONS = [
  { value: "bg-primary",   label: "Negro de marca" },
  { value: "bg-secondary", label: "Morado oscuro" },
  { value: "bg-accent",    label: "Morado" },
  { value: "bg-success",   label: "Verde" },
  { value: "bg-warning",   label: "Ãmbar" },
];

const colorHex: Record<string, string> = {
  "bg-primary": "#0B0712", "bg-secondary": "#1A1030", "bg-accent": "#7C3AED",
  "bg-success": "#15803D", "bg-warning": "#B45309",
};

type EditingPromo = Partial<PromoItem> & { name: string; price: string; off: string; color: string };

const emptyPromo = (): EditingPromo => ({ name: "", price: "", old_price: "", off: "", color: "bg-accent", img: "" });

export default function PromotionsPage() {
  const { user, logout } = useAdminAuth();
  const [items, setItems] = useState<PromoItem[]>([]);
  const [editing, setEditing] = useState<EditingPromo | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function reload() {
    api.get<PromoItem[]>("/promotions").then(setItems).catch((e: ApiError) => setErr(e.detail));
  }
  useEffect(reload, []);

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  function openNew() { setEditing(emptyPromo()); setIsNew(true); }
  function openEdit(p: PromoItem) { setEditing({ ...p }); setIsNew(false); }

  async function saveEditing(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const unit_price = Number(editing.price.replace(/[^0-9]/g, "")) || 0;
    const body = { ...editing, unit_price };
    try {
      if (isNew) await api.post("/promotions", body);
      else await api.patch(`/promotions/${editing.id}`, body);
      setEditing(null);
      reload();
      flash();
    } catch (e) { setErr((e as ApiError).detail); }
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar esta promoción?")) return;
    try { await api.delete(`/promotions/${id}`); reload(); }
    catch (e) { setErr((e as ApiError).detail); }
  }

  async function swap(a: PromoItem, b: PromoItem) {
    try {
      await Promise.all([
        api.patch(`/promotions/${a.id}`, { sort_order: b.sort_order }),
        api.patch(`/promotions/${b.id}`, { sort_order: a.sort_order }),
      ]);
      reload();
    } catch (e) { setErr((e as ApiError).detail); }
  }
  function moveUp(idx: number) { if (idx > 0) swap(items[idx], items[idx - 1]); }
  function moveDown(idx: number) { if (idx < items.length - 1) swap(items[idx], items[idx + 1]); }

  return (
      <PageShell>
        <PageHeader
          title="Ofertas"
          subtitle="Ofertas especiales del sitio"
          actions={
            <div className="flex items-center gap-3">
              <SavedToast visible={saved} />
              <BtnPrimary onClick={openNew}>
                <i className="fa-solid fa-plus text-xs" /> Nueva promoción
              </BtnPrimary>
            </div>
          }
        />

        <ErrorBox message={err} />

        <Table>
          <Thead>
            <Th>Orden</Th>
            <Th>Nombre</Th>
            <Th>Precio</Th>
            <Th>Antes</Th>
            <Th>Badge</Th>
            <Th>Color</Th>
            <Th />
          </Thead>
          <Tbody>
            {items.map((p, idx) => (
              <Tr key={p.id}>
                <Td muted><SortButtons onUp={() => moveUp(idx)} onDown={() => moveDown(idx)} /></Td>
                <Td><span className="font-semibold text-gray-900">{p.name}</span></Td>
                <Td><span className="font-semibold">{p.price}</span></Td>
                <Td muted><span className="line-through text-xs">{p.old_price || "—"}</span></Td>
                <Td>
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ background: colorHex[p.color] ?? "#7C3AED" }}
                  >
                    {p.off}
                  </span>
                </Td>
                <Td>
                  <span
                    className="inline-block w-5 h-5 rounded-lg border border-black/10"
                    style={{ background: colorHex[p.color] ?? "#7C3AED" }}
                  />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-3">
                    <BtnGhost onClick={() => openEdit(p)}>
                      <i className="fa-solid fa-pen-to-square text-xs" /> Editar
                    </BtnGhost>
                    <BtnDanger onClick={() => remove(p.id)}>
                      <i className="fa-solid fa-trash text-xs" /> Eliminar
                    </BtnDanger>
                  </div>
                </Td>
              </Tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7}><EmptyState message="Sin promociones" /></td></tr>
            )}
          </Tbody>
        </Table>

        {/* Cards preview */}
        {items.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Vista previa</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {items.map((p) => (
                <div key={p.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  <div
                    className="px-3 py-2.5 flex items-center justify-between"
                    style={{ background: colorHex[p.color] ?? "#7C3AED" }}
                  >
                    <span className="text-white text-xs font-semibold truncate">{p.name}</span>
                    <span className="text-[10px] text-white/80 ml-1 flex-shrink-0">{p.off}</span>
                  </div>
                  <div className="p-3">
                    <span className="font-bold text-gray-900 text-sm">{p.price}</span>
                    {p.old_price && <span className="ml-1.5 text-xs text-gray-400 line-through">{p.old_price}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Modal
          open={!!editing}
          onClose={() => setEditing(null)}
          title={isNew ? "Nueva promoción" : "Editar promoción"}
        >
          <form onSubmit={saveEditing}>
            <ModalBody>
              <Field label="Nombre del producto" required>
                <Input value={editing?.name ?? ""} onChange={(e) => setEditing({ ...editing!, name: e.target.value })} required />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Precio actual" required>
                  <Input value={editing?.price ?? ""} onChange={(e) => setEditing({ ...editing!, price: e.target.value })} placeholder="$45.000" required />
                </Field>
                <Field label="Precio anterior">
                  <Input value={editing?.old_price ?? ""} onChange={(e) => setEditing({ ...editing!, old_price: e.target.value })} placeholder="$70.000" />
                </Field>
                <Field label="Badge / descuento" required>
                  <Input value={editing?.off ?? ""} onChange={(e) => setEditing({ ...editing!, off: e.target.value })} placeholder="36% OFF" required />
                </Field>
                <Field label="Color de tarjeta">
                  <Select value={editing?.color ?? "bg-accent"} onChange={(e) => setEditing({ ...editing!, color: e.target.value })}>
                    {COLOR_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </Select>
                </Field>
              </div>
              <Field label="Imagen de la promoción">
                <ImageUpload
                  value={editing?.img ?? ""}
                  onUpload={(url) => setEditing({ ...editing!, img: url })}
                  onClear={() => setEditing({ ...editing!, img: "" })}
                />
              </Field>
            </ModalBody>
            <ModalFooter>
              <BtnSecondary type="button" onClick={() => setEditing(null)}>Cancelar</BtnSecondary>
              <BtnPrimary type="submit">Guardar</BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      </PageShell>
  );
}
