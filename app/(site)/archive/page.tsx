import type { Metadata } from "next"
import { ArchiveGrid } from "@/components/sections/archive-grid"
import { Footer } from "@/components/sections/footer"
import { publicWorks } from "@/lib/catalog"
import { PERSON, breadcrumbs, galleryJsonLd, jsonLd } from "@/lib/seo"

export const metadata: Metadata = {
    title: "Archive — Posters, Cover Art & Photography",
    description: `Every piece by ${PERSON}: posters, album cover art, typography, graphic design and photography from Trinidad and Tobago, with original prints for sale in TT$.`,
    alternates: { canonical: "/archive" },
    openGraph: { url: "/archive" },
}

export default async function ArchivePage() {
    const { all } = await publicWorks()
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={jsonLd({
                    ...galleryJsonLd(all, "/archive", "Archive"),
                    breadcrumb: breadcrumbs([["Home", "/"], ["Archive", "/archive"]]),
                })}
            />
            <ArchiveGrid works={all} />
            <Footer />
        </>
    )
}
