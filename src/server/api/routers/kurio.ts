import { desc, eq } from "drizzle-orm"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { kurioResources, kurios } from "@/server/db/schemas"

export const kurioRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.kurios.findMany({
			where: (kurios, { eq }) => eq(kurios.userId, ctx.user.id),
			orderBy: [desc(kurios.createdAt)],
			with: {
				resources: true,
			},
		})
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const kurio = await ctx.db.query.kurios.findFirst({
				where: (kurios, { eq }) => eq(kurios.id, input.id),
				with: {
					resources: {
						orderBy: (resources, { asc }) => [asc(resources.orderIndex)],
					},
					units: {
						orderBy: (units, { asc }) => [asc(units.orderIndex)],
						with: {
							lessons: {
								orderBy: (lessons, { asc }) => [asc(lessons.orderIndex)],
								with: {
									exercises: {
										orderBy: (exercises, { asc }) => [
											asc(exercises.orderIndex),
										],
									},
								},
							},
						},
					},
				},
			})

			if (!kurio) {
				throw new Error("Kurio not found")
			}

			if (kurio.userId !== ctx.user.id) {
				throw new Error("Unauthorized")
			}

			return kurio
		}),

	create: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1).max(255),
				description: z.string().optional(),
				difficultyLevel: z.enum(["easy", "medium", "hard", "mixed"]),
				autoGenEnabled: z.boolean().default(true),
				autoGenThreshold: z.number().int().min(0).max(100).default(75),
				aiModel: z.string().default("gpt-4o-mini"),
				resources: z.array(
					z.object({
						resourceType: z.enum(["text", "file", "image"]),
						resourceContent: z.string().optional(),
						resourceFileUrl: z.string().url().optional(),
						resourceFileType: z.string().optional(),
						orderIndex: z.number().int(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [newKurio] = await ctx.db
				.insert(kurios)
				.values({
					userId: ctx.user.id,
					title: input.title,
					description: input.description,
					difficultyLevel: input.difficultyLevel,
					autoGenEnabled: input.autoGenEnabled,
					autoGenThreshold: input.autoGenThreshold,
					aiModel: input.aiModel,
					status: "draft",
				})
				.returning()

			if (input.resources.length > 0) {
				await ctx.db.insert(kurioResources).values(
					input.resources.map((resource) => ({
						kurioId: newKurio.id,
						resourceType: resource.resourceType,
						resourceContent: resource.resourceContent,
						resourceFileUrl: resource.resourceFileUrl,
						resourceFileType: resource.resourceFileType,
						orderIndex: resource.orderIndex,
					})),
				)
			}

			return newKurio
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).max(255).optional(),
				description: z.string().optional(),
				difficultyLevel: z.enum(["easy", "medium", "hard", "mixed"]).optional(),
				autoGenEnabled: z.boolean().optional(),
				autoGenThreshold: z.number().int().min(0).max(100).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input

			const [updated] = await ctx.db
				.update(kurios)
				.set({
					...updateData,
					updatedAt: new Date(),
				})
				.where(eq(kurios.id, id))
				.returning()

			if (!updated) {
				throw new Error("Kurio not found")
			}

			if (updated.userId !== ctx.user.id) {
				throw new Error("Unauthorized")
			}

			return updated
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const kurio = await ctx.db.query.kurios.findFirst({
				where: (kurios, { eq }) => eq(kurios.id, input.id),
			})

			if (!kurio) {
				throw new Error("Kurio not found")
			}

			if (kurio.userId !== ctx.user.id) {
				throw new Error("Unauthorized")
			}

			await ctx.db.delete(kurios).where(eq(kurios.id, input.id))

			return { success: true }
		}),
})
