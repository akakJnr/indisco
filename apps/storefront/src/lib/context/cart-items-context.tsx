"use client"

import { getCartQuantityLines } from "@lib/data/cart"
import { CART_UPDATED_EVENT } from "@lib/util/cart-events"
import { usePathname } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

type CartLine = {
  product_id?: string | null
  variant_id?: string | null
  quantity: number
}

type CartQuantities = {
  /** Total quantity in the cart per product id. */
  byProduct: Record<string, number>
  /** Quantity in the cart per variant id. */
  byVariant: Record<string, number>
  /** Reloads the cart's lines (also triggered by the cart-updated event). */
  refresh: () => Promise<void>
}

const EMPTY: CartQuantities = {
  byProduct: {},
  byVariant: {},
  refresh: async () => {},
}

const CartItemsContext = createContext<CartQuantities>(EMPTY)

/**
 * Makes the cart's contents available to client components (product cards,
 * the product page) so they can show what is already in the cart.
 *
 * Pages like the home page are statically cached, so the cart cannot come from
 * the server layout. It is loaded here through a server action instead, on
 * first render, on every navigation and whenever `refresh` is called.
 */
export function CartItemsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [items, setItems] = useState<CartLine[]>([])

  const refresh = useCallback(async () => {
    try {
      setItems(await getCartQuantityLines())
    } catch {
      // Indicators are a nicety; a failed refresh keeps the last known state.
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh, pathname])

  useEffect(() => {
    const onChange = () => refresh()
    window.addEventListener("focus", onChange)
    window.addEventListener(CART_UPDATED_EVENT, onChange)
    return () => {
      window.removeEventListener("focus", onChange)
      window.removeEventListener(CART_UPDATED_EVENT, onChange)
    }
  }, [refresh])

  const value = useMemo(() => {
    const byProduct: Record<string, number> = {}
    const byVariant: Record<string, number> = {}
    for (const item of items) {
      if (item.product_id) {
        byProduct[item.product_id] =
          (byProduct[item.product_id] ?? 0) + item.quantity
      }
      if (item.variant_id) {
        byVariant[item.variant_id] =
          (byVariant[item.variant_id] ?? 0) + item.quantity
      }
    }
    return { byProduct, byVariant, refresh }
  }, [items, refresh])

  return (
    <CartItemsContext.Provider value={value}>
      {children}
    </CartItemsContext.Provider>
  )
}

/** Quantity of a product (all variants) currently in the cart. */
export const useProductCartQuantity = (productId?: string | null) => {
  const { byProduct } = useContext(CartItemsContext)
  return productId ? (byProduct[productId] ?? 0) : 0
}

/** Quantity of one variant currently in the cart. */
export const useVariantCartQuantity = (variantId?: string | null) => {
  const { byVariant } = useContext(CartItemsContext)
  return variantId ? (byVariant[variantId] ?? 0) : 0
}
