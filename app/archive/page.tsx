import type { Metadata } from "next"
import { ArchiveSphere } from "@/components/sections/archive-sphere"

export const metadata: Metadata = { title: "Archive — Ethanol" }

export default function ArchivePage() {
    return <ArchiveSphere />
}
