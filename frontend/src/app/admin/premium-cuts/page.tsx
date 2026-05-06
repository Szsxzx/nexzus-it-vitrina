"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import AdminLayout from "@/components/AdminLayout";
import {
  PageShell, PageHeader, SavedToast, EmptyState,
  Table, Thead, Th, Tbody, Tr, Td,
  Modal, ModalBody, ModalFooter,
  BtnPrimary, BtnSecondary, BtnGhost, BtnDanger,
  SortButtons, Field, Input, Select,
} from "@/components/AdminUI";
import ImageUpload from "@/components/ImageUpload";
import {
  siteData,
  defaultPremiumSections,
  defaultPremiumCuts,
  type PremiumSection,
  type PremiumCut,
} from "@/lib/siteData";

const ICON_OPTIONS = [
  { value: "fa-cow",            label: "🐄 Res" },
  { value: "fa-piggy-bank",     label: "🐷 Cerdo" },
  { value: "fa-drumstick-bite", label: "🍗 Pollo" },
  { value: "fa-fish",           label: "🐟 Pescado" },
  { value: "fa-sausage",        label: "🌭 Embutidos" },
  { value: "fa-star",           label: "⭐ Estrella" },
  { value: "fa-fire",           label: "🔥 Fuego" },
];

const COLOR_OPTIONS = [
  { value: "bg-rojo",      label: "🔴 Rojo" },
  { value: "bg-negro2",    label: "⚫ Negro" },
  { value: "bg-azul",      label: "🔵 Azul" },
  { value: "bg-green-700", label: "🟢 Verde" },
  { value: "bg-amber-600", label: "🟡 Ámbar" },
  { value: "bg-pink-700",  label: "🩷 Rosa" },
];

const BADGE_COLOR_OPTIONS = [
  { value: "bg-rojo",      label: "🔴 Rojo" },
  { value: "bg-azul",      label: "🔵 Azul" },
  { value: "bg-negro2",    label: "⚫ Negro" },
  { value: "bg-green-700", label: "🟢 Verde" },
  { value: "bg-amber-600", label: "🟡 Ámbar" },
];

const colorHex: Record<string, string> = {
  "bg-rojo": "#8B0000", "bg-negro2": "#1a1a1a",
  "bg-azul": "#3AA8C1", "bg-green-700": "#15803d",
  "bg-amber-600": "#d97706", "bg-pink-700": "#be185d",
};

const emptySection = (): PremiumSection => ({
  id: `sec-${Date.now()}`, title: "", icon: "fa-cow", color: "bg-rojo",
});

const emptyCut = (sections: PremiumSection[]): PremiumCut => ({
  id: `cut-${Date.now()}`,
  sectionId: sections[0]?.id ?? "",
  name: "", price: "", unitPrice: 0, origin: "",
  img: "", badge: "", badgeColor: "bg-rojo", text: "",
});

export default function PremiumCutsPage() {
  const { user, loading, logout } = useAuth();
  const [sections, setSections] = useState<PremiumSection[]>([]);
  const [cuts, setCuts] = useState<PremiumCut[]>([]);
  const [saved, setSaved] = useState(false);

  // Modales secciones
  const [editingSection, setEditingSection] = useState<PremiumSection | null>(null);
  const [isNewSection, setIsNewSection] = useState(false);

  // Modales cortes
  const [editingCut, setEditingCut] = useState<PremiumCut | null>(null);
  const [isNewCut, setIsNewCut] = useState(false);

  useEffect(() => {
    setSections(siteData.getPremiumSections());
    setCuts(siteData.getPremiumCuts());
  }, []);

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  // ── Secciones ──
  function persistSections(updated: PremiumSection[]) {
    setSections(updated); siteData.setPremiumSections(updated); flash();
  }
  function saveSection(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSection) return;
    if (!editingSection.id.trim()) { alert("El ID es obligatorio"); return; }
    persistSections(
      isNewSection
        ? [...sections, editingSection]
        : sections.map((s) => s.id === editingSection.id ? editingSection : s)
    );
    setEditingSection(null);
  }
  function removeSection(id: string) {
    if (!confirm("¿Eliminar esta sección? Los cortes asociados quedarán sin sección.")) return;
    persistSections(sections.filter((s) => s.id !== id));
  }
  function moveSectionUp(idx: number) {
    if (idx === 0) return;
    const arr = [...sections]; [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]; persistSections(arr);
  }
  function moveSectionDown(idx: number) {
    if (idx === sections.length - 1) return;
    const arr = [...sections]; [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]; persistSections(arr);
  }

  // ── Cortes ──
  function persistCuts(updated: PremiumCut[]) {
    setCuts(updated); siteData.setPremiumCuts(updated); flash();
  }
  function saveCut(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCut) return;
    persistCuts(
      isNewCut
        ? [...cuts, editingCut]
        : cuts.map((c) => c.id === editingCut.id ? editingCut : c)
    );
    setEditingCut(null);
  }
  function removeCut(id: string) {
    if (!confirm("¿Eliminar este corte?")) return;
    persistCuts(cuts.filter((c) => c.id !== id));
  }
  function moveCutUp(idx: number) {
    if (idx === 0) return;
    const arr = [...cuts]; [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]; persistCuts(arr);
  }
  function moveCutDown(idx: number) {
    if (idx === cuts.length - 1) return;
    const arr = [...cuts]; [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]; persistCuts(arr);
  }

  function resetAll() {
    if (!confirm("¿Restaurar todos los cortes y secciones a los valores por defecto?")) return;
    siteData.resetPremiumSections(); siteData.resetPremiumCuts();
    setSections(defaultPremiumSections); setCuts(defaultPremiumCuts); flash();
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">Cargando...</div>;
  if (!user) return null;

  return (
    <AdminLayout user={user} onLogout={logout}>
      <PageShell>
        <PageHeader
          title="Cortes Premium"
          subtitle="Secciones y cortes de la vitrina"
          actions={
            <div className="flex items-center gap-3">
              <SavedToast visible={saved} />
              <BtnSecondary onClick={resetAll}>Restaurar defecto</BtnSecondary>
            </div>
          }
        />

        {/* ── SECCIONES ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Secciones</h2>
            <BtnPrimary onClick={() => { setEditingSection(emptySection()); setIsNewSection(true); }}>
              <i className="fa-solid fa-plus text-xs" /> Nueva sección
            </BtnPrimary>
          </div>
          <Table>
            <Thead>
              <Th>Orden</Th>
              <Th>Título</Th>
              <Th>Ícono</Th>
              <Th>Color</Th>
              <Th />
            </Thead>
            <Tbody>
              {sections.map((s, idx) => (
                <Tr key={s.id}>
                  <Td muted><SortButtons onUp={() => moveSectionUp(idx)} onDown={() => moveSectionDown(idx)} /></Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs flex-shrink-0"
                        style={{ background: colorHex[s.color] ?? "#8B0000" }}
                      >
                        <i className={`fa-solid ${s.icon}`} />
                      </span>
                      <span className="font-semibold text-gray-900">{s.title}</span>
                    </div>
                  </Td>
                  <Td muted><code className="text-xs">{s.icon}</code></Td>
                  <Td>
                    <span
                      className="inline-block w-5 h-5 rounded-lg border border-black/10"
                      style={{ background: colorHex[s.color] ?? "#8B0000" }}
                    />
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-3">
                      <BtnGhost onClick={() => { setEditingSection({ ...s }); setIsNewSection(false); }}>
                        <i className="fa-solid fa-pen-to-square text-xs" /> Editar
                      </BtnGhost>
                      <BtnDanger onClick={() => removeSection(s.id)}>
                        <i className="fa-solid fa-trash text-xs" /> Eliminar
                      </BtnDanger>
                    </div>
                  </Td>
                </Tr>
              ))}
              {sections.length === 0 && (
                <tr><td colSpan={5}><EmptyState message="Sin secciones" /></td></tr>
              )}
            </Tbody>
          </Table>
        </div>

        {/* ── CORTES ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Cortes</h2>
            <BtnPrimary onClick={() => { setEditingCut(emptyCut(sections)); setIsNewCut(true); }}>
              <i className="fa-solid fa-plus text-xs" /> Nuevo corte
            </BtnPrimary>
          </div>
          <Table>
            <Thead>
              <Th>Orden</Th>
              <Th>Nombre</Th>
              <Th>Sección</Th>
              <Th>Precio</Th>
              <Th>Badge</Th>
              <Th />
            </Thead>
            <Tbody>
              {cuts.map((c, idx) => {
                const sec = sections.find((s) => s.id === c.sectionId);
                return (
                  <Tr key={c.id}>
                    <Td muted><SortButtons onUp={() => moveCutUp(idx)} onDown={() => moveCutDown(idx)} /></Td>
                    <Td><span className="font-semibold text-gray-900">{c.name}</span></Td>
                    <Td>
                      {sec ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ background: colorHex[sec.color] ?? "#8B0000" }}
                        >
                          <i className={`fa-solid ${sec.icon} text-[10px]`} />
                          {sec.title}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </Td>
                    <Td><span className="font-semibold text-sm">{c.price}</span></Td>
                    <Td>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                        style={{ background: colorHex[c.badgeColor] ?? "#8B0000" }}
                      >
                        {c.badge}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-3">
                        <BtnGhost onClick={() => { setEditingCut({ ...c }); setIsNewCut(false); }}>
                          <i className="fa-solid fa-pen-to-square text-xs" /> Editar
                        </BtnGhost>
                        <BtnDanger onClick={() => removeCut(c.id)}>
                          <i className="fa-solid fa-trash text-xs" /> Eliminar
                        </BtnDanger>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
              {cuts.length === 0 && (
                <tr><td colSpan={6}><EmptyState message="Sin cortes" /></td></tr>
              )}
            </Tbody>
          </Table>
        </div>

        {/* ── MODAL SECCIÓN ── */}
        <Modal
          open={!!editingSection}
          onClose={() => setEditingSection(null)}
          title={isNewSection ? "Nueva sección" : "Editar sección"}
        >
          <form onSubmit={saveSection}>
            <ModalBody>
              <Field label="Título" required>
                <Input
                  value={editingSection?.title ?? ""}
                  onChange={(e) => setEditingSection({ ...editingSection!, title: e.target.value })}
                  placeholder="Cortes de Res"
                  required
                />
              </Field>
              {isNewSection && (
                <Field label="ID (slug único)" required>
                  <Input
                    value={editingSection?.id ?? ""}
                    onChange={(e) => setEditingSection({ ...editingSection!, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    placeholder="res"
                    required
                  />
                </Field>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ícono">
                  <Select
                    value={editingSection?.icon ?? "fa-cow"}
                    onChange={(e) => setEditingSection({ ...editingSection!, icon: e.target.value })}
                  >
                    {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </Field>
                <Field label="Color de encabezado">
                  <Select
                    value={editingSection?.color ?? "bg-rojo"}
                    onChange={(e) => setEditingSection({ ...editingSection!, color: e.target.value })}
                  >
                    {COLOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </Field>
              </div>
            </ModalBody>
            <ModalFooter>
              <BtnSecondary type="button" onClick={() => setEditingSection(null)}>Cancelar</BtnSecondary>
              <BtnPrimary type="submit">Guardar</BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>

        {/* ── MODAL CORTE ── */}
        <Modal
          open={!!editingCut}
          onClose={() => setEditingCut(null)}
          title={isNewCut ? "Nuevo corte" : "Editar corte"}
        >
          <form onSubmit={saveCut}>
            <ModalBody>
              <Field label="Sección" required>
                <Select
                  value={editingCut?.sectionId ?? ""}
                  onChange={(e) => setEditingCut({ ...editingCut!, sectionId: e.target.value })}
                >
                  {sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </Select>
              </Field>
              <Field label="Nombre del corte" required>
                <Input
                  value={editingCut?.name ?? ""}
                  onChange={(e) => setEditingCut({ ...editingCut!, name: e.target.value })}
                  placeholder="Lomo Fino Angus"
                  required
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Precio (texto)" required>
                  <Input
                    value={editingCut?.price ?? ""}
                    onChange={(e) => setEditingCut({ ...editingCut!, price: e.target.value })}
                    placeholder="$32.000/kg"
                    required
                  />
                </Field>
                <Field label="Precio unitario (número)">
                  <Input
                    type="number"
                    value={editingCut?.unitPrice ?? 0}
                    onChange={(e) => setEditingCut({ ...editingCut!, unitPrice: Number(e.target.value) })}
                    placeholder="32000"
                  />
                </Field>
                <Field label="Badge">
                  <Input
                    value={editingCut?.badge ?? ""}
                    onChange={(e) => setEditingCut({ ...editingCut!, badge: e.target.value })}
                    placeholder="TOP VENTAS"
                  />
                </Field>
                <Field label="Color del badge">
                  <Select
                    value={editingCut?.badgeColor ?? "bg-rojo"}
                    onChange={(e) => setEditingCut({ ...editingCut!, badgeColor: e.target.value })}
                  >
                    {BADGE_COLOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </Field>
              </div>
              <Field label="Origen">
                <Input
                  value={editingCut?.origin ?? ""}
                  onChange={(e) => setEditingCut({ ...editingCut!, origin: e.target.value })}
                  placeholder="Origen: Argentina"
                />
              </Field>
              <Field label="Descripción">
                <Input
                  value={editingCut?.text ?? ""}
                  onChange={(e) => setEditingCut({ ...editingCut!, text: e.target.value })}
                  placeholder="Descripción del corte..."
                />
              </Field>
              <Field label="Imagen">
                <ImageUpload
                  value={editingCut?.img ?? ""}
                  onUpload={(url) => setEditingCut({ ...editingCut!, img: url })}
                  onClear={() => setEditingCut({ ...editingCut!, img: "" })}
                />
              </Field>
            </ModalBody>
            <ModalFooter>
              <BtnSecondary type="button" onClick={() => setEditingCut(null)}>Cancelar</BtnSecondary>
              <BtnPrimary type="submit">Guardar</BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>

      </PageShell>
    </AdminLayout>
  );
}
