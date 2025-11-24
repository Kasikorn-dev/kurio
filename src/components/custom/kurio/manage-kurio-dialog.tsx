"use client"

import { Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { api } from "@/trpc/react"
import { DeleteKurioButton } from "./delete-kurio-button"
import type { KurioForCard } from "./types"

type ManageKurioDialogProps = {
	kurio: KurioForCard & {
		autoGenEnabled: boolean
	}
}

export function ManageKurioDialog({ kurio }: ManageKurioDialogProps) {
	const [open, setOpen] = useState(false)
	const [title, setTitle] = useState(kurio.title)
	const [description, setDescription] = useState(kurio.description || "")
	const [autoGenEnabled, setAutoGenEnabled] = useState(kurio.autoGenEnabled)

	// Sync title and description when kurio prop changes
	useEffect(() => {
		setTitle(kurio.title)
		setDescription(kurio.description || "")
		setAutoGenEnabled(kurio.autoGenEnabled)
	}, [kurio.title, kurio.description, kurio.autoGenEnabled])

	const utils = api.useUtils()
	const updateKurio = api.kurio.update.useMutation({
		onSuccess: () => {
			toast.success("Kurio updated successfully")
			utils.kurio.getById.invalidate({ id: kurio.id })
			setOpen(false)
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update kurio")
		},
	})

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		await updateKurio.mutateAsync({
			id: kurio.id,
			title,
			description: description || undefined,
			autoGenEnabled,
		})
	}

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button className="absolute top-4 right-4" size="icon" variant="ghost">
					<Settings className="size-5" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Manage Kurio</DialogTitle>
					<DialogDescription>
						Edit your kurio settings and information
					</DialogDescription>
				</DialogHeader>
				<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-2">
						<Label htmlFor="title">Title</Label>
						<Input
							disabled={updateKurio.isPending}
							id="title"
							onChange={(e) => setTitle(e.target.value)}
							required
							value={title}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							disabled={updateKurio.isPending}
							id="description"
							onChange={(e) => setDescription(e.target.value)}
							value={description}
						/>
					</div>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center justify-between">
								<Label htmlFor="autoGenEnabled">Auto-generate games</Label>
								<Switch
									checked={autoGenEnabled}
									disabled={updateKurio.isPending}
									id="autoGenEnabled"
									onCheckedChange={setAutoGenEnabled}
								/>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<p>
								Automatically generate new units when you complete existing ones
							</p>
						</TooltipContent>
					</Tooltip>
					<DialogFooter className="flex-col gap-2 sm:flex-row">
						<div className="flex flex-1 justify-start">
							<DeleteKurioButton kurioId={kurio.id} kurioTitle={kurio.title} />
						</div>
						<div className="flex gap-2">
							<Button
								disabled={updateKurio.isPending}
								onClick={() => setOpen(false)}
								type="button"
								variant="outline"
							>
								Cancel
							</Button>
							<Button disabled={updateKurio.isPending} type="submit">
								{updateKurio.isPending && <Spinner className="mr-2 size-4" />}
								{updateKurio.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
