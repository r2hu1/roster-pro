"use client"

import { Logo } from "@/components/logo"
import { authClient } from "@/lib/better-auth/client"
import { IconBrandGoogleFilled, IconQuestionMark } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import { Loader } from "@workspace/ui/components/loader"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bulb } from "reicon-react"
import { Skeleton } from "@workspace/ui/components/skeleton"

export default function LoginPageView() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && session) {
      router.push("/")
    }
  }, [session, isPending, router])

  const handleGoogle = async () => {
    setLoading(true)
    setError("")
    const { error: err } = await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/`,
    })
    if (err) {
      setError(err.message || err.code || "Something went wrong")
      setLoading(false)
    }
  }

  if (isPending) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background p-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--primary) 1px, transparent 1px),
              linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />
        <Skeleton className="w-full max-w-md h-100" />
      </div>
    )
  }

  if (session) return null

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--primary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      <div className="relative w-full max-w-md rounded-2xl border bg-background p-8 border-primary/20 sm:p-10">
        <div className="mb-10 flex flex-col items-center text-center">
          <Logo className="mb-6 h-10 w-auto" />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            We{"'"}re glad you{"'"}re here!
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to your account, or create a new one.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-2">
          <Button
            disabled={loading}
            onClick={handleGoogle}
            size="lg"
            className="h-11 w-full text-base!"
          >
            {loading ? (
              <Loader />
            ) : (
              <span className="flex size-5 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110">
                <IconBrandGoogleFilled className="size-4" />
              </span>
            )}
            <span className="font-medium">Continue with Google</span>
          </Button>
          <Button variant="secondary" asChild size="lg">
            <a
              href={`${process.env.NEXT_PUBLIC_MARKETING_URL}/contact`}
              className="text-foreground"
            >
              Get Help <IconQuestionMark />
            </a>
          </Button>
        </div>

        <p className="mx-auto mt-6 max-w-50 text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <a
            href={`${process.env.NEXT_PUBLIC_MARKETING_URL}/terms`}
            className="text-foreground underline underline-offset-2"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href={`${process.env.NEXT_PUBLIC_MARKETING_URL}/privacy-policy`}
            className="text-foreground underline underline-offset-2"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}
