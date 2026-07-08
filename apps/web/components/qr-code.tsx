"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

export default function QR({ token, className }: {
  token: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const qr = new QRCodeStyling({
      width: 340,
      height: 340,
      data: `${process.env.NEXT_PUBLIC_CLIENT_WEB_URL}/${token}`,
      image: "/assets/roster-pro-logo.jpeg",
      dotsOptions: {
        type: "dots",
        color:"#d99007"
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 0,
        imageSize: 0.3,
      },
    });

    if (ref.current) {
      ref.current.innerHTML = ""
      qr.append(ref.current);
    }
  }, [token]);

  return <div ref={ref} className={className} />;
}
