import * as React from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import Glow from "@workspace/ui/components/glow"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

export const Hero = () => {
  return (
    <section className="overflow-hidden px-6">
      <div className="relative mx-auto max-w-5xl w-full py-16 md:py-28 lg:py-24">
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            The Complete Operating System for Modern{" "}
            <span className="relative inline-block border-2 border-primary px-4 py-1 bg-primary/10 text-primary rounded-md">
              Restaurants
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary"></div>
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary"></div>
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary"></div>
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary"></div>
            </span>
          </h1>
          <p className="mx-auto my-8 text-muted-foreground max-w-2xl text-xl">
            We help you digitize your restaurant bussiness with qr based menu,
            ordering, table management, and gst compliance billing and many
            more.
          </p>

          <div className="flex items-center gap-2 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="#">
                <span className="btn-label">Schedule Meeting</span>
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="#">
                Get Started <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl relative pt-12 -mt-12">
        <Glow variant="top" className="-z-10" />
        <Image
          className="rounded-xl border-5 border-secondary sm:aspect-video bg-contain"
          src="/assets/analytics.jpeg"
          loading="eager"
          alt="Tailark hero section"
          width={2880}
          height={2074}
        />
      </div>
    </section>
  )
}
