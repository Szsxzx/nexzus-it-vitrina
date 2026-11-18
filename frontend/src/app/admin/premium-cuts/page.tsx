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

interface PremiumSection {
  id: number;
  title: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface PremiumCut {
  id: number;
  section_id: number | null;
  name: string;
  price: string;
  unit_price: number;
  origin: string | null;
  img: string | null;
  badge: string | null;
  badge_color: string;
  text: string | null;
  sort_order: number;
}

const ICON_OPTIONS = [
  { value: "fa-laptop",         label: "PortÃ¡til" },
  { value: "fa-server",         label: "Servidor" },
  { value: "fa-network-wired",  label: "Redes" },
  { value: "fa-key",            label: "Licencias" },
  { value: "fa-shield-halved",  label: "Seguridad" },
  { value: "fa-screwdriver-wrench", label: "Soporte" },
  { value: "fa-star",           label: "Destacado" },
];

const COLOR_OPTIONS = [
  { value: "bg-primary",   label: "Negro de marca" },
  { value: "bg-secondary", label: "Morado oscuro" },
  { value: "bg-accent",    label: "Morado" },
  { value: "bg-success",   label: "Verde" },
  { value: "bg-warning",   label: "Ãmbar" },
];

const BADGE_COLOR_OPTIONS = COLOR_OPTIONS;

const colorHex: Record<string, string> = {
  "bg-primary": "#0B0712", "bg-secondary": "#1A1030", "bg-accent": "#7C3AED",
  "bg-success": "#15803D", "bg-warning": "#B45309",
};

type EditingSection = Partial<PremiumSection> & { title: string; icon: string; color: string };
type EditingCut = Partial<PremiumCut> & { name: string; price: string; badge_color: string };

const emptySection = (): EditingSection => ({ title: "", icon: "fa-laptop", color: "bg-accent" });
const emptyCut = (sections: PremiumSection[]): EditingCut => ({
  section_id: sections[0]?.id ?? null,
  name: "", price: "", unit_price: 0, origin: "", img: "", badge: "", badge_color: "bg-accent", text: "",
});

export default function PremiumCutsPage() {
  const { user, logout } = useAdminAuth();
  const [sections, setSections] = useState<PremiumSection[]>([]);
  const [cuts, setCuts] = useState<PremiumCut[]>([]);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [editingSection, setEditingSection] = useState<EditingSection | null>(null);
  const [isNewSection, setIsNewSection] = useState(false);

  const [editingCut, setEditingCut] = useState<EditingCut | null>(null);
  const [isNewCut, setIsNewCut] = useState(false);

  function reload() {
    api.get<PremiumSection[]>("/premium-sections").then(setSections).catch((e: ApiError) => setErr(e.detail));
    api.get<PremiumCut[]>("/premium-cuts").then(setCuts).catch((e: ApiError) => setErr(e.detail));
  }
  useEffect(reload, []);

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  // ── Secciones ──
  async function saveSection(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSection) return;
    try {
      if (isNewSection) await api.post("/premium-sections", editingSection);
      else await api.patch(`/premium-sections/${editingSection.id}`, editingSection);
      setEditingSection(null);
      reload();
      flash();
    } catch (e) { setErr((e as ApiError).detail); }
  }
  async function removeSection(id: number) {
    if (!confirm("¿Eliminar esta sección? Las soluciones asociadas quedarán sin sección.")) return;
    try { await api.delete(`/premium-sections/${id}`); reload(); }
    catch (e) { setErr((e as ApiError).detail); }
  }
  async function swapSection(a: PremiumSection, b: PremiumSection) {
    try {
      await Promise.all([
        api.patch(`/premium-sections/${a.id}`, { sort_order: b.sort_order }),
        api.patch(`/premium-sections/${b.id}`, { sort_order: a.sort_order }),
      ]);
      reload();
    } catch (e) { setErr((e as ApiError).detail); }
  }
  function moveSectionUp(idx: number) { if (idx > 0) swapSection(sections[idx], sections[idx - 1]); }
  function moveSectionDown(idx: number) { if (idx < sections.length - 1) swapSection(sections[idx], sections[idx + 1]); }

  // ── Cortes ──
  async function saveCut(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCut) return;
    const unit_price = Number(editingCut.price.replace(/[^0-9]/g, "")) || 0;
    const body = { ...editingCut, unit_price };
    try {
      if (isNewCut) await api.post("/premium-cuts", body);
      else await api.patch(`/premium-cuts/${editingCut.id}`, body);
      setEditingCut(null);
      reload();
      flash();
    } catch (e) { setErr((e as ApiError).detail); }
  }
  async function removeCut(id: number) {
    if (!confirm("¿Eliminar esta solución?")) return;
    try { await api.delete(`/premium-cuts/${id}`); reload(); }
    catch (e) { setErr((e as ApiError).detail); }
  }
  async function swapCut(a: PremiumCut, b: PremiumCut) {
    try {
      await Promise.all([
        api.patch(`/premium-cuts/${a.id}`, { sort_order: b.sort_order }),
        api.patch(`/premium-cuts/${b.id}`, { sort_order: a.sort_order }),
      ]);
      reload();
    } catch (e) { setErr((e as ApiError).detail); }
  }
  function moveCutUp(idx: number) { if (idx > 0) swapCut(cuts[idx], cuts[idx - 1]); }
  function moveCutDown(idx: number) { if (idx < cuts.length - 1) swapCut(cuts[idx], cuts[idx + 1]); }

  return (
      <PageShell>
        <PageHeader
          title="Soluciones destacadas"
          subtitle="Secciones y soluciones de la tienda"
          actions={<SavedToast visible={saved} />}
        />

        <ErrorBox message={err} />

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
                        style={{ background: colorHex[s.color] ?? "#7C3AED" }}
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
                      style={{ background: colorHex[s.color] ?? "#7C3AED" }}
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
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Soluciones</h2>
            <BtnPrimary onClick={() => { setEditingCut(emptyCut(sections)); setIsNewCut(true); }}>
              <i className="fa-solid fa-plus text-xs" /> Nueva solución
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
                const sec = sections.find((s) => s.id === c.section_id);
                return (
                  <Tr key={c.id}>
                    <Td muted><SortButtons onUp={() => moveCutUp(idx)} onDown={() => moveCutDown(idx)} /></Td>
                    <Td><span className="font-semibold text-gray-900">{c.name}</span></Td>
                    <Td>
                      {sec ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ background: colorHex[sec.color] ?? "#7C3AED" }}
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
                        style={{ background: colorHex[c.badge_color] ?? "#7C3AED" }}
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
                <tr><td colSpan={6}><EmptyState message="Sin soluciones" /></td></tr>
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
                    value={editingSection?.color ?? "bg-accent"}
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
          title={isNewCut ? "Nueva solución" : "Editar solución"}
        >
          <form onSubmit={saveCut}>
            <ModalBody>
              <Field label="Sección" required>
                <Select
                  value={editingCut?.section_id ?? ""}
                  onChange={(e) => setEditingCut({ ...editingCut!, section_id: Number(e.target.value) })}
                >
                  {sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </Select>
              </Field>
              <Field label="Nombre de la solución" required>
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
                <Field label="Badge">
                  <Input
                    value={editingCut?.badge ?? ""}
                    onChange={(e) => setEditingCut({ ...editingCut!, badge: e.target.value })}
                    placeholder="TOP VENTAS"
                  />
                </Field>
                <Field label="Color del badge">
                  <Select
                    value={editingCut?.badge_color ?? "bg-accent"}
                    onChange={(e) => setEditingCut({ ...editingCut!, badge_color: e.target.value })}
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
                  placeholder="Descripción de la solución..."
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
  );
}
