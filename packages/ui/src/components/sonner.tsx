"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ theme = "light", ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group z-9999!"
      toastOptions={{
        classNames: {
          toast:
            "p-3! rounded-xl! px-4! group toast group-[.toaster]:bg-foreground! group-[.toaster]:text-background! group-[.toaster]:border-0! group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          icon: "size-4! mr-2!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
