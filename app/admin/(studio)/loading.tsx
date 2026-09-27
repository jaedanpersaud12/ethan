// The wall, before it's hung.
export default function Loading() {
    return (
        <div role="status" aria-busy className="grain min-h-dvh bg-paper px-4 pt-[88px] md:px-6 md:pt-[120px]">
            <span className="sr-only">Loading</span>
            <div className="mb-8 grid grid-cols-12 items-end gap-4 border-b border-ink pb-4">
                <p className="label col-span-12 md:col-span-3">
                    (Studio) — loading<span className="blink">_</span>
                </p>
                <p className="display col-span-12 text-[13vw] leading-[0.9] opacity-10 md:col-span-9 md:text-[7vw]">Index</p>
            </div>
            <div className="mt-24 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }, (_, i) => (
                    <div key={i}>
                        <div className="aspect-square animate-pulse bg-ink/[.06]" style={{ animationDelay: `${i * 60}ms` }} />
                        <div className="mt-2 h-3 w-2/3 bg-ink/[.06]" />
                    </div>
                ))}
            </div>
        </div>
    )
}
