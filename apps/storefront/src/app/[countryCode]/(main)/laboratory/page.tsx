import { Metadata } from "next"

import LaboratoryTemplate from "@modules/laboratory/templates"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Laboratory Supplies and Equipment",
  description:
    "Laboratory consumables, glassware, reagents, equipment and safety gear. Order online from Indisco Supermarket and pay securely with Paystack.",
}

export default async function LaboratoryPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  return <LaboratoryTemplate countryCode={countryCode} />
}
