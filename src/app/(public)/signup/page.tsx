import Link from "next/link"
import { SignupForm } from "@/components/custom/auth/signup-form"

export default function SignupPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-md space-y-8 rounded-lg border p-8">
				<div className="text-center">
					<h1 className="font-bold text-3xl">Create an account</h1>
					<p className="mt-2 text-muted-foreground">
						Sign up to start creating games
					</p>
				</div>
				<SignupForm />
				<div className="text-center text-sm">
					Already have an account?{" "}
					<Link className="text-primary hover:underline" href="/login">
						Sign in
					</Link>
				</div>
			</div>
		</div>
	)
}
