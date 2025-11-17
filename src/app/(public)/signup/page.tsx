import Link from "next/link"
import { SignupForm } from "@/components/custom/auth/signup-form"

export default function SignupPage() {
	return (
		<div className="w-full max-w-md space-y-8">
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
					<h2 className="font-bold text-2xl">Create an account</h2>
					<p className="mt-2 text-muted-foreground text-sm">
						Sign up with your Google account
					</p>
				</div>
				<SignupForm />
			</div>

			{/* Sign In Link */}
			<div className="text-center text-muted-foreground text-sm">
				Already have an account?{" "}
				<Link
					className="font-medium text-foreground hover:underline"
					href="/login"
				>
					Sign in
				</Link>
			</div>

			{/* Terms and Privacy */}
			<div className="text-center text-muted-foreground text-xs">
				By clicking sign up, you agree to our{" "}
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
