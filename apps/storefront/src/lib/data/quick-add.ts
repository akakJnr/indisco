"use server"

import { toQuickAddVariants, type QuickAddVariant } from "@lib/util/quick-add"
import { listProducts } from "./products"

/** Loads a product's purchasable variants for the quick add-to-cart button. */
export async function getQuickAddVariants(
  handle: string,
  countryCode: string
): Promise<QuickAddVariant[]> {
  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: {
      handle,
      limit: 1,
      fields: "id,*variants.calculated_price,+variants.inventory_quantity",
    },
  })

  return products[0] ? toQuickAddVariants(products[0]) : []
}
