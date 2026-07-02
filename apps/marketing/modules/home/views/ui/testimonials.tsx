const testimonials = [
  {
    quote:
      "RosterPro cut our ticket times in half. Our kitchen staff finally works as one unit instead of scrambling between screens.",
    name: "Marcus Chen",
    role: "Owner, Golden Dragon Bistro",
    rating: 5,
  },
  {
    quote:
      "We switched from three separate tools to RosterPro and saved over $800 a month. The analytics alone paid for the subscription in week one.",
    name: "Sarah Mitchell",
    role: "GM, The Oak Table",
    rating: 5,
  },
  {
    quote:
      "Our online orders went up 40% after launching the branded ordering site. Customers love the live tracking feature.",
    name: "David Ramirez",
    role: "Owner, Casa del Sabor",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-20 px-5 py-18 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="font-bold text-3xl tracking-tight md:text-4xl">
            Loved by restaurant owners
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            See what our customers have to say about transforming their
            operations with RosterPro.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col rounded-xl border border-border/60 bg-card p-6"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4 text-amber-500"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="flex-1 text-muted-foreground text-sm leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-4 border-t border-border/60 pt-4">
                <p className="font-semibold text-sm">{testimonial.name}</p>
                <p className="text-muted-foreground text-xs">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
