"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { getAuthErrorMessage } from "@/lib/auth/error-messages"
import { type SignupInput, signupSchema } from "@/lib/auth/validation-schemas"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { GoogleSignInButton } from "./google-signin-button"
import { PasswordInput } from "./password-input"
import { PasswordStrengthIndicator } from "./password-strength-indicator"

export function SignupForm() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const form = useForm<SignupInput>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			displayName: "",
			email: "",
			password: "",
		},
	})

	const password = form.watch("password")

	const onSubmit = async (data: SignupInput) => {
		setIsLoading(true)

		try {
			const supabase = createBrowserSupabaseClient()
			const { data: signUpData, error: signUpError } =
				await supabase.auth.signUp({
					email: data.email,
					password: data.password,
					options: {
						data: {
							display_name: data.displayName,
						},
					},
				})

			if (signUpError) {
				// Supabase will return specific errors like "User already registered"
				toast.error(getAuthErrorMessage(signUpError))
				return
			}

			if (signUpData.user) {
				// Profile will be created automatically by database trigger
				// Trigger reads display_name from raw_user_meta_data
				toast.success("Account created successfully")
				router.push("/kurio")
				router.refresh()
			}
		} catch (err) {
			toast.error(
				err instanceof Error
					? getAuthErrorMessage(err)
					: "An error occurred. Please try again",
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="space-y-6">
			{/* Social Login Buttons */}
			<div className="space-y-3">
				<GoogleSignInButton />
			</div>

			{/* Separator */}
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs">
					<span className="bg-card px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>

			{/* Email/Password Form */}
			<Form {...form}>
				<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="displayName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Display Name</FormLabel>
								<FormControl>
									<Input
										disabled={isLoading}
										placeholder="Your name"
										type="text"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										disabled={isLoading}
										placeholder="m@example.com"
										type="email"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<PasswordInput
										disabled={isLoading}
										placeholder="••••••••"
										{...field}
									/>
								</FormControl>
								{password && <PasswordStrengthIndicator password={password} />}
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button className="w-full" disabled={isLoading} type="submit">
						{isLoading && <Spinner className="mr-2 size-4" />}
						{isLoading ? "Creating account..." : "Sign Up"}
					</Button>
				</form>
			</Form>
		</div>
	)
}
