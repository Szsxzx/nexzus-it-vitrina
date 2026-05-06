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
import { siteData, defaultCategories, type CatalogCategory } from "@/lib/siteData";

const GRADIENT_OPTIONS = [
  { value: "from-rojo to-rojo-mid",        label: "Rojo" },
  { value: "from-pink-700 to-pink-900",     label: "Rosa / Cerdo" },
  { value: "from-amber-600 to-amber-800",   label: "Ámbar / Pollo" },
  { value: "from-orange-700 to-red-900",    label: "Naranja / Embutidos" },
  { value: "from-azul to-azul-dark",        label: "Azul / Pescado" },
  { value: "from-green-700 to-green-900",   label: "Verde" },
  { value: "from-purple-700 to-purple-900", label: "Morado" },
  { value: "from-negro to-negro2",          label: "Negro" },
];

const emptyCategory = (): CatalogCategory => ({ id: "", label: "", cssClass: "from-rojo to-rojo-mid" });

export default function CatalogPage() {
  const { user, logout } = useAdminAuth();
  const [items, setItems] = useState<CatalogCategory[]>([]);
  const [editing, setEditing] = useState<CatalogCategory | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setItems(siteData.getCategories()); }, []);

  function persist(updated: CatalogCategory[]) {
    setItems(updated);
    siteData.setCategories(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function openNew() { setEditing(emptyCategory()); setIsNew(true); }
  function openEdit(c: CatalogCategory) { setEditing({ ...c }); setIsNew(false); }

  function saveEditing(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!editing.id.trim()) { alert("El slug/ID es obligatorio"); return; }
    persist(isNew ? [...items, editing] : items.map((c) => c.id === editing.id ? editing : c));
    setEditing(null);
  }

  function remove(id: string) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    persist(items.filter((c) => c.id !== id));
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
          title="Catálogo — Categorías"
          subtitle="Categorías visibles en el sitio y su apariencia"
          actions={
            <div className="flex items-center gap-3">
              <SavedToast visible={saved} />
              <BtnSecondary onClick={() => { siteData.resetCategories(); setItems(defaultCategories); }}>
                Restaurar defecto
              </BtnSecondary>
              <BtnPrimary onClick={openNew}>
                <i className="fa-solid fa-plus text-xs" /> Nueva categoría
              </BtnPrimary>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tabla */}
          <div className="lg:col-span-2">
            <Table>
              <Thead>
                <Th>Orden</Th>
                <Th>ID / Slug</Th>
                <Th>Etiqueta</Th>
                <Th>Gradiente</Th>
                <Th />
              </Thead>
              <Tbody>
                {items.map((c, idx) => (
                  <Tr key={c.id}>
                    <Td muted><SortButtons onUp={() => moveUp(idx)} onDown={() => moveDown(idx)} /></Td>
                    <Td>
                      <span className="font-mono text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">{c.id}</span>
                    </Td>
                    <Td><span className="font-semibold text-gray-900">{c.label}</span></Td>
                    <Td>
                      <div className={`w-12 h-5 rounded-md bg-gradient-to-br ${c.cssClass}`} />
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-3">
                        <BtnGhost onClick={() => openEdit(c)}>
                          <i className="fa-solid fa-pen-to-square text-xs" /> Editar
                        </BtnGhost>
                        <BtnDanger onClick={() => remove(c.id)}>
                          <i className="fa-solid fa-trash text-xs" /> Eliminar
                        </BtnDanger>
                      </div>
                    </Td>
                  </Tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5}><EmptyState message="Sin categorías" /></td></tr>
                )}
              </Tbody>
            </Table>
          </div>

          {/* Vista previa */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Vista previa en sitio</p>
            <div className="grid grid-cols-2 gap-2">
              {items.map((c) => (
                <div
                  key={c.id}
                  className={`bg-gradient-to-br ${c.cssClass} rounded-xl aspect-square p-3 flex flex-col justify-end text-white`}
                >
                  <p className="font-semibold text-xs leading-tight">{c.label}</p>
                  <span className="text-[9px] uppercase tracking-wider opacity-70 mt-0.5">Ver más →</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Modal
          open={!!editing}
          onClose={() => setEditing(null)}
          title={isNew ? "Nueva categoría" : "Editar categoría"}
        >
          <form onSubmit={saveEditing}>
            <ModalBody>
              <Field label="Slug / ID" required hint="Sin espacios. Se usa para filtrar productos. No se puede cambiar después.">
                <Input
                  value={editing?.id ?? ""}
                  onChange={(e) => setEditing({ ...editing!, id: e.target.value.toLowerCase().replace(/\s/g, "-") })}
                  placeholder="res, cerdo, pollo..."
                  disabled={!isNew}
                  required
                />
              </Field>
              <Field label="Etiqueta visible" required>
                <Input
                  value={editing?.label ?? ""}
                  onChange={(e) => setEditing({ ...editing!, label: e.target.value })}
                  placeholder="Cortes de Res"
                  required
                />
              </Field>
              <Field label="Color / Gradiente">
                <Select
                  value={editing?.cssClass ?? "from-rojo to-rojo-mid"}
                  onChange={(e) => setEditing({ ...editing!, cssClass: e.target.value })}
                >
                  {GRADIENT_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </Select>
                {editing && (
                  <div className={`mt-2 h-10 rounded-xl bg-gradient-to-br ${editing.cssClass}`} />
                )}
              </Field>
              <Field label="Imagen de portada" hint="Se muestra en la tarjeta de la categoría. Si no hay imagen se usa solo el color.">
                <ImageUpload
                  value={editing?.image ?? ""}
                  onUpload={(url) => setEditing({ ...editing!, image: url })}
                  onClear={() => setEditing({ ...editing!, image: "" })}
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
