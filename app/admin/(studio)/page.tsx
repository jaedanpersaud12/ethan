import type { Metadata } from "next"
import { listWorks } from "@/lib/catalog"
import { Board } from "./board"

export const metadata: Metadata = { title: { absolute: "Studio — Ethanol" } }

export default async function Studio() {
    return <Board works={await listWorks()} />
}
