"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const lastVisited = localStorage.getItem("last-visited");
    if (lastVisited) {
      router.push(`/${lastVisited}`);
    } else {
      router.push(`${process.env.NEXT_PUBLIC_MARKETING_URL}/?utm_source=partner`);
    }
  }, [router]);

  return null;
}
