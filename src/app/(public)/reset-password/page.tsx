import Link from "next/link"
import { ResetPasswordForm } from "@/components/custom/auth/reset-password-form"

export default function ResetPasswordPage() {
	return (
		<div className="w-full max-w-md space-y-8">
			<div className="text-center">
				<h1 className="font-bold text-3xl">Reset Password</h1>
				<p className="mt-2 text-muted-foreground">Enter your new password</p>
			</div>
			<ResetPasswordForm />
			<div className="text-center text-sm">
				<Link className="text-primary hover:underline" href="/login">
					← Back to sign in
				</Link>
			</div>
		</div>
	)
}
