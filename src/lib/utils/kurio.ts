import type { api, RouterOutputs } from "@/trpc/react"

type Utils = ReturnType<typeof api.useUtils>

/**
 * Invalidate kurio cache by ID
 * Helper function to reduce code duplication
 */
export function invalidateKurio(utils: Utils, kurioId: string): void {
	void utils.kurio.getById.invalidate({ id: kurioId })
}

/**
 * Get kurio status for generation component
 * Normalizes status to the expected format
 */
export function getGenerationStatus(
	status: RouterOutputs["kurio"]["getById"]["status"],
): "generating" | "generating_units" | "generating_games" | "ready" | "error" {
	if (
		status === "generating" ||
		status === "generating_units" ||
		status === "generating_games"
	) {
		return status as "generating" | "generating_units" | "generating_games"
	}
	if (status === "error") {
		return "error"
	}
	return "ready"
}
