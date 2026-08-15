"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  PageShell, PageHeader, SavedToast, ErrorBox, Badge, EmptyState,
  Table, Thead, Th, Tbody, Tr, Td,
  Modal, ModalBody, ModalFooter,
  BtnPrimary, BtnSecondary, BtnGhost, BtnDanger,
  SortButtons, Field, Input, Textarea,
} from "@/components/AdminUI";
import ImageUpload from "@/components/ImageUpload";
import { api, type ApiError } from "@/lib/api";

interface BlogPost {
  id: number;
  title: string;
  date: string;
  image: string | null;
  excerpt: string;
  content: string;
  sort_order: number;
}

type EditingPost = Partial<BlogPost> & { title: string; date: string };

const emptyPost = (): EditingPost => ({
  title: "",
  date: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }),
  image: "", excerpt: "", content: "",
});

export default function RecipesPage() {
  const { user, logout } = useAdminAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<EditingPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [preview, setPreview] = useState<BlogPost | null>(null);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  function reload() {
    api.get<BlogPost[]>("/blog-posts").then(setPosts).catch((e: ApiError) => setErr(e.detail));
  }
  useEffect(reload, []);

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  function openNew() { setEditing(emptyPost()); setIsNew(true); setTab("edit"); }
  function openEdit(p: BlogPost) { setEditing({ ...p }); setIsNew(false); setTab("edit"); }

  async function saveEditing(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      if (isNew) await api.post("/blog-posts", editing);
      else await api.patch(`/blog-posts/${editing.id}`, editing);
      setEditing(null);
      reload();
      flash();
    } catch (e) { setErr((e as ApiError).detail); }
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar esta receta?")) return;
    try { await api.delete(`/blog-posts/${id}`); reload(); }
    catch (e) { setErr((e as ApiError).detail); }
  }

  async function swap(a: BlogPost, b: BlogPost) {
    try {
      await Promise.all([
        api.patch(`/blog-posts/${a.id}`, { sort_order: b.sort_order }),
        api.patch(`/blog-posts/${b.id}`, { sort_order: a.sort_order }),
      ]);
      reload();
    } catch (e) { setErr((e as ApiError).detail); }
  }
  function moveUp(idx: number) { if (idx > 0) swap(posts[idx], posts[idx - 1]); }
  function moveDown(idx: number) { if (idx < posts.length - 1) swap(posts[idx], posts[idx + 1]); }

  return (
      <PageShell>
        <PageHeader
          title="Recetas y Artículos"
          subtitle="Blog de consejos y recetas del sitio"
          actions={
            <div className="flex items-center gap-3">
              <SavedToast visible={saved} />
              <BtnPrimary onClick={openNew}>
                <i className="fa-solid fa-plus text-xs" /> Nueva receta
              </BtnPrimary>
            </div>
          }
        />

        <ErrorBox message={err} />

        <Table>
          <Thead>
            <Th>Orden</Th>
            <Th>Título</Th>
            <Th>Fecha</Th>
            <Th>Extracto</Th>
            <Th />
          </Thead>
          <Tbody>
            {posts.map((p, idx) => (
              <Tr key={p.id}>
                <Td muted><SortButtons onUp={() => moveUp(idx)} onDown={() => moveDown(idx)} /></Td>
                <Td><span className="font-semibold text-gray-900">{p.title}</span></Td>
                <Td muted>
                  <Badge color="gray">{p.date}</Badge>
                </Td>
                <Td muted>
                  <span className="text-xs line-clamp-1 max-w-[200px] block">{p.excerpt}</span>
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-3">
                    <BtnGhost onClick={() => setPreview(p)}>
                      <i className="fa-solid fa-eye text-xs" /> Ver
                    </BtnGhost>
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
            {posts.length === 0 && (
              <tr><td colSpan={5}><EmptyState message="Sin artículos" /></td></tr>
            )}
          </Tbody>
        </Table>

        {/* Modal edición con tabs */}
        <Modal
          open={!!editing}
          onClose={() => setEditing(null)}
          title={isNew ? "Nueva receta" : "Editar receta"}
          width="max-w-2xl"
        >
          <form onSubmit={saveEditing}>
            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6 pt-1">
              {(["edit", "preview"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                    tab === t
                      ? "border-red-700 text-red-700"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {t === "edit" ? "✏️ Editor" : "👁 Vista previa"}
                </button>
              ))}
            </div>

            {tab === "edit" ? (
              <ModalBody>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Título" required full>
                    <Input value={editing?.title ?? ""} onChange={(e) => setEditing({ ...editing!, title: e.target.value })} required />
                  </Field>
                  <Field label="Fecha">
                    <Input value={editing?.date ?? ""} onChange={(e) => setEditing({ ...editing!, date: e.target.value })} placeholder="15 Enero 2023" />
                  </Field>
                  <Field label="Imagen del artículo" full>
                    <ImageUpload
                      value={editing?.image ?? ""}
                      onUpload={(url) => setEditing({ ...editing!, image: url })}
                      onClear={() => setEditing({ ...editing!, image: "" })}
                    />
                  </Field>
                  <Field label="Extracto breve" full>
                    <Textarea
                      rows={2}
                      value={editing?.excerpt ?? ""}
                      onChange={(e) => setEditing({ ...editing!, excerpt: e.target.value })}
                      placeholder="Descripción corta que aparece en la tarjeta..."
                    />
                  </Field>
                  <Field
                    label="Contenido HTML"
                    full
                    hint="Puedes usar: <p>, <h4>, <ul>, <li>, <strong>"
                  >
                    <Textarea
                      rows={10}
                      value={editing?.content ?? ""}
                      onChange={(e) => setEditing({ ...editing!, content: e.target.value })}
                      placeholder="<p>Contenido...</p>"
                      className="font-mono text-xs"
                    />
                  </Field>
                </div>
              </ModalBody>
            ) : (
              <div className="px-6 py-5">
                {editing?.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editing.image}
                    alt=""
                    className="w-full aspect-video object-cover rounded-xl mb-4 bg-gray-100"
                    onError={(e) => ((e.currentTarget.src = "/img/placeholder.jpg"))}
                  />
                )}
                <span className="text-xs text-gray-400">{editing?.date}</span>
                <h2 className="font-serif font-bold text-xl mt-1 mb-3">{editing?.title}</h2>
                <div
                  className="prose prose-sm max-w-none text-gray-700 [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:text-gray-900 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2"
                  dangerouslySetInnerHTML={{ __html: editing?.content ?? "" }}
                />
              </div>
            )}

            <ModalFooter>
              <BtnSecondary type="button" onClick={() => setEditing(null)}>Cancelar</BtnSecondary>
              <BtnPrimary type="submit">Guardar</BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>

        {/* Modal solo vista previa */}
        <Modal
          open={!!preview}
          onClose={() => setPreview(null)}
          title={preview?.title ?? ""}
          width="max-w-2xl"
        >
          {preview && (
            <ModalBody>
              {preview.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.image}
                  alt=""
                  className="w-full aspect-video object-cover rounded-xl bg-gray-100"
                  onError={(e) => ((e.currentTarget.src = "/img/placeholder.jpg"))}
                />
              )}
              <span className="text-xs text-gray-400">{preview.date}</span>
              <div
                className="prose prose-sm max-w-none text-gray-700 [&_h4]:font-semibold [&_h4]:mt-4 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2"
                dangerouslySetInnerHTML={{ __html: preview.content }}
              />
            </ModalBody>
          )}
        </Modal>
      </PageShell>
  );
}
