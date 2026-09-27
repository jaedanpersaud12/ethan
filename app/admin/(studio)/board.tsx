"use client"

import { AnimatePresence, motion, MotionConfig } from "motion/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from "react"
import { reorderWorks, setPublished, signOut } from "@/app/admin/actions"
import type { WorkRow } from "@/lib/catalog"
import { formatTTD, type Collection } from "@/lib/works"
import { Editor } from "./editor"

type Filter = "all" | "live" | "draft" | "forsale" | "sold"
const FILTERS: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "live", label: "Live" },
    { value: "draft", label: "Drafts" },
    { value: "forsale", label: "For sale" },
    { value: "sold", label: "Sold" },
]

type Patch = { id: string; changes: Partial<WorkRow> } | { order: string[] }
type Editing = { work: WorkRow | null; file?: File; key: string }

const matches = (w: WorkRow, f: Filter) =>
    f === "live" ? w.published : f === "draft" ? !w.published : f === "forsale" ? w.price !== null && !w.sold : f === "sold" ? w.sold : true

/**
 * The studio: Ethan's index, editable. Drag tiles to reorder what the site
 * shows, drop an image anywhere to start a new piece, click one to edit it.
 */
export function Board({ works }: { works: WorkRow[] }) {
    const router = useRouter()
    const params = useSearchParams()
    const [, start] = useTransition()

    const [rows, patch] = useOptimistic(works, (state: WorkRow[], p: Patch) => {
        if ("order" in p) {
            const at = new Map(p.order.map((id, i) => [id, i]))
            return state.map((w) => (at.has(w.id) ? { ...w, position: at.get(w.id)! } : w))
        }
        return state.map((w) => (w.id === p.id ? { ...w, ...p.changes } : w))
    })

    const [collection, setCollection] = useState<Collection>((params.get("c") as Collection) === "tobago" ? "tobago" : "index")
    const [filter, setFilter] = useState<Filter>("all")
    const [editing, setEditing] = useState<Editing | null>(null)
    const [dropping, setDropping] = useState(false)
    const [error, setError] = useState<string | null>(null)
    // One stable polite region for moves and publishes, so each is announced.
    const [announcement, setAnnouncement] = useState("")

    const inCollection = useMemo(
        () => rows.filter((w) => w.collection === collection).sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at)),
        [rows, collection],
    )
    const shown = inCollection.filter((w) => matches(w, filter))
    const canArrange = filter === "all"

    /* -------------------------------------------------------- reordering --- */
    const [dragId, setDragId] = useState<string | null>(null)
    const [preview, setPreview] = useState<string[] | null>(null)
    const ordered = preview ? preview.map((id) => inCollection.find((w) => w.id === id)!).filter(Boolean) : shown

    const dragOver = (overId: string) => {
        if (!dragId || !preview || dragId === overId) return
        const next = preview.filter((id) => id !== dragId)
        next.splice(next.indexOf(overId), 0, dragId)
        if (next.join() !== preview.join()) setPreview(next)
    }
    const dragEnd = () => {
        const order = preview
        const before = inCollection.map((w) => w.id).join()
        setDragId(null)
        setPreview(null)
        if (!order || order.join() === before) return
        start(async () => {
            patch({ order })
            const result = await reorderWorks(order)
            if (!result.ok) setError(result.error)
            router.refresh()
        })
    }
    // Keyboard: focus a tile, [ and ] move it.
    const nudge = (id: string, by: -1 | 1) => {
        const order = inCollection.map((w) => w.id)
        const i = order.indexOf(id)
        const j = i + by
        if (!canArrange || j < 0 || j >= order.length) return
        ;[order[i], order[j]] = [order[j], order[i]]
        const title = inCollection[i].title
        setAnnouncement(`${title} moved to ${j + 1} of ${order.length}`)
        start(async () => {
            patch({ order })
            const result = await reorderWorks(order)
            if (!result.ok) setError(result.error)
            router.refresh()
        })
    }

    const toggleLive = (w: WorkRow) => {
        if (!w.published && !w.image_url) return setError(`Add an image to “${w.title}” before publishing it.`)
        setAnnouncement(w.published ? `${w.title} hidden from the site` : `${w.title} published to the site`)
        start(async () => {
            patch({ id: w.id, changes: { published: !w.published } })
            const result = await setPublished([w.id], !w.published)
            if (!result.ok) setError(result.error)
            router.refresh()
        })
    }

    const open = (work: WorkRow | null, file?: File) => setEditing({ work, file, key: work?.id ?? `new-${Date.now()}` })

    /* ------------------------------------------- drop a file anywhere --- */
    const depth = useRef(0)
    useEffect(() => {
        const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes("Files")
        const enter = (e: DragEvent) => {
            if (!hasFiles(e) || editing) return
            depth.current++
            setDropping(true)
        }
        const leave = (e: DragEvent) => {
            if (!hasFiles(e)) return
            depth.current = Math.max(0, depth.current - 1)
            if (depth.current === 0) setDropping(false)
        }
        const over = (e: DragEvent) => hasFiles(e) && e.preventDefault()
        const drop = (e: DragEvent) => {
            if (!hasFiles(e)) return
            e.preventDefault()
            depth.current = 0
            setDropping(false)
            const file = e.dataTransfer?.files[0]
            if (file && !editing) open(null, file)
        }
        const key = (e: KeyboardEvent) => {
            const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select")
            if (e.key === "n" && !typing && !editing && !e.metaKey && !e.ctrlKey) {
                e.preventDefault()
                open(null)
            }
        }
        window.addEventListener("dragenter", enter)
        window.addEventListener("dragleave", leave)
        window.addEventListener("dragover", over)
        window.addEventListener("drop", drop)
        window.addEventListener("keydown", key)
        return () => {
            window.removeEventListener("dragenter", enter)
            window.removeEventListener("dragleave", leave)
            window.removeEventListener("dragover", over)
            window.removeEventListener("drop", drop)
            window.removeEventListener("keydown", key)
        }
    }, [editing])

    // ?edit=<id> deep-links straight into a piece.
    const deepLinked = useRef(false)
    useEffect(() => {
        if (deepLinked.current) return
        deepLinked.current = true
        const id = params.get("edit")
        const work = id ? works.find((w) => w.id === id) : undefined
        if (work) Promise.resolve().then(() => setEditing({ work, key: work.id }))
    }, [params, works])

    /* -------------------------------------------------------------- figures --- */
    const live = rows.filter((w) => w.published).length
    const forSale = rows.filter((w) => w.price !== null && !w.sold)
    const sold = rows.filter((w) => w.sold)
    const kinds = useMemo(() => [...new Set(rows.map((w) => w.kind).filter(Boolean))].sort(), [rows])
    const count = (c: Collection) => rows.filter((w) => w.collection === c).length

    return (
        // Under reduced motion, motion swaps slides and springs for fades.
        <MotionConfig reducedMotion="user">
        <div className="studio grain min-h-dvh bg-paper text-ink">
            {/* ---- top bar: the site's nav chips, with the studio's verbs ---- */}
            <header inert={Boolean(editing)} className="label sticky top-0 z-30 flex items-start justify-between gap-3 p-3 whitespace-nowrap md:p-5">
                <div className="flex items-center gap-3 rounded-full bg-ink py-2 ps-2 pe-4 text-paper">
                    <img src="/logo.png" alt="" className="h-7 w-auto" />
                    <span>
                        Ethanol <span className="hidden text-lime sm:inline">/ Studio</span>
                    </span>
                </div>
                <div className="on-ink flex gap-1 rounded-full bg-ink p-1 text-paper">
                    <button type="button" onClick={() => open(null)} className="uppercase min-h-9 rounded-full bg-lime px-4 text-ink transition-[background-color,scale] duration-150 hover:bg-paper active:scale-[0.96]">
                        + New<span className="hidden sm:inline"> piece</span>
                    </button>
                    <a href="/" target="_blank" className="hidden min-h-9 items-center rounded-full px-4 transition-colors hover:bg-paper/15 sm:inline-flex">
                        View site <span aria-hidden>↗</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    <form action={signOut}>
                        <button type="submit" className="uppercase min-h-9 rounded-full px-4 transition-[background-color,scale] duration-150 hover:bg-paper/15 active:scale-[0.96]">
                            Sign out
                        </button>
                    </form>
                </div>
            </header>

            <main inert={Boolean(editing)} className="px-4 pt-10 pb-32 md:px-6 md:pt-16">
                {/* ---- the heading, in the index's own voice ---- */}
                <header className="mb-8 grid grid-cols-12 items-end gap-4 border-b border-ink pb-4">
                    <div className="label col-span-12 space-y-1 md:col-span-3">
                        <p>(Studio) — {rows.length} pieces</p>
                        <p className="opacity-60">
                            {live} live · {rows.length - live} draft{rows.length - live === 1 ? "" : "s"}
                        </p>
                        <p className="opacity-60">
                            {forSale.length} for sale{forSale.length ? `, ${formatTTD(sum(forSale))}` : ""}
                            {sold.length ? ` · ${sold.length} sold` : ""}
                        </p>
                    </div>
                    <h1 className="col-span-12 text-[13vw] leading-[0.9] text-balance md:col-span-9 md:text-[7vw]">
                        <span className="display">{collection === "index" ? "Index" : "Tobago"}</span>
                        <span className="font-serif italic">, {collection === "index" ? "editable" : "meditations"}</span>
                    </h1>
                </header>

                {/* ---- which wall, and which pieces on it ---- */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-3" role="group" aria-label="Collection">
                        {(["index", "tobago"] as const).map((c) => (
                            <button
                                key={c}
                                type="button"
                                aria-pressed={collection === c}
                                onClick={() => setCollection(c)}
                                className={`label inline-flex min-h-11 items-center gap-2 rounded-full border px-4 transition-colors ${
                                    collection === c ? "border-ink bg-ink text-lime" : "border-ink/25 hover:border-ink"
                                }`}
                            >
                                {c === "index" ? "Index" : "Tobago Meditation"}
                                <span className="tabular-nums opacity-70">{count(c)}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-1" role="group" aria-label="Show">
                        {FILTERS.map((f) => {
                            const n = inCollection.filter((w) => matches(w, f.value)).length
                            return (
                                <button
                                    key={f.value}
                                    type="button"
                                    aria-pressed={filter === f.value}
                                    onClick={() => setFilter(f.value)}
                                    className={`label min-h-9 rounded-full px-3 transition-[opacity,background-color] ${
                                        filter === f.value ? "bg-ink/10" : "opacity-70 hover:opacity-100"
                                    }`}
                                >
                                    {f.label} <span className="tabular-nums">{n}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div role="alert">
                    {error && (
                        <p className="label mb-6 flex items-center justify-between gap-3 bg-pink ps-3 pe-1 py-1">
                            {error}
                            <button type="button" onClick={() => setError(null)} className="min-h-8 rounded-full px-3 hover:bg-ink/10">
                                Dismiss
                            </button>
                        </p>
                    )}
                </div>
                <span role="status" className="sr-only">
                    {announcement}
                </span>

                <p id="arrange-hint" className="label mb-4 hidden opacity-70 md:block">
                    {canArrange ? "Drag to reorder · or focus a piece and press [ or ] · drop an image anywhere to add one · N for a new piece" : "Show All to reorder"}
                </p>

                {/* ---- the wall ---- */}
                <motion.ul layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                    <AnimatePresence initial={false}>
                        {ordered.map((w) => (
                            <Tile
                                key={w.id}
                                work={w}
                                number={inCollection.findIndex((x) => x.id === w.id) + 1}
                                total={inCollection.length}
                                draggable={canArrange}
                                dragging={dragId === w.id}
                                onDragStart={() => {
                                    setDragId(w.id)
                                    setPreview(inCollection.map((x) => x.id))
                                }}
                                onDragOver={() => dragOver(w.id)}
                                onDragEnd={dragEnd}
                                onOpen={() => open(w)}
                                onToggleLive={() => toggleLive(w)}
                                onNudge={(by) => nudge(w.id, by)}
                            />
                        ))}
                        <motion.li layout key="__new">
                            <button
                                type="button"
                                onClick={() => open(null)}
                                className="group grid aspect-square w-full place-items-center border border-dashed border-ink/50 transition-colors hover:border-ink hover:bg-lime"
                            >
                                <span className="text-center">
                                    <span aria-hidden className="display block text-[40px] leading-none transition-transform duration-300 group-hover:rotate-90 motion-reduce:transition-none">+</span>
                                    <span className="label mt-3 block">New piece</span>
                                </span>
                            </button>
                        </motion.li>
                    </AnimatePresence>
                </motion.ul>

                {shown.length === 0 && filter !== "all" && (
                    <p className="label mt-8 flex flex-wrap items-center gap-3">
                        <span className="opacity-70">
                            No {FILTERS.find((f) => f.value === filter)?.label.toLowerCase()} pieces in {collection === "index" ? "the Index" : "Tobago"}.
                        </span>
                        <button type="button" onClick={() => setFilter("all")} className="min-h-9 rounded-full border border-ink px-3 hover:bg-ink hover:text-paper">
                            Show all
                        </button>
                    </p>
                )}
            </main>

            {/* ---- drop anywhere ---- */}
            <AnimatePresence>
                {dropping && (
                    <motion.div
                        className="pointer-events-none fixed inset-0 z-[60] grid place-items-center bg-lime"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className="text-center">
                            <p className="display text-[12vw] leading-[0.9]">Drop it</p>
                            <p className="mt-4 font-serif text-[4vw] italic">
                                — a new piece for {collection === "index" ? "the Index" : "Tobago"}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editing && (
                    <Editor
                        key={editing.key}
                        work={editing.work}
                        file={editing.file}
                        collection={collection}
                        number={
                            editing.work
                                ? `${String(inCollection.findIndex((x) => x.id === editing.work!.id) + 1).padStart(2, "0")} / ${String(inCollection.length).padStart(2, "0")}`
                                : undefined
                        }
                        kinds={kinds}
                        onClose={() => setEditing(null)}
                    />
                )}
            </AnimatePresence>
        </div>
        </MotionConfig>
    )
}

function Tile({
    work,
    number,
    total,
    draggable,
    dragging,
    onDragStart,
    onDragOver,
    onDragEnd,
    onOpen,
    onToggleLive,
    onNudge,
}: {
    work: WorkRow
    number: number
    total: number
    draggable: boolean
    dragging: boolean
    onDragStart: () => void
    onDragOver: () => void
    onDragEnd: () => void
    onOpen: () => void
    onToggleLive: () => void
    onNudge: (by: -1 | 1) => void
}) {
    return (
        <motion.li
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: dragging ? 0.35 : 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className="@container relative"
        >
            <button
                type="button"
                draggable={draggable}
                onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move"
                    e.dataTransfer.setData("text/plain", work.id)
                    onDragStart()
                }}
                onDragOver={(e) => {
                    e.preventDefault()
                    onDragOver()
                }}
                onDrop={(e) => e.preventDefault()}
                onDragEnd={onDragEnd}
                onClick={onOpen}
                onKeyDown={(e) => {
                    if (e.key === "[") onNudge(-1)
                    if (e.key === "]") onNudge(1)
                }}
                aria-label={`Edit ${work.title}, ${number} of ${total}`}
                aria-describedby="arrange-hint"
                className={`group relative block aspect-square w-full overflow-hidden text-left ${
                    draggable ? "cursor-grab active:cursor-grabbing" : ""
                }`}
                style={{ background: work.image_url ? "rgb(12 12 11 / 0.05)" : `${work.tone}55` }}
            >
                {work.image_url ? (
                    <img
                        src={work.image_url}
                        alt=""
                        draggable={false}
                        className={`size-full object-cover outline-1 -outline-offset-1 outline-[oklch(0_0_0/0.1)] transition-[scale,filter] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
                            work.published ? "" : "grayscale opacity-60"
                        }`}
                    />
                ) : (
                    <span className="label absolute inset-0 grid place-items-center opacity-70">No image yet</span>
                )}

                <span aria-hidden className="label absolute top-2 start-2 rounded-full bg-ink px-2 py-1 text-paper tabular-nums">
                    {String(number).padStart(2, "0")}
                </span>
                {/* Under ~200px the status drops to the bottom corner so it never covers the number. */}
                <span className="absolute top-2 end-2 @max-[200px]:top-auto @max-[200px]:end-auto @max-[200px]:bottom-2 @max-[200px]:start-2">
                    <Status work={work} />
                </span>

                <span aria-hidden className="label absolute inset-x-0 bottom-0 flex translate-y-full items-baseline justify-between gap-2 bg-ink px-3 py-3 text-paper transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none">
                    <span className="truncate">Edit →</span>
                    <span className="shrink-0 opacity-60">{work.year}</span>
                </span>
            </button>

            {/* Monument regular in sentence case: still the site’s face, but readable at caption size. */}
            <div className="mt-3 flex items-start justify-between gap-3 @max-[200px]:flex-col">
                <div className="min-w-0">
                    <p className="line-clamp-2 font-display text-[17px] leading-[1.3] font-normal tracking-normal [overflow-wrap:anywhere] @max-[200px]:text-[15px]" title={work.title}>
                        {work.title}
                    </p>
                    <p className="mt-1 truncate text-[13px] leading-[1.4] tracking-normal opacity-70">
                        {work.kind || "No kind yet"} · {work.year}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onToggleLive}
                    aria-label={`${work.published ? "Hide" : "Publish"} ${work.title}`}
                    className={`label min-h-8 shrink-0 rounded-full border px-3 transition-[color,background-color,border-color,scale] duration-150 active:scale-[0.96] ${
                        work.published ? "border-ink/40 hover:border-ink" : "border-ink bg-ink text-paper hover:bg-lime hover:text-ink"
                    }`}
                >
                    {work.published ? "Hide" : "Publish"}
                </button>
            </div>
        </motion.li>
    )
}

function Status({ work }: { work: WorkRow }) {
    if (!work.published) return <span className="label rounded-full border border-ink bg-paper px-2 py-1">Draft</span>
    if (work.sold) return <span className="label rounded-full bg-ink px-2 py-1 text-paper line-through decoration-lime">Sold</span>
    if (work.price !== null) return <span className="label rounded-full bg-lime px-2 py-1 text-ink">{formatTTD(work.price)}</span>
    return null
}

const sum = (rows: WorkRow[]) => rows.reduce((t, w) => t + (w.price ?? 0), 0)

