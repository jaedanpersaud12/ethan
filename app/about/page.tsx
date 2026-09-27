import type { Metadata } from "next"
import { About } from "@/components/sections/about"
import { Footer } from "@/components/sections/footer"

export const metadata: Metadata = { title: "About — Ethanol" }

export default function AboutPage() {
    return (
        <>
            <About />
            <Footer />
        </>
    )
}
