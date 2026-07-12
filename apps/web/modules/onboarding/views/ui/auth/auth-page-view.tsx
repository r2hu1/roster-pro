"use client"

import { Logo } from "@/components/logo"
import { authClient } from "@/lib/better-auth/client"
import { IconBrandGoogleFilled } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import { Loader } from "@workspace/ui/components/loader"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

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
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader />
      </div>
    )
  }

  if (session) return null

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="flex w-full max-w-[60vw] overflow-hidden rounded-2xl bg-secondary shadow-2xl md:min-h-[80vh]">
        <div className="flex w-full flex-col items-center justify-center px-6 md:w-1/2">
          <div className="w-full max-w-sm">
            <div className="mb-15 flex flex-col items-center text-center">
              <Logo className="mb-6 h-10 w-auto" />
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              disabled={loading}
              onClick={handleGoogle}
              variant="outline"
              className="group relative w-full h-11 gap-3 overflow-hidden border-2 bg-white text-foreground shadow-xs transition-all duration-300 hover:bg-accent hover:shadow-md active:scale-[0.97]"
              size="lg"
            >
              {loading ? (
                <Loader />
              ) : (
                <span className="flex size-5 items-center justify-center rounded-full bg-white transition-transform duration-300 group-hover:scale-110">
                  <IconBrandGoogleFilled className="size-4" />
                </span>
              )}
              <span className="font-medium">Continue with Google</span>
            </Button>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="/terms&cond" className="text-foreground underline underline-offset-2">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy_policy" className="text-foreground underline underline-offset-2">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

        <div className="hidden md:flex md:w-1/2 items-center justify-center p-6">
          <Image
            src="/assets/scanning-qr-stand.jpeg"
            alt="QR scanning"
            width={1200}
            height={3000}
            className="max-h-full w-full rounded-xl object-contain"
          />
        </div>
      </div>
    </div>
  )
}
