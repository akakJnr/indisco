import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { REVIEW_MODULE } from "../modules/review"
import type ReviewModuleService from "../modules/review/service"

export type ReviewStatus = "pending" | "approved" | "rejected"

const updateReviewStatusStep = createStep(
  "update-review-status-step",
  async (
    input: { id: string; status: ReviewStatus },
    { container }
  ) => {
    const reviews: ReviewModuleService = container.resolve(REVIEW_MODULE)

    const [existing] = await reviews.listReviews({ id: input.id })
    if (!existing) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Review not found.")
    }

    const updated = await reviews.updateReviews({
      id: input.id,
      status: input.status,
    })
    return new StepResponse(updated, { id: input.id, status: existing.status })
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const reviews: ReviewModuleService = container.resolve(REVIEW_MODULE)
    await reviews.updateReviews({ id: previous.id, status: previous.status })
  }
)

export const updateReviewStatusWorkflow = createWorkflow(
  "update-review-status",
  (input: { id: string; status: ReviewStatus }) => {
    const review = updateReviewStatusStep(input)
    return new WorkflowResponse(review)
  }
)

const deleteReviewStep = createStep(
  "delete-review-step",
  async (input: { id: string }, { container }) => {
    const reviews: ReviewModuleService = container.resolve(REVIEW_MODULE)

    const [existing] = await reviews.listReviews({ id: input.id })
    if (!existing) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Review not found.")
    }

    // Soft delete, so the step can be compensated.
    await reviews.softDeleteReviews(input.id)
    return new StepResponse({ id: input.id }, input.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const reviews: ReviewModuleService = container.resolve(REVIEW_MODULE)
    await reviews.restoreReviews(id)
  }
)

export const deleteReviewWorkflow = createWorkflow(
  "delete-review",
  (input: { id: string }) => {
    const deleted = deleteReviewStep(input)
    return new WorkflowResponse(deleted)
  }
)
