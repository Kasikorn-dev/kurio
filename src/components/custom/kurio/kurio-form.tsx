"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useKurioStore } from "@/stores/kurio-store"
import { api } from "@/trpc/react"
import { DifficultySelector } from "./difficulty-selector"
import { InputSelector } from "./input-selector"

export function KurioForm() {
	const router = useRouter()
	const {
		title,
		description,
		difficultyLevel,
		autoGenEnabled,
		autoGenThreshold,
		resources,
		setTitle,
		setDescription,
		setAutoGenEnabled,
		setAutoGenThreshold,
		reset,
	} = useKurioStore()

	const createKurio = api.kurio.create.useMutation({
		onSuccess: () => {
			reset()
			router.push("/kurios")
		},
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		await createKurio.mutateAsync({
			title,
			description: description || undefined,
			difficultyLevel,
			autoGenEnabled,
			autoGenThreshold,
			resources: resources.map((r) => ({
				resourceType: r.resourceType,
				resourceContent: r.resourceContent,
				resourceFileUrl: r.resourceFileUrl,
				resourceFileType: r.resourceFileType,
				orderIndex: r.orderIndex,
			})),
		})
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<Label htmlFor="title">Title</Label>
				<Input
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
					disabled={createKurio.isPending}
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					disabled={createKurio.isPending}
				/>
			</div>

			<DifficultySelector />

			<div className="flex flex-col gap-2">
				<Label>
					<input
						type="checkbox"
						checked={autoGenEnabled}
						onChange={(e) => setAutoGenEnabled(e.target.checked)}
						disabled={createKurio.isPending}
					/>
					<span className="ml-2">Enable Auto-generation</span>
				</Label>
				{autoGenEnabled && (
					<div className="flex flex-col gap-2">
						<Label htmlFor="threshold">Auto-gen Threshold (%)</Label>
						<Input
							id="threshold"
							type="number"
							min="0"
							max="100"
							value={autoGenThreshold}
							onChange={(e) =>
								setAutoGenThreshold(Number.parseInt(e.target.value, 10))
							}
							disabled={createKurio.isPending}
						/>
					</div>
				)}
			</div>

			<InputSelector />

			<Button type="submit" disabled={createKurio.isPending}>
				{createKurio.isPending ? "Creating..." : "Create Kurio"}
			</Button>
		</form>
	)
}

