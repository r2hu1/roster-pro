import { Geist, Geist_Mono, Instrument_Sans } from "next/font/google";

import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { Toaster } from "sonner"

const instrumentSans = Instrument_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
});

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={cn("antialiased", fontMono.variable, "font-sans", instrumentSans.variable)}>
            <body>
                <ReactQueryProvider>{children}</ReactQueryProvider>
                <Toaster />
            </body>
        </html>
    );
}
