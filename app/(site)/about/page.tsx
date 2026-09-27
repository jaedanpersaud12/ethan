import type { Metadata } from "next"
import { About } from "@/components/sections/about"
import { Footer } from "@/components/sections/footer"
import { PERSON, absolute, breadcrumbs, jsonLd } from "@/lib/seo"

export const metadata: Metadata = {
    title: "About — Designer & Photographer, Trinidad",
    description: `About ${PERSON}: a Trinidadian graphic designer, UI/UX designer and photographer in Port of Spain. Experience with Zed Labs, Wam and independent clients; photography studies at UWI Open Campus.`,
    alternates: { canonical: "/about" },
    openGraph: { url: "/about" },
}

const profile = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absolute("/about"),
    name: `About ${PERSON}`,
    mainEntity: { "@id": absolute("/#person") },
    breadcrumb: breadcrumbs([["Home", "/"], ["About", "/about"]]),
}

export default function AboutPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(profile)} />
            <About />
            <Footer />
        </>
    )
}
