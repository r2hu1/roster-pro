"use client"

import { Logo } from "@/components/logo"
import { authClient } from "@/lib/better-auth/client"
import { IconBrandGoogleFilled } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Loader } from "@workspace/ui/components/loader"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Mode = "login" | "signup"

export default function LoginPageView() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const form = e.currentTarget
    const data = new FormData(form)
    const email = data.get("email") as string
    const password = data.get("password") as string

    const { error: err } =
      mode === "login"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({
            name: data.get("name") as string,
            email,
            password,
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
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center text-center">
          <Logo className="mb-6 h-10 w-auto" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "login"
              ? "Enter your credentials to access your account"
              : "Get started with your free account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                Full name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="hello@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10"
            size="lg"
          >
            {loading ? <Loader /> : mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          disabled={loading}
          onClick={handleGoogle}
          variant="outline"
          className="w-full h-10 gap-2"
          size="lg"
        >
          <IconBrandGoogleFilled className="size-4" />
          Continue with Google
        </Button>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("signup"); setError("") }}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("login"); setError("") }}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
