import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/layout/components/logo"

const SERVICE_LINKS = [
  { href: "/shipping", label: "Delivery information" },
  { href: "/returns", label: "Return policy" },
  { href: "/terms", label: "Terms of service" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/contact", label: "Contact us" },
  { href: "/search", label: "Search" },
]

const PAYMENT_METHODS = ["Paystack", "Visa", "Mastercard", "Verve", "Bank Transfer", "USSD"]

export default async function Footer() {
  const categories = await listCategories({
    fields: "id,name,handle,parent_category_id",
    parent_category_id: "null",
  }).catch(() => [])

  const shopCategories = (categories ?? []).filter(
    (category) => category.handle !== "laboratory"
  )

  return (
    <footer className="mt-24 w-full bg-brand-900 text-brand-100">
      <div className="content-container">
        <div className="grid grid-cols-2 gap-10 py-16 small:grid-cols-12">
          <div className="col-span-2 small:col-span-4">
            <LocalizedClientLink href="/">
              <Logo tone="light" className="h-14" />
            </LocalizedClientLink>
            <p className="mt-5 max-w-sm text-sm leading-6 text-brand-200">
              Your neighbourhood supermarket, online. Fresh groceries,
              household essentials and quality laboratory supplies, delivered
              to your door across Nigeria.
            </p>
            <a
              href="mailto:info@indiscosupermarket.com"
              className="mt-5 inline-block text-sm font-semibold text-sun-300 hover:text-sun-200"
            >
              info@indiscosupermarket.com
            </a>
          </div>

          <div className="small:col-span-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Shop
            </h3>
            <ul className="mt-4 grid gap-2.5 text-sm" data-testid="footer-categories">
              {shopCategories.map((category) => (
                <li key={category.id}>
                  <LocalizedClientLink
                    href={`/categories/${category.handle}`}
                    className="text-brand-200 transition-colors hover:text-white"
                    data-testid="category-link"
                  >
                    {category.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="small:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Laboratory
            </h3>
            <ul className="mt-4 grid gap-2.5 text-sm">
              <li>
                <LocalizedClientLink
                  href="/laboratory"
                  className="text-brand-200 transition-colors hover:text-white"
                >
                  Lab supplies
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/categories/lab-equipment"
                  className="text-brand-200 transition-colors hover:text-white"
                >
                  Equipment
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/categories/glassware"
                  className="text-brand-200 transition-colors hover:text-white"
                >
                  Glassware
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/categories/safety-ppe"
                  className="text-brand-200 transition-colors hover:text-white"
                >
                  Safety and PPE
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          <div className="small:col-span-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Customer service
            </h3>
            <ul className="mt-4 grid gap-2.5 text-sm">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <LocalizedClientLink
                    href={link.href}
                    className="text-brand-200 transition-colors hover:text-white"
                  >
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-brand-700 py-6 text-xs text-brand-300 small:flex-row small:items-center small:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Indisco Supermarket. All rights
            reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-2">
            <li className="mr-1 font-semibold text-brand-200">We accept</li>
            {PAYMENT_METHODS.map((method) => (
              <li
                key={method}
                className="rounded-md border border-brand-600 bg-brand-800 px-2.5 py-1 font-semibold text-brand-100"
              >
                {method}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
