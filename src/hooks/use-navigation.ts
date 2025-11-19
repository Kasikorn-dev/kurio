import { useRouter } from "next/navigation"
import { useCallback } from "react"

type UseNavigationReturn = {
	navigate: (path: string, refresh?: boolean) => void
	back: () => void
}

export function useNavigation(): UseNavigationReturn {
	const router = useRouter()

	const navigate = useCallback(
		(path: string, refresh = false): void => {
			router.push(path)
			if (refresh) {
				router.refresh()
			}
		},
		[router],
	)

	const back = useCallback((): void => {
		router.back()
	}, [router])

	return { navigate, back }
}
