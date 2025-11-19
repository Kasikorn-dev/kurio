"use client"

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { GAME_CONSTANTS } from "@/lib/constants"
import { cn } from "@/lib/utils"

type UnitCountSelectorProps = {
	value: number | undefined
	onChange: (value: number | undefined) => void
	className?: string
}

export function UnitCountSelector({
	value,
	onChange,
	className,
}: UnitCountSelectorProps) {
	return (
		<div className={cn("flex items-center", className)}>
			<Select
				onValueChange={(val) =>
					onChange(val ? Number.parseInt(val, 10) : undefined)
				}
				value={value?.toString() ?? ""}
			>
				<SelectTrigger
					className={cn("w-full min-w-20 border-none")}
					id="unit-count"
				>
					<SelectValue placeholder="Units" />
				</SelectTrigger>
				<SelectContent>
					{GAME_CONSTANTS.UNIT_COUNT_OPTIONS.map((count) => (
						<SelectItem key={count} value={count.toString()}>
							{count} units
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
