import { getCategoryByHandle } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ShopIcon } from "@modules/common/icons/shop-icons"
import ProductPreview from "@modules/products/components/product-preview"
import { notFound } from "next/navigation"

const SUBCATEGORY_BLURBS: Record<string, string> = {
  "lab-consumables": "Gloves, slides, tubes, dishes and everyday disposables.",
  glassware: "Beakers, flasks, cylinders and borosilicate glass.",
  "reagents-chemicals": "Distilled water, stains, solvents and sanitisers.",
  "lab-equipment": "Microscopes, balances, hot plates and instruments.",
  "safety-ppe": "Lab coats, goggles, masks and protective gear.",
}

const PRODUCT_FIELDS = "*variants.calculated_price,+variants.inventory_quantity"

export default async function LaboratoryTemplate({
  countryCode,
}: {
  countryCode: string
}) {
  const [region, category] = await Promise.all([
    getRegion(countryCode),
    getCategoryByHandle(["laboratory"]).catch(() => undefined),
  ])

  if (!region || !category) {
    notFound()
  }

  const subcategories: HttpTypes.StoreProductCategory[] =
    category.category_children ?? []

  const sections = await Promise.all(
    subcategories.map(async (sub) => {
      const { response } = await listProducts({
        regionId: region.id,
        queryParams: {
          category_id: [sub.id],
          limit: 24,
          fields: PRODUCT_FIELDS,
        },
      })
      return { sub, products: response.products }
    })
  )
  const visibleSections = sections.filter((s) => s.products.length > 0)
  const totalProducts = visibleSections.reduce(
    (sum, s) => sum + s.products.length,
    0
  )

  return (
    <div data-testid="laboratory-page">
      <section className="relative overflow-hidden bg-gradient-to-br from-lab-800 via-lab-700 to-lab-600 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-lab-500/30 blur-3xl"
        />
        <div className="content-container relative py-14 small:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-lab-100 ring-1 ring-white/20">
            <ShopIcon name="laboratory" className="h-4 w-4" />
            Indisco Laboratory
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight small:text-5xl">
            Laboratory supplies and equipment, delivered.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-lab-100 small:text-lg">
            Quality consumables, glassware, reagents, instruments and safety
            gear for schools, clinics, research and industry labs. Order
            online and pay securely with Paystack.
          </p>
          <p className="mt-6 text-sm font-semibold text-lab-100">
            {totalProducts} products across {visibleSections.length}{" "}
            categories
          </p>
        </div>
      </section>

      {visibleSections.length > 0 && (
        <nav
          aria-label="Laboratory categories"
          className="sticky top-[105px] small:top-[149px] z-40 border-b border-grey-20 bg-white/95 backdrop-blur"
        >
          <ul className="content-container flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            {visibleSections.map(({ sub }) => (
              <li key={sub.id}>
                <a
                  href={`#${sub.handle}`}
                  className="whitespace-nowrap rounded-full bg-lab-50 px-4 py-2 text-[13px] font-semibold text-lab-800 transition-colors hover:bg-lab-100"
                >
                  {sub.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {visibleSections.length === 0 ? (
        <div className="content-container py-24 text-center">
          <p className="text-lg font-semibold text-grey-80">
            Our laboratory range is being stocked.
          </p>
          <p className="mt-2 text-grey-50">Please check back soon.</p>
        </div>
      ) : (
        visibleSections.map(({ sub, products }) => (
          <section
            key={sub.id}
            id={sub.handle}
            className="content-container scroll-mt-48 pt-14"
          >
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-grey-90">
                  {sub.name}
                </h2>
                {SUBCATEGORY_BLURBS[sub.handle] && (
                  <p className="mt-1 text-sm text-grey-50">
                    {SUBCATEGORY_BLURBS[sub.handle]}
                  </p>
                )}
              </div>
              <LocalizedClientLink
                href={`/categories/${sub.handle}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-lab-700 hover:text-lab-600"
              >
                View all
                <ShopIcon name="arrow" className="h-4 w-4" />
              </LocalizedClientLink>
            </div>
            <ul className="grid grid-cols-2 gap-4 small:grid-cols-4 small:gap-6">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductPreview
                    product={product}
                    region={region}
                    isFeatured
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <section className="content-container pt-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-lab-50 p-8 ring-1 ring-lab-100 small:flex-row small:items-center small:p-10">
          <div>
            <h2 className="text-xl font-extrabold text-lab-900 small:text-2xl">
              Need bulk orders or specialised equipment?
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-lab-800">
              Tell us what your lab needs. We can source items not listed
              here and quote for larger quantities.
            </p>
          </div>
          <LocalizedClientLink
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-lab-700 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-lab-800"
          >
            Contact us
            <ShopIcon name="arrow" className="h-4 w-4" />
          </LocalizedClientLink>
        </div>
      </section>
    </div>
  )
}
