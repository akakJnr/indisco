import { z } from "@medusajs/framework/zod"

export const PostAdminReviewStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
})

export type PostAdminReviewStatusSchemaType = z.infer<
  typeof PostAdminReviewStatusSchema
>
