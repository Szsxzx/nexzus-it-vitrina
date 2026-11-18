import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TrustStrip from "@/components/home/TrustStrip";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Services from "@/components/home/Services";
import MissionVision from "@/components/home/MissionVision";
import WhyUs from "@/components/home/WhyUs";
import Brands from "@/components/home/Brands";
import Testimonials from "@/components/home/Testimonials";
import PqrCta from "@/components/home/PqrCta";
import Contact from "@/components/home/Contact";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <TrustStrip />
        <About />
        <Services />
        <MissionVision />
        <WhyUs />
        <Brands />
        <Testimonials />
        <PqrCta />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
