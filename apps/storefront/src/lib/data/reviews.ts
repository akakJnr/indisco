"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type Review = {
  id: string
  author_name: string
  rating: number
  title: string | null
  content: string
  created_at: string
}

export type ReviewsResponse = {
  reviews: Review[]
  count: number
  limit: number
  offset: number
  average_rating: number
  rating_counts: Record<string, number>
  my_review_id: string | null
}

export type ReviewsResult = ReviewsResponse & { signed_in: boolean }

export async function fetchReviews(
  productId: string,
  offset = 0,
  limit = 10
): Promise<ReviewsResult> {
  const headers = { ...(await getAuthHeaders()) }

  const data = await sdk.client.fetch<ReviewsResponse>(
    `/store/products/${productId}/reviews`,
    {
      method: "GET",
      query: { offset, limit },
      headers,
      cache: "no-store",
    }
  )

  return { ...data, signed_in: "authorization" in headers }
}

export type SubmitReviewResult =
  | { ok: true; review: Review }
  | { ok: false; error: string }

export async function submitReview(
  productId: string,
  input: { rating: number; title?: string; content: string }
): Promise<SubmitReviewResult> {
  const headers = { ...(await getAuthHeaders()) }

  if (!("authorization" in headers)) {
    return { ok: false, error: "Please sign in to write a review." }
  }

  try {
    const { review } = await sdk.client.fetch<{ review: Review }>(
      `/store/products/${productId}/reviews`,
      {
        method: "POST",
        body: input,
        headers,
        cache: "no-store",
      }
    )
    return { ok: true, review }
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "We could not save your review. Please try again."
    return { ok: false, error: message }
  }
}
