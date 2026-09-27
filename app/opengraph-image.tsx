import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

export const alt = "The Ethanol logo: Ethan Z. Lalla, graphic artist, Trinidad and Tobago"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/** The yellow inside the logo's oval, sampled from public/logo.png, so the logo sits on its own ground. */
const LOGO_YELLOW = "#f3ff74"

// Just the mark. WhatsApp and Instagram crop link previews toward a square, so everything
// sits inside the middle 630px and reads the same at either shape.
export default async function Image() {
    const root = process.cwd()
    const [logo, monumentBold, monument] = await Promise.all([
        readFile(join(root, "public/logo.png")).then((b) => `data:image/png;base64,${b.toString("base64")}`),
        readFile(join(root, "app/fonts/MonumentExtended-Ultrabold.otf")),
        readFile(join(root, "app/fonts/MonumentExtended-Regular.otf")),
    ])

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: LOGO_YELLOW,
                    fontFamily: "Monument",
                }}
            >
                <img src={logo} width={560} height={370} />
                <div
                    style={{
                        marginTop: 26,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        background: "#0c0c0b",
                        color: "#ece9e1",
                        borderRadius: 999,
                        padding: "12px 26px",
                        fontSize: 20,
                        letterSpacing: 1,
                    }}
                >
                    <span style={{ fontWeight: 800 }}>ETHANOL</span>
                    <span style={{ color: LOGO_YELLOW }}>/</span>
                    <span>GRAPHIC ARTIST, T&amp;T</span>
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                { name: "Monument", data: monument, weight: 400, style: "normal" },
                { name: "Monument", data: monumentBold, weight: 800, style: "normal" },
            ],
        },
    )
}
