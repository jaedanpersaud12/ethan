import type { Metadata } from "next"
import { Instrument_Serif, JetBrains_Mono } from "next/font/google"
import localFont from "next/font/local"
import { Cursor } from "@/components/custom/cursor"
import { Nav } from "@/components/custom/nav"
import { PixelTransition } from "@/components/custom/pixel-transition"
import { SmoothScroll } from "@/components/smooth-scroll/smooth-scroll"
import { WebglProvider } from "@/components/webgl-provider/webgl-provider"
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

export const metadata: Metadata = {
    title: "Ethanol — Ethan Z. Lalla, graphic artist",
    description: "Posters, cover art, type studies and photography by Ethan Z. Lalla. Trinidad & Tobago.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" className={`${monument.variable} ${mono.variable} ${serif.variable} antialiased`}>
            <body className="grain">
                <SmoothScroll options={{ lerp: 0.09 }}>
                    <WebglProvider>
                        <PixelTransition>
                            <Nav />
                            <main>{children}</main>
                        </PixelTransition>
                    </WebglProvider>
                </SmoothScroll>
                <Cursor />
            </body>
        </html>
    )
}
