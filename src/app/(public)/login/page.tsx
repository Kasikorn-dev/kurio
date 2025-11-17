import Link from "next/link"
import { LoginForm } from "@/components/custom/auth/login-form"
import { LoginToastHandler } from "@/components/custom/auth/login-toast-handler"

type LoginPageProps = {
	searchParams: Promise<{
		error?: string
		info?: string
		message?: string
	}>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const params = await searchParams

	return (
		<div className="w-full max-w-md space-y-8">
			<LoginToastHandler
				error={params.error}
				info={params.info}
				message={params.message}
			/>
			{/* Logo/Brand */}
			<div className="flex flex-col items-center gap-2">
				<div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-card">
					<svg
						aria-label="Kurio logo"
						className="size-6"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<title>Kurio</title>
						<path
							d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
				{/* <h1 className="font-bold text-xl">Kurio</h1> */}
			</div>

			{/* Main Card */}
			<div className="rounded-lg border bg-card p-8 shadow-sm">
				<div className="mb-6">
					<h2 className="font-bold text-2xl">Welcome back</h2>
					<p className="mt-2 text-muted-foreground text-sm">
						Login with your Google account
					</p>
				</div>
				<LoginForm />
			</div>

			{/* Sign Up Link */}
			<div className="text-center text-muted-foreground text-sm">
				Don't have an account?{" "}
				<Link
					className="font-medium text-foreground hover:underline"
					href="/signup"
				>
					Sign up
				</Link>
			</div>

			{/* Terms and Privacy */}
			<div className="text-center text-muted-foreground text-xs">
				By clicking login, you agree to our{" "}
				<Link className="underline hover:text-foreground" href="/terms">
					Terms of Service
				</Link>{" "}
				and{" "}
				<Link className="underline hover:text-foreground" href="/privacy">
					Privacy Policy
				</Link>
				.
			</div>
		</div>
	)
}
