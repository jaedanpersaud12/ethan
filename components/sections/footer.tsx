"use client"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { Clock } from "@/components/custom/clock"
import { TransitionLink } from "@/components/custom/pixel-transition"
import { ScrollShape } from "@/components/custom/shapes"
import { TextRoll } from "@/components/custom/text-roll"
import { MagneticDotGrid } from "@/components/magnetic-dot-grid/magnetic-dot-grid"
import PixelScroll from "@/components/pixel-scroll/pixel-scroll"
import { TextBounce } from "@/components/text-bounce/text-bounce"
import { GRAPHITE, LILAC, LIME, PINK, TEAL } from "@/lib/palette"
import { useLenis } from "lenis/react"
import { useRef } from "react"

const IG = "https://www.instagram.com/ethan.z.lalla/"

const ELSEWHERE = [
    { label: "Instagram", href: IG },
    { label: "Zed Labs", href: "https://www.zed.io/" },
    { label: "Wam", href: "https://wam.money/" },
]
const SITE = [
    { label: "Work", href: "/" },
    { label: "Archive", href: "/archive" },
    { label: "About", href: "/about" },
]

/**
 * Pixel cover that fills to ink before the footer. Its canvas is
 * transparent, so a section can render it over its own tail (see Tobago).
 */
export function FooterPixels({ className }: { className?: string }) {
    return (
        <div className={`relative z-10 ${className ?? ""}`}>
            <PixelScroll
                colors={[LIME, PINK, LILAC, TEAL]}
                colorRatio={0.35}
                density={22}
                scrollDistance={80}
                overlap={100}
                className="text-ink"
            />
        </div>
    )
}

/** `pixels={false}` when the section above already renders <FooterPixels />. */
export function Footer({ pixels = true }: { pixels?: boolean }) {
    const lenis = useLenis()
    const gridRef = useRef<HTMLDivElement>(null)
    const reduced = useReducedMotion()

    // MagneticDotGrid listens on its own canvas, so buttons and text above it
    // swallow the pointer. Forward moves from anywhere in the footer.
    const forward = (e: React.PointerEvent) => {
        const canvas = gridRef.current?.querySelector("canvas")
        if (!canvas || e.target === canvas) return
        canvas.dispatchEvent(new PointerEvent("pointermove", { clientX: e.clientX, clientY: e.clientY }))
    }
    const release = () => gridRef.current?.querySelector("canvas")?.dispatchEvent(new PointerEvent("pointerleave"))
    return (
        <>
            {pixels && <FooterPixels />}
            {/*
              The footer slides up over the end of the pixel cover. Its top is
              transparent, so the dot grid runs through the inked pixels and
              fades in rather than starting at a hard edge.
            */}
            {/* Rendered inside <main> by the pages, so name the landmark explicitly. */}
            <footer
                role="contentinfo"
                className="relative z-10 -mt-[60vh] overflow-hidden bg-[linear-gradient(to_bottom,transparent_0,var(--color-ink)_22vh)] text-paper"
                onPointerMove={forward}
                onPointerLeave={release}
            >
                <div ref={gridRef} className="absolute inset-0">
                    <MagneticDotGrid
                        className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,transparent_0,black_24vh)]"
                        baseColor={GRAPHITE}
                        centerColors={[LIME, PINK, LILAC]}
                        spacing={18}
                        dotRadius={1}
                        strength={28}
                        interactionRadius={260}
                    />
                </div>
                <ScrollShape
                    name="orb"
                    color={LIME}
                    turns={-720}
                    className="-right-[12vw] top-[26vh] hidden w-[30vw] opacity-40 md:block"
                    wobble={false}
                />

                <div className="pointer-events-none relative flex min-h-[calc(100svh+20vh)] flex-col gap-16 px-4 pb-6 pt-[calc(22vh+2rem)] md:px-6">
                    {/* Pitch + primary actions */}
                    <div className="grid grid-cols-12 gap-4">
                        <span className="label col-span-12 text-paper/60 md:col-span-3">(05) — Contact</span>
                        <div className="col-span-12 md:col-span-8">
                            <p className="text-[9vw] leading-[1] md:text-[4.6vw]">
                                <span className="font-serif italic">Got something</span>{" "}
                                <span className="display text-lime">interesting?</span>
                            </p>
                            <div className="pointer-events-auto mt-10 flex flex-wrap gap-3">
                                <a
                                    href={IG}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-lime ps-7 pe-6.5 text-base font-medium uppercase tracking-wide text-ink transition-[translate,scale,background-color] duration-150 hover:-translate-y-0.5 hover:bg-paper active:scale-[0.96] md:min-h-16 md:ps-9 md:pe-8.5 md:text-lg"
                                >
                                    <TextRoll>DM @ethan.z.lalla</TextRoll>
                                    <span className="sr-only"> on Instagram (opens in new tab)</span>
                                    <span aria-hidden>↗</span>
                                </a>
                                <TransitionLink
                                    href="/archive"
                                    className="group inline-flex min-h-14 items-center gap-3 rounded-full border border-paper/40 ps-7 pe-6.5 text-base uppercase tracking-wide transition-[color,background-color,border-color,scale] duration-150 hover:border-paper hover:bg-paper hover:text-ink active:scale-[0.96] md:min-h-16 md:ps-9 md:pe-8.5 md:text-lg"
                                >
                                    <TextRoll>See everything</TextRoll>
                                    <span aria-hidden>→</span>
                                </TransitionLink>
                            </div>
                        </div>
                    </div>

                    {/* Link columns: whole rows are the hit area */}
                    <div className="pointer-events-auto grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-4">
                        <LinkList title="Elsewhere" className="md:col-span-3 md:col-start-4">
                            {ELSEWHERE.map((l) => (
                                <Row key={l.label} href={l.href} external>
                                    {l.label}
                                </Row>
                            ))}
                        </LinkList>
                        <LinkList title="Site" className="md:col-span-3">
                            {SITE.map((l) => (
                                <Row key={l.label} href={l.href}>
                                    {l.label}
                                </Row>
                            ))}
                        </LinkList>
                        <LinkList title="Based in" className="md:col-span-3">
                            <li className="flex min-h-12 items-center justify-between border-b border-paper/15 text-base">
                                <span>Port of Spain, TT</span>
                            </li>
                            <li className="flex min-h-12 items-center justify-between border-b border-paper/15 text-base text-paper/70">
                                <Clock />
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => lenis?.scrollTo(0, reduced ? { immediate: true } : { duration: 2 })}
                                    className="group flex min-h-12 w-full items-center justify-between border-b border-paper/15 text-base transition-colors hover:text-lime"
                                >
                                    <TextRoll>Back to top</TextRoll>
                                    <span aria-hidden>↑</span>
                                </button>
                            </li>
                        </LinkList>
                    </div>

                    {/* Wordmark */}
                    <div className="mt-auto">
                        {/* A wordmark, not a heading: as an h2 it outranked the page's h1. */}
                        <p className="display pointer-events-auto flex items-start text-[13.5vw] leading-[0.85] text-paper">
                            <TextBounce render={<span />} distance={70} rotation={40}>
                                Ethanol
                            </TextBounce>
                            <ScrollShape
                                name="burst"
                                color={PINK}
                                turns={900}
                                className="relative ml-[1.5vw] mt-[0.5vw] w-[6vw] shrink-0"
                            />
                        </p>
                        <div className="label mt-4 flex flex-wrap justify-between gap-2 text-paper/50">
                            <span>Ethan Z. Lalla ©{new Date().getFullYear()}</span>
                            <span>Built with Atelier UI + a few homemade shaders</span>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

function LinkList({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
    return (
        <div className={className}>
            <p className="label mb-2 text-paper/50">{title}</p>
            <ul className="border-t border-paper/15">{children}</ul>
        </div>
    )
}

function Row({ href, external, children }: { href: string; external?: boolean; children: string }) {
    const cls =
        "group flex min-h-12 items-center justify-between border-b border-paper/15 text-base transition-colors hover:text-lime"
    return (
        <li>
            {external ? (
                <a href={href} target="_blank" rel="noreferrer" className={cls}>
                    <TextRoll>{children}</TextRoll>
                    <span className="sr-only"> (opens in new tab)</span>
                    <span aria-hidden>↗</span>
                </a>
            ) : (
                <TransitionLink href={href} className={cls}>
                    <TextRoll>{children}</TextRoll>
                    <span aria-hidden>→</span>
                </TransitionLink>
            )}
        </li>
    )
}
