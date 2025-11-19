import { api } from "@/trpc/react"

type UseKurioReturn = {
	kurios: Awaited<ReturnType<typeof api.kurio.getAll.useQuery>>["data"]
	isLoading: boolean
	refetch: ReturnType<typeof api.kurio.getAll.useQuery>["refetch"]
}

/**
 * Hook for fetching kurios list
 * For mutations (create, update, delete), create them in components with specific options
 */
export function useKurio(): UseKurioReturn {
	const { data: kurios, isLoading, refetch } = api.kurio.getAll.useQuery()

	return {
		kurios,
		isLoading,
		refetch,
	}
}
