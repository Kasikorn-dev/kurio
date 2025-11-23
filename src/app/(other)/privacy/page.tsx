import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
	return (
		<div className="container mx-auto max-w-4xl space-y-6 px-4 py-4 sm:space-y-8 sm:py-6 md:py-8">
			{/* Header */}
			<div className="flex flex-col gap-4">
				<h1 className="font-bold text-2xl sm:text-3xl md:text-4xl">
					Privacy Policy
				</h1>
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
				<div className="space-y-6 rounded-lg border bg-card p-6 sm:space-y-8 sm:p-8">
					{/* Introduction */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">1. Introduction</h2>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							At Kurio, we respect your privacy and are committed to protecting
							your personal information. This Privacy Policy explains how we
							collect, use, disclose, and safeguard your information when you
							use our platform for creating educational games with AI.
						</p>
					</section>

					{/* Information We Collect */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">
							2. Information We Collect
						</h2>
						<div className="space-y-4 text-muted-foreground">
							<div>
								<h3 className="mb-2 font-semibold text-foreground text-sm sm:text-base">
									2.1 Account Information
								</h3>
								<p className="text-sm leading-relaxed sm:text-base">
									When you create an account, we collect information such as
									your email address, display name, and authentication
									credentials. If you sign up using a third-party provider
									(e.g., Google), we may receive basic profile information from
									that provider.
								</p>
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-foreground text-sm sm:text-base">
									2.2 Content You Upload
								</h3>
								<p className="text-sm leading-relaxed sm:text-base">
									We collect and store the content you upload to Kurio,
									including text, files, images, and any educational games or
									materials you create. This content is stored securely and is
									only accessible to you and authorized users you designate.
								</p>
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-foreground text-sm sm:text-base">
									2.3 Usage Information
								</h3>
								<p className="text-sm leading-relaxed sm:text-base">
									We automatically collect information about how you use Kurio,
									including pages visited, features used, time spent on the
									platform, and interactions with AI-generated content.
								</p>
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-foreground text-sm sm:text-base">
									2.4 Technical Information
								</h3>
								<p className="text-sm leading-relaxed sm:text-base">
									We collect technical information such as your IP address,
									browser type, device information, and operating system to
									ensure the security and functionality of our service.
								</p>
							</div>
						</div>
					</section>

					{/* How We Use Your Information */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">
							3. How We Use Your Information
						</h2>
						<p className="mb-2 text-muted-foreground text-sm leading-relaxed sm:text-base">
							We use the information we collect to:
						</p>
						<ul className="ml-6 list-disc space-y-2 text-muted-foreground text-sm sm:text-base">
							<li>Provide, maintain, and improve our services</li>
							<li>
								Process your content and generate AI-powered educational
								materials
							</li>
							<li>Authenticate your identity and manage your account</li>
							<li>Communicate with you about your account and our services</li>
							<li>
								Monitor and analyze usage patterns to improve user experience
							</li>
							<li>
								Detect, prevent, and address technical issues or security
								threats
							</li>
							<li>
								Comply with legal obligations and enforce our Terms of Service
							</li>
						</ul>
					</section>

					{/* AI Processing */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">
							4. AI Processing of Your Content
						</h2>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							When you upload content to Kurio, we use artificial intelligence
							models to analyze and generate educational content. Your content
							may be processed by third-party AI service providers (such as
							OpenAI) to generate games, and learning materials. We ensure that
							any third-party AI providers comply with appropriate data
							protection standards.
						</p>
					</section>

					{/* Information Sharing */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">
							5. Information Sharing and Disclosure
						</h2>
						<div className="space-y-2 text-muted-foreground">
							<p className="text-sm leading-relaxed sm:text-base">
								We do not sell your personal information. We may share your
								information only in the following circumstances:
							</p>
							<ul className="ml-6 list-disc space-y-2 text-sm sm:text-base">
								<li>
									<strong>Service Providers:</strong> We may share information
									with third-party service providers who assist us in operating
									our platform, including cloud storage providers, AI service
									providers, and analytics services.
								</li>
								<li>
									<strong>Legal Requirements:</strong> We may disclose
									information if required by law, court order, or government
									regulation.
								</li>
								<li>
									<strong>Protection of Rights:</strong> We may disclose
									information to protect our rights, property, or safety, or
									that of our users or others.
								</li>
								<li>
									<strong>Business Transfers:</strong> In the event of a merger,
									acquisition, or sale of assets, your information may be
									transferred to the acquiring entity.
								</li>
							</ul>
						</div>
					</section>

					{/* Data Security */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">6. Data Security</h2>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							We implement appropriate technical and organizational measures to
							protect your personal information against unauthorized access,
							alteration, disclosure, or destruction. However, no method of
							transmission over the internet or electronic storage is 100%
							secure, and we cannot guarantee absolute security.
						</p>
					</section>

					{/* Data Retention */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">7. Data Retention</h2>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							We retain your personal information for as long as necessary to
							provide our services and fulfill the purposes outlined in this
							Privacy Policy. When you delete your account, we will delete or
							anonymize your personal information, except where we are required
							to retain it for legal or legitimate business purposes.
						</p>
					</section>

					{/* Your Rights */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">8. Your Rights</h2>
						<p className="mb-2 text-muted-foreground text-sm leading-relaxed sm:text-base">
							Depending on your location, you may have certain rights regarding
							your personal information, including:
						</p>
						<ul className="ml-6 list-disc space-y-2 text-muted-foreground text-sm sm:text-base">
							<li>
								<strong>Access:</strong> Request access to your personal
								information
							</li>
							<li>
								<strong>Correction:</strong> Request correction of inaccurate or
								incomplete information
							</li>
							<li>
								<strong>Deletion:</strong> Request deletion of your personal
								information
							</li>
							<li>
								<strong>Portability:</strong> Request transfer of your data to
								another service
							</li>
							<li>
								<strong>Objection:</strong> Object to certain processing of your
								information
							</li>
						</ul>
						<p className="mt-4 text-sm leading-relaxed sm:text-base">
							To exercise these rights, please contact us through our support
							channels.
						</p>
					</section>

					{/* Cookies and Tracking */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">
							9. Cookies and Tracking Technologies
						</h2>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							We use cookies and similar tracking technologies to enhance your
							experience, analyze usage patterns, and improve our services. You
							can control cookie preferences through your browser settings.
							However, disabling cookies may limit your ability to use certain
							features of Kurio.
						</p>
					</section>

					{/* Children's Privacy */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">
							10. Children's Privacy
						</h2>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							Kurio is not intended for children under the age of 13. We do not
							knowingly collect personal information from children under 13. If
							you believe we have collected information from a child under 13,
							please contact us immediately, and we will take steps to delete
							such information.
						</p>
					</section>

					{/* International Transfers */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">
							11. International Data Transfers
						</h2>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							Your information may be transferred to and processed in countries
							other than your country of residence. These countries may have
							different data protection laws. By using Kurio, you consent to the
							transfer of your information to these countries.
						</p>
					</section>

					{/* Changes to Privacy Policy */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">
							12. Changes to This Privacy Policy
						</h2>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							We may update this Privacy Policy from time to time. We will
							notify you of any material changes by updating the "Last updated"
							date at the top of this page and, where appropriate, providing
							additional notice. Your continued use of Kurio after such changes
							constitutes acceptance of the updated Privacy Policy.
						</p>
					</section>

					{/* Contact */}
					<section className="space-y-4">
						<h2 className="font-bold text-xl sm:text-2xl">13. Contact Us</h2>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							If you have any questions, concerns, or requests regarding this
							Privacy Policy or our data practices, please contact us through
							our support channels.
						</p>
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
				<Button
					asChild
					className="w-full sm:size-default sm:w-auto"
					size="sm"
					variant="outline"
				>
					<Link href="/terms">Terms of Service</Link>
				</Button>
			</div>
		</div>
	)
}
