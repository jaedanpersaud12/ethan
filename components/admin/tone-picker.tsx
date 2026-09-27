"use client"

import { Pipette } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Tooltip, TooltipGroup } from "@/components/interior/tooltip-group"

/** The site's own colours, one tap away. */
const PALETTE = [
    { hex: "#DCF26B", name: "Lime" },
    { hex: "#FF5FAE", name: "Pink" },
    { hex: "#C9A2FF", name: "Lilac" },
    { hex: "#1FB58F", name: "Teal" },
    { hex: "#F4D35E", name: "Sun" },
    { hex: "#ECE9E1", name: "Paper" },
    { hex: "#0C0C0B", name: "Ink" },
]

type Hsv = { h: number; s: number; v: number }

const valid = (hex: string) => /^#[0-9a-f]{6}$/i.test(hex)
const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))

function toHsv(hex: string): Hsv {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    const max = Math.max(r, g, b)
    const d = max - Math.min(r, g, b)
    const h = d === 0 ? 0 : max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
    return { h: h * 60, s: max === 0 ? 0 : d / max, v: max }
}

function toHex({ h, s, v }: Hsv) {
    const f = (n: number) => {
        const k = (n + h / 60) % 6
        return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255)
    }
    return `#${[f(5), f(3), f(1)].map((c) => c.toString(16).padStart(2, "0")).join("")}`.toUpperCase()
}

/**
 * The piece's tone: a swatch that opens a picker in the studio's clothes — a
 * saturation/brightness field, a hue rail, the site's palette and, where the
 * browser has one, an eyedropper. The hex field beside it stays the source of
 * truth; the picker keeps its own hue so dragging through grey doesn't lose it.
 */
export function TonePicker({
    value,
    onChange,
    inputId,
    invalid,
}: {
    value: string
    onChange: (hex: string) => void
    inputId: string
    invalid?: Record<string, unknown>
}) {
    const id = useId()
    const [place, setPlace] = useState<Place | null>(null)
    const [hsv, setHsv] = useState<Hsv>(() => toHsv(valid(value) ? value : "#000000"))
    const [seen, setSeen] = useState(value)
    const swatch = useRef<HTMLButtonElement>(null)
    const pop = useRef<HTMLDivElement>(null)
    const reduced = useReducedMotion()
    const open = place !== null

    // Typed or sampled values flow back into the picker, without clobbering the hue at s = 0.
    if (value !== seen) {
        setSeen(value)
        if (valid(value) && value.toUpperCase() !== toHex(hsv)) {
            const next = toHsv(value)
            setHsv(next.s === 0 || next.v === 0 ? { ...next, h: hsv.h } : next)
        }
    }

    const commit = (next: Hsv) => {
        setHsv(next)
        const hex = toHex(next)
        setSeen(hex)
        onChange(hex)
    }

    const close = (refocus = false) => {
        setPlace(null)
        if (refocus) swatch.current?.focus()
    }

    // While open it follows the swatch through scrolls and resizes. Escape closes the
    // picker before it closes the editor; a press outside closes it too.
    useEffect(() => {
        if (!open) return
        const follow = () => setPlace((p) => (p ? measure(swatch.current) : p))
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return
            e.stopImmediatePropagation()
            close(true)
        }
        const onDown = (e: PointerEvent) => {
            const t = e.target as Node
            if (!pop.current?.contains(t) && !swatch.current?.contains(t)) close()
        }
        window.addEventListener("keydown", onKey, true)
        window.addEventListener("pointerdown", onDown)
        window.addEventListener("scroll", follow, true)
        window.addEventListener("resize", follow)
        return () => {
            window.removeEventListener("keydown", onKey, true)
            window.removeEventListener("pointerdown", onDown)
            window.removeEventListener("scroll", follow, true)
            window.removeEventListener("resize", follow)
        }
    }, [open])

    const shown = valid(value) ? value : toHex(hsv)
    const eyedropper = typeof window !== "undefined" && "EyeDropper" in window

    async function sample() {
        try {
            // @ts-expect-error EyeDropper isn't in the DOM lib yet.
            const { sRGBHex } = await new window.EyeDropper().open()
            if (valid(sRGBHex)) commit(toHsv(sRGBHex))
        } catch {
            // Cancelled.
        }
    }

    const lift = place?.side === "top" ? 7 : -7

    return (
        <>
            <span className="flex items-center gap-3">
                <button
                    ref={swatch}
                    type="button"
                    onClick={(e) => {
                        if (open) return close()
                        setPlace(measure(swatch.current))
                        // Opened from the keyboard, focus goes straight to the field.
                        if (e.detail === 0) requestAnimationFrame(() => pop.current?.querySelector<HTMLElement>("[role=slider]")?.focus())
                    }}
                    aria-expanded={open}
                    aria-controls={`${id}-picker`}
                    aria-label="Open the colour picker"
                    className="size-7 shrink-0 cursor-pointer rounded-full border border-ink transition-[scale] duration-150 active:scale-[0.92]"
                    style={{ background: shown }}
                />
                <input
                    id={inputId}
                    value={value}
                    onChange={(e) => {
                        const raw = e.target.value.toUpperCase()
                        onChange(raw.startsWith("#") || raw === "" ? raw : `#${raw}`)
                    }}
                    maxLength={7}
                    autoComplete="off"
                    spellCheck={false}
                    {...invalid}
                    className="w-full bg-transparent text-base uppercase tabular-nums md:text-[13px]"
                />
            </span>

            {place &&
                createPortal(
                    <AnimatePresence>
                        <motion.div
                            ref={pop}
                            id={`${id}-picker`}
                            role="group"
                            aria-label="Colour picker"
                            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: lift, filter: "blur(4px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                            transition={reduced ? { duration: 0 } : RISE}
                            className="absolute z-[60] space-y-3 rounded-2xl border border-ink bg-paper p-3 text-ink shadow-[0_12px_32px_-12px_rgba(12,12,11,0.45)]"
                            style={{
                                width: WIDTH,
                                left: place.x,
                                top: place.top,
                                bottom: place.bottom,
                                transformOrigin: `${place.origin}px ${place.side === "top" ? "100%" : "0%"}`,
                            }}
                        >
                            <Field hsv={hsv} onChange={commit} />
                            <Hue hsv={hsv} onChange={commit} />
                            <TooltipGroup className="flex flex-wrap items-center gap-1.5">
                                {PALETTE.map((c) => {
                                    const on = shown === c.hex
                                    return (
                                        <Tooltip key={c.hex} label={c.name}>
                                            <button
                                                type="button"
                                                onClick={() => commit(toHsv(c.hex))}
                                                aria-label={c.name}
                                                aria-pressed={on}
                                                className={`size-6 rounded-full border border-ink transition-[scale,box-shadow] duration-150 hover:scale-110 active:scale-95 ${
                                                    on ? "shadow-[0_0_0_2px_var(--paper),0_0_0_3px_var(--ink)]" : ""
                                                }`}
                                                style={{ background: c.hex }}
                                            />
                                        </Tooltip>
                                    )
                                })}
                                {eyedropper && (
                                    <Tooltip label="Pick from anywhere on screen">
                                        <button
                                            type="button"
                                            onClick={sample}
                                            aria-label="Sample a colour from the screen"
                                            className="ms-auto grid size-6 place-items-center rounded-full border border-ink transition-colors hover:bg-ink hover:text-paper"
                                        >
                                            <Pipette aria-hidden className="size-3.5" />
                                        </button>
                                    </Tooltip>
                                )}
                            </TooltipGroup>
                        </motion.div>
                    </AnimatePresence>,
                    place.host,
                )}
        </>
    )
}

const WIDTH = 264
/** Field + rail + swatches + padding: enough to decide which side has room. */
const HEIGHT = 250
const GAP = 8
/** interior.dev's tooltip rise, so the picker arrives the same way its labels do. */
const RISE = { type: "spring", stiffness: 560, damping: 34, mass: 0.6 } as const

type Place = { host: HTMLElement; side: "top" | "bottom"; x: number; top?: number; bottom?: number; origin: number }

/**
 * Anchors the picker to the swatch inside the dialog, which is fixed, so it
 * floats over the scrolling sheet instead of pushing it. It opens below when
 * there's room and above when there isn't.
 */
function measure(swatch: HTMLElement | null): Place | null {
    const host = swatch?.closest<HTMLElement>("[role=dialog]")
    if (!swatch || !host) return null
    const r = swatch.getBoundingClientRect()
    const b = host.getBoundingClientRect()
    const side = window.innerHeight - r.bottom >= HEIGHT + GAP * 2 || window.innerHeight - r.bottom > r.top ? "bottom" : "top"
    const x = clamp(r.left - b.left - 12, 12, b.width - WIDTH - 12)
    return {
        host,
        side,
        x,
        origin: r.left - b.left + r.width / 2 - x,
        ...(side === "bottom" ? { top: r.bottom - b.top + GAP } : { bottom: b.bottom - r.top + GAP }),
    }
}

/** Drags a pointer across an element, reporting where it is as 0–1 on each axis. */
function useDrag(onMove: (x: number, y: number) => void) {
    const ref = useRef<HTMLDivElement>(null)
    const move = (e: React.PointerEvent) => {
        const r = ref.current!.getBoundingClientRect()
        onMove(clamp((e.clientX - r.left) / r.width), clamp((e.clientY - r.top) / r.height))
    }
    return {
        ref,
        onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            e.currentTarget.focus()
            move(e)
        },
        onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => e.currentTarget.hasPointerCapture(e.pointerId) && move(e),
    }
}

/** Saturation across, brightness up. Arrow keys nudge by 1%, with shift by 10%. */
function Field({ hsv, onChange }: { hsv: Hsv; onChange: (hsv: Hsv) => void }) {
    const drag = useDrag((x, y) => onChange({ ...hsv, s: x, v: 1 - y }))
    const onKey = (e: React.KeyboardEvent) => {
        const step = e.shiftKey ? 0.1 : 0.01
        const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key]
        if (!d) return
        e.preventDefault()
        onChange({ ...hsv, s: clamp(hsv.s + d[0]), v: clamp(hsv.v + d[1]) })
    }
    return (
        <div
            {...drag}
            role="slider"
            tabIndex={0}
            aria-label="Saturation and brightness"
            aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
            aria-valuenow={Math.round(hsv.s * 100)}
            onKeyDown={onKey}
            className="relative h-36 touch-none cursor-crosshair rounded-xl border border-ink"
            style={{
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))`,
            }}
        >
            <span
                aria-hidden
                className="pointer-events-none absolute size-4 -translate-1/2 rounded-full border-2 border-paper shadow-[0_0_0_1px_var(--ink)]"
                style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: toHex(hsv) }}
            />
        </div>
    )
}

function Hue({ hsv, onChange }: { hsv: Hsv; onChange: (hsv: Hsv) => void }) {
    const drag = useDrag((x) => onChange({ ...hsv, h: x * 359 }))
    const onKey = (e: React.KeyboardEvent) => {
        const step = e.shiftKey ? 10 : 1
        const d = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step }[e.key]
        if (d === undefined) return
        e.preventDefault()
        onChange({ ...hsv, h: clamp(hsv.h + d, 0, 359) })
    }
    return (
        <div
            {...drag}
            role="slider"
            tabIndex={0}
            aria-label="Hue"
            aria-valuemin={0}
            aria-valuemax={359}
            aria-valuenow={Math.round(hsv.h)}
            onKeyDown={onKey}
            className="relative h-4 touch-none cursor-ew-resize rounded-full border border-ink"
            style={{ background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}
        >
            <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 size-5 -translate-1/2 rounded-full border-2 border-paper shadow-[0_0_0_1px_var(--ink)]"
                style={{ left: `${(hsv.h / 359) * 100}%`, background: `hsl(${hsv.h} 100% 50%)` }}
            />
        </div>
    )
}
