"use client"

import { useEffect } from "react"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { UNIT_CONSTANTS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useKurioStore } from "@/stores/kurio-store"
import { AutoGenToggle } from "./auto-gen-toggle"
import { UnitCountSelector } from "./unit-count-selector"

export function KurioAutoGenControls() {
	const { autoGenEnabled, setAutoGenEnabled, unitCount, setUnitCount } =
		useKurioStore()

	// Set default unitCount to 10 when auto-gen is enabled
	useEffect(() => {
		if (autoGenEnabled && unitCount === undefined) {
			setUnitCount(UNIT_CONSTANTS.INITIAL_UNITS)
		}
	}, [autoGenEnabled, unitCount, setUnitCount])

	return (
		<div className="flex items-center gap-2">
			<Tooltip>
				<TooltipTrigger asChild>
					<AutoGenToggle
						enabled={autoGenEnabled}
						onToggle={setAutoGenEnabled}
					/>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					AI will auto generate units when the content reaches 80% of the total
					content
				</TooltipContent>
			</Tooltip>

			<UnitCountSelector
				className={cn(
					"transition-opacity",
					!autoGenEnabled
						? "pointer-events-auto opacity-100"
						: "pointer-events-none opacity-0",
				)}
				onChange={setUnitCount}
				value={unitCount}
			/>
		</div>
	)
}
