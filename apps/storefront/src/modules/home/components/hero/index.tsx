import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ShopIcon } from "@modules/common/icons/shop-icons"
import Image from "next/image"

type HeroProps = {
  products: HttpTypes.StoreProduct[]
}

const Hero = ({ products }: HeroProps) => {
  const shots = products.filter((p) => p.thumbnail).slice(0, 4)

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sun-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl"
      />

      <div className="content-container relative grid items-center gap-12 pb-24 pt-12 small:grid-cols-2 small:pb-28 small:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sun-300 ring-1 ring-white/20">
            <ShopIcon name="truck" className="h-4 w-4" />
            Delivered across Nigeria
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight small:text-6xl">
            Fresh groceries and{" "}
            <span className="text-sun-300">lab supplies</span>, at your door.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-brand-100 small:text-lg">
            Everything for your kitchen, your home and your laboratory, from
            one trusted store. Order online, pay securely with Paystack, and
            we handle the rest.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center gap-2 rounded-full bg-sun-400 px-7 py-3.5 text-sm font-bold text-brand-900 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-sun-300"
            >
              Shop groceries
              <ShopIcon name="arrow" className="h-4 w-4" />
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/laboratory"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-7 py-3.5 text-sm font-bold text-white ring-1 ring-white/30 transition-colors hover:bg-white/20"
            >
              <ShopIcon name="laboratory" className="h-4 w-4" />
              Browse laboratory
            </LocalizedClientLink>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-brand-100">
            <li className="flex items-center gap-2">
              <ShopIcon name="shield" className="h-5 w-5 text-sun-300" />
              Secure Paystack payments
            </li>
            <li className="flex items-center gap-2">
              <ShopIcon name="truck" className="h-5 w-5 text-sun-300" />
              Express Lagos delivery
            </li>
          </ul>
        </div>

        {shots.length > 0 && (
          <div className="relative hidden small:block">
            <div className="grid grid-cols-2 gap-5">
              {shots.map((product, index) => (
                <LocalizedClientLink
                  key={product.id}
                  href={`/products/${product.handle}`}
                  className={`group block rounded-3xl bg-white p-3 shadow-2xl shadow-black/20 transition-transform duration-300 hover:-translate-y-1 ${
                    index % 2 === 1 ? "mt-10" : ""
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-50">
                    <Image
                      src={product.thumbnail as string}
                      alt={product.title}
                      fill
                      sizes="240px"
                      className="object-cover"
                      priority={index < 2}
                    />
                  </div>
                  <p className="mt-3 line-clamp-1 px-1 text-sm font-semibold text-grey-80">
                    {product.title}
                  </p>
                </LocalizedClientLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Hero
