"use client"

import { useProductCartQuantity } from "@lib/context/cart-items-context"

/** "In cart" pill shown over a product image when the product is in the cart. */
export default function InCartBadge({ productId }: { productId?: string | null }) {
  const quantity = useProductCartQuantity(productId)

  if (quantity < 1) {
    return null
  }

  return (
    <span
      className="pointer-events-none absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-brand-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-md"
      data-testid="in-cart-badge"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M5 12.500l4.500 4.500L19 7.500" />
      </svg>
      In cart{quantity > 1 ? ` (${quantity})` : ""}
    </span>
  )
}
