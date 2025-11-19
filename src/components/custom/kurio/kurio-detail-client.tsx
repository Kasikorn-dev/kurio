import { KurioPathViewer } from "@/components/custom/kurio/kurio-path-viewer"
import { ManageKurioDialog } from "@/components/custom/kurio/manage-kurio-dialog"

type KurioDetailClientProps = {
	kurio: {
		id: string
		title: string
		description: string | null
		status: string
		autoGenEnabled: boolean
		resources: Array<{
			id: string
			resourceType: string
			resourceContent: string | null
			resourceFileUrl: string | null
		}>
		units: Array<{
			id: string
			title: string
			orderIndex: number
			games: Array<{
				id: string
				title: string
				orderIndex: number
			}>
		}>
	}
}

export function KurioDetailClient({ kurio }: KurioDetailClientProps) {
	return (
		<div className="relative">
			<ManageKurioDialog
				kurio={{
					id: kurio.id,
					title: kurio.title,
					description: kurio.description,
					autoGenEnabled: kurio.autoGenEnabled,
				}}
			/>
			{kurio.status === "ready" && kurio.units.length > 0 ? (
				<KurioPathViewer kurio={kurio} />
			) : (
				<div className="container mx-auto py-8 text-center">
					<h1 className="font-bold text-3xl">{kurio.title}</h1>
					{kurio.description && (
						<p className="mt-2 text-muted-foreground">{kurio.description}</p>
					)}
					<p className="mt-8 text-muted-foreground">
						{kurio.status === "generating"
							? "Generating games..."
							: kurio.status === "error"
								? "Failed to generate games. Please try again."
								: "No games available yet"}
					</p>
				</div>
			)}
		</div>
	)
}
