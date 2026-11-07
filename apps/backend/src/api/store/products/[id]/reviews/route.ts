import type {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../../../modules/review"
import type ReviewModuleService from "../../../../../modules/review/service"
import { createReviewWorkflow } from "../../../../../workflows/create-review"
import type { PostStoreReviewSchemaType } from "./validators"

const PAGE_SIZE = 10

/**
 * Public: approved reviews for a product with rating totals. When the caller
 * is a signed-in customer, `my_review_id` says whether they already reviewed.
 */
export const GET = async (
  req: MedusaRequest & { auth_context?: { actor_id?: string } },
  res: MedusaResponse
) => {
  const reviews: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)
  const productId = req.params.id
  const limit = Math.min(Number(req.query.limit) || PAGE_SIZE, 50)
  const offset = Math.max(Number(req.query.offset) || 0, 0)

  const [page, count] = await reviews.listAndCountReviews(
    { product_id: productId, status: "approved" },
    { take: limit, skip: offset, order: { created_at: "DESC" } }
  )

  const ratings = await reviews.listReviews(
    { product_id: productId, status: "approved" },
    { select: ["rating"] }
  )
  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let total = 0
  for (const { rating } of ratings) {
    ratingCounts[rating] = (ratingCounts[rating] ?? 0) + 1
    total += rating
  }

  const customerId = req.auth_context?.actor_id
  let myReviewId: string | null = null
  if (customerId) {
    const mine = await reviews.listReviews({
      product_id: productId,
      customer_id: customerId,
    })
    myReviewId = mine[0]?.id ?? null
  }

  res.json({
    reviews: page.map((review) => ({
      id: review.id,
      author_name: review.author_name,
      rating: review.rating,
      title: review.title,
      content: review.content,
      created_at: review.created_at,
    })),
    count,
    limit,
    offset,
    average_rating: ratings.length ? Math.round((total / ratings.length) * 10) / 10 : 0,
    rating_counts: ratingCounts,
    my_review_id: myReviewId,
  })
}

/** Signed-in customers only: add a review for the product. */
export const POST = async (
  req: AuthenticatedMedusaRequest<PostStoreReviewSchemaType>,
  res: MedusaResponse
) => {
  const { result } = await createReviewWorkflow(req.scope).run({
    input: {
      product_id: req.params.id,
      customer_id: req.auth_context.actor_id,
      rating: req.validatedBody.rating,
      title: req.validatedBody.title || null,
      content: req.validatedBody.content,
    },
  })

  res.status(201).json({
    review: {
      id: result.id,
      author_name: result.author_name,
      rating: result.rating,
      title: result.title,
      content: result.content,
      created_at: result.created_at,
    },
  })
}
