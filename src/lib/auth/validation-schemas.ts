import { z } from "zod"

export const loginSchema = z.object({
	email: z.string().min(1, "Email is required").email("Invalid email format"),
	password: z.string().min(1, "Password is required"),
})

export const signupSchema = z.object({
	displayName: z
		.string()
		.min(1, "Display name is required")
		.max(255, "Display name is too long"),
	email: z.string().min(1, "Email is required").email("Invalid email format"),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(72, "Password is too long"),
})

export const forgotPasswordSchema = z.object({
	email: z.string().min(1, "Email is required").email("Invalid email format"),
})

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.max(72, "Password is too long"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	})

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.max(72, "Password is too long"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
