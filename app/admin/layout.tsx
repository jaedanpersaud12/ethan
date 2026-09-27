import type { Metadata } from "next"

export const metadata: Metadata = {
    title: { default: "Studio — Ethanol", template: "%s — Ethanol studio" },
    robots: { index: false, follow: false },
}

export default function AdminRoot({ children }: LayoutProps<"/admin">) {
    return children
}
