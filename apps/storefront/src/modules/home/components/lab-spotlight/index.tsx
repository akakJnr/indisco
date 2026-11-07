import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ShopIcon } from "@modules/common/icons/shop-icons"
import ProductPreview from "@modules/products/components/product-preview"

export default function LabSpotlight({
  products,
  region,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}) {
  if (!products.length) {
    return null
  }

  return (
    <section className="mt-20 bg-gradient-to-br from-lab-800 to-lab-900 py-16 text-white">
      <div className="content-container grid items-center gap-12 small:grid-cols-12">
        <div className="small:col-span-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-lab-200 ring-1 ring-white/20">
            <ShopIcon name="laboratory" className="h-4 w-4" />
            Indisco Laboratory
          </span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight small:text-4xl">
            Everything your lab needs, in one place.
          </h2>
          <p className="mt-4 text-base leading-7 text-lab-100">
            From gloves and slides to glassware, reagents and microscopes,
            order lab consumables and equipment as easily as your groceries.
          </p>
          <LocalizedClientLink
            href="/laboratory"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-lab-800 transition-all hover:-translate-y-0.5 hover:bg-lab-50"
          >
            Explore the laboratory
            <ShopIcon name="arrow" className="h-4 w-4" />
          </LocalizedClientLink>
        </div>

        <ul className="grid grid-cols-2 gap-4 small:col-span-8 small:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
