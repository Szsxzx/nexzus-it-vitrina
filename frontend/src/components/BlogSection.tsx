"use client";
import { useEffect, useState } from "react";
import { siteData, defaultBlogs, type BlogPost } from "@/lib/siteData";

export default function BlogSection() {
  const [blogs, setBlogs] = useState<BlogPost[]>(defaultBlogs);
  const [open, setOpen] = useState<BlogPost | null>(null);

  useEffect(() => {
    setBlogs(siteData.getBlogs());
  }, []);

  return (
    <>
      <section id="blog" className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center mb-8">Consejos y Recetas</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <article
              key={b.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition cursor-pointer"
              onClick={() => setOpen(b)}
            >
              <div className="relative aspect-video bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image}
                  alt={b.title}
                  className="w-full h-full object-cover"
                  onError={(e) => ((e.currentTarget.src = "/img/placeholder.jpg"))}
                />
              </div>
              <div className="p-5">
                <h3 className="font-semibold">{b.title}</h3>
                <span className="text-xs text-gray-400">{b.date}</span>
                <p className="text-sm text-gray-600 mt-2">{b.excerpt}</p>
                <button className="text-azul text-sm mt-3 hover:underline">Leer más →</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="sticky top-3 ml-auto mr-3 mt-3 bg-rojo text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-rojo-mid"
              onClick={() => setOpen(null)}
              aria-label="Cerrar"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={open.image}
              alt={open.title}
              className="w-full aspect-video object-cover"
              onError={(e) => ((e.currentTarget.src = "/img/placeholder.jpg"))}
            />
            <div className="p-6">
              <span className="text-xs text-gray-500">{open.date}</span>
              <h2 className="text-2xl font-serif font-bold mt-1 mb-4">{open.title}</h2>
              <div
                className="prose prose-sm max-w-none [&_h4]:font-semibold [&_h4]:mt-4 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2"
                dangerouslySetInnerHTML={{ __html: open.content }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
