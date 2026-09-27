import { Footer } from "@/components/sections/footer"
import { Hero } from "@/components/sections/hero"
import { IndexList } from "@/components/sections/index-list"
import { Statement } from "@/components/sections/statement"
import { Swarm } from "@/components/sections/swarm"
import { Tobago } from "@/components/sections/tobago"
import { publicWorks } from "@/lib/catalog"
import { galleryJsonLd, jsonLd } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = { alternates: { canonical: "/" } }

export default async function Home() {
    const works = await publicWorks()
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(galleryJsonLd(works.all, "/", "Selected work"))} />
            <Hero />
            <Statement />
            <IndexList works={works.index} />
            <Swarm />
            <Tobago works={works.tobago} />
            <Footer pixels={false} />
        </>
    )
}
