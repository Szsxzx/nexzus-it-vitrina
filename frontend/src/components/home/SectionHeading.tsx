import Reveal from "@/components/Reveal";

export default function SectionHeading({
  eyebrow, title, description, align = "center", dark = false,
}: { eyebrow: string; title: string; description?: string; align?: "center" | "left"; dark?: boolean }) {
  return (
    <Reveal className={`mb-10 md:mb-12 ${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${dark ? "text-accent-light" : "text-accent"}`}>
        {eyebrow}
      </span>
      <h2 className={`mt-2 font-heading text-3xl font-semibold md:text-4xl ${dark ? "text-white" : "text-primary"}`}>{title}</h2>
      {description && (
        <p className={`mt-3 text-base md:text-lg ${dark ? "text-white/70" : "text-muted-foreground"}`}>{description}</p>
      )}
    </Reveal>
  );
}
