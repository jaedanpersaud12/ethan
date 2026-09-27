/*
 * Hand-built stand-in for Atelier's pro Text Roll: each letter rolls up
 * to a copy of itself on hover, staggered. Pure CSS (see .roll in globals).
 *
 * The doubled letters are hidden from assistive tech; the sr-only copy is
 * what names the link or button it sits in. `className` styles the visual
 * roll only, so hiding it still leaves the name.
 */

export function TextRoll({ children, className }: { children: string; className?: string }) {
    return (
        <>
            <span className="sr-only">{children}</span>
            <span className={`roll ${className ?? ""}`} aria-hidden>
                {Array.from(children).map((ch, i) => (
                    <span key={i} style={{ "--i": i } as React.CSSProperties}>
                        <span>{ch}</span>
                        <span>{ch}</span>
                    </span>
                ))}
            </span>
        </>
    )
}
