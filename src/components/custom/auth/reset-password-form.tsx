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
import { PasswordInput } from "./password-input"
import { Spinner } from "@/components/ui/spinner"
import { usePasswordReset } from "@/hooks/use-password-reset"
import { getAuthErrorMessage } from "@/lib/auth/error-messages"
import {
	type ResetPasswordInput,
	resetPasswordSchema,
} from "@/lib/auth/validation-schemas"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { PasswordStrengthIndicator } from "./password-strength-indicator"

export function ResetPasswordForm() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const { isCheckingSession, error } = usePasswordReset()

	const form = useForm<ResetPasswordInput>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	})

	const password = form.watch("password")

	const onSubmit = async (data: ResetPasswordInput) => {
		setIsLoading(true)

		try {
			const supabase = createBrowserSupabaseClient()

			// Verify we have a valid session
			const {
				data: { session },
			} = await supabase.auth.getSession()

			if (!session) {
				// Check if hash fragment exists (still processing)
				if (
					typeof window !== "undefined" &&
					window.location.hash?.includes("access_token")
				) {
					toast.error(
						"Please wait a moment for the reset link to be processed, then try again.",
					)
				} else {
					toast.error(
						"Your session has expired. Please request a new password reset link.",
					)
				}
				return
			}

			// Update password
			const { error: updateError } = await supabase.auth.updateUser({
				password: data.password,
			})

			if (updateError) {
				toast.error(getAuthErrorMessage(updateError))
				return
			}

			toast.success("Password reset successfully")
			router.push("/login")
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

	// Show loading state while checking session
	if (isCheckingSession) {
		return (
			<div className="space-y-4 text-center">
				<Spinner className="mx-auto size-8" />
				<p className="text-muted-foreground text-sm">Verifying reset link...</p>
			</div>
		)
	}

	// Show error message if error is present
	if (error?.hasError) {
		return (
			<div className="space-y-4 text-center">
				<div className="rounded-lg bg-destructive/10 p-4">
					<p className="text-destructive">{error.message}</p>
				</div>
				<Button
					className="w-full"
					onClick={() => router.push("/forgot-password")}
					variant="outline"
				>
					Request new reset link
				</Button>
			</div>
		)
	}

	// Check if we have a valid session (Supabase sets session automatically from reset link)
	// We don't need to check for token parameter as Supabase handles it via hash fragment
	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>New Password</FormLabel>
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
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm Password</FormLabel>
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
					{isLoading ? "Resetting password..." : "Reset Password"}
				</Button>
			</form>
		</Form>
	)
}
