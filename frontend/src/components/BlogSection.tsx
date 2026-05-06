"use client";
import { useEffect, useState } from "react";
import { siteData, defaultBlogs, type BlogPost } from "@/lib/siteData";

export default function BlogSection() {
  const [blogs, setBlogs] = useState<BlogPost[]>(defaultBlogs);
  const [open, setOpen]   = useState<BlogPost | null>(null);

  useEffect(() => { setBlogs(siteData.getBlogs()); }, []);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <section id="blog" className="py-16" style={{ background: "#faf9f7" }}>
        <div className="container mx-auto px-4">

          {/* Encabezado */}
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-rojo mb-2">
              Del experto para ti
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
              Consejos y Recetas
            </h2>
            <div className="mt-3 mx-auto w-12 h-0.5 bg-rojo rounded-full" />
          </div>

          {/* Grid de tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {blogs.map((b, i) => (
              <article
                key={b.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                onClick={() => setOpen(b)}
              >
                {/* Imagen */}
                <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.image}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => ((e.currentTarget.src = "/img/placeholder.jpg"))}
                  />
                  {/* Gradiente inferior */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  {/* Número decorativo */}
                  <span
                    className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "rgba(139,0,0,0.85)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Contenido */}
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                    {b.date}
                  </span>
                  <h3 className="font-serif font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-rojo transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1 line-clamp-2">
                    {b.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-rojo text-sm font-semibold">
                    <span>Leer más</span>
                    <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagen cabecera con overlay */}
            <div className="relative aspect-[16/7] flex-shrink-0 bg-gray-100 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={open.image}
                alt={open.title}
                className="w-full h-full object-cover"
                onError={(e) => ((e.currentTarget.src = "/img/placeholder.jpg"))}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Título sobre la imagen */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="text-xs text-white/70 font-medium">{open.date}</span>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-white mt-0.5 leading-tight">
                  {open.title}
                </h2>
              </div>

              {/* Botón cerrar */}
              <button
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all"
                style={{ background: "rgba(0,0,0,0.5)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#8B0000")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.5)")}
                onClick={() => setOpen(null)}
                aria-label="Cerrar"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="overflow-y-auto flex-1 p-6 md:p-8">
              <div
                className="text-sm text-gray-700 leading-relaxed
                  [&_h4]:font-bold [&_h4]:text-gray-900 [&_h4]:text-base [&_h4]:mt-5 [&_h4]:mb-2
                  [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2 [&_ul]:space-y-1
                  [&_li]:text-gray-600
                  [&_strong]:text-gray-800 [&_strong]:font-semibold
                  [&_p]:mb-3"
                dangerouslySetInnerHTML={{ __html: open.content }}
              />
            </div>

            {/* Footer del modal */}
            <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 flex justify-end">
              <button
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: "#8B0000" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#6b0000")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#8B0000")}
                onClick={() => setOpen(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
