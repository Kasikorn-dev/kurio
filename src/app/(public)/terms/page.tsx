import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
	return (
		<div className="w-full max-w-4xl space-y-8 px-4 py-12">
			{/* Header */}
			<div className="flex flex-col gap-4">
				<h1 className="font-bold text-4xl">Terms of Service</h1>
				<p className="text-muted-foreground text-sm">
					Last updated:{" "}
					{new Date().toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</p>
			</div>

			{/* Content */}
			<div className="prose prose-sm dark:prose-invert max-w-none">
				<div className="space-y-8 rounded-lg border bg-card p-8">
					{/* Introduction */}
					<section className="space-y-4">
						<h2 className="font-bold text-2xl">1. Introduction</h2>
						<p className="text-muted-foreground leading-relaxed">
							Welcome to Kurio. These Terms of Service ("Terms") govern your
							access to and use of our platform for creating educational games
							powered by AI. By accessing or using Kurio, you agree to be bound
							by these Terms.
						</p>
					</section>

					{/* Acceptance */}
					<section className="space-y-4">
						<h2 className="font-bold text-2xl">2. Acceptance of Terms</h2>
						<p className="text-muted-foreground leading-relaxed">
							By creating an account, accessing, or using Kurio, you acknowledge
							that you have read, understood, and agree to be bound by these
							Terms and our Privacy Policy. If you do not agree to these Terms,
							you may not use our service.
						</p>
					</section>

					{/* Description of Service */}
					<section className="space-y-4">
						<h2 className="font-bold text-2xl">3. Description of Service</h2>
						<p className="text-muted-foreground leading-relaxed">
							Kurio is a platform that allows users to create educational games
							and interactive learning experiences using AI-powered content
							generation. You can upload text, files, or images, and our AI will
							generate educational content including exercises, lessons, and
							units.
						</p>
					</section>

					{/* User Accounts */}
					<section className="space-y-4">
						<h2 className="font-bold text-2xl">4. User Accounts</h2>
						<div className="space-y-2 text-muted-foreground">
							<p className="leading-relaxed">
								To use Kurio, you must create an account. You agree to:
							</p>
							<ul className="ml-6 list-disc space-y-2">
								<li>
									Provide accurate, current, and complete information during
									registration
								</li>
								<li>
									Maintain and update your account information to keep it
									accurate
								</li>
								<li>
									Maintain the security of your password and account credentials
								</li>
								<li>
									Accept responsibility for all activities that occur under your
									account
								</li>
								<li>
									Notify us immediately of any unauthorized use of your account
								</li>
							</ul>
						</div>
					</section>

					{/* User Content */}
					<section className="space-y-4">
						<h2 className="font-bold text-2xl">5. User Content</h2>
						<div className="space-y-2 text-muted-foreground">
							<p className="leading-relaxed">
								You retain ownership of any content you upload or create on
								Kurio ("User Content"). By using our service, you grant us a
								license to:
							</p>
							<ul className="ml-6 list-disc space-y-2">
								<li>
									Use, store, and process your content to provide and improve
									our services
								</li>
								<li>
									Use AI models to generate educational content based on your
									content
								</li>
								<li>
									Display your content within the Kurio platform to you and
									authorized users
								</li>
							</ul>
							<p className="mt-4 leading-relaxed">
								You are solely responsible for ensuring that your User Content
								does not violate any laws, infringe on any rights, or contain
								harmful or inappropriate material.
							</p>
						</div>
					</section>

					{/* AI-Generated Content */}
					<section className="space-y-4">
						<h2 className="font-bold text-2xl">6. AI-Generated Content</h2>
						<p className="text-muted-foreground leading-relaxed">
							Kurio uses artificial intelligence to generate educational
							content. While we strive for accuracy and quality, AI-generated
							content may contain errors or inaccuracies. You are responsible
							for reviewing and verifying all AI-generated content before use.
							We do not guarantee the accuracy, completeness, or suitability of
							AI-generated content.
						</p>
					</section>

					{/* Prohibited Uses */}
					<section className="space-y-4">
						<h2 className="font-bold text-2xl">7. Prohibited Uses</h2>
						<p className="mb-2 text-muted-foreground leading-relaxed">
							You agree not to use Kurio to:
						</p>
						<ul className="ml-6 list-disc space-y-2 text-muted-foreground">
							<li>
								Violate any applicable laws, regulations, or third-party rights
							</li>
							<li>
								Upload or create content that is illegal, harmful, threatening,
								abusive, or discriminatory
							</li>
							<li>
								Impersonate any person or entity or misrepresent your
								affiliation
							</li>
							<li>
								Attempt to gain unauthorized access to our systems or other
								users' accounts
							</li>
							<li>
								Interfere with or disrupt the service or servers connected to
								the service
							</li>
							<li>
								Use the service for any commercial purpose without our express
								written consent
							</li>
						</ul>
					</section>

					{/* Intellectual Property */}
					<section className="space-y-4">
						<h2 className="font-bold text-2xl">8. Intellectual Property</h2>
						<p className="text-muted-foreground leading-relaxed">
							The Kurio platform, including its design, features, and
							functionality, is owned by us and protected by copyright,
							trademark, and other intellectual property laws. You may not copy,
							modify, distribute, or create derivative works based on our
							platform without our express written permission.
						</p>
					</section>

					{/* Termination */}
					<section className="space-y-4">
						<h2 className="font-bold text-2xl">9. Termination</h2>
						<p className="text-muted-foreground leading-relaxed">
							We reserve the right to suspend or terminate your account and
							access to Kurio at any time, with or without notice, for any
							reason, including if you violate these Terms. Upon termination,
							your right to use the service will immediately cease.
						</p>
					</section>

					{/* Disclaimer of Warranties */}
					<section className="space-y-4">
						<h2 className="font-bold text-2xl">10. Disclaimer of Warranties</h2>
						<p className="text-muted-foreground leading-relaxed">
							Kurio is provided "as is" and "as available" without warranties of
							any kind, either express or implied. We do not warrant that the
							service will be uninterrupted, secure, or error-free, or that any
							defects will be corrected.
						</p>
					</section>

					{/* Limitation of Liability */}
					<section className="space-y-4">
						<h2 className="font-bold text-2xl">11. Limitation of Liability</h2>
						<p className="text-muted-foreground leading-relaxed">
							To the maximum extent permitted by law, we shall not be liable for
							any indirect, incidental, special, consequential, or punitive
							damages, or any loss of profits or revenues, whether incurred
							directly or indirectly, or any loss of data, use, goodwill, or
							other intangible losses resulting from your use of Kurio.
						</p>
					</section>

					{/* Changes to Terms */}
					<section className="space-y-4">
						<h2 className="font-bold text-2xl">12. Changes to Terms</h2>
						<p className="text-muted-foreground leading-relaxed">
							We reserve the right to modify these Terms at any time. We will
							notify users of any material changes by updating the "Last
							updated" date at the top of this page. Your continued use of Kurio
							after such changes constitutes acceptance of the updated Terms.
						</p>
					</section>

					{/* Contact */}
					<section className="space-y-4">
						<h2 className="font-bold text-2xl">13. Contact Us</h2>
						<p className="text-muted-foreground leading-relaxed">
							If you have any questions about these Terms, please contact us
							through our support channels.
						</p>
					</section>
				</div>
			</div>

			{/* Footer Actions */}
			<div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
				<Button asChild variant="outline">
					<Link href="/">Back to Home</Link>
				</Button>
				<Button asChild variant="outline">
					<Link href="/privacy">Privacy Policy</Link>
				</Button>
			</div>
		</div>
	)
}
