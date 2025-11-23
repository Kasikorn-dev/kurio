import { KurioCreateForm } from "@/components/custom/kurio/kurio-create-form"

export default function CreateKurioPage() {
	return (
		<div className="flex h-full flex-col items-center justify-center overflow-hidden px-4 py-4 sm:py-6">
			<div className="flex w-full max-w-4xl flex-col gap-4 sm:gap-6">
				<div className="text-center">
					<h1 className="font-bold text-2xl sm:text-3xl md:text-4xl">
						Create New Kurio
					</h1>
					<p className="mt-2 text-muted-foreground text-sm sm:text-base">
						Add files, images, or type your content to get started
					</p>
				</div>
				<KurioCreateForm />
			</div>
		</div>
	)
}
