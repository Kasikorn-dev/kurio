import { api } from "@/trpc/react"

export function useKurio() {
	const getAll = api.kurio.getAll.useQuery()
	const create = api.kurio.create.useMutation()
	const update = api.kurio.update.useMutation()
	const deleteKurio = api.kurio.delete.useMutation()

	return {
		kurios: getAll.data,
		isLoading: getAll.isLoading,
		create,
		update,
		delete: deleteKurio,
		refetch: getAll.refetch,
	}
}

