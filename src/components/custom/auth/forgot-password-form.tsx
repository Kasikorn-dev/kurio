"use client"

import { zodResolver } from "@hookform/resolvers/zod"
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
import {
	type ForgotPasswordInput,
	forgotPasswordSchema,
} from "@/lib/auth/validation-schemas"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

export function ForgotPasswordForm() {
	const [isLoading, setIsLoading] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)
	const form = useForm<ForgotPasswordInput>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	})

	const onSubmit = async (data: ForgotPasswordInput) => {
		setIsLoading(true)

		try {
			const supabase = createBrowserSupabaseClient()
			const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
				redirectTo: `${window.location.origin}/reset-password`,
			})

			if (error) {
				// Supabase doesn't reveal if email exists for security reasons
				// Always show success message to prevent email enumeration
				// In production, log to error tracking service instead of console
				// Show success message even if error (security best practice)
				// This prevents attackers from checking if emails exist
				setIsSuccess(true)
				toast.success(
					"If this email exists, a password reset link has been sent. Please check your email",
				)
				return
			}

			setIsSuccess(true)
			toast.success("Password reset email sent. Please check your email")
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

	if (isSuccess) {
		return (
			<div className="space-y-4 text-center">
				<div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
					<p className="text-green-800 dark:text-green-200">
						Password reset email sent. Please check your email and follow the
						instructions.
					</p>
				</div>
				<Button
					className="w-full"
					onClick={() => {
						setIsSuccess(false)
						form.reset()
					}}
					variant="outline"
				>
					Send email again
				</Button>
			</div>
		)
	}

	return (
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
									placeholder="your@email.com"
									type="email"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button className="w-full" disabled={isLoading} type="submit">
					{isLoading && <Spinner className="mr-2 size-4" />}
					{isLoading ? "Sending email..." : "Send reset link"}
				</Button>
			</form>
		</Form>
	)
}
