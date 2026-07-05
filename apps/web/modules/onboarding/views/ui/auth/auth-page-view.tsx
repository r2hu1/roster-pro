"use client"
import { Logo } from "@/components/logo"
import { authClient } from "@/lib/better-auth/client"
import { IconBrandGoogleFilled } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import { Loader } from "@workspace/ui/components/loader"
import { useState } from "react"

export default function LoginPageView() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/`,
    })
  }

  return (
    <div className="flex px-6 items-center justify-center min-h-dvh">
      <div className="w-full max-w-xs px-6">
        <Button
          disabled={loading}
          onClick={handleLogin}
          variant="secondary"
          className="w-full bg-foreground! text-background! hover:bg-foreground/80! rounded-xl"
          size="lg"
        >
          Continue with google
          {loading ? <Loader /> : <IconBrandGoogleFilled />}
        </Button>
      </div>
    </div>
  )
}
