import { Cursor } from "@/components/custom/cursor"
import { Nav } from "@/components/custom/nav"
import { PixelTransition } from "@/components/custom/pixel-transition"
import { SmoothScroll } from "@/components/smooth-scroll/smooth-scroll"
import { WebglProvider } from "@/components/webgl-provider/webgl-provider"

// Every public page reads the catalog from the database; admin saves refresh
// them with revalidatePath, so between edits they're served static.
export const revalidate = 3600

export default function SiteLayout({ children }: LayoutProps<"/">) {
    return (
        // #site goes inert while the lightbox (portaled outside it) is open.
        <div id="site" className="grain">
            <a
                href="#main"
                className="label sr-only rounded-full bg-lime px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
            >
                Skip to content
            </a>
            <SmoothScroll options={{ lerp: 0.09 }}>
                <WebglProvider>
                    <PixelTransition>
                        <Nav />
                        <main id="main">{children}</main>
                    </PixelTransition>
                </WebglProvider>
            </SmoothScroll>
            <Cursor />
        </div>
    )
}
