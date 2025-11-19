import { useEffect, useState } from "react"
import { UI_CONSTANTS } from "@/lib/constants"

export function useIsMobile(): boolean {
	const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

	useEffect(() => {
		const mql = window.matchMedia(
			`(max-width: ${UI_CONSTANTS.MOBILE_BREAKPOINT - 1}px)`,
		)
		const onChange = (): void => {
			setIsMobile(window.innerWidth < UI_CONSTANTS.MOBILE_BREAKPOINT)
		}
		mql.addEventListener("change", onChange)
		setIsMobile(window.innerWidth < UI_CONSTANTS.MOBILE_BREAKPOINT)
		return () => mql.removeEventListener("change", onChange)
	}, [])

	return !!isMobile
}
