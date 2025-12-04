"use client"

import { getGenerationStatus, invalidateKurio } from "@/lib/utils/kurio"
import type { RouterOutputs } from "@/trpc/react"
import { api } from "@/trpc/react"
import { KurioGenerationStatus } from "./kurio-generation-status"
import { ManageKurioDialog } from "./manage-kurio-dialog"
import type { Kurio } from "./types"

type KurioDetailClientProps = {
	kurio: Kurio
}

export function KurioDetailClient({ kurio }: KurioDetailClientProps) {
	const utils = api.useUtils()

	const { id, title, description, status, autoGenEnabled, units } = kurio

	// Refresh data when course metadata is updated (title/description)
	const handleCourseMetadataUpdated = () => {
		invalidateKurio(utils, id)
	}

	// Refresh data when generation completes
	const handleGenerationComplete = () => {
		invalidateKurio(utils, id)
	}

	// Determine status for generation component
	const generationStatus = getGenerationStatus(
		status as RouterOutputs["kurio"]["getById"]["status"],
	)

	return (
		<div className="relative min-h-screen">
			<div className="container relative mx-auto px-4 py-8">
				{/* Generation Status - Shows when generating */}
				{generationStatus !== "ready" && (
					<div className="mb-6">
						<KurioGenerationStatus
							kurioId={id}
							onComplete={handleGenerationComplete}
							onCourseMetadataUpdated={handleCourseMetadataUpdated}
							status={generationStatus}
						/>
					</div>
				)}

				{/* Kurio Content */}
				<div>
					<h1 className="font-bold text-3xl">{title}</h1>
					{description && (
						<p className="mt-2 text-muted-foreground">{description}</p>
					)}
				</div>

				{/* TODO: Add units display when ready */}
				{generationStatus === "ready" && units.length > 0 && (
					<div className="mt-8">
						<h2 className="mb-4 font-semibold text-xl">Units</h2>
						{/* Units will be displayed here */}
					</div>
				)}

				<ManageKurioDialog
					kurio={{
						id,
						title,
						description,
						status,
						autoGenEnabled,
					}}
				/>
			</div>
		</div>
	)
}
