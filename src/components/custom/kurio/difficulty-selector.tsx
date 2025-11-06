"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useKurioStore } from "@/stores/kurio-store"
import type { Resource } from "@/stores/kurio-store"

export function DifficultySelector() {
	const { difficultyLevel, setDifficultyLevel } = useKurioStore()

	return (
		<div className="flex flex-col gap-2">
			<Label>Difficulty Level</Label>
			<div className="flex gap-2">
				{(["easy", "medium", "hard", "mixed"] as const).map((level) => (
					<Button
						key={level}
						type="button"
						variant={difficultyLevel === level ? "default" : "outline"}
						onClick={() => setDifficultyLevel(level)}
					>
						{level.charAt(0).toUpperCase() + level.slice(1)}
					</Button>
				))}
			</div>
		</div>
	)
}

