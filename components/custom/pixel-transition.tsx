"use client"

/*
 * Hand-built stand-in for Atelier's pro Pixel Transition.
 * Cells flash an accent color, then settle to ink, in a random order.
 * The first load plays as an intro: covered with a counter, then revealed.
 */

import { useLenis } from "lenis/react"
import NextLink from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    type ComponentProps,
    createContext,
    type MouseEvent,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"

type Phase = "idle" | "cover" | "reveal"
const ACCENTS = ["#dcf26b", "#c9a2ff", "#ff5fae", "#1fb58f", "#f4d35e"]
const COVER_MS = 1000
const REVEAL_MS = 900
const LABELS: Record<string, string> = { "/": "Index", "/archive": "Archive", "/about": "About" }

const NavCtx = createContext<(href: string) => void>(() => {})

export function PixelTransition({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const lenis = useLenis()
    const [phase, setPhase] = useState<Phase>("cover")
    const [label, setLabel] = useState("ethanol.cc")
    const [count, setCount] = useState(0)
    const [intro, setIntro] = useState(true)
    const [grid, setGrid] = useState({ cols: 16, rows: 10 })
    const pending = useRef<string | null>(null)
    const busy = useRef(true)

    useEffect(() => {
        const size = () => {
            const cols = window.innerWidth < 700 ? 8 : 16
            const cell = window.innerWidth / cols
            setGrid({ cols, rows: Math.ceil(window.innerHeight / cell) })
        }
        size()
        window.addEventListener("resize", size)
        return () => window.removeEventListener("resize", size)
    }, [])

    // Seeded so the server and client render the same grid.
    const cells = useMemo(() => {
        let seed = 42
        const rand = () => {
            seed = (seed * 16807) % 2147483647
            return (seed - 1) / 2147483646
        }
        return Array.from({ length: grid.cols * grid.rows }, () => ({
            d: rand(),
            c: ACCENTS[Math.floor(rand() * ACCENTS.length)],
        }))
    }, [grid])

    const setTransitioning = (on: boolean) => {
        const html = document.documentElement
        if (on) html.setAttribute("data-atelier-transitioning", "")
        else html.removeAttribute("data-atelier-transitioning")
    }

    // Intro: count to 100 while the cover holds, then reveal.
    useEffect(() => {
        let raf = 0
        const start = performance.now()
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / 1800)
            setCount(Math.round(t * t * (3 - 2 * t) * 100))
            if (t < 1) raf = requestAnimationFrame(tick)
            else {
                setPhase("reveal")
                setTimeout(() => {
                    setPhase("idle")
                    setIntro(false)
                    busy.current = false
                }, REVEAL_MS)
            }
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [])

    const navigate = useCallback(
        (href: string) => {
            if (busy.current || href === pathname) return
            busy.current = true
            pending.current = href
            setLabel(LABELS[href] ?? href)
            setTransitioning(true)
            setPhase("cover")
            setTimeout(() => router.push(href, { scroll: false }), COVER_MS)
        },
        [pathname, router],
    )

    useEffect(() => {
        if (!pending.current) {
            lenis?.scrollTo(0, { immediate: true, force: true })
            return
        }
        pending.current = null
        lenis?.scrollTo(0, { immediate: true, force: true })
        window.scrollTo(0, 0)
        const t = setTimeout(() => {
            setPhase("reveal")
            setTimeout(() => {
                setPhase("idle")
                setTransitioning(false)
                busy.current = false
            }, REVEAL_MS)
        }, 350)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname])

    return (
        <NavCtx.Provider value={navigate}>
            {children}
            <div
                data-phase={phase}
                aria-hidden
                className="pointer-events-none fixed inset-0 z-[80] grid"
                style={{
                    gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
                    pointerEvents: phase === "idle" ? "none" : "auto",
                }}
            >
                {cells.map((cell, i) => (
                    <div
                        key={i}
                        className="px-cell"
                        style={
                            {
                                "--d": `${(cell.d * (phase === "reveal" ? REVEAL_MS - 450 : COVER_MS - 500)).toFixed(0)}ms`,
                                "--c": cell.c,
                                ...(intro && phase === "cover" ? { opacity: 1, animation: "none" } : {}),
                            } as React.CSSProperties
                        }
                    />
                ))}
            </div>
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-[81] flex items-end justify-between p-5 text-paper transition-opacity duration-300 md:p-8"
                style={{ opacity: phase === "cover" ? 1 : 0 }}
            >
                <span className="label">
                    {intro ? "Loading the good stuff" : "Going to"}
                    <br />
                    <span className="display text-[9vw] leading-none text-lime md:text-[6vw]">
                        {intro ? "ethanol" : label}
                    </span>
                </span>
                {intro && <span className="display text-[16vw] leading-none md:text-[10vw]">{count}</span>}
            </div>
        </NavCtx.Provider>
    )
}

export function TransitionLink({ href, onClick, ...rest }: ComponentProps<typeof NextLink> & { href: string }) {
    const navigate = useContext(NavCtx)
    return (
        <NextLink
            href={href}
            {...rest}
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                onClick?.(e)
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return
                e.preventDefault()
                navigate(href)
            }}
        />
    )
}
