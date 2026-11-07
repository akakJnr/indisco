import { clx } from "@modules/common/components/ui"

const STAR_PATH =
  "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"

/** Read-only star display, supports fractional values (rounded to halves). */
export default function StarRating({
  value,
  className = "h-4 w-4",
}: {
  value: number
  className?: string
}) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, value - (star - 1)))
        const id = `star-${star}-${Math.round(fill * 100)}`
        return (
          <svg key={star} viewBox="0 0 24 24" className={clx(className)} aria-hidden>
            <defs>
              <linearGradient id={id}>
                <stop offset={`${fill * 100}%`} stopColor="#F59E0B" />
                <stop offset={`${fill * 100}%`} stopColor="#E5E7EB" />
              </linearGradient>
            </defs>
            <path d={STAR_PATH} fill={`url(#${id})`} />
          </svg>
        )
      })}
    </span>
  )
}
