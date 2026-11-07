import { Metadata } from "next"

import CategoryTiles from "@modules/home/components/category-tiles"
import ProductRail from "@modules/home/components/featured-products/product-rail"
import Hero from "@modules/home/components/hero"
import LabSpotlight from "@modules/home/components/lab-spotlight"
import TrustStrip from "@modules/home/components/trust-strip"
import { listCategories, getCategoryByHandle } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import { toJsonLd } from "@lib/util/product-structured-data"
import { getSiteOrigin, listCountryCodes, STORE_NAME } from "@lib/util/site"
import { buildRegionsReturnPolicies } from "@lib/util/store-policies"

export const dynamic = "force-static"
export const revalidate = 60

export async function generateMetadata(props: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await props.params
  const [origin, regions] = await Promise.all([getSiteOrigin(), listRegions()])

  return {
    title: {
      absolute: "Indisco Supermarket | Groceries and Laboratory Supplies in Nigeria",
    },
    description:
      "Shop fresh groceries, household essentials and laboratory supplies online. Fast delivery across Nigeria and secure payment with Paystack.",
    alternates: {
      canonical: `${origin}/${countryCode}`,
      languages: {
        ...Object.fromEntries(
          listCountryCodes(regions).map((code) => [
            `en-${code.toUpperCase()}`,
            `${origin}/${code}`,
          ])
        ),
        "x-default": origin,
      },
    },
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const [{ collections }, categories, labCategory] = await Promise.all([
    listCollections({ fields: "id, handle, title" }),
    listCategories({
      fields: "id,name,handle,parent_category_id",
      parent_category_id: "null",
    }).catch(() => []),
    getCategoryByHandle(["laboratory"]).catch(() => undefined),
  ])

  if (!collections || !region) {
    return null
  }

  const labProducts = labCategory
    ? await listProducts({
        regionId: region.id,
        queryParams: {
          category_id: [labCategory.id],
          limit: 4,
          fields: "*variants.calculated_price,+variants.inventory_quantity",
        },
      }).then(({ response }) => response.products)
    : []

  const shopCollections = collections.filter(
    (collection) => collection.handle !== "lab-essentials"
  )
  const heroProducts = await listProducts({
    regionId: region.id,
    queryParams: {
      handle: [
        "long-grain-parboiled-rice",
        "pure-vegetable-oil",
        "fresh-pineapple",
        "compound-microscope",
      ],
      limit: 4,
      fields: "*variants.calculated_price,+variants.inventory_quantity",
    },
  }).then(({ response }) => response.products)
  const firstRails = shopCollections.slice(0, 2)
  const laterRails = shopCollections.slice(2)

  const [origin, regions] = await Promise.all([getSiteOrigin(), listRegions()])
  const homeUrl = `${origin}/${countryCode}`
  const returnPolicies = buildRegionsReturnPolicies(regions)
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: STORE_NAME,
      url: origin,
      ...(returnPolicies.length
        ? { hasMerchantReturnPolicy: returnPolicies }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: STORE_NAME,
      url: homeUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${homeUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(structuredData) }}
      />
      <Hero products={heroProducts} />
      <TrustStrip />
      <CategoryTiles categories={categories ?? []} />
      {firstRails.map((collection) => (
        <ProductRail
          key={collection.id}
          collection={collection}
          region={region}
        />
      ))}
      <LabSpotlight products={labProducts} region={region} />
      {laterRails.map((collection) => (
        <ProductRail
          key={collection.id}
          collection={collection}
          region={region}
        />
      ))}
    </>
  )
}
