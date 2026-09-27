import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { isAdmin } from "@/app/admin/guard"

// Client uploads: the browser sends the file straight to Blob, so artwork
// isn't capped by the 4.5 MB function body limit. This only mints the token.
export async function POST(request: Request) {
    const body = (await request.json()) as HandleUploadBody
    try {
        const json = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                if (!(await isAdmin())) throw new Error("Not signed in")
                if (!pathname.startsWith("works/")) throw new Error("Bad path")
                return {
                    allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
                    maximumSizeInBytes: 25 * 1024 * 1024,
                    addRandomSuffix: true,
                }
            },
        })
        return NextResponse.json(json)
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 400 })
    }
}
