"use client"

import { forwardRef, useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "@workspace/ui/components/button"
import { Cart } from "reicon-react"

export const RippleButton = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => {
  const [ripples, setRipples] = useState<number[]>([])

  useEffect(() => {
    let id = 0

    const interval = setInterval(() => {
      id++
      setRipples((prev) => [...prev, id])
    }, 700)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-7 right-7 z-50 h-13 w-13">
      <AnimatePresence>
        {ripples.map((id) => (
          <motion.span
            key={id}
            className="pointer-events-none absolute inset-0 rounded-full bg-primary"
            initial={{ scale: 1, opacity: 0.35 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            onAnimationComplete={() =>
              setRipples((prev) => prev.filter((x) => x !== id))
            }
          />
        ))}
      </AnimatePresence>

      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Button
          ref={ref}
          {...props}
          size="icon-lg"
          className={`relative size-13 rounded-full! border-none! shadow-lg ${className ?? ""}`}
        >
          <Cart weight="Filled" className="size-6" />
        </Button>
      </motion.div>
    </div>
  )
})

RippleButton.displayName = "RippleButton"
