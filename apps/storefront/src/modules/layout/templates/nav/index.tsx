import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ShopIcon } from "@modules/common/icons/shop-icons"
import AnnouncementBar from "@modules/layout/components/announcement-bar"
import CartButton from "@modules/layout/components/cart-button"
import Logo from "@modules/layout/components/logo"
import Search from "@modules/layout/components/search"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale, categories] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    listCategories({
      fields: "id,name,handle,parent_category_id",
      parent_category_id: "null",
    }).catch(() => []),
  ])

  const shopCategories = (categories ?? []).filter(
    (category) => category.handle !== "laboratory"
  )

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <AnnouncementBar />
      <header className="relative border-b border-grey-20 bg-white/95 shadow-sm backdrop-blur">
        <nav className="content-container flex h-[68px] w-full items-center justify-between text-small-regular text-grey-70">
          <div className="flex h-full flex-1 basis-0 items-center">
            <div className="h-full font-semibold">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
                categories={shopCategories}
              />
            </div>
          </div>

          <div className="flex h-full items-center">
            <LocalizedClientLink href="/" data-testid="nav-store-link">
              <Logo priority className="h-11 small:h-12" />
            </LocalizedClientLink>
          </div>

          <div className="flex h-full flex-1 basis-0 items-center justify-end gap-x-5">
            <LocalizedClientLink
              href="/laboratory"
              className="hidden small:inline-flex items-center gap-1.5 rounded-full bg-lab-700 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-lab-800"
              data-testid="nav-laboratory-link"
            >
              <ShopIcon name="laboratory" className="h-4 w-4" /> Laboratory
            </LocalizedClientLink>
            <Search />
            <div className="hidden h-full items-center gap-x-6 small:flex">
              <LocalizedClientLink
                className="font-semibold hover:text-brand-700"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex gap-2 font-semibold hover:text-brand-700"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>

        {shopCategories.length > 0 && (
          <div className="hidden border-t border-grey-10 bg-brand-50/60 small:block">
            <ul className="content-container flex h-11 items-center gap-x-1 overflow-x-auto no-scrollbar text-[13px] font-semibold text-grey-70">
              <li>
                <LocalizedClientLink
                  href="/store"
                  className="rounded-full px-3.5 py-1.5 text-brand-700 hover:bg-white"
                >
                  All products
                </LocalizedClientLink>
              </li>
              {shopCategories.map((category) => (
                <li key={category.id}>
                  <LocalizedClientLink
                    href={`/categories/${category.handle}`}
                    className="whitespace-nowrap rounded-full px-3.5 py-1.5 hover:bg-white hover:text-brand-700"
                  >
                    {category.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </div>
  )
}
