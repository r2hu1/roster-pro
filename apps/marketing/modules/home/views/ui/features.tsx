import { features } from "./features-data"

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 px-5 py-18 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="font-bold text-3xl tracking-tight md:text-4xl">
            One platform. Every tool you need.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Front-of-house, back-of-house, and everything in between — designed
            to work together seamlessly.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border/60 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg border border-border/60 bg-background text-primary">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-sm">{feature.title}</h3>
              <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
