export type Work = {
    id: string
    title: string
    kind: string
    year: string
    src: string
    tone: string
}

const w = (id: string, title: string, kind: string, year: string, tone: string): Work => ({
    id,
    title,
    kind,
    year,
    tone,
    src: `/work/${id}.jpg`,
})

export const WORKS: Work[] = [
    w("32", "K.I.S.S.", "Poster", "2025", "#1FB58F"),
    w("27", "Fading Things", "Type Study", "2025", "#C9A2FF"),
    w("35", "Vagabond V2", "Poster", "2024", "#8FD3FF"),
    w("28", "Make A Move", "Editorial", "2025", "#E9E9E9"),
    w("39", "Greetings From Maracas", "Postcard", "2024", "#FFB59A"),
    w("34", "You're So Divine", "Cover Art", "2025", "#7A5CFF"),
    w("40", "Pushing Me Away", "Cover Art", "2024", "#3A3325"),
    w("43", "The Forever Story", "Cover Art", "2023", "#1A1A1A"),
    w("33", "How I See You", "Layout", "2025", "#F1F1F1"),
    w("29", "Be My Valentine?", "Illustration", "2025", "#FF6FB5"),
    w("41", "Shoot For The Stars", "Type Study", "2024", "#FFE66B"),
    w("38", "Korn / Blind", "Tracklist", "2024", "#2B2B2B"),
    w("36", "Sketchbook 01", "Mixed Media", "2023", "#E8413C"),
    w("37", "Sketchbook 02", "Mixed Media", "2023", "#F4E74A"),
    w("30", "Godzilla", "Poster", "2024", "#0B0B0B"),
    w("31", "Shin Godzilla", "Poster", "2024", "#0B0B0B"),
    w("42", "Forever Story — Tracklist", "Layout", "2023", "#141414"),
]

export const TOBAGO: Work[] = ["22", "23", "24", "25", "26"].map((id, i) =>
    w(id, `Tobago Meditation ${i + 1}`, "Photography", "2024", "#F2D46B"),
)

export const ALL = [...WORKS, ...TOBAGO]
