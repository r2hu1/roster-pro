import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"

export const Logo = ({
  className,
  type,
  src,
}: {
  className?: string
  type?: "full" | "icon"
  src?: string
}) => {
  return (
    <Image
      src={src ?? (type === "icon" ? "/assets/roster-pro-logo.jpeg" : "/assets/roster-pro-logo-full.jpeg")}
      height={100}
      preload
      unoptimized
      width={100}
      alt="Logo"
      className={cn("h-9 w-auto mix-blend-multiply", className)}
    />
  )
}
