import { ShopIcon } from "@modules/common/icons/shop-icons"

const ITEMS = [
  {
    icon: "truck",
    title: "Fast delivery",
    text: "Express delivery in Lagos and nationwide shipping.",
  },
  {
    icon: "shield",
    title: "Secure payment",
    text: "Pay with card, bank transfer or USSD through Paystack.",
  },
  {
    icon: "fresh-produce",
    title: "Fresh and quality",
    text: "Carefully selected groceries, packed with care.",
  },
  {
    icon: "laboratory",
    title: "Lab-ready supplies",
    text: "Consumables, glassware and equipment for your lab.",
  },
]

export default function TrustStrip() {
  return (
    <section className="content-container relative z-10 -mt-14">
      <ul className="grid gap-px overflow-hidden rounded-2xl bg-grey-10 shadow-xl shadow-black/5 ring-1 ring-grey-10 xsmall:grid-cols-2 small:grid-cols-4">
        {ITEMS.map((item) => (
          <li key={item.title} className="flex items-start gap-4 bg-white p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <ShopIcon name={item.icon} className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-grey-90">{item.title}</p>
              <p className="mt-0.5 text-[13px] leading-5 text-grey-50">
                {item.text}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
