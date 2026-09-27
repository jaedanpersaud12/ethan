import { requireAdmin } from "@/app/admin/guard"

export default async function StudioLayout({ children }: LayoutProps<"/admin">) {
    await requireAdmin()
    return children
}
