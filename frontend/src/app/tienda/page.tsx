"use client";
import { useState } from "react";
import type { Category } from "@/lib/types";

import SiteHeader from "@/components/SiteHeader";
import Banner from "@/components/Banner";
import Features from "@/components/Features";
import Categories from "@/components/Categories";
import Catalog from "@/components/Catalog";
import PremiumCuts from "@/components/PremiumCuts";
import Promotions from "@/components/Promotions";
import BlogSection from "@/components/BlogSection";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppCart from "@/components/WhatsAppCart";

export default function TiendaPage() {
  const [filter, setFilter] = useState<"all" | Category>("all");

  function pickCategory(c: string) {
    setFilter(c as "all" | Category);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <SiteHeader />
      <Banner />
      <main>
        <Features />
        <Categories onPick={pickCategory} />
        <Catalog activeFilter={filter} onFilter={setFilter} />
        <PremiumCuts />
        <Promotions />
        <BlogSection />
      </main>
      <SiteFooter />
      <WhatsAppCart />
    </>
  );
}
