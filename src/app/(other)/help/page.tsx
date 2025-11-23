import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HelpPage() {
	return (
		<div className="container mx-auto max-w-4xl space-y-6 px-4 py-4 sm:space-y-8 sm:py-6 md:py-8">
			{/* Header */}
			<div className="flex flex-col gap-4">
				<h1 className="font-bold text-2xl sm:text-3xl md:text-4xl">
					Help & Support
				</h1>
				<p className="text-muted-foreground text-sm">
					Find answers to common questions and get help with Kurio
				</p>
			</div>

			{/* Content */}
			<div className="prose prose-sm dark:prose-invert max-w-none">
				<div className="space-y-6 rounded-lg border bg-card p-6 sm:space-y-8 sm:p-8">
					{/* Getting Started */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">Getting Started</h2>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							Create your first Kurio by providing content or uploading files.
							Our AI will generate interactive educational games for you to play
							and learn.
						</p>
					</section>

					{/* Frequently Asked Questions */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">
							Frequently Asked Questions
						</h2>
						<div className="space-y-4 text-muted-foreground">
							<div>
								<h3 className="mb-2 font-semibold text-foreground text-sm sm:text-base">
									How do I create a Kurio?
								</h3>
								<p className="text-sm leading-relaxed sm:text-base">
									Go to the Create Kurio page, enter your content or upload
									files, and click Send. Our AI will generate games for you.
								</p>
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-foreground text-sm sm:text-base">
									What file types are supported?
								</h3>
								<p className="text-sm leading-relaxed sm:text-base">
									We support images, PDFs, and text files. You can upload
									multiple files at once.
								</p>
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-foreground text-sm sm:text-base">
									How do I track my progress?
								</h3>
								<p className="text-sm leading-relaxed sm:text-base">
									Your progress is automatically saved. You can view your
									completed games and units in the My Kurios page.
								</p>
							</div>
						</div>
					</section>

					{/* Contact Support */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">Contact Support</h2>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							If you have any questions or need assistance, please contact our
							support team.
						</p>
						<Button asChild className="sm:size-default" size="sm">
							<Link href="mailto:support@kurio.com">Contact Support</Link>
						</Button>
					</section>
				</div>
			</div>

			{/* Footer Actions */}
			<div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-4">
				<Button
					asChild
					className="w-full sm:size-default sm:w-auto"
					size="sm"
					variant="outline"
				>
					<Link href="/">Back to Home</Link>
				</Button>
				<div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
					<Button
						asChild
						className="w-full sm:size-default sm:w-auto"
						size="sm"
						variant="outline"
					>
						<Link href="/terms">Terms & Policies</Link>
					</Button>
					<Button
						asChild
						className="w-full sm:size-default sm:w-auto"
						size="sm"
						variant="outline"
					>
						<Link href="/privacy">Privacy Policy</Link>
					</Button>
				</div>
			</div>
		</div>
	)
}
