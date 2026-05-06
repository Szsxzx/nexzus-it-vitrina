"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  PageShell, PageHeader, SavedToast, EmptyState,
  Table, Thead, Th, Tbody, Tr, Td,
  Modal, ModalBody, ModalFooter,
  BtnPrimary, BtnSecondary, BtnGhost, BtnDanger,
  SortButtons, Field, Input, Select,
} from "@/components/AdminUI";
import ImageUpload from "@/components/ImageUpload";
import { siteData, defaultPromos, type PromoItem } from "@/lib/siteData";

const COLOR_OPTIONS = [
  { value: "bg-rojo",      label: "🔴 Rojo" },
  { value: "bg-negro2",    label: "⚫ Negro" },
  { value: "bg-azul",      label: "🔵 Azul" },
  { value: "bg-green-700", label: "🟢 Verde" },
  { value: "bg-amber-600", label: "🟡 Ámbar" },
];

const emptyPromo = (): PromoItem => ({
  id: `promo-${Date.now()}`,
  name: "", price: "", oldPrice: "", off: "",
  color: "bg-rojo", img: "",
});

const colorHex: Record<string, string> = {
  "bg-rojo": "#8B0000", "bg-negro2": "#1a1a1a",
  "bg-azul": "#3AA8C1", "bg-green-700": "#15803d",
  "bg-amber-600": "#d97706",
};

export default function PromotionsPage() {
  const { user, logout } = useAdminAuth();
  const [items, setItems] = useState<PromoItem[]>([]);
  const [editing, setEditing] = useState<PromoItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setItems(siteData.getPromos()); }, []);

  function persist(updated: PromoItem[]) {
    setItems(updated);
    siteData.setPromos(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function openNew() { setEditing(emptyPromo()); setIsNew(true); }
  function openEdit(p: PromoItem) { setEditing({ ...p }); setIsNew(false); }

  function saveEditing(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    persist(isNew ? [...items, editing] : items.map((p) => p.id === editing.id ? editing : p));
    setEditing(null);
  }

  function remove(id: string) {
    if (!confirm("¿Eliminar esta promoción?")) return;
    persist(items.filter((p) => p.id !== id));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const arr = [...items];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    persist(arr);
  }

  function moveDown(idx: number) {
    if (idx === items.length - 1) return;
    const arr = [...items];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    persist(arr);
  }

  return (
      <PageShell>
        <PageHeader
          title="Promociones"
          subtitle="Ofertas especiales del sitio"
          actions={
            <div className="flex items-center gap-3">
              <SavedToast visible={saved} />
              <BtnSecondary onClick={() => { siteData.resetPromos(); setItems(defaultPromos); }}>
                Restaurar defecto
              </BtnSecondary>
              <BtnPrimary onClick={openNew}>
                <i className="fa-solid fa-plus text-xs" /> Nueva promoción
              </BtnPrimary>
            </div>
          }
        />

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
                <Td muted><span className="line-through text-xs">{p.oldPrice || "—"}</span></Td>
                <Td>
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ background: colorHex[p.color] ?? "#8B0000" }}
                  >
                    {p.off}
                  </span>
                </Td>
                <Td>
                  <span
                    className="inline-block w-5 h-5 rounded-lg border border-black/10"
                    style={{ background: colorHex[p.color] ?? "#8B0000" }}
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
                    style={{ background: colorHex[p.color] ?? "#8B0000" }}
                  >
                    <span className="text-white text-xs font-semibold truncate">{p.name}</span>
                    <span className="text-[10px] text-white/80 ml-1 flex-shrink-0">{p.off}</span>
                  </div>
                  <div className="p-3">
                    <span className="font-bold text-gray-900 text-sm">{p.price}</span>
                    {p.oldPrice && <span className="ml-1.5 text-xs text-gray-400 line-through">{p.oldPrice}</span>}
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
                  <Input value={editing?.oldPrice ?? ""} onChange={(e) => setEditing({ ...editing!, oldPrice: e.target.value })} placeholder="$70.000" />
                </Field>
                <Field label="Badge / descuento" required>
                  <Input value={editing?.off ?? ""} onChange={(e) => setEditing({ ...editing!, off: e.target.value })} placeholder="36% OFF" required />
                </Field>
                <Field label="Color de tarjeta">
                  <Select value={editing?.color ?? "bg-rojo"} onChange={(e) => setEditing({ ...editing!, color: e.target.value })}>
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
