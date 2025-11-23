"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
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
import { getEmailCheckErrorMessage } from "@/lib/auth/email-check-utils"
import { getAuthErrorMessage } from "@/lib/auth/error-messages"
import { type LoginInput, loginSchema } from "@/lib/auth/validation-schemas"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { api } from "@/trpc/react"
import { GoogleSignInButton } from "./google-signin-button"
import { PasswordInput } from "./password-input"

export function LoginForm() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const form = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	})

	const utils = api.useUtils()

	const onSubmit = async (data: LoginInput) => {
		setIsLoading(true)

		try {
			const supabase = createBrowserSupabaseClient()
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: data.email,
				password: data.password,
			})

			if (signInError) {
				// Check if error is "Invalid login credentials"
				if (signInError.message.includes("Invalid login credentials")) {
					try {
						const checkResult = await utils.auth.checkEmail.fetch({
							email: data.email,
						})
						const errorMessage = getEmailCheckErrorMessage(
							checkResult as Parameters<typeof getEmailCheckErrorMessage>[0],
						)
						toast.error(errorMessage)
					} catch {
						toast.error(
							"Invalid email or password. Please check your credentials and try again.",
						)
					}
					return
				}

				// For other errors, use the standard error message handler
				toast.error(getAuthErrorMessage(signInError))
				return
			}

			toast.success("Signed in successfully")
			router.push("/kurio")
			router.refresh()
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
								<div className="flex items-center justify-between">
									<FormLabel>Password</FormLabel>
									<Link
										className="text-muted-foreground text-sm hover:underline"
										href="/forgot-password"
									>
										Forgot your password?
									</Link>
								</div>
								<FormControl>
									<PasswordInput
										disabled={isLoading}
										placeholder="••••••••"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button className="w-full" disabled={isLoading} type="submit">
						{isLoading && <Spinner className="mr-2 size-4" />}
						{isLoading ? "Signing in..." : "Login"}
					</Button>
				</form>
			</Form>
		</div>
	)
}
