import Link from "next/link"
import { ForgotPasswordForm } from "@/components/custom/auth/forgot-password-form"

export default function ForgotPasswordPage() {
	return (
		<div className="w-full max-w-md space-y-8">
			<div className="text-center">
				<h1 className="font-bold text-3xl">Forgot Password?</h1>
				<p className="mt-2 text-muted-foreground">
					Enter your email address and we'll send you a password reset link
				</p>
			</div>
			<ForgotPasswordForm />
			<div className="text-center text-sm">
				<Link className="text-primary hover:underline" href="/login">
					← Back to sign in
				</Link>
			</div>
		</div>
	)
}
