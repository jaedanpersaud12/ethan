import type { Metadata, Viewport } from "next"
import { Instrument_Serif, JetBrains_Mono } from "next/font/google"
import localFont from "next/font/local"
import { PAPER } from "@/lib/palette"
import { DESCRIPTION, KEYWORDS, PERSON, SITE_NAME, SITE_URL, TAGLINE, jsonLd, siteJsonLd } from "@/lib/seo"
import "./globals.css"

const monument = localFont({
    src: [
        { path: "./fonts/MonumentExtended-Regular.woff2", weight: "400" },
        { path: "./fonts/MonumentExtended-Ultrabold.woff2", weight: "800" },
    ],
    variable: "--font-monument",
    display: "swap",
})
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb", weight: ["400", "500"] })
const serif = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument", weight: "400", style: ["normal", "italic"] })

// app/opengraph-image.tsx supplies the share image; these make WhatsApp, iMessage and X show it large.
const title = `${PERSON} — ${TAGLINE}`

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${PERSON}` },
    description: DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: KEYWORDS,
    authors: [{ name: PERSON, url: SITE_URL }],
    creator: PERSON,
    publisher: PERSON,
    category: "design",
    alternates: { canonical: "/" },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    openGraph: { type: "profile", siteName: SITE_NAME, title, description: DESCRIPTION, locale: "en_TT", url: "/", firstName: "Ethan", lastName: "Lalla", username: "ethan.z.lalla" },
    twitter: { card: "summary_large_image", title, description: DESCRIPTION },
    formatDetection: { telephone: false, email: false, address: false },
    // Regional signals for local search in Trinidad and Tobago.
    other: {
        "geo.region": "TT-POS",
        "geo.placename": "Port of Spain, Trinidad and Tobago",
        "geo.position": "10.6596;-61.5086",
        ICBM: "10.6596, -61.5086",
    },
}

export const viewport: Viewport = { themeColor: PAPER }

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en-TT" className={`${monument.variable} ${mono.variable} ${serif.variable} antialiased`}>
            <body>
                <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(siteJsonLd())} />
                {children}
            </body>
        </html>
    )
}
