import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-NG",
}: ConvertToLocaleParams) => {
  const isNaira = currency_code?.toLowerCase() === "ngn"
  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        currencyDisplay: "narrowSymbol",
        // Naira prices are shown without kobo unless the amount has them.
        minimumFractionDigits: minimumFractionDigits ?? (isNaira ? 0 : undefined),
        maximumFractionDigits: maximumFractionDigits ?? (isNaira ? 2 : undefined),
      }).format(amount)
    : amount.toString()
}
