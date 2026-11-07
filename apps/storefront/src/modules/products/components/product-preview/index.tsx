import { getProductPrice } from "@lib/util/get-product-price"
import { toQuickAddVariants } from "@lib/util/quick-add"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import InCartBadge from "@modules/products/components/in-cart-badge"
import QuickAddButton from "@modules/products/components/quick-add"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const hasMultipleVariants = (product.variants?.length ?? 0) > 1
  const quickAddVariants = toQuickAddVariants(product)

  return (
    <div className="group relative flex h-full flex-col rounded-2xl border border-grey-10 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg focus-within:border-brand-200">
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="block"
        data-testid="product-wrapper"
      >
        <div className="relative">
          <InCartBadge productId={product.id} />
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            alt={product.title}
            size="full"
            isFeatured={isFeatured ?? true}
            className="!p-0 !shadow-none"
          />
        </div>
        <p
          className="mt-3 line-clamp-2 min-h-[2.5rem] px-1 text-sm font-semibold leading-5 text-grey-80"
          data-testid="product-title"
        >
          {product.title}
        </p>
      </LocalizedClientLink>

      <div className="mt-2 flex flex-1 items-end justify-between gap-2 px-1 pb-1">
        <div className="flex flex-col">
          {hasMultipleVariants && (
            <span className="text-[11px] font-medium uppercase tracking-wide text-grey-40">
              From
            </span>
          )}
          <div className="flex items-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
        {product.handle && (
          <QuickAddButton
            productId={product.id}
            handle={product.handle}
            productTitle={product.title}
            variants={quickAddVariants}
          />
        )}
      </div>
    </div>
  )
}
