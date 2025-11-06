import { LoginForm } from "@/components/custom/auth/login-form"
import Link from "next/link"

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-md space-y-8 rounded-lg border p-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold">Welcome to Kurio</h1>
					<p className="mt-2 text-muted-foreground">Sign in to your account</p>
				</div>
				<LoginForm />
				<div className="text-center text-sm">
					Don't have an account?{" "}
					<Link href="/signup" className="text-primary hover:underline">
						Sign up
					</Link>
				</div>
			</div>
		</div>
	)
}

