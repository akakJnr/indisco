import { z } from "@medusajs/framework/zod"

export const PostStoreReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(100).optional(),
  content: z.string().trim().min(10).max(2000),
})

export type PostStoreReviewSchemaType = z.infer<typeof PostStoreReviewSchema>
