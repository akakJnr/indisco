"use client"

import {
  fetchReviews,
  submitReview,
  type Review,
  type ReviewsResult,
} from "@lib/data/reviews"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import StarRating from "@modules/common/components/star-rating"
import { Button, clx } from "@modules/common/components/ui"
import { useCallback, useEffect, useState } from "react"

const PAGE_SIZE = 10
const STAR_PATH =
  "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

function RatingPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (rating: number) => void
}) {
  const [hover, setHover] = useState(0)
  const shown = hover || value

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Your rating"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8">
            <path
              d={STAR_PATH}
              fill={star <= shown ? "#F59E0B" : "#E5E7EB"}
              stroke={star <= shown ? "#D97706" : "#D1D5DB"}
              strokeWidth="1"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}

function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId: string
  onSubmitted: (review: Review) => void
}) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (rating < 1) {
      setError("Please choose a star rating.")
      return
    }
    if (content.trim().length < 10) {
      setError("Please write at least 10 characters.")
      return
    }

    setSubmitting(true)
    const result = await submitReview(productId, {
      rating,
      title: title.trim() || undefined,
      content: content.trim(),
    })
    setSubmitting(false)

    if (result.ok) {
      onSubmitted(result.review)
    } else {
      setError(result.error)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-grey-10 bg-white p-6 shadow-sm"
      data-testid="review-form"
    >
      <h3 className="text-lg font-bold text-grey-90">Write a review</h3>
      <p className="mt-1 text-sm text-grey-50">
        Share what you think so other shoppers can decide.
      </p>

      <div className="mt-5">
        <RatingPicker value={rating} onChange={setRating} />
      </div>

      <label className="mt-5 block text-sm font-semibold text-grey-70">
        Title <span className="font-normal text-grey-40">(optional)</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Sum it up in a few words"
          className="mt-1.5 w-full rounded-xl border border-grey-20 px-4 py-2.5 text-sm font-normal text-grey-80 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          data-testid="review-title-input"
        />
      </label>

      <label className="mt-4 block text-sm font-semibold text-grey-70">
        Your review
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="What did you like or dislike? How was the quality?"
          className="mt-1.5 w-full resize-y rounded-xl border border-grey-20 px-4 py-2.5 text-sm font-normal text-grey-80 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          data-testid="review-content-input"
        />
      </label>

      {error && (
        <p className="mt-3 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="large"
        className="mt-5"
        isLoading={submitting}
        data-testid="review-submit-button"
      >
        Post review
      </Button>
    </form>
  )
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [data, setData] = useState<ReviewsResult | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [failed, setFailed] = useState(false)
  const [justPosted, setJustPosted] = useState(false)

  const load = useCallback(async () => {
    try {
      const result = await fetchReviews(productId, 0, PAGE_SIZE)
      setData(result)
      setReviews(result.reviews)
      setFailed(false)
    } catch {
      setFailed(true)
    }
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const result = await fetchReviews(productId, reviews.length, PAGE_SIZE)
      setReviews((current) => [...current, ...result.reviews])
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSubmitted = async () => {
    setJustPosted(true)
    await load()
  }

  if (failed) {
    return (
      <section className="content-container pt-16" data-testid="product-reviews">
        <h2 className="text-2xl font-extrabold tracking-tight text-grey-90">
          Customer reviews
        </h2>
        <p className="mt-3 text-sm text-grey-50">
          Reviews are unavailable right now. Please try again shortly.
        </p>
      </section>
    )
  }

  const total = data?.count ?? 0
  const average = data?.average_rating ?? 0

  return (
    <section className="content-container pt-16" data-testid="product-reviews">
      <h2 className="text-2xl font-extrabold tracking-tight text-grey-90 small:text-3xl">
        Customer reviews
      </h2>

      {!data ? (
        <div className="mt-8 h-40 animate-pulse rounded-2xl bg-grey-10" />
      ) : (
        <div className="mt-8 grid gap-10 small:grid-cols-12">
          <div className="flex flex-col gap-6 small:col-span-4">
            <div className="rounded-2xl border border-grey-10 bg-white p-6 shadow-sm">
              {total > 0 ? (
                <>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-extrabold text-grey-90">
                      {average.toFixed(1)}
                    </span>
                    <span className="pb-1.5 text-sm text-grey-50">out of 5</span>
                  </div>
                  <div className="mt-2">
                    <StarRating value={average} className="h-5 w-5" />
                  </div>
                  <p className="mt-1 text-sm text-grey-50">
                    Based on {total} review{total === 1 ? "" : "s"}
                  </p>
                  <ul className="mt-5 grid gap-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const n = data.rating_counts[String(star)] ?? 0
                      const pct = total ? (n / total) * 100 : 0
                      return (
                        <li key={star} className="flex items-center gap-3 text-xs text-grey-60">
                          <span className="w-8 shrink-0">{star} star</span>
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-grey-10">
                            <span
                              className="block h-full rounded-full bg-sun-400"
                              style={{ width: `${pct}%` }}
                            />
                          </span>
                          <span className="w-6 shrink-0 text-right">{n}</span>
                        </li>
                      )
                    })}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-grey-50">
                  No reviews yet. Be the first to share your thoughts.
                </p>
              )}
            </div>

            {data.my_review_id ? (
              <div
                className="rounded-2xl bg-brand-50 p-5 text-sm text-brand-800"
                data-testid="review-thanks"
              >
                <p className="font-bold">
                  {justPosted ? "Thank you for your review!" : "You have reviewed this product."}
                </p>
                <p className="mt-1 text-brand-700">
                  {justPosted
                    ? "Your review is now live below."
                    : "Thanks for sharing your feedback."}
                </p>
              </div>
            ) : data.signed_in ? (
              <ReviewForm productId={productId} onSubmitted={handleSubmitted} />
            ) : (
              <div className="rounded-2xl border border-grey-10 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-grey-90">Write a review</h3>
                <p className="mt-1 text-sm text-grey-50">
                  Sign in to share your experience with this product.
                </p>
                <LocalizedClientLink
                  href="/account"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                  data-testid="review-signin-link"
                >
                  Sign in to review
                </LocalizedClientLink>
              </div>
            )}
          </div>

          <div className="small:col-span-8">
            {reviews.length === 0 ? null : (
              <ul className="grid gap-4">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-2xl border border-grey-10 bg-white p-6 shadow-sm"
                    data-testid="review-item"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <StarRating value={review.rating} />
                      <span className="text-xs text-grey-40">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    {review.title && (
                      <h3 className="mt-3 text-base font-bold text-grey-90">
                        {review.title}
                      </h3>
                    )}
                    <p
                      className={clx(
                        "whitespace-pre-line text-sm leading-6 text-grey-60",
                        review.title ? "mt-1" : "mt-3"
                      )}
                    >
                      {review.content}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-grey-50">
                      {review.author_name}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {reviews.length < total && (
              <div className="mt-6 text-center">
                <Button
                  variant="secondary"
                  onClick={loadMore}
                  isLoading={loadingMore}
                >
                  Show more reviews
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
