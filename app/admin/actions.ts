"use server"

import { del } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql, type WorkRow } from "@/lib/catalog"
import { passwordMatches, SESSION_COOKIE, SESSION_TTL, signSession } from "@/lib/session"
import type { Collection } from "@/lib/works"
import { isAdmin } from "./guard"

/** `field` names the input an error belongs to, so the editor can mark and focus it. */
export type Result = { ok: true; id?: string } | { ok: false; error: string; field?: keyof WorkInput }

/* ------------------------------------------------------------------ auth --- */

export async function signIn(_: unknown, form: FormData): Promise<{ error: string | null }> {
    const password = String(form.get("password") ?? "")
    if (!(await passwordMatches(password))) {
        // A beat on failure makes guessing slow without bothering the owner.
        await new Promise((r) => setTimeout(r, 600))
        return { error: "Incorrect password. Check it and try again." }
    }
    ;(await cookies()).set(SESSION_COOKIE, await signSession(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_TTL,
    })
    const next = String(form.get("next") ?? "")
    redirect(next.startsWith("/admin") ? next : "/admin")
}

export async function signOut() {
    ;(await cookies()).delete(SESSION_COOKIE)
    redirect("/admin/login")
}

/* ----------------------------------------------------------------- works --- */

export type WorkInput = {
    id?: string
    title: string
    kind: string
    year: number
    tone: string
    image_url: string
    collection: Collection
    published: boolean
    price: number | null
    sold: boolean
    notes: string
}

const refresh = () => {
    // The site's pages are static between edits; this is the edit.
    revalidatePath("/", "layout")
}

type Invalid = { error: string; field: keyof WorkInput }

function validate(input: WorkInput): Invalid | null {
    if (!input.title.trim()) return { field: "title", error: "Enter a title for the piece." }
    if (!Number.isInteger(input.year) || input.year < 1990 || input.year > 2100)
        return { field: "year", error: "Enter a four-digit year, like 2025." }
    if (!/^#[0-9a-f]{6}$/i.test(input.tone)) return { field: "tone", error: "Enter the tone as a hex colour, like #1FB58F." }
    if (input.collection !== "index" && input.collection !== "tobago") return { field: "collection", error: "Choose where the piece shows." }
    if (input.price !== null && (!Number.isInteger(input.price) || input.price < 0))
        return { field: "price", error: "Enter the price in whole dollars, or leave it empty." }
    if (input.published && !input.image_url)
        return { field: "published", error: "Add an image, or save it as a draft." }
    return null
}

const isBlob = (url: string) => /\.blob\.vercel-storage\.com\//.test(url)

async function dropBlob(url: string | undefined | null) {
    if (url && isBlob(url)) await del(url).catch(() => {})
}

export async function saveWork(input: WorkInput): Promise<Result> {
    if (!(await isAdmin())) return { ok: false, error: "Your session ended. Reload the page and sign in again." }
    const invalid = validate(input)
    if (invalid) return { ok: false, ...invalid }

    const title = input.title.trim()
    const kind = input.kind.trim()
    const notes = input.notes.trim()
    const tone = input.tone.toUpperCase()

    try {
        if (input.id) {
            const [before] = (await sql`select image_url from works where id = ${input.id}`) as Pick<WorkRow, "image_url">[]
            if (!before) return { ok: false, error: "This piece was deleted in another tab. Close this panel to continue." }
            await sql`
                update works set
                    title = ${title}, kind = ${kind}, year = ${input.year}, tone = ${tone},
                    image_url = ${input.image_url}, collection = ${input.collection},
                    published = ${input.published}, price = ${input.price}, sold = ${input.sold},
                    notes = ${notes}, updated_at = now()
                where id = ${input.id}
            `
            if (before.image_url !== input.image_url) await dropBlob(before.image_url)
            refresh()
            return { ok: true, id: input.id }
        }

        // New pieces go to the top of their collection — the newest work leads.
        const [row] = (await sql`
            with shifted as (
                update works set position = position + 1 where collection = ${input.collection}
            )
            insert into works (title, kind, year, tone, image_url, collection, position, published, price, sold, notes)
            values (${title}, ${kind}, ${input.year}, ${tone}, ${input.image_url}, ${input.collection}, 0,
                    ${input.published}, ${input.price}, ${input.sold}, ${notes})
            returning id
        `) as { id: string }[]
        refresh()
        return { ok: true, id: row.id }
    } catch (err) {
        console.error("saveWork", err)
        return { ok: false, error: "Unable to save. Check your connection and try again." }
    }
}

export async function setPublished(ids: string[], published: boolean): Promise<Result> {
    if (!(await isAdmin())) return { ok: false, error: "Your session ended. Reload the page and sign in again." }
    try {
        if (published) {
            await sql`update works set published = true, updated_at = now() where id = any(${ids}) and image_url <> ''`
        } else {
            await sql`update works set published = false, updated_at = now() where id = any(${ids})`
        }
        refresh()
        return { ok: true }
    } catch (err) {
        console.error("setPublished", err)
        return { ok: false, error: "Unable to update. Check your connection and try again." }
    }
}

export async function setSold(id: string, sold: boolean): Promise<Result> {
    if (!(await isAdmin())) return { ok: false, error: "Your session ended. Reload the page and sign in again." }
    try {
        await sql`update works set sold = ${sold}, updated_at = now() where id = ${id}`
        refresh()
        return { ok: true }
    } catch (err) {
        console.error("setSold", err)
        return { ok: false, error: "Unable to update. Check your connection and try again." }
    }
}

export async function deleteWorks(ids: string[]): Promise<Result> {
    if (!(await isAdmin())) return { ok: false, error: "Your session ended. Reload the page and sign in again." }
    try {
        const rows = (await sql`delete from works where id = any(${ids}) returning image_url`) as Pick<WorkRow, "image_url">[]
        await Promise.all(rows.map((r) => dropBlob(r.image_url)))
        refresh()
        return { ok: true }
    } catch (err) {
        console.error("deleteWorks", err)
        return { ok: false, error: "Unable to delete. Check your connection and try again." }
    }
}

/** Writes a collection's order as given. Ids not in the list keep theirs. */
export async function reorderWorks(ids: string[]): Promise<Result> {
    if (!(await isAdmin())) return { ok: false, error: "Your session ended. Reload the page and sign in again." }
    try {
        await sql`
            update works set position = ord.i - 1
            from unnest(${ids}::text[]) with ordinality as ord(id, i)
            where works.id = ord.id
        `
        refresh()
        return { ok: true }
    } catch (err) {
        console.error("reorderWorks", err)
        return { ok: false, error: "Unable to save the new order. Check your connection and try again." }
    }
}

/** Discards an upload that never made it onto a saved piece. */
export async function discardUpload(url: string) {
    if (!(await isAdmin())) return
    const [used] = (await sql`select 1 from works where image_url = ${url}`) as unknown[]
    if (!used) await dropBlob(url)
}
