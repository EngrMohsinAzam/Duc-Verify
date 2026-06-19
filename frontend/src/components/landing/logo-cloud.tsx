import { ScrollReveal } from "@/components/landing/scroll-reveal";

const logos = [
  { name: "Google", style: "font-semibold tracking-tight" },
  { name: "Microsoft", style: "font-semibold" },
  { name: "AWS", style: "font-bold tracking-widest" },
  { name: "PayPal", style: "font-bold italic" },
  { name: "Zoom", style: "font-bold" },
  { name: "Shopify", style: "font-semibold" },
];

export function LogoCloud() {
  return (
    <section className="border-t border-blue-200/30 py-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ScrollReveal variant="fade-up">
          <p className="text-center text-sm font-medium text-slate-500">
            Trusted by forward-thinking organizations
          </p>
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={100}>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-5 sm:gap-x-16">
            {logos.map(({ name, style }) => (
              <span
                key={name}
                className={`text-base text-slate-300 transition hover:text-slate-400 ${style}`}
              >
                {name}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
