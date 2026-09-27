/*
 * The shape the public site renders. Rows live in Postgres (see lib/catalog.ts)
 * and are managed from /admin; this file stays client-safe.
 */
export type Collection = "index" | "tobago"

export type Work = {
    id: string
    title: string
    kind: string
    year: string
    src: string
    tone: string
    collection: Collection
    /** Whole TT dollars. Null when the piece isn't for sale. */
    price: number | null
    sold: boolean
}

export const COLLECTIONS: { value: Collection; label: string }[] = [
    { value: "index", label: "Index" },
    { value: "tobago", label: "Tobago Meditation" },
]

export function formatTTD(amount: number) {
    return `TT$${amount.toLocaleString("en-TT")}`
}
