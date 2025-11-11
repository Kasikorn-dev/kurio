"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useKurioStore } from "@/stores/kurio-store"

export function DifficultySelector() {
	const { difficultyLevel, setDifficultyLevel } = useKurioStore()

	return (
		<div className="flex flex-col gap-2">
			<Label>Difficulty Level</Label>
			<div className="flex gap-2">
				{(["easy", "medium", "hard", "mixed"] as const).map((level) => (
					<Button
						key={level}
						onClick={() => setDifficultyLevel(level)}
						type="button"
						variant={difficultyLevel === level ? "default" : "outline"}
					>
						{level.charAt(0).toUpperCase() + level.slice(1)}
					</Button>
				))}
			</div>
		</div>
	)
}
