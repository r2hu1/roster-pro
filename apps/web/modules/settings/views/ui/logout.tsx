"use client"
import { authClient } from "@/lib/better-auth/client"
import { Button } from "@workspace/ui/components/button"
import { Logout } from "reicon-react"
import { toast } from "sonner"

export default function LogoutButton({ ...props }) {
  const handleLogout = async () => {
    try {
      await authClient.signOut()
      window.location.href = "/"
    } catch {
      toast.error("Failed to logout")
    }
  }
  return (
    <Button onClick={handleLogout} {...props}>
      Logout <Logout />
    </Button>
  )
}
