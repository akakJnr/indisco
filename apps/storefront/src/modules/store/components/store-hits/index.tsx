"use client"

import type { Hit } from "instantsearch.js"
import { useEffect, useRef } from "react"
import { useHits, useInstantSearch } from "react-instantsearch"

import useSearchSettled from "@lib/hooks/use-search-settled"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text } from "@modules/common/components/ui"
import InCartBadge from "@modules/products/components/in-cart-badge"
import QuickAddButton from "@modules/products/components/quick-add"
import Thumbnail from "@modules/products/components/thumbnail"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import SearchPagination from "./pagination"
import HitPrice, { HitPricing } from "./price"

type ProductHit = Hit<
  {
    title: string | null
    handle: string | null
    thumbnail: string | null
  } & HitPricing
>

/** The search index stores the product id in `id`; objectID is the fallback. */
const hitProductId = (hit: ProductHit) =>
  (hit as unknown as { id?: string }).id ?? hit.objectID

type StoreHitsProps = {
  hitsPerPage: number
  currencyCode: string
}

const StoreHits = ({ hitsPerPage, currencyCode }: StoreHitsProps) => {
  const { items } = useHits<ProductHit>()
  const { status, error, indexUiState } = useInstantSearch()
  const { isSearching, hasNoResultsYet } = useSearchSettled()

  const { page, ...refinements } = indexUiState
  const currentPage = page ?? 1
  const refinementKey = JSON.stringify(refinements)

  const settled = useRef({ page: currentPage, refinementKey })

  useEffect(() => {
    if (!isSearching) {
      settled.current = { page: currentPage, refinementKey }
    }
  }, [isSearching, currentPage, refinementKey])

  const isPagingOnly =
    refinementKey === settled.current.refinementKey &&
    currentPage !== settled.current.page

  const showSkeleton = hasNoResultsYet || (isSearching && isPagingOnly)

  if (status === "error") {
    return (
      <Text
        className="py-16 text-center text-ui-fg-error"
        data-testid="products-error"
      >
        Couldn&apos;t load products
        {error?.message ? `: ${error.message}` : "."}
      </Text>
    )
  }

  return (
    <>
      {showSkeleton ? (
        <SkeletonProductGrid numberOfProducts={hitsPerPage} />
      ) : !items.length ? (
        <Text
          className="py-16 text-center text-ui-fg-subtle"
          data-testid="no-products"
        >
          No products matched these filters.
        </Text>
      ) : (
        <ul
          className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
          data-testid="products-list"
        >
          {items.map((hit) =>
            hit.handle ? (
              <li key={hit.objectID}>
                <div className="group relative flex h-full flex-col rounded-2xl border border-grey-10 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg">
                  <LocalizedClientLink
                    href={`/products/${hit.handle}`}
                    className="block"
                    data-testid="product-wrapper"
                  >
                    <div className="relative">
                      <InCartBadge productId={hitProductId(hit)} />
                      <Thumbnail
                        thumbnail={hit.thumbnail}
                        alt={hit.title ?? ""}
                        size="full"
                        isFeatured
                        className="!p-0 !shadow-none"
                      />
                    </div>
                    <p
                      className="mt-3 line-clamp-2 min-h-[2.5rem] px-1 text-sm font-semibold leading-5 text-grey-80"
                      data-testid="product-title"
                    >
                      {hit.title}
                    </p>
                  </LocalizedClientLink>
                  <div className="mt-2 flex flex-1 items-end justify-between gap-2 px-1 pb-1">
                    <HitPrice hit={hit} currencyCode={currencyCode} />
                    <QuickAddButton
                      productId={hitProductId(hit)}
                      handle={hit.handle}
                      productTitle={hit.title ?? "product"}
                    />
                  </div>
                </div>
              </li>
            ) : null
          )}
        </ul>
      )}
      <SearchPagination />
    </>
  )
}

export default StoreHits
