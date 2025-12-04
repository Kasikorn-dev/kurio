"use client"

import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { useKurioRealtime } from "@/hooks/use-kurio-realtime"

type KurioGenerationStatusProps = {
	kurioId: string
	status:
		| "generating"
		| "generating_units"
		| "generating_games"
		| "ready"
		| "error"
	onComplete?: () => void
	onCourseMetadataUpdated?: () => void
}

export function KurioGenerationStatus({
	kurioId,
	status,
	onComplete,
	onCourseMetadataUpdated,
}: KurioGenerationStatusProps) {
	const { progress, isComplete } = useKurioRealtime({
		kurioId,
		enabled:
			status === "generating" ||
			status === "generating_units" ||
			status === "generating_games",
		onCourseMetadataUpdated: () => {
			onCourseMetadataUpdated?.()
		},
		onGenerationComplete: () => {
			onComplete?.()
		},
	})

	if (status === "ready" || isComplete) {
		return null
	}

	if (status === "error") {
		return (
			<div className="rounded-lg border border-destructive bg-destructive/10 p-4">
				<p className="font-medium text-destructive text-sm">
					Generation failed. Please try again.
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-4 rounded-lg border bg-muted/50 p-6">
			<div className="flex items-center gap-3">
				<Spinner className="size-5" />
				<div className="flex-1">
					<p className="font-medium">
						{status === "generating" || status === "generating_units"
							? "Generating units..."
							: status === "generating_games"
								? "Generating games..."
								: "Processing..."}
					</p>
					{status === "generating_games" && (
						<p className="text-muted-foreground text-sm">
							{progress.toFixed(0)}% complete
						</p>
					)}
				</div>
			</div>
			{status === "generating_games" && (
				<Progress className="h-2" value={progress} />
			)}
		</div>
	)
}
