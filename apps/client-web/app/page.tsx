"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import {
  useQrSession,
  useCreateQrSession,
  qrTokenStorage,
} from "@/hooks/use-qr-session"
import Preloader from "@/components/preloader"
import { Camera, CameraOff } from "reicon-react"
import { Logo } from "@/components/roster-logo"

type ScanState =
  | "idle"
  | "starting"
  | "scanning"
  | "denied"
  | "issuing"
  | "error"

// Accepts full QR URL content (https://host/{token}) or a bare token.
function parseTokenFromQrContent(content: string): string | null {
  const trimmed = content.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    const segment = url.pathname.split("/").filter(Boolean).pop()
    return segment ?? null
  } catch {
    // not a URL — treat as a raw token if it looks like one
    return /^[A-Za-z0-9_-]{20,}$/.test(trimmed) ? trimmed : null
  }
}

export default function ScannerPage() {
  const router = useRouter()
  const { data: session, isPending: sessionPending } = useQrSession()
  const { mutate: createSession } = useCreateQrSession()

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const handledRef = useRef(false)

  const [state, setState] = useState<ScanState>("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [pendingToken, setPendingToken] = useState<string | null>(null)

  // Valid session → straight to the menu, no re-scan friction mid-meal.
  useEffect(() => {
    if (sessionPending || !session) return
    const routeToken =
      qrTokenStorage.getRouteToken() ?? qrTokenStorage.getPendingToken()
    if (routeToken) {
      router.replace(`/${routeToken}`)
    }
  }, [session, sessionPending, router])

  useEffect(() => {
    setPendingToken(qrTokenStorage.getPendingToken())
  }, [])

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const issueSession = useCallback(
    (token: string) => {
      if (handledRef.current) return
      handledRef.current = true
      stopCamera()
      setState("issuing")
      setErrorMsg(null)

      createSession(token, {
        onSuccess: () => {
          qrTokenStorage.setRouteToken(token)
          qrTokenStorage.clearPendingToken()
          router.replace(`/${token}`)
        },
        onError: (err) => {
          handledRef.current = false
          setState("error")
          setErrorMsg(
            err instanceof Error ? err.message : "Failed to start session"
          )
        },
      })
    },
    [createSession, router, stopCamera]
  )

  const startScanner = useCallback(async () => {
    setState("starting")
    setErrorMsg(null)
    handledRef.current = false

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
    } catch {
      setState("denied")
      return
    }

    streamRef.current = stream
    const video = videoRef.current
    if (!video) {
      stopCamera()
      return
    }
    video.srcObject = stream
    await video.play().catch(() => {})
    setState("scanning")

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d", { willReadFrequently: true })

    const BarcodeDetectorCtor = (
      window as unknown as {
        BarcodeDetector?: new (opts: {
          formats: string[]
        }) => {
          detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]>
        }
      }
    ).BarcodeDetector
    const detector = BarcodeDetectorCtor
      ? new BarcodeDetectorCtor({ formats: ["qr_code"] })
      : null

    let jsqr: typeof import("jsqr").default | null = null
    if (!detector) {
      jsqr = (await import("jsqr")).default
    }

    const scanFrame = async () => {
      if (handledRef.current || !streamRef.current) return
      const v = videoRef.current
      if (v && v.readyState >= 2) {
        let raw: string | null = null
        if (detector) {
          try {
            const codes = await detector.detect(v)
            raw = codes[0]?.rawValue ?? null
          } catch {
            /* frame not ready */
          }
        } else if (jsqr && ctx) {
          canvas.width = v.videoWidth
          canvas.height = v.videoHeight
          ctx.drawImage(v, 0, 0)
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
          raw = jsqr(img.data, img.width, img.height)?.data ?? null
        }

        if (raw) {
          const token = parseTokenFromQrContent(raw)
          if (token) {
            issueSession(token)
            return
          }
        }
      }
      rafRef.current = requestAnimationFrame(() => void scanFrame())
    }

    rafRef.current = requestAnimationFrame(() => void scanFrame())
  }, [issueSession, stopCamera])

  useEffect(() => stopCamera, [stopCamera])

  if (sessionPending) return <Preloader />

  return (
    <main className="min-h-svh flex flex-col items-center justify-center gap-8 px-6 text-center bg-gradient-to-b from-background to-muted/40">
      <div className="space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">
          Scan the table qr
        </h1>
        <p className="text-sm text-muted-foreground max-w-[22rem] leading-relaxed">
          Point your camera at the QR code on your table to view the menu and
          start ordering.
        </p>
      </div>

      <div className="w-full bg-secondary p-2 max-w-sm mx-auto flex flex-col justify-center items-center rounded-xl">
        <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-neutral-950">
          <video
            ref={videoRef}
            className="h-full w-full object-cover opacity-90"
            muted
            playsInline
          />
          {state === "scanning" && (
            <div className="pointer-events-none absolute inset-6">
              {[
                "top-4 left-4 border-t-2 border-l-2 rounded-tl-xl",
                "top-4 right-4 border-t-2 border-r-2 rounded-tr-xl",
                "bottom-4 left-4 border-b-2 border-l-2 rounded-bl-xl",
                "bottom-4 right-4 border-b-2 border-r-2 rounded-br-xl",
              ].map((pos, i) => (
                <span
                  key={i}
                  className={`absolute h-8 w-8 border-primary ${pos}`}
                />
              ))}
              <div className="absolute inset-x-4 top-1/2 h-px bg-primary shadow-[0_0_12px_2px_rgba(251,191,36,0.6)] animate-pulse" />
            </div>
          )}
          {(state === "idle" || state === "error" || state === "denied") && (
            <div className="absolute inset-0 grid place-content-center bg-neutral-950/85 p-8 backdrop-blur-sm">
              {state === "denied" ? (
                <p className="text-sm text-neutral-300 leading-relaxed max-w-[16rem]">
                  Camera access was denied. Allow camera permission in your
                  browser settings, or open the table QR with your phone&apos;s
                  camera app and tap the link.
                </p>
              ) : (
                <p className="text-sm text-neutral-300">
                  {errorMsg ?? "Camera is off"}
                </p>
              )}
            </div>
          )}
          {state === "issuing" && (
            <div className="absolute inset-0 grid place-content-center gap-2 bg-neutral-950/85 backdrop-blur-sm">
              <div className="mx-auto size-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <p className="text-sm text-neutral-300">Starting session...</p>
            </div>
          )}
        </div>

        <div className="w-full grid border-0! mt-2">
          {state === "scanning" || state === "starting" ? (
            <Button
              size="lg"
              className="h-10 w-full"
              onClick={() => {
                stopCamera()
                setState("idle")
              }}
            >
              Stop camera
              <CameraOff />
            </Button>
          ) : state !== "issuing" ? (
            <Button
              size="lg"
              className="h-10 w-full"
              onClick={() => void startScanner()}
            >
              {state === "error" || state === "denied"
                ? "Try again"
                : "Open camera"}
              <Camera />
            </Button>
          ) : null}
        </div>
      </div>
    </main>
  )
}
