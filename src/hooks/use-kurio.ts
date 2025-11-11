import { api } from "@/trpc/react"

/**
 * Hook for fetching kurios list
 * For mutations (create, update, delete), create them in components with specific options
 */
export function useKurio() {
	const { data: kurios, isLoading, refetch } = api.kurio.getAll.useQuery()

	return {
		kurios,
		isLoading,
		refetch,
	}
}
