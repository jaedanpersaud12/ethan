import "server-only"

import { neon } from "@neondatabase/serverless"
import type { Collection, Work } from "@/lib/works"

export const sql = neon(process.env.DATABASE_URL!)

/** A row as the admin sees it — everything, drafts included. */
export type WorkRow = {
    id: string
    title: string
    kind: string
    year: number
    tone: string
    image_url: string
    collection: Collection
    position: number
    published: boolean
    price: number | null
    sold: boolean
    notes: string
    created_at: string
    updated_at: string
}

export async function listWorks(): Promise<WorkRow[]> {
    return (await sql`
        select id, title, kind, year, tone, image_url, collection, position, published, price, sold, notes,
               created_at::text as created_at, updated_at::text as updated_at
        from works order by collection, position, works.created_at
    `) as WorkRow[]
}

export function toWork(row: WorkRow): Work {
    return {
        id: row.id,
        title: row.title,
        kind: row.kind,
        year: String(row.year),
        src: row.image_url,
        tone: row.tone,
        collection: row.collection,
        price: row.price,
        sold: row.sold,
    }
}

/** What the public site shows: published pieces with an image, in order. */
export async function publicWorks() {
    const rows = (await sql`
        select id, title, kind, year, tone, image_url, collection, position, published, price, sold, notes,
               created_at::text as created_at, updated_at::text as updated_at
        from works
        where published and image_url <> ''
        order by collection, position, works.created_at
    `) as WorkRow[]
    const works = rows.map(toWork)
    return {
        index: works.filter((w) => w.collection === "index"),
        tobago: works.filter((w) => w.collection === "tobago"),
        all: works,
    }
}
