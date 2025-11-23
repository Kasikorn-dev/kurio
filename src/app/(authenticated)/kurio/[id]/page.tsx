import { notFound } from "next/navigation"
import { KurioDetailClient } from "@/components/custom/kurio/kurio-detail-client"
import { api } from "@/trpc/server"

export const dynamic = "force-dynamic"

type KurioDetailPageProps = {
	params: Promise<{ id: string }>
}

export default async function KurioDetailPage({
	params,
}: KurioDetailPageProps) {
	const { id: kurioId } = await params

	try {
		const kurio = await api.kurio.getById({ id: kurioId })

		if (!kurio) {
			notFound()
		}

		return <KurioDetailClient kurio={kurio} />
	} catch (_error) {
		notFound()
	}
}

export async function generateMetadata({ params }: KurioDetailPageProps) {
	const { id: kurioId } = await params

	try {
		const kurio = await api.kurio.getById({ id: kurioId })
		return {
			title: kurio?.title ?? "Kurio",
		}
	} catch {
		return {
			title: "Kurio",
		}
	}
}
