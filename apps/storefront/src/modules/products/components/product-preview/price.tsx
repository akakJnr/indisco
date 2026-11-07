import { clx } from "@modules/common/components/ui"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <>
      <span
        className={clx("text-base font-extrabold text-brand-700", {
          "text-red-600": price.price_type === "sale",
        })}
        data-testid="price"
      >
        {price.calculated_price}
      </span>
      {price.price_type === "sale" && (
        <span
          className="text-xs text-grey-40 line-through"
          data-testid="original-price"
        >
          {price.original_price}
        </span>
      )}
    </>
  )
}
