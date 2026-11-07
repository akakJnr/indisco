import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "./money"

export type QuickAddVariant = {
  id: string
  title: string
  /** Formatted price, e.g. "₦9,500". */
  price: string
  inStock: boolean
}

/** Variants in the shape the quick add-to-cart button needs. */
export function toQuickAddVariants(
  product: HttpTypes.StoreProduct
): QuickAddVariant[] {
  return (product.variants ?? []).flatMap((variant) => {
    const calculated = variant.calculated_price
    if (!calculated || calculated.calculated_amount == null) {
      return []
    }
    // When the list query did not load stock levels, treat stock as unknown
    // and let the backend reject a genuinely sold-out item.
    const inStock =
      !variant.manage_inventory ||
      !!variant.allow_backorder ||
      variant.inventory_quantity == null ||
      variant.inventory_quantity > 0

    return [
      {
        id: variant.id,
        title: variant.title ?? "Default",
        price: convertToLocale({
          amount: calculated.calculated_amount,
          currency_code: calculated.currency_code ?? "ngn",
        }),
        inStock,
      },
    ]
  })
}
