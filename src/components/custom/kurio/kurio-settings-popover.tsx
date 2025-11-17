"use client"

import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { useKurioStore } from "@/stores/kurio-store"
import { AutoGenToggle } from "./auto-gen-toggle"
import { UnitCountSelector } from "./unit-count-selector"

export function KurioSettingsPopover() {
	const { autoGenEnabled, unitCount, setAutoGenEnabled, setUnitCount } =
		useKurioStore()

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					className="size-8 shrink-0"
					size="icon"
					type="button"
					variant="ghost"
				>
					<Settings className="size-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-80" side="top">
				<div className="space-y-4">
					<div className="flex items-center justify-between gap-4">
						<div className="flex-1">
							<p className="font-medium text-sm">Auto-generation</p>
							<p className="text-muted-foreground text-xs">
								Auto-generate games when player reaches 80% completion
							</p>
						</div>
						<AutoGenToggle
							enabled={autoGenEnabled}
							onToggle={setAutoGenEnabled}
						/>
					</div>

					{!autoGenEnabled && (
						<div className="space-y-2">
							<p className="font-medium text-sm">Number of Units</p>
							<UnitCountSelector onChange={setUnitCount} value={unitCount} />
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	)
}
