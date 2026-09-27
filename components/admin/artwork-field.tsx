"use client"

import { upload } from "@vercel/blob/client"
import { useEffect, useRef, useState } from "react"

/**
 * The piece's image. Drop or pick a file and it goes straight from the
 * browser to Blob. On the way it reads the image's average colour, which the
 * editor offers as the piece's tone.
 */
export function ArtworkField({
    value,
    tone,
    initialFile,
    onUploaded,
    onTone,
}: {
    value: string
    tone: string
    /** A file dropped on the board: starts uploading as soon as the editor opens. */
    initialFile?: File
    onUploaded: (url: string) => void
    onTone: (hex: string) => void
}) {
    const input = useRef<HTMLInputElement>(null)
    const [progress, setProgress] = useState<number | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [over, setOver] = useState(false)

    async function take(file: File | undefined) {
        if (!file) return
        if (!file.type.startsWith("image/")) return setError("Choose a JPG, PNG or WebP image.")
        setError(null)
        const local = URL.createObjectURL(file)
        setPreview(local)
        averageColour(local).then((hex) => hex && onTone(hex))
        setProgress(0)
        try {
            const name = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-")
            const blob = await upload(`works/${name}`, file, {
                access: "public",
                handleUploadUrl: "/api/admin/upload",
                onUploadProgress: ({ percentage }) => setProgress(percentage),
            })
            // Hold the local preview until the uploaded copy has loaded, so nothing blinks.
            await new Promise((resolve) => {
                const img = new Image()
                img.onload = img.onerror = resolve
                img.src = blob.url
            })
            onUploaded(blob.url)
        } catch (err) {
            setError(
                err instanceof Error && /size/i.test(err.message)
                    ? "Choose an image under 25 MB."
                    : "Unable to upload. Check your connection and try again.",
            )
        } finally {
            setPreview(null)
            setProgress(null)
            URL.revokeObjectURL(local)
        }
    }

    const started = useRef(false)
    useEffect(() => {
        if (!initialFile || started.current) return
        started.current = true
        Promise.resolve().then(() => take(initialFile))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialFile])

    const shown = preview ?? value
    const busy = progress !== null

    return (
        <div>
            <button
                type="button"
                disabled={busy}
                aria-label={busy ? "Uploading artwork" : shown ? "Replace artwork" : "Add artwork"}
                aria-describedby={error ? "artwork-error" : undefined}
                onClick={() => input.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setOver(true)
                }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setOver(false)
                    take(e.dataTransfer.files[0])
                }}
                className="group relative block aspect-[16/10] max-h-[36vh] w-full overflow-hidden border border-ink text-left"
                style={{ background: shown ? `${tone}` : undefined }}
            >
                {shown ? (
                    <img src={shown} alt="" className="absolute inset-0 size-full object-contain p-4" />
                ) : (
                    <span className="absolute inset-0 grid place-items-center bg-[repeating-linear-gradient(-45deg,transparent_0_10px,rgb(12_12_11/0.05)_10px_11px)]">
                        <span className="text-center">
                            <span className="display block text-[28px]">Drop it here</span>
                            <span className="label mt-2 block opacity-70">or click to choose · JPG, PNG, WebP up to 25 MB</span>
                        </span>
                    </span>
                )}

                {over && (
                    <span className="absolute inset-0 grid place-items-center bg-lime/90">
                        <span className="display text-[28px]">Let go</span>
                    </span>
                )}

                {shown && !busy && (
                    <span className="label absolute bottom-0 start-0 translate-y-full bg-ink px-3 py-2 text-paper transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none">
                        Replace image
                    </span>
                )}

                {busy && (
                    <span className="absolute inset-x-0 bottom-0 bg-ink px-3 py-2 text-paper">
                        <span className="label flex justify-between">
                            <span>Uploading</span>
                            <span className="tabular-nums">{String(Math.round(progress)).padStart(3, "0")}%</span>
                        </span>
                        <span className="mt-1.5 block h-[3px] bg-paper/15">
                            <span className="block h-full bg-lime transition-[width] duration-200" style={{ width: `${progress}%` }} />
                        </span>
                    </span>
                )}
            </button>
            <input
                ref={input}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    take(e.target.files?.[0])
                    e.target.value = ""
                }}
            />
            {error && (
                <p id="artwork-error" role="alert" className="label mt-2 inline-block bg-pink px-2 py-1 text-ink">
                    {error}
                </p>
            )}
        </div>
    )
}

/** Downsample to one pixel and read it back. A local object URL doesn't taint the canvas. */
function averageColour(src: string): Promise<string | null> {
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement("canvas")
            canvas.width = canvas.height = 1
            const ctx = canvas.getContext("2d")
            if (!ctx) return resolve(null)
            ctx.drawImage(img, 0, 0, 1, 1)
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
            resolve(`#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase())
        }
        img.onerror = () => resolve(null)
        img.src = src
    })
}
