"use client";
import { authClient } from "@/lib/better-auth/client";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { Button } from "@workspace/ui/components/button";

export default function LoginPage() {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/`,
    });
  };
  return (
    <div>
      <Button onClick={handleLogin} size="lg">
<IconBrandGoogleFilled/>
        Continue with Google
      </Button>
    </div>
  )
}
