"use client"

import { useProductCartQuantity } from "@lib/context/cart-items-context"
import { addToCart } from "@lib/data/cart"
import { getQuickAddVariants } from "@lib/data/quick-add"
import { notifyCartUpdated } from "@lib/util/cart-events"
import type { QuickAddVariant } from "@lib/util/quick-add"
import { ShopIcon } from "@modules/common/icons/shop-icons"
import { clx } from "@modules/common/components/ui"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type Status = "idle" | "loading" | "added" | "error"

type QuickAddButtonProps = {
  productId?: string | null
  handle: string
  productTitle: string
  /** Preloaded variants; when omitted they are fetched on first click. */
  variants?: QuickAddVariant[]
  className?: string
}

/**
 * Round "add to cart" button for product cards. Single-size products are
 * added straight away; products with several sizes open a small size picker.
 */
export default function QuickAddButton({
  productId,
  handle,
  productTitle,
  variants: preloaded,
  className,
}: QuickAddButtonProps) {
  const { countryCode } = useParams() as { countryCode: string }
  const router = useRouter()
  const inCart = useProductCartQuantity(productId)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [variants, setVariants] = useState<QuickAddVariant[] | undefined>(
    preloaded
  )
  const [status, setStatus] = useState<Status>("idle")
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  useEffect(() => {
    if (status !== "added" && status !== "error") return
    const timer = setTimeout(() => {
      setStatus("idle")
      setMessage(null)
    }, 2200)
    return () => clearTimeout(timer)
  }, [status])

  const add = async (variant: QuickAddVariant) => {
    setOpen(false)
    setStatus("loading")
    try {
      await addToCart({ variantId: variant.id, quantity: 1, countryCode })
      router.refresh()
      notifyCartUpdated()
      setMessage(`${productTitle} added to cart`)
      setStatus("added")
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not add to cart"
      )
      setStatus("error")
    }
  }

  const handleClick = async () => {
    if (status === "loading") return

    let list = variants
    if (!list) {
      setStatus("loading")
      try {
        list = await getQuickAddVariants(handle, countryCode)
        setVariants(list)
      } catch {
        setMessage("Could not load this product")
        setStatus("error")
        return
      }
      setStatus("idle")
    }

    const available = list.filter((variant) => variant.inStock)
    if (list.length === 0 || available.length === 0) {
      setMessage(list.length === 0 ? "Unavailable" : "Out of stock")
      setStatus("error")
      return
    }

    if (list.length === 1) {
      await add(list[0])
    } else {
      setOpen((current) => !current)
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={clx("relative shrink-0", open && "z-30", className)}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        aria-label={
          inCart > 0
            ? `Add another ${productTitle} to cart (${inCart} in cart)`
            : `Add ${productTitle} to cart`
        }
        aria-haspopup={variants && variants.length > 1 ? "listbox" : undefined}
        aria-expanded={open}
        data-testid="quick-add-button"
        className={clx(
          "flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
          {
            "bg-brand-600 hover:bg-brand-700 hover:scale-105": status === "idle",
            "bg-brand-600 opacity-70": status === "loading",
            "bg-brand-500": status === "added",
            "bg-red-500": status === "error",
          }
        )}
      >
        {status === "loading" ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : status === "added" ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.500" />
          </svg>
        ) : status === "error" ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <ShopIcon name="basket" className="h-5 w-5" />
        )}
      </button>

      {inCart > 0 && status === "idle" && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sun-400 px-1 text-[11px] font-extrabold leading-none text-brand-900 ring-2 ring-white"
          data-testid="quick-add-count"
        >
          {inCart}
        </span>
      )}

      {message && (status === "added" || status === "error") && (
        <span
          role="status"
          className={clx(
            "pointer-events-none absolute bottom-full right-0 mb-2 w-max max-w-[200px] rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-lg",
            status === "added" ? "bg-brand-800" : "bg-red-600"
          )}
        >
          {message}
        </span>
      )}

      {open && variants && variants.length > 1 && (
        <div
          role="listbox"
          aria-label={`Choose a size for ${productTitle}`}
          className="absolute bottom-full right-0 mb-2 w-56 overflow-hidden rounded-xl border border-grey-10 bg-white p-1.5 shadow-xl"
        >
          <p className="px-3 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wider text-grey-40">
            Choose a size
          </p>
          {variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              role="option"
              aria-selected={false}
              disabled={!variant.inStock}
              onClick={() => add(variant)}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              data-testid="quick-add-variant"
            >
              <span className="font-semibold text-grey-80">{variant.title}</span>
              <span className="text-xs font-bold text-brand-700">
                {variant.inStock ? variant.price : "Sold out"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
