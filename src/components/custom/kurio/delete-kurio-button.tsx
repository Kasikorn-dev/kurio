"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/trpc/react"

type DeleteKurioButtonProps = {
	kurioId: string
	kurioTitle: string
}

export function DeleteKurioButton({
	kurioId,
	kurioTitle,
}: DeleteKurioButtonProps) {
	const router = useRouter()
	const [isOpen, setIsOpen] = useState(false)
	const deleteKurio = api.kurio.delete.useMutation({
		onSuccess: () => {
			toast.success("Kurio deleted successfully")
			router.push("/kurio")
			router.refresh()
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete kurio")
		},
	})

	const handleDelete = async () => {
		await deleteKurio.mutateAsync({ id: kurioId })
		setIsOpen(false)
	}

	return (
		<AlertDialog onOpenChange={setIsOpen} open={isOpen}>
			<AlertDialogTrigger asChild>
				<Button disabled={deleteKurio.isPending} variant="destructive">
					Delete
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently delete "{kurioTitle}". This action cannot be
						undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						disabled={deleteKurio.isPending}
						onClick={handleDelete}
					>
						{deleteKurio.isPending && <Spinner className="mr-2 size-4" />}
						{deleteKurio.isPending ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
