import Image from "next/image";
import Link from "next/link";

/** Logo oficial + wordmark. Pensado para fondos oscuros (header, footer). */
export default function BrandLogo({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="NEXZUS IT SERVICE — Inicio"
      className={`inline-flex items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-accent-light ${className}`}
    >
      <Image
        src="/img/isotipo-nexzus.png"
        alt=""
        width={Math.round(size * 1.31)}
        height={size}
        priority
        className="h-auto"
      />
      <span className="font-heading text-xl font-bold tracking-wide text-white">
        NEXZUS <span className="text-accent-light">IT</span>
      </span>
    </Link>
  );
}
