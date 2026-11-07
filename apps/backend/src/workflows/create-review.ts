import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { REVIEW_MODULE } from "../modules/review"
import type ReviewModuleService from "../modules/review/service"

export type CreateReviewInput = {
  product_id: string
  customer_id: string
  rating: number
  title?: string | null
  content: string
}

const validateReviewStep = createStep(
  "validate-review",
  async (input: { product_id: string; customer_id: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const reviews: ReviewModuleService = container.resolve(REVIEW_MODULE)

    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id"],
      filters: { id: input.product_id },
    })
    if (!products.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Product not found."
      )
    }

    const existing = await reviews.listReviews({
      product_id: input.product_id,
      customer_id: input.customer_id,
    })
    if (existing.length) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "You have already reviewed this product."
      )
    }

    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["first_name", "last_name"],
      filters: { id: input.customer_id },
    })
    const customer = customers[0]
    const first = customer?.first_name?.trim() ?? ""
    const lastInitial = customer?.last_name?.trim()?.[0]
    const authorName = first
      ? lastInitial
        ? `${first} ${lastInitial}.`
        : first
      : "Verified customer"

    return new StepResponse(authorName)
  }
)

const createReviewStep = createStep(
  "create-review-step",
  async (
    input: CreateReviewInput & { author_name: string },
    { container }
  ) => {
    const reviews: ReviewModuleService = container.resolve(REVIEW_MODULE)
    const review = await reviews.createReviews({
      product_id: input.product_id,
      customer_id: input.customer_id,
      author_name: input.author_name,
      rating: input.rating,
      title: input.title ?? null,
      content: input.content,
      status: "approved",
    })
    return new StepResponse(review, review.id)
  },
  async (reviewId, { container }) => {
    if (!reviewId) {
      return
    }
    const reviews: ReviewModuleService = container.resolve(REVIEW_MODULE)
    await reviews.deleteReviews(reviewId)
  }
)

export const createReviewWorkflow = createWorkflow(
  "create-review",
  (input: CreateReviewInput) => {
    const authorName = validateReviewStep({
      product_id: input.product_id,
      customer_id: input.customer_id,
    })

    const review = createReviewStep({
      product_id: input.product_id,
      customer_id: input.customer_id,
      rating: input.rating,
      title: input.title,
      content: input.content,
      author_name: authorName,
    })

    return new WorkflowResponse(review)
  }
)
