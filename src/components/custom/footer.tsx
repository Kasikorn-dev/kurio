import Link from "next/link"

export function Footer() {
	const currentYear = new Date().getFullYear()

	return (
		<footer className="border-t bg-background mt-16">
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-4">
					{/* Brand */}
					<div className="flex flex-col gap-4">
						<Link className="font-bold text-xl" href="/">
							Kurio
						</Link>
						<p className="text-muted-foreground text-sm">
							Create educational games powered by AI
						</p>
					</div>

					{/* Product */}
					<div className="flex flex-col gap-4">
						<h3 className="font-semibold text-sm">Product</h3>
						<ul className="flex flex-col gap-2">
							<li>
								<Link
									className="text-muted-foreground text-sm transition-colors hover:text-foreground"
									href="/create-kurio"
								>
									Kurio
								</Link>
							</li>
						</ul>
					</div>

					{/* Legal */}
					<div className="flex flex-col gap-4">
						<h3 className="font-semibold text-sm">Legal</h3>
						<ul className="flex flex-col gap-2">
							<li>
								<Link
									className="text-muted-foreground text-sm transition-colors hover:text-foreground"
									href="/terms"
								>
									Terms & Policies
								</Link>
							</li>
							<li>
								<Link
									className="text-muted-foreground text-sm transition-colors hover:text-foreground"
									href="/privacy"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									className="text-muted-foreground text-sm transition-colors hover:text-foreground"
									href="/help"
								>
									Help & Support
								</Link>
							</li>
						</ul>
					</div>

					{/* Company */}
					<div className="flex flex-col gap-4">
						<h3 className="font-semibold text-sm">Company</h3>
						<ul className="flex flex-col gap-2">
							<li>
								<Link
									className="text-muted-foreground text-sm transition-colors hover:text-foreground"
									href="/help"
								>
									About
								</Link>
							</li>
							<li>
								<a
									className="text-muted-foreground text-sm transition-colors hover:text-foreground"
									href="mailto:support@kurio.com"
								>
									Contact
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Copyright */}
				<div className="mt-8 pt-8">
					<p className="text-center text-muted-foreground text-sm">
						© {currentYear} Kurio. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	)
}
