import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  deleteReviewWorkflow,
  updateReviewStatusWorkflow,
} from "../../../../workflows/moderate-review"
import type { PostAdminReviewStatusSchemaType } from "../validators"

/** Admin: approve, reject or set a review back to pending. */
export const POST = async (
  req: MedusaRequest<PostAdminReviewStatusSchemaType>,
  res: MedusaResponse
) => {
  const { result } = await updateReviewStatusWorkflow(req.scope).run({
    input: { id: req.params.id, status: req.validatedBody.status },
  })

  res.json({ review: result })
}

/** Admin: permanently remove a review from the store. */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  await deleteReviewWorkflow(req.scope).run({
    input: { id: req.params.id },
  })

  res.json({ id: req.params.id, object: "review", deleted: true })
}
