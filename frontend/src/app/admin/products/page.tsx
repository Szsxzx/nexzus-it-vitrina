"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import AdminLayout from "@/components/AdminLayout";
import {
  PageShell, PageHeader, ErrorBox, Badge,
  Table, Thead, Th, Tbody, Tr, Td, EmptyState,
  Modal, ModalBody, ModalFooter,
  BtnPrimary, BtnSecondary, BtnGhost, BtnDanger,
  Field, Input, Textarea, Select,
} from "@/components/AdminUI";
import ImageUpload from "@/components/ImageUpload";
import { api, loadToken, type ApiError } from "@/lib/api";
import type { Product, Category } from "@/lib/types";

const CATEGORIES: Category[] = ["res", "cerdo", "pollo", "embutidos", "pescado"];
const fmtCOP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

const empty = (): Partial<Product> => ({
  slug: "", name: "", description: "", category: "res",
  price: 0, old_price: undefined, image_url: "",
  rating: 4.5, review_count: 0, discount: "", tags: "",
  stock: 0, is_active: true,
});

export default function ProductsPage() {
  const { user, loading, logout } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reload() {
    api.get<Product[]>("/products?only_active=false", loadToken()!)
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
      if (body.discount === "")  body.discount = null;
      if (body.tags === "")      body.tags = null;
      if (body.old_price === "" || body.old_price === undefined) body.old_price = null;
      if (editing.id) {
        await api.patch(`/products/${editing.id}`, body, loadToken()!);
      } else {
        await api.post("/products", body, loadToken()!);
      }
      setEditing(null);
      reload();
    } catch (e) {
      setErr((e as ApiError).detail);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await api.delete(`/products/${id}`, loadToken()!);
      reload();
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
          title="Productos"
          subtitle={`${items.filter((p) => p.is_active).length} activos · ${items.length} total`}
          actions={
            <BtnPrimary onClick={() => setEditing(empty())}>
              <i className="fa-solid fa-plus text-xs" /> Nuevo producto
            </BtnPrimary>
          }
        />

        <ErrorBox message={err} />

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
            {items.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <div className="font-semibold text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">{p.slug}</div>
                </Td>
                <Td>
                  <Badge color="gray">{p.category}</Badge>
                </Td>
                <Td right>
                  <span className="font-semibold text-gray-900">{fmtCOP.format(p.price)}</span>
                  {p.old_price && (
                    <span className="block text-xs text-gray-400 line-through">{fmtCOP.format(p.old_price)}</span>
                  )}
                </Td>
                <Td right>{p.stock}</Td>
                <Td>
                  <Badge color={p.is_active ? "green" : "gray"}>
                    {p.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-3">
                    <BtnGhost onClick={() => setEditing(p)}>
                      <i className="fa-solid fa-pen-to-square" /> Editar
                    </BtnGhost>
                    {user.role === "admin" && (
                      <BtnDanger onClick={() => remove(p.id)}>
                        <i className="fa-solid fa-trash" /> Eliminar
                      </BtnDanger>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6}><EmptyState message="Sin productos" /></td></tr>
            )}
          </Tbody>
        </Table>

        <Modal
          open={!!editing}
          onClose={() => setEditing(null)}
          title={editing?.id ? "Editar producto" : "Nuevo producto"}
          width="max-w-2xl"
        >
          <form onSubmit={save}>
            <ModalBody>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Slug" required>
                  <Input
                    value={editing?.slug ?? ""}
                    onChange={(e) => setEditing({ ...editing!, slug: e.target.value })}
                    disabled={!!editing?.id}
                    required
                    placeholder="lomo-fino-angus"
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
                    value={editing?.category ?? "res"}
                    onChange={(e) => setEditing({ ...editing!, category: e.target.value as Category })}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </Field>
                <Field label="Imagen del producto" full>
                  <ImageUpload
                    value={editing?.image_url ?? ""}
                    onUpload={(url) => setEditing({ ...editing!, image_url: url })}
                    onClear={() => setEditing({ ...editing!, image_url: "" })}
                  />
                </Field>
                <Field label="Precio (COP)" required>
                  <Input
                    type="number" min="0"
                    value={editing?.price ?? 0}
                    onChange={(e) => setEditing({ ...editing!, price: Number(e.target.value) })}
                    required
                  />
                </Field>
                <Field label="Precio anterior">
                  <Input
                    type="number" min="0"
                    value={editing?.old_price ?? ""}
                    onChange={(e) => setEditing({ ...editing!, old_price: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </Field>
                <Field label="Stock">
                  <Input
                    type="number" min="0"
                    value={editing?.stock ?? 0}
                    onChange={(e) => setEditing({ ...editing!, stock: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Descuento (texto)">
                  <Input
                    value={editing?.discount ?? ""}
                    onChange={(e) => setEditing({ ...editing!, discount: e.target.value })}
                    placeholder="-10%"
                  />
                </Field>
                <Field label="Tags (separadas por coma)" full>
                  <Input
                    value={(editing as any)?.tags ?? ""}
                    onChange={(e) => setEditing({ ...editing!, tags: e.target.value } as any)}
                    placeholder="TOP VENTAS, PREMIUM"
                  />
                </Field>
                <Field label="Descripción" full>
                  <Textarea
                    rows={3}
                    value={editing?.description ?? ""}
                    onChange={(e) => setEditing({ ...editing!, description: e.target.value })}
                  />
                </Field>
                <div className="col-span-2 flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editing?.is_active ?? true}
                    onChange={(e) => setEditing({ ...editing!, is_active: e.target.checked })}
                    className="w-4 h-4 accent-red-700"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">Activo en catálogo</label>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <BtnSecondary type="button" onClick={() => setEditing(null)}>Cancelar</BtnSecondary>
              <BtnPrimary type="submit" disabled={busy}>
                {busy ? "Guardando..." : "Guardar"}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      </PageShell>
    </AdminLayout>
  );
}
