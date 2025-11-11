import { KurioForm } from "@/components/custom/kurio/kurio-form"

export default function CreateKurioPage() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="mb-6 font-bold text-3xl">Create New Kurio</h1>
			<KurioForm />
		</div>
	)
}
