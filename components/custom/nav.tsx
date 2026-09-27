"use client"

import { usePathname } from "next/navigation"
import { TransitionLink } from "./pixel-transition"
import { TextRoll } from "./text-roll"

const LINKS = [
    { href: "/", label: "Work" },
    { href: "/archive", label: "Archive" },
    { href: "/about", label: "About" },
]

// Solid chips instead of blend-mode text, so the nav reads over any shader.
export function Nav() {
    const pathname = usePathname()
    return (
        <header className="label pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-3 p-3 md:p-5">
            <TransitionLink
                href="/"
                className="group pointer-events-auto flex items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-4 text-paper"
            >
                <img src="/logo.png" alt="" className="h-7 w-auto" />
                <TextRoll>Ethanol</TextRoll>
            </TransitionLink>

            <nav className="pointer-events-auto flex gap-1 rounded-full bg-ink p-1 text-paper">
                {LINKS.map((l) => {
                    const on = pathname === l.href
                    return (
                        <TransitionLink
                            key={l.href}
                            href={l.href}
                            className={`group rounded-full px-4 py-2 transition-colors ${on ? "bg-lime text-ink" : "hover:bg-paper/10"}`}
                        >
                            <TextRoll>{l.label}</TextRoll>
                        </TransitionLink>
                    )
                })}
            </nav>

            <a
                href="https://www.instagram.com/ethan.z.lalla/"
                target="_blank"
                rel="noreferrer"
                className="group pointer-events-auto hidden items-center gap-2 rounded-full bg-ink px-4 py-3 text-paper md:flex"
            >
                <span className="blink text-lime">●</span>
                <TextRoll>Open for work</TextRoll>
            </a>
        </header>
    )
}
