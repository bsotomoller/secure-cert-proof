import { Building2 } from "lucide-react";

const companies = [
  "Empresa 1",
  "Empresa 2",
  "Empresa 3",
  "Empresa 4",
];

const TrustedCarousel = () => {
  // Duplicate for infinite scroll effect
  const items = [...companies, ...companies];

  return (
    <section className="py-14 border-b border-border overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <h3 className="text-center font-display text-xl font-semibold text-muted-foreground tracking-wide uppercase">
          Confían en nosotros
        </h3>
      </div>
      <div className="relative">
        <div className="flex animate-scroll-left w-max gap-16 px-8">
          {items.map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-3 min-w-[200px] opacity-50 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary/60" />
              </div>
              <span className="font-body text-sm text-muted-foreground whitespace-nowrap">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedCarousel;
