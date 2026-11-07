import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CATEGORY_TONES, ShopIcon } from "@modules/common/icons/shop-icons"

export default function CategoryTiles({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  if (!categories.length) {
    return null
  }

  return (
    <section className="content-container pt-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-sun-600">
            Browse
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-grey-90 small:text-3xl">
            Shop by category
          </h2>
        </div>
        <LocalizedClientLink
          href="/store"
          className="text-sm font-semibold text-brand-700 hover:text-brand-600"
        >
          See everything
        </LocalizedClientLink>
      </div>

      <ul className="grid grid-cols-2 gap-4 xsmall:grid-cols-3 small:grid-cols-5">
        {categories.map((category) => {
          const isLab = category.handle === "laboratory"
          return (
            <li key={category.id}>
              <LocalizedClientLink
                href={
                  isLab ? "/laboratory" : `/categories/${category.handle}`
                }
                className={`group flex h-full flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  isLab
                    ? "border-lab-200 bg-lab-50 hover:border-lab-500"
                    : "border-grey-10 bg-white hover:border-brand-200"
                }`}
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110 ${
                    CATEGORY_TONES[category.handle] ?? "bg-brand-50 text-brand-600"
                  }`}
                >
                  <ShopIcon name={category.handle} className="h-7 w-7" />
                </span>
                <span className="text-sm font-bold text-grey-80">
                  {category.name}
                </span>
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
