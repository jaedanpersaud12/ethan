import type { Metadata } from "next"
import { ArchiveGrid } from "@/components/sections/archive-grid"
import { Footer } from "@/components/sections/footer"
import { publicWorks } from "@/lib/catalog"

export const metadata: Metadata = { title: "Archive — Ethanol" }

export default async function ArchivePage() {
    const { all } = await publicWorks()
    return (
        <>
            <ArchiveGrid works={all} />
            <Footer />
        </>
    )
}
