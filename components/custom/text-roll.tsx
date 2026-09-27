/*
 * Hand-built stand-in for Atelier's pro Text Roll: each letter rolls up
 * to a copy of itself on hover, staggered. Pure CSS (see .roll in globals).
 */

export function TextRoll({ children, className }: { children: string; className?: string }) {
    return (
        <span className={`roll ${className ?? ""}`} aria-label={children}>
            {Array.from(children).map((ch, i) => (
                <span key={i} style={{ "--i": i } as React.CSSProperties} aria-hidden>
                    <span>{ch}</span>
                    <span>{ch}</span>
                </span>
            ))}
        </span>
    )
}
