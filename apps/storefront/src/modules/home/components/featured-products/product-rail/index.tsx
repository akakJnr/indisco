import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ShopIcon } from "@modules/common/icons/shop-icons"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      limit: 8,
      fields: "*variants.calculated_price,+variants.inventory_quantity",
    },
  })

  if (!pricedProducts?.length) {
    return null
  }

  return (
    <section className="content-container pt-16">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight text-grey-90 small:text-3xl">
          {collection.title}
        </h2>
        <LocalizedClientLink
          href={`/collections/${collection.handle}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-600"
        >
          View all
          <ShopIcon name="arrow" className="h-4 w-4" />
        </LocalizedClientLink>
      </div>
      <ul className="grid grid-cols-2 gap-4 small:grid-cols-4 small:gap-6">
        {pricedProducts.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </section>
  )
}
