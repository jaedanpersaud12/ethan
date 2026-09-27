"use client"

// One failing load keeps a way back. A tab left open across a deploy needs a reload, not a retry.
export default function StudioError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const stale = /Server Action .* was not found|Failed to find Server Action/i.test(error.message)
    return (
        <div className="grain grid min-h-dvh place-items-center bg-paper px-4 text-ink">
            <div className="max-w-xl">
                <p className="label">(Error){error.digest ? ` — ref ${error.digest}` : ""}</p>
                <h1 className="mt-3 text-[11vw] leading-[0.9] md:text-[5vw]">
                    <span className="display">{stale ? "Studio updated" : "That didn’t load"}</span>
                    <span className="font-serif italic">, {stale ? "reload it" : "your work is safe"}</span>
                </h1>
                <button
                    type="button"
                    onClick={() => (stale ? window.location.reload() : reset())}
                    className="label mt-8 rounded-full bg-ink px-5 py-3 text-lime transition-colors hover:bg-lime hover:text-ink"
                >
                    {stale ? "Reload →" : "Try again →"}
                </button>
            </div>
        </div>
    )
}
