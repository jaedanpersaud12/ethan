"use client"

import { animate, motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect, useId, useLayoutEffect, useRef, useState, useTransition } from "react"
import { deleteWorks, discardUpload, saveWork, type WorkInput } from "@/app/admin/actions"
import { ArtworkField } from "@/components/admin/artwork-field"
import { TonePicker } from "@/components/admin/tone-picker"
import type { WorkRow } from "@/lib/catalog"
import { COLLECTIONS, type Collection } from "@/lib/works"

const SPRING = { type: "spring", stiffness: 380, damping: 38, mass: 0.8 } as const
/** 16px on phones so iOS doesn't zoom the page into a field; the site's 13px from md up. */
const FIELD = "w-full bg-transparent text-base md:text-[13px]"

const blank = (collection: Collection): WorkInput => ({
    title: "",
    kind: "",
    year: new Date().getFullYear(),
    tone: "#DCF26B",
    image_url: "",
    collection,
    published: true,
    price: null,
    sold: false,
    notes: "",
})

type SaveState = "idle" | "saving" | "saved" | "error"

/**
 * One piece, as a spec sheet. Keyed on the piece by the board, so opening
 * another never shows the last one's values. The board makes everything
 * behind it inert while it's open; focus lands here and goes back on close.
 */
export function Editor({
    work,
    file,
    collection,
    number,
    kinds,
    onClose,
}: {
    work: WorkRow | null
    /** Dropped on the board to start a new piece. */
    file?: File
    /** Where a new piece goes. */
    collection: Collection
    /** "03 / 17" for an existing piece. */
    number?: string
    kinds: string[]
    onClose: () => void
}) {
    const router = useRouter()
    const id = useId()
    const initial: WorkInput = work
        ? {
              id: work.id,
              title: work.title,
              kind: work.kind,
              year: work.year,
              tone: work.tone,
              image_url: work.image_url,
              collection: work.collection,
              published: work.published,
              price: work.price,
              sold: work.sold,
              notes: work.notes,
          }
        : blank(collection)

    const [form, setForm] = useState(initial)
    const [year, setYear] = useState(String(initial.year))
    const [price, setPrice] = useState(initial.price === null ? "" : String(initial.price))
    const [state, setState] = useState<SaveState>("idle")
    const [error, setError] = useState<{ message: string; field?: keyof WorkInput } | null>(null)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [confirmClose, setConfirmClose] = useState(false)
    const [, start] = useTransition()
    const toneTouched = useRef(Boolean(work))
    const uploads = useRef<string[]>([])
    const done = useRef(false)
    const panel = useRef<HTMLElement>(null)
    const heading = useRef<HTMLHeadingElement>(null)

    const set = <K extends keyof WorkInput>(key: K, value: WorkInput[K]) => setForm((f) => ({ ...f, [key]: value }))
    const dirty =
        JSON.stringify({ ...form, year, price }) !==
        JSON.stringify({ ...initial, year: String(initial.year), price: initial.price === null ? "" : String(initial.price) })

    // Focus moves in on open and back to whatever opened it on close.
    useEffect(() => {
        const opener = document.activeElement as HTMLElement | null
        if (!panel.current?.contains(document.activeElement)) heading.current?.focus()
        return () => opener?.focus?.()
    }, [])

    const close = () => {
        // Uploads that never made it onto a saved piece are cleaned up.
        if (!done.current) for (const url of uploads.current) if (url !== initial.image_url) discardUpload(url)
        onClose()
    }
    const requestClose = () => (dirty && !done.current ? setConfirmClose(true) : close())

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") requestClose()
            if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                save()
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    })

    function save() {
        if (state === "saving") return
        setError(null)
        setState("saving")
        const amount = price.trim() === "" ? null : Number(price.replace(/,/g, ""))
        start(async () => {
            const result = await saveWork({ ...form, year: Number(year), price: amount, sold: amount === null ? false : form.sold })
            if (!result.ok) {
                setState("error")
                setError({ message: result.error, field: result.field })
                // The first invalid field takes focus, so the fix starts where the problem is.
                if (result.field) document.getElementById(`${id}-${result.field}`)?.focus()
                return
            }
            done.current = true
            for (const url of uploads.current) if (url !== form.image_url) discardUpload(url)
            setState("saved")
            router.refresh()
            setTimeout(onClose, 500)
        })
    }

    function remove() {
        if (!work) return
        start(async () => {
            const result = await deleteWorks([work.id])
            if (!result.ok) return setError({ message: result.error })
            done.current = true
            router.refresh()
            onClose()
        })
    }

    /** Wires a field to its error: marked invalid, described by the message. */
    const invalid = (field: keyof WorkInput) =>
        error?.field === field ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {}

    const forSale = price.trim() !== ""

    return (
        <>
            <motion.div
                aria-hidden
                className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={requestClose}
            />
            <motion.aside
                ref={panel}
                role="dialog"
                aria-modal
                aria-labelledby={`${id}-heading`}
                className="fixed inset-y-0 end-0 z-50 flex w-full flex-col border-s border-ink bg-paper text-ink md:w-[600px]"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={SPRING}
            >
                <header className="flex items-center justify-between border-b border-ink ps-5 pe-3 py-2">
                    <h2 id={`${id}-heading`} ref={heading} tabIndex={-1} className="label outline-none">
                        {work ? (
                            <>
                                (Edit) — {number}
                                <span className="sr-only">: {work.title}</span>
                            </>
                        ) : (
                            "(New piece)"
                        )}
                    </h2>
                    <button type="button" onClick={requestClose} className="label min-h-10 rounded-full px-3 transition-colors hover:bg-ink/10">
                        Close <span aria-hidden>[esc]</span>
                    </button>
                </header>

                <div className="relative flex-1 overflow-y-auto overscroll-contain" data-lenis-prevent>
                    <div className="p-5">
                        <ArtworkField
                            value={form.image_url}
                            tone={form.tone}
                            initialFile={file}
                            onUploaded={(url) => {
                                uploads.current.push(url)
                                set("image_url", url)
                            }}
                            onTone={(hex) => !toneTouched.current && set("tone", hex)}
                        />
                    </div>

                    <div className="px-5">
                        <label htmlFor={`${id}-title`} className="sr-only">
                            Title
                        </label>
                        <textarea
                            id={`${id}-title`}
                            value={form.title}
                            onChange={(e) => set("title", e.target.value.replace(/\n/g, ""))}
                            placeholder="Untitled"
                            rows={1}
                            autoFocus={!work && !file}
                            {...invalid("title")}
                            className="display field-sizing-content w-full resize-none bg-transparent text-[40px] leading-[1.05] text-balance aria-invalid:underline aria-invalid:decoration-pink aria-invalid:decoration-4 md:text-[48px]"
                        />
                    </div>

                    <div className="mt-4 border-t border-ink">
                        <Row label="Kind" htmlFor={`${id}-kind`}>
                            <input
                                id={`${id}-kind`}
                                value={form.kind}
                                onChange={(e) => set("kind", e.target.value)}
                                list={`${id}-kinds`}
                                placeholder="Poster"
                                autoComplete="off"
                                className={FIELD}
                            />
                            <datalist id={`${id}-kinds`}>
                                {kinds.map((k) => (
                                    <option key={k} value={k} />
                                ))}
                            </datalist>
                        </Row>
                        <Row label="Year" htmlFor={`${id}-year`}>
                            <input
                                id={`${id}-year`}
                                value={year}
                                onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                inputMode="numeric"
                                autoComplete="off"
                                {...invalid("year")}
                                className={`${FIELD} tabular-nums`}
                            />
                        </Row>
                        <Choice
                            legend="Shows in"
                            name={`${id}-collection`}
                            value={form.collection}
                            options={COLLECTIONS.map((c) => ({ value: c.value, label: c.value === "index" ? "Index" : "Tobago" }))}
                            onChange={(v) => set("collection", v)}
                        />
                        <Row label="Tone" htmlFor={`${id}-tone`} hint="Sampled from the image. Used as the piece’s accent.">
                            <TonePicker
                                value={form.tone}
                                onChange={(hex) => {
                                    toneTouched.current = true
                                    set("tone", hex)
                                }}
                                inputId={`${id}-tone`}
                                invalid={invalid("tone")}
                            />
                        </Row>
                        <Row label="Price" htmlFor={`${id}-price`} hint="Whole Trinidad and Tobago dollars. Leave empty if it’s not for sale.">
                            <span className="flex items-baseline gap-1">
                                <span aria-hidden className="opacity-70">
                                    TT$
                                </span>
                                <input
                                    id={`${id}-price`}
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value.replace(/[^\d,]/g, ""))}
                                    inputMode="numeric"
                                    placeholder="450"
                                    autoComplete="off"
                                    {...invalid("price")}
                                    className={`${FIELD} tabular-nums`}
                                />
                            </span>
                        </Row>
                        {forSale && (
                            <Choice
                                legend="Availability"
                                name={`${id}-sold`}
                                value={form.sold ? "sold" : "available"}
                                options={[
                                    { value: "available", label: "Available" },
                                    { value: "sold", label: "Sold" },
                                ]}
                                onChange={(v) => set("sold", v === "sold")}
                            />
                        )}
                        <Choice
                            legend="On the site"
                            name={`${id}-published`}
                            value={form.published ? "live" : "draft"}
                            options={[
                                { value: "live", label: "Live" },
                                { value: "draft", label: "Draft" },
                            ]}
                            onChange={(v) => set("published", v === "live")}
                            hint={
                                form.published && !form.image_url
                                    ? "Add an image before this goes live, or save it as a draft."
                                    : form.published
                                      ? "Visible on the site as soon as you save."
                                      : "Only visible here."
                            }
                            warn={form.published && !form.image_url}
                        />
                        <Row label="Notes" htmlFor={`${id}-notes`} hint="Private. Never shown on the site.">
                            <textarea
                                id={`${id}-notes`}
                                value={form.notes}
                                onChange={(e) => set("notes", e.target.value)}
                                placeholder="Edition of 20, A2 riso"
                                rows={2}
                                className={`${FIELD} field-sizing-content min-h-12 resize-none`}
                            />
                        </Row>
                    </div>

                    {error && (
                        <p id={`${id}-error`} role="alert" className="label mx-5 mt-4 bg-pink px-3 py-2 text-ink">
                            {error.message}
                        </p>
                    )}
                    <div className="h-6" />
                    {/* A fade over the fold says there's more below the last visible row. */}
                    <div aria-hidden className="pointer-events-none sticky bottom-0 h-10 bg-gradient-to-b from-transparent to-paper" />
                </div>

                <footer className="border-t border-ink px-5 py-3">
                    {confirmClose ? (
                        <div className="flex flex-wrap items-center justify-between gap-3" role="alertdialog" aria-label="Discard unsaved changes?">
                            <span className="label">Discard unsaved changes?</span>
                            <span className="flex gap-3">
                                <Chip tone="paper" onClick={() => setConfirmClose(false)} autoFocus>
                                    Keep editing
                                </Chip>
                                <Chip tone="pink" onClick={close}>
                                    Discard changes
                                </Chip>
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-3">
                            {work ? (
                                confirmDelete ? (
                                    <span className="flex items-center gap-3" role="group" aria-label={`Delete ${work.title}?`}>
                                        <Chip tone="pink" onClick={remove} autoFocus>
                                            Delete permanently
                                        </Chip>
                                        <Chip tone="paper" onClick={() => setConfirmDelete(false)}>
                                            Keep it
                                        </Chip>
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDelete(true)}
                                        className="label min-h-10 rounded-full px-3 opacity-70 transition-[opacity,color,background-color] hover:bg-pink hover:opacity-100"
                                    >
                                        Delete piece
                                    </button>
                                )
                            ) : (
                                <span className="label opacity-70">
                                    <kbd>⌘S</kbd> saves
                                </span>
                            )}
                            <SaveButton state={state} onClick={save} label={work ? "Save changes" : "Add piece"} />
                        </div>
                    )}
                </footer>
            </motion.aside>
        </>
    )
}

function Row({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-12 gap-x-4 gap-y-1 border-b border-ink/15 px-5 py-3.5 transition-colors focus-within:bg-ink/[.04]">
            <label htmlFor={htmlFor} className="label col-span-4 pt-0.5 md:col-span-3">
                {label}
            </label>
            <div className="col-span-8 md:col-span-9">
                {children}
                {hint && <p className="mt-1.5 text-[12px] leading-[1.45] text-pretty opacity-70">{hint}</p>}
            </div>
        </div>
    )
}

/**
 * A choice between two or three values: native radios, so arrow keys, focus
 * and announcements come from the platform, dressed as the site's pills.
 */
function Choice<T extends string>({
    legend,
    name,
    value,
    options,
    onChange,
    hint,
    warn,
}: {
    legend: string
    name: string
    value: T
    options: { value: T; label: string }[]
    onChange: (v: T) => void
    hint?: string
    warn?: boolean
}) {
    const track = useRef<HTMLSpanElement>(null)
    const pill = useRef<HTMLSpanElement>(null)
    const placed = useRef(false)

    // Clips the pill to the chosen option: instantly on mount and resize, with the spring on a change.
    useLayoutEffect(() => {
        const t = track.current
        const p = pill.current
        if (!t || !p) return
        const place = (animated: boolean) => {
            const el = t.querySelector<HTMLElement>(`[data-value="${value}"]`)
            if (!el) return
            const bottom = t.clientHeight - el.offsetTop - el.offsetHeight
            const right = t.clientWidth - el.offsetLeft - el.offsetWidth
            const clipPath = `inset(${el.offsetTop}px ${right}px ${bottom}px ${el.offsetLeft}px round 9999px)`
            const still = !animated || matchMedia("(prefers-reduced-motion: reduce)").matches
            animate(p, { clipPath }, still ? { duration: 0 } : SPRING)
        }
        place(placed.current)
        placed.current = true
        // It fires once on observe, which would cut the spring short.
        let first = true
        const observer = new ResizeObserver(() => (first ? (first = false) : place(false)))
        observer.observe(t)
        return () => observer.disconnect()
    }, [value])

    return (
        <fieldset className="grid grid-cols-12 gap-x-4 gap-y-1 border-b border-ink/15 px-5 py-3.5">
            <legend className="sr-only">{legend}</legend>
            <span aria-hidden className="label col-span-4 pt-1.5 md:col-span-3">
                {legend}
            </span>
            <div className="col-span-8 md:col-span-9">
                <span ref={track} className="relative inline-flex gap-1 rounded-full border border-ink p-0.5">
                    {options.map((o) => (
                        <label
                            key={o.value}
                            data-value={o.value}
                            className="label min-h-8 cursor-pointer rounded-full px-3 py-1.5 transition-colors hover:bg-ink/10 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
                        >
                            <input
                                type="radio"
                                name={name}
                                value={o.value}
                                checked={o.value === value}
                                onChange={() => onChange(o.value)}
                                className="sr-only"
                            />
                            {o.label}
                        </label>
                    ))}
                    {/* The same labels in lime on ink, clipped to the chosen one. The clip slides, so text
                        is never lime on paper or ink on ink mid-move, whatever the scroll or the panel is doing. */}
                    <span ref={pill} aria-hidden className="pointer-events-none absolute inset-0 flex gap-1 rounded-full bg-ink p-0.5 text-lime">
                        {options.map((o) => (
                            <span key={o.value} className="label min-h-8 rounded-full px-3 py-1.5">
                                {o.label}
                            </span>
                        ))}
                    </span>
                </span>
                {hint && (
                    <p className={`mt-1.5 text-[12px] leading-[1.45] text-pretty ${warn ? "inline-block bg-pink px-1.5 py-0.5" : "opacity-70"}`}>{hint}</p>
                )}
            </div>
        </fieldset>
    )
}

export function Chip({
    tone = "ink",
    className = "",
    ...props
}: React.ComponentProps<"button"> & { tone?: "ink" | "lime" | "pink" | "paper" }) {
    const tones = {
        ink: "bg-ink text-paper hover:bg-ink/85",
        lime: "bg-lime text-ink hover:bg-ink hover:text-lime",
        pink: "bg-pink text-ink hover:bg-ink hover:text-pink",
        paper: "border border-ink bg-paper text-ink hover:bg-ink hover:text-paper",
    }
    return (
        <button
            type="button"
            {...props}
            className={`label inline-flex min-h-10 items-center gap-2 rounded-full px-4 transition-[color,background-color,scale] duration-150 active:scale-[0.96] disabled:opacity-40 ${tones[tone]} ${className}`}
        />
    )
}

/** Every state lives in one grid cell, so the button never changes width mid-save. */
function SaveButton({ state, onClick, label }: { state: SaveState; onClick: () => void; label: string }) {
    const layer = (on: boolean) =>
        `col-start-1 row-start-1 transition-[opacity,translate] duration-200 motion-reduce:translate-y-0 ${
            on ? "opacity-100" : "pointer-events-none translate-y-1 opacity-0"
        }`
    const text = { idle: `${label} →`, saving: "Saving", saved: "Saved ✓", error: "Try again" }
    return (
        <>
            <button
                type="button"
                onClick={onClick}
                disabled={state === "saving"}
                className={`label grid min-h-10 items-center rounded-full px-5 text-center transition-[color,background-color,scale] duration-150 active:scale-[0.96] ${
                    state === "saved" ? "bg-lime text-ink" : state === "error" ? "bg-pink text-ink" : "bg-ink text-lime hover:bg-lime hover:text-ink"
                }`}
            >
                <span className={layer(state === "idle")} aria-hidden={state !== "idle"}>
                    {text.idle}
                </span>
                <span className={layer(state === "saving")} aria-hidden={state !== "saving"}>
                    Saving<span className="blink">_</span>
                </span>
                <span className={layer(state === "saved")} aria-hidden={state !== "saved"}>
                    {text.saved}
                </span>
                <span className={layer(state === "error")} aria-hidden={state !== "error"}>
                    {text.error}
                </span>
            </button>
            {/* A stable region, so each save result is announced. */}
            <span role="status" className="sr-only">
                {state === "saved" ? "Saved" : state === "saving" ? "Saving" : ""}
            </span>
        </>
    )
}
