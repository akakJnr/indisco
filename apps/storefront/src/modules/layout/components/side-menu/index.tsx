"use client"

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react"
import { Locale } from "@lib/data/locales"
import useToggleState from "@lib/hooks/use-toggle-state"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import {
  CATEGORY_TONES,
  ShopIcon,
} from "@modules/common/icons/shop-icons"
import { Fragment, useState } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import Logo from "../logo"

type MenuCategory = { id: string; name: string; handle: string }

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  categories?: MenuCategory[]
}

const PRIMARY_LINKS = [
  { name: "Home", href: "/", icon: "home" },
  { name: "Shop all", href: "/store", icon: "grid" },
  { name: "Account", href: "/account", icon: "user" },
  { name: "Cart", href: "/cart", icon: "cart" },
]

const SideMenu = ({
  regions,
  locales,
  currentLocale,
  categories = [],
}: SideMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  const close = () => setIsOpen(false)

  return (
    <div className="h-full">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        data-testid="nav-menu-button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="flex h-full items-center gap-2.5 rounded-lg pr-3 transition-colors hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <ShopIcon name="menu" className="h-6 w-6" />
        <span className="hidden xsmall:inline">Menu</span>
        <span className="sr-only xsmall:hidden">Open menu</span>
      </button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog
          onClose={close}
          className="relative z-[70]"
          data-testid="nav-menu-popup"
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-brand-900/50 backdrop-blur-sm"
              aria-hidden
              data-testid="side-menu-backdrop"
            />
          </TransitionChild>

          <div className="fixed inset-0 flex">
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel className="relative flex h-full w-full max-w-[380px] flex-col bg-white shadow-2xl">
                <div className="flex items-center justify-between bg-gradient-to-br from-brand-800 to-brand-600 px-6 py-5">
                  <Logo tone="light" className="h-10" />
                  <button
                    type="button"
                    onClick={close}
                    data-testid="close-menu-button"
                    aria-label="Close menu"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <ShopIcon name="close" className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-6">
                  <ul className="grid gap-1.5">
                    {PRIMARY_LINKS.map((link) => (
                      <li key={link.name}>
                        <LocalizedClientLink
                          href={link.href}
                          onClick={close}
                          data-testid={`${link.name.toLowerCase().replace(" ", "-")}-link`}
                          className="group flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-brand-50"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-white">
                            <ShopIcon name={link.icon} className="h-5 w-5" />
                          </span>
                          <span className="flex-1 text-base font-semibold text-grey-80">
                            {link.name}
                          </span>
                          <ShopIcon
                            name="chevron"
                            className="h-4 w-4 text-grey-30 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                          />
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>

                  <LocalizedClientLink
                    href="/laboratory"
                    onClick={close}
                    data-testid="laboratory-link"
                    className="group mt-5 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-lab-800 to-lab-600 p-4 text-white shadow-md transition-transform hover:-translate-y-0.5"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                      <ShopIcon name="laboratory" className="h-6 w-6" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-base font-bold">
                        Indisco Laboratory
                      </span>
                      <span className="block text-xs text-lab-100">
                        Consumables, glassware and equipment
                      </span>
                    </span>
                    <ShopIcon
                      name="arrow"
                      className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    />
                  </LocalizedClientLink>

                  {categories.length > 0 && (
                    <div className="mt-8">
                      <h3 className="px-3 text-xs font-bold uppercase tracking-widest text-grey-40">
                        Shop by category
                      </h3>
                      <ul className="mt-3 grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                          <li key={category.id}>
                            <LocalizedClientLink
                              href={`/categories/${category.handle}`}
                              onClick={close}
                              className="flex h-full items-center gap-3 rounded-xl border border-grey-10 px-3 py-2.5 transition-colors hover:border-brand-200 hover:bg-brand-50"
                            >
                              <span
                                className={clx(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                  CATEGORY_TONES[category.handle] ??
                                    "bg-brand-50 text-brand-600"
                                )}
                              >
                                <ShopIcon
                                  name={category.handle}
                                  className="h-4 w-4"
                                />
                              </span>
                              <span className="text-[13px] font-semibold leading-4 text-grey-70">
                                {category.name}
                              </span>
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="border-t border-grey-10 bg-grey-5 px-6 py-5">
                  <div className="flex flex-col gap-y-3 text-sm text-grey-60">
                    {!!locales?.length && (
                      <div
                        onMouseEnter={languageToggleState.open}
                        onMouseLeave={languageToggleState.close}
                      >
                        <LanguageSelect
                          toggleState={languageToggleState}
                          locales={locales}
                          currentLocale={currentLocale}
                        />
                      </div>
                    )}
                    {regions && (
                      <div
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        <CountrySelect
                          toggleState={countryToggleState}
                          regions={regions}
                        />
                      </div>
                    )}
                    <a
                      href="mailto:info@indiscosupermarket.com"
                      className="flex items-center gap-2 font-semibold text-brand-700 hover:text-brand-600"
                    >
                      <ShopIcon name="mail" className="h-4 w-4" />
                      info@indiscosupermarket.com
                    </a>
                    <p className="text-xs text-grey-40">
                      &copy; {new Date().getFullYear()} Indisco Supermarket
                    </p>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default SideMenu
