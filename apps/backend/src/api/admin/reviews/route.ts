import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { REVIEW_MODULE } from "../../../modules/review"
import type ReviewModuleService from "../../../modules/review/service"

const STATUSES = ["pending", "approved", "rejected"]

/** Admin: every review (newest first), with the product it belongs to. */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const reviews: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const limit = Math.min(Number(req.query.limit) || 20, 100)
  const offset = Math.max(Number(req.query.offset) || 0, 0)
  const status =
    typeof req.query.status === "string" && STATUSES.includes(req.query.status)
      ? req.query.status
      : undefined

  const [rows, count] = await reviews.listAndCountReviews(
    status ? { status: status as "pending" | "approved" | "rejected" } : {},
    { take: limit, skip: offset, order: { created_at: "DESC" } }
  )

  const productIds = [...new Set(rows.map((review) => review.product_id))]
  const productsById = new Map<string, { title: string; handle: string }>()
  if (productIds.length) {
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title", "handle"],
      filters: { id: productIds },
    })
    for (const product of products) {
      productsById.set(product.id, {
        title: product.title,
        handle: product.handle,
      })
    }
  }

  res.json({
    reviews: rows.map((review) => ({
      ...review,
      product: productsById.get(review.product_id) ?? null,
    })),
    count,
    limit,
    offset,
  })
}
