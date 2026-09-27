import type { Metadata } from "next"
import { Instrument_Serif, JetBrains_Mono } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"

const monument = localFont({
    src: [
        { path: "./fonts/MonumentExtended-Regular.otf", weight: "400" },
        { path: "./fonts/MonumentExtended-Ultrabold.otf", weight: "800" },
    ],
    variable: "--font-monument",
    display: "swap",
})
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb", weight: ["400", "500"] })
const serif = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument", weight: "400", style: ["normal", "italic"] })

const site =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")

const description = "Posters, cover art, type studies and photography by Ethan Z. Lalla. Trinidad & Tobago."

// app/opengraph-image.tsx supplies the share image; these make WhatsApp, iMessage and X show it large.
export const metadata: Metadata = {
    metadataBase: new URL(site),
    title: "Ethanol — Ethan Z. Lalla, graphic artist",
    description,
    openGraph: { type: "website", siteName: "Ethanol", title: "Ethanol — Ethan Z. Lalla, graphic artist", description, locale: "en_TT" },
    twitter: { card: "summary_large_image", title: "Ethanol — Ethan Z. Lalla, graphic artist", description },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" className={`${monument.variable} ${mono.variable} ${serif.variable} antialiased`}>
            <body>{children}</body>
        </html>
    )
}
