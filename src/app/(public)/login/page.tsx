import Link from "next/link"
import { LoginForm } from "@/components/custom/auth/login-form"

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-md space-y-8 rounded-lg border p-8">
				<div className="text-center">
					<h1 className="font-bold text-3xl">Welcome to Kurio</h1>
					<p className="mt-2 text-muted-foreground">Sign in to your account</p>
				</div>
				<LoginForm />
				<div className="text-center text-sm">
					Don't have an account?{" "}
					<Link className="text-primary hover:underline" href="/signup">
						Sign up
					</Link>
				</div>
			</div>
		</div>
	)
}
