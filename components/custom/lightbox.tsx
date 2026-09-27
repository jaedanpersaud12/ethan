"use client"

import { startTransition, useCallback, useEffect, useId, useRef, ViewTransition } from "react"
import { createPortal } from "react-dom"
import { formatTTD, type Work } from "@/lib/works"
import { workAlt } from "@/lib/seo"

/*
 * Full-size viewer shared by the Index and the Archive.
 *
 * Open/close morph with React's <ViewTransition>: the thumbnail and the
 * viewer image share `name={workTransitionName(id)}`, and opening/closing
 * run inside startTransition, so the browser morphs one into the other in
 * both directions. React pairs a named <ViewTransition> that unmounts with
 * one that mounts, so callers must unmount (not just rename) the wrapper on
 * the thumbnail whose piece is open.
 *
 * Browsing with the arrows is a plain state update (no transition), so it
 * swaps instantly.
 *
 * It's a modal: portaled to <body>, it marks #site inert while open, moves
 * focus to Close, and hands focus back to whatever opened it.
 */
export const workTransitionName = (id: string) => `work-${id}`

export function Lightbox({
    works,
    index,
    onChange,
    onClose,
}: {
    works: Work[]
    index: number | null
    onChange: (index: number | null) => void
    /** Runs inside the closing transition, e.g. to restore a hover preview to morph into. */
    onClose?: () => void
}) {
    const work = index !== null ? works[index] : null
    const isOpen = work !== null
    const titleId = useId()
    const closeRef = useRef<HTMLButtonElement>(null)

    const close = useCallback(() => {
        startTransition(() => {
            onClose?.()
            onChange(null)
        })
    }, [onChange, onClose])

    useEffect(() => {
        if (index === null) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close()
            if (e.key === "ArrowRight") onChange((index + 1) % works.length)
            if (e.key === "ArrowLeft") onChange((index - 1 + works.length) % works.length)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [index, works.length, onChange, close])

    useEffect(() => {
        if (!isOpen) return
        const site = document.getElementById("site")
        const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
        site?.setAttribute("inert", "")
        closeRef.current?.focus({ preventScroll: true })
        return () => {
            site?.removeAttribute("inert")
            returnTo?.focus({ preventScroll: true })
        }
    }, [isOpen])

    const step = (d: number) => (e: React.MouseEvent) => {
        e.stopPropagation()
        if (index !== null) onChange((index + d + works.length) % works.length)
    }

    if (!work) return null

    // The backdrop and chrome ride the root crossfade; the image morphs.
    return createPortal(
        <div role="dialog" aria-modal="true" aria-labelledby={titleId}>
            <div className="fixed inset-0 z-[70] bg-ink/95 backdrop-blur" onClick={close} data-lenis-prevent />
            <div className="pointer-events-none fixed inset-0 z-[71] flex flex-col p-4 text-paper md:p-6">
                <div className="label flex items-start justify-between gap-4 pt-16">
                    <span>
                        {String(index! + 1).padStart(2, "0")} / {String(works.length).padStart(2, "0")} — {work.kind},{" "}
                        {work.year}
                        {work.sold ? (
                            <span className="opacity-60"> · Sold</span>
                        ) : work.price !== null ? (
                            <span className="text-lime"> · Available, {formatTTD(work.price)}</span>
                        ) : null}
                    </span>
                    <div className="flex items-center gap-4">
                        {/* Keyboard hint only where there's likely a keyboard. */}
                        <span className="hidden [@media(hover:hover)]:inline">Esc to close · ← → to browse</span>
                        <button
                            ref={closeRef}
                            type="button"
                            onClick={close}
                            className="pointer-events-auto min-h-11 rounded-full border border-paper/40 px-5 uppercase transition-[color,background-color,scale] duration-150 hover:bg-paper hover:text-ink active:scale-[0.96]"
                        >
                            Close
                        </button>
                    </div>
                </div>
                <div className="relative flex min-h-0 flex-1 items-center justify-center py-6">
                    <ViewTransition name={workTransitionName(work.id)} share="morph" default="none">
                        <img
                            src={work.src}
                            alt={workAlt(work)}
                            width={1000}
                            height={1000}
                            decoding="sync"
                            onClick={close}
                            className="pointer-events-auto h-auto max-h-full w-auto max-w-full object-contain outline outline-1 -outline-offset-1 outline-white/10"
                        />
                    </ViewTransition>
                </div>
                <div className="flex items-end justify-between gap-4">
                    <h3 id={titleId} className="display text-balance text-[7vw] md:text-[3.5vw]">
                        {work.title}
                    </h3>
                    <div className="pointer-events-auto flex gap-2">
                        <button
                            type="button"
                            onClick={step(-1)}
                            aria-label="Previous"
                            className="flex size-14 items-center justify-center rounded-full border border-paper/40 text-lg transition-[color,background-color,scale] duration-150 hover:bg-paper hover:text-ink active:scale-[0.96]"
                        >
                            <span aria-hidden>←</span>
                        </button>
                        <button
                            type="button"
                            onClick={step(1)}
                            aria-label="Next"
                            className="flex size-14 items-center justify-center rounded-full border border-paper/40 text-lg transition-[color,background-color,scale] duration-150 hover:bg-paper hover:text-ink active:scale-[0.96]"
                        >
                            <span aria-hidden>→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    )
}
