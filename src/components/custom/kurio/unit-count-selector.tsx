"use client"

import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

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
		<div className={className}>
			<Label className="sr-only" htmlFor="unit-count">
				Number of units
			</Label>
			<Select
				onValueChange={(val) =>
					onChange(val ? Number.parseInt(val, 10) : undefined)
				}
				value={value?.toString() ?? ""}
			>
				<SelectTrigger className="w-32" id="unit-count">
					<SelectValue placeholder="Units" />
				</SelectTrigger>
				<SelectContent>
					{[1, 3, 5, 10].map((count) => (
						<SelectItem key={count} value={count.toString()}>
							{count} {count === 1 ? "unit" : "units"}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
