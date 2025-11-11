"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
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
		onError: (error) => {
			toast.error(error.message)
		},
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
		<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
			<div className="flex flex-col gap-2">
				<Label htmlFor="title">Title</Label>
				<Input
					disabled={createKurio.isPending}
					id="title"
					onChange={(e) => setTitle(e.target.value)}
					required
					value={title}
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					disabled={createKurio.isPending}
					id="description"
					onChange={(e) => setDescription(e.target.value)}
					value={description}
				/>
			</div>

			<DifficultySelector />

			<div className="flex flex-col gap-2">
				<Label>
					<input
						checked={autoGenEnabled}
						disabled={createKurio.isPending}
						onChange={(e) => setAutoGenEnabled(e.target.checked)}
						type="checkbox"
					/>
					<span className="ml-2">Enable Auto-generation</span>
				</Label>
				{autoGenEnabled && (
					<div className="flex flex-col gap-2">
						<Label htmlFor="threshold">Auto-gen Threshold (%)</Label>
						<Input
							disabled={createKurio.isPending}
							id="threshold"
							max="100"
							min="0"
							onChange={(e) =>
								setAutoGenThreshold(Number.parseInt(e.target.value, 10))
							}
							type="number"
							value={autoGenThreshold}
						/>
					</div>
				)}
			</div>

			<InputSelector />

			<Button disabled={createKurio.isPending} type="submit">
				{createKurio.isPending && <Spinner className="mr-2 size-4" />}
				{createKurio.isPending ? "Creating..." : "Create Kurio"}
			</Button>
		</form>
	)
}
