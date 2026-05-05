"use client";
import { useEffect, useState } from "react";
import { siteData, defaultBanner, type BannerData } from "@/lib/siteData";

export default function Banner() {
  const [data, setData] = useState<BannerData>(defaultBanner);

  useEffect(() => {
    setData(siteData.getBanner());
  }, []);

  return (
    <section
      id="top"
      className="relative h-[80vh] min-h-[500px] flex items-center justify-center text-white text-center bg-gradient-to-br from-negro via-rojo/40 to-negro"
    >
      <div className="absolute inset-0 bg-[url('/img/banner.jpg')] bg-cover bg-center opacity-30" />
      <div className="relative z-10 px-4">
        <p className="text-sm md:text-base uppercase tracking-[0.4em] text-azul">{data.subtitle}</p>
        <h2 className="font-serif text-4xl md:text-7xl mt-3 leading-tight">
          {data.title}<br /><span className="text-rojo-light">{data.highlight}</span>
        </h2>
        <a
          href={data.ctaHref}
          className="inline-block mt-8 px-8 py-3 bg-rojo hover:bg-rojo-mid rounded-full uppercase tracking-wider text-sm font-semibold transition"
        >
          {data.ctaText}
        </a>
      </div>
    </section>
  );
}
