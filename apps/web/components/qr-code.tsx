"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import QRCodeStyling from "qr-code-styling";

type FileExtension = "svg" | "png" | "jpeg" | "webp"

export interface QRHandle {
  download: (options?: { extension?: FileExtension; name?: string }) => void
}

const QR = forwardRef<QRHandle, { token: string; className?: string }>(
  ({ token, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const qrRef = useRef<QRCodeStyling | null>(null);

    useImperativeHandle(ref, () => ({
      download(options?: { extension?: FileExtension; name?: string }) {
        qrRef.current?.download(options as Record<string, unknown>)
      },
    }))

    useEffect(() => {
      const qr = new QRCodeStyling({
        width: 320,
        height: 320,
        data: `${process.env.NEXT_PUBLIC_CLIENT_WEB_URL}/${token}`,
        image: "/assets/roster-pro-logo.jpeg",
        shape: "square",
        dotsOptions: {
          type: "dots",
          color: "#d99007",
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 0,
          imageSize: 0.3,
        },
        margin: 0,
      })

      qrRef.current = qr

      if (containerRef.current) {
        containerRef.current.innerHTML = ""
        qr.append(containerRef.current)
      }
    }, [token])

    return <div ref={containerRef} className={className} />
  },
)

QR.displayName = "QR"

export default QR
