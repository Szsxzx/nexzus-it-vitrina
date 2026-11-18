"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  PageShell, PageHeader, ErrorBox, Badge,
  Table, Thead, Th, Tbody, Tr, Td, EmptyState,
  Modal, ModalBody, ModalFooter,
  BtnPrimary, BtnSecondary, BtnGhost, BtnDanger,
  Field, Input, Textarea, Select, PriceInput,
} from "@/components/AdminUI";
import ImageUpload from "@/components/ImageUpload";
import { api, type ApiError } from "@/lib/api";
import type { Product, Category } from "@/lib/types";

const CATEGORIES: Category[] = ["software", "hardware", "licencias", "redes", "accesorios"];
const fmtCOP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

const catMeta: Record<string, { color: "gray"|"red"|"amber"|"blue"|"green"|"purple"; emoji: string }> = {
  software:   { color: "purple", emoji: "" },
  hardware:   { color: "gray",   emoji: "" },
  licencias:  { color: "blue",   emoji: "" },
  redes:      { color: "green",  emoji: "" },
  accesorios: { color: "amber",  emoji: "" },
};

const empty = (): Partial<Product> => ({
  slug: "", name: "", description: "", category: "hardware",
  price: 0, old_price: undefined, image_url: "",
  rating: 4.5, review_count: 0, discount: "", tags: "",
  stock: 0, is_active: true,
});

export default function ProductsPage() {
  const { user } = useAdminAuth();
  const [items, setItems]     = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [err, setErr]         = useState<string | null>(null);
  const [busy, setBusy]       = useState(false);
  const [search, setSearch]   = useState("");
  const [catFilter, setCatFilter] = useState<"all" | Category>("all");

  function reload() {
    api.get<Product[]>("/products?only_active=false")
      .then(setItems)
      .catch((e: ApiError) => setErr(e.detail));
  }
  useEffect(() => { if (user) reload(); }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true); setErr(null);
    try {
      const body: Record<string, unknown> = { ...editing };
      if (body.image_url === "") body.image_url = null;
      if (body.discount === "")  body.discount  = null;
      if (body.tags === "")      body.tags       = null;
      if (body.old_price === "" || body.old_price === undefined) body.old_price = null;
      if (editing.id) {
        await api.patch(`/products/${editing.id}`, body);
      } else {
        await api.post("/products", body);
      }
      setEditing(null); reload();
    } catch (e) { setErr((e as ApiError).detail); }
    finally { setBusy(false); }
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar este producto?")) return;
    try { await api.delete(`/products/${id}`); reload(); }
    catch (e) { setErr((e as ApiError).detail); }
  }

  async function toggleActive(p: Product) {
    try {
      await api.patch(`/products/${p.id}`, { is_active: !p.is_active });
      reload();
    } catch (e) { setErr((e as ApiError).detail); }
  }

  const visible = items.filter((p) => {
    if (catFilter !== "all" && p.category !== catFilter) return false;
    const q = search.toLowerCase();
    if (q && !`${p.name} ${p.slug}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const active   = items.filter((p) => p.is_active).length;
  const inactive = items.length - active;
  const lowStock = items.filter((p) => (p.stock ?? 0) <= 5 && p.is_active).length;

  return (
    <PageShell>
      {/* Header */}
      <PageHeader
        title="Productos"
        subtitle="Gestiona el catálogo de la tienda"
        actions={
          <BtnPrimary onClick={() => setEditing(empty())}>
            <i className="fa-solid fa-plus text-xs" /> Nuevo producto
          </BtnPrimary>
        }
      />

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total",    value: items.length,  icon: "fa-box",          color: "#3b82f6", bg: "#eff6ff" },
          { label: "Activos",  value: active,         icon: "fa-check-circle", color: "#059669", bg: "#ecfdf5" },
          { label: "Stock bajo", value: lowStock,     icon: "fa-triangle-exclamation", color: "#d97706", bg: "#fffbeb" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.color }}>
              <i className={`fa-solid ${s.icon} text-sm`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <ErrorBox message={err} />

      {/* Filtros y búsqueda */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-1 p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
          {(["all", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: catFilter === c ? "#7C3AED" : "transparent",
                color: catFilter === c ? "#fff" : "#777",
              }}
            >
              {c === "all" ? "Todos" : `${catMeta[c]?.emoji ?? ""} ${c}`}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-300" />
          <input
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/10 bg-white"
          />
        </div>
      </div>

      {/* Tabla */}
      <Table>
        <Thead>
          <Th>Producto</Th>
          <Th>Categoría</Th>
          <Th right>Precio</Th>
          <Th right>Stock</Th>
          <Th>Estado</Th>
          <Th />
        </Thead>
        <Tbody>
          {visible.map((p) => {
            const meta = catMeta[p.category] ?? { color: "gray", emoji: "" };
            const stockLow = (p.stock ?? 0) <= 5;
            return (
              <Tr key={p.id}>
                {/* Producto con thumbnail */}
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <i className="fa-solid fa-image text-xs" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{p.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{p.slug}</div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <Badge color={meta.color}>{meta.emoji} {p.category}</Badge>
                </Td>
                <Td right>
                  <span className="font-semibold text-gray-900">{fmtCOP.format(p.price)}</span>
                  {p.old_price && (
                    <span className="block text-[11px] text-gray-400 line-through">{fmtCOP.format(p.old_price)}</span>
                  )}
                </Td>
                <Td right>
                  <span className={`font-medium text-sm ${stockLow ? "text-amber-600" : "text-gray-700"}`}>
                    {stockLow && <i className="fa-solid fa-triangle-exclamation text-xs mr-1" />}
                    {p.stock ?? 0}
                  </span>
                </Td>
                <Td>
                  {/* Toggle inline */}
                  <button
                    onClick={() => toggleActive(p)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: p.is_active ? "#ecfdf5" : "#f9f9f9",
                      color: p.is_active ? "#059669" : "#9ca3af",
                      border: `1px solid ${p.is_active ? "#a7f3d0" : "#e5e7eb"}`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: p.is_active ? "#10b981" : "#d1d5db" }}
                    />
                    {p.is_active ? "Activo" : "Inactivo"}
                  </button>
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-2">
                    <BtnGhost onClick={() => setEditing(p)}>
                      <i className="fa-solid fa-pen-to-square" /> Editar
                    </BtnGhost>
                    {user.role === "admin" && (
                      <BtnDanger onClick={() => remove(p.id)}>
                        <i className="fa-solid fa-trash" />
                      </BtnDanger>
                    )}
                  </div>
                </Td>
              </Tr>
            );
          })}
          {visible.length === 0 && (
            <tr><td colSpan={6}><EmptyState message="Sin productos" /></td></tr>
          )}
        </Tbody>
      </Table>

      {/* Modal edición */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Editar — ${editing.name}` : "Nuevo producto"}
        width="max-w-2xl"
      >
        <form onSubmit={save}>
          <ModalBody>
            {/* Sección: Identidad */}
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Identidad</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug" required hint="URL única, solo minúsculas y guiones">
                <Input
                  value={editing?.slug ?? ""}
                  onChange={(e) => setEditing({ ...editing!, slug: e.target.value })}
                  disabled={!!editing?.id}
                  required placeholder="lomo-fino-angus"
                />
              </Field>
              <Field label="Nombre" required>
                <Input
                  value={editing?.name ?? ""}
                  onChange={(e) => setEditing({ ...editing!, name: e.target.value })}
                  required
                />
              </Field>
              <Field label="Categoría">
                <Select
                  value={editing?.category ?? "hardware"}
                  onChange={(e) => setEditing({ ...editing!, category: e.target.value as Category })}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{catMeta[c]?.emoji ?? ""} {c}</option>)}
                </Select>
              </Field>
              <Field label="Tags (separadas por coma)">
                <Input
                  value={(editing as any)?.tags ?? ""}
                  onChange={(e) => setEditing({ ...editing!, tags: e.target.value } as any)}
                  placeholder="GARANTÍA 1 AÑO, NUEVO"
                />
              </Field>
              <Field label="Descripción" full>
                <Textarea
                  rows={2}
                  value={editing?.description ?? ""}
                  onChange={(e) => setEditing({ ...editing!, description: e.target.value })}
                />
              </Field>
            </div>

            {/* Sección: Imagen */}
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-5 mb-3">Imagen</p>
            <Field label="Foto del producto" full>
              <ImageUpload
                value={editing?.image_url ?? ""}
                onUpload={(url) => setEditing({ ...editing!, image_url: url })}
                onClear={() => setEditing({ ...editing!, image_url: "" })}
              />
            </Field>

            {/* Sección: Precio y Stock */}
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-5 mb-3">Precio y stock</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Precio (COP)" required>
                <PriceInput
                  value={editing?.price}
                  onChange={(v) => setEditing({ ...editing!, price: v ?? 0 })}
                  required
                />
              </Field>
              <Field label="Precio anterior" hint="Se muestra tachado">
                <PriceInput
                  value={editing?.old_price ?? undefined}
                  onChange={(v) => setEditing({ ...editing!, old_price: v })}
                />
              </Field>
              <Field label="Stock">
                <Input
                  type="number" min="0"
                  value={editing?.stock ?? 0}
                  onChange={(e) => setEditing({ ...editing!, stock: Number(e.target.value) })}
                />
              </Field>
              <Field label="Descuento (texto)" hint='Ej: "-18%"'>
                <Input
                  value={editing?.discount ?? ""}
                  onChange={(e) => setEditing({ ...editing!, discount: e.target.value })}
                  placeholder="-10%"
                />
              </Field>
            </div>

            {/* Toggle activo */}
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <input
                type="checkbox"
                id="is_active"
                checked={editing?.is_active ?? true}
                onChange={(e) => setEditing({ ...editing!, is_active: e.target.checked })}
                className="w-4 h-4 accent-red-700"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Visible en el catálogo público
              </label>
              <span className="ml-auto text-xs text-gray-400">{editing?.is_active ? "Activo" : "Oculto"}</span>
            </div>
          </ModalBody>
          <ModalFooter>
            <BtnSecondary type="button" onClick={() => setEditing(null)}>Cancelar</BtnSecondary>
            <BtnPrimary type="submit" loading={busy}>
              {editing?.id ? "Guardar cambios" : "Crear producto"}
            </BtnPrimary>
          </ModalFooter>
        </form>
      </Modal>
    </PageShell>
  );
}
