export function About() {
  return (
    <section
      id="about"
      className="border-border border-t bg-background/60 px-5 py-18 md:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-bold text-3xl tracking-tight md:text-4xl">
              Built for restaurants, by restaurant people
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              RosterPro was born from the frustration of juggling multiple tools
              to run a single restaurant. Our team has worked in kitchens,
              managed front-of-house operations, and lived the chaos firsthand.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              We built one unified platform so you can focus on what matters —
              serving great food and creating memorable experiences for your
              guests.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <p className="font-bold text-2xl text-primary">2023</p>
              <p className="mt-1 text-muted-foreground text-sm">Founded</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <p className="font-bold text-2xl text-primary">12</p>
              <p className="mt-1 text-muted-foreground text-sm">Team members</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <p className="font-bold text-2xl text-primary">500+</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Restaurants served
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <p className="font-bold text-2xl text-primary">24/7</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Support available
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
