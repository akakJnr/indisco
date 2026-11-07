/**
 * Sets the store up for Nigeria: NGN currency, a Nigeria region paid via
 * Paystack, VAT, a Lagos stock location with naira shipping options, and NGN
 * prices on every variant.
 *
 *   npx medusa exec ./src/scripts/setup-nigeria.ts
 *
 * Re-running is safe: it stops early if the Nigeria region already exists, and
 * NGN prices are only added to variants that don't have one.
 *
 * NGN prices are PLACEHOLDERS converted from each variant's EUR price at
 * EUR_TO_NGN. Replace them with the client's real prices in the admin.
 */
import {
  ContainerRegistrationKeys,
  Modules,
} from '@medusajs/framework/utils'
import type { ExecArgs } from '@medusajs/framework/types'
import {
  createInventoryLevelsWorkflow,
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from '@medusajs/medusa/core-flows'

const EUR_TO_NGN = 1700
const STANDARD_SHIPPING_NGN = 3500
const EXPRESS_SHIPPING_NGN = 7000
const VAT_RATE = 7.5
const PRICE_PAGE_SIZE = 100

export default async function setupNigeria({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillment = container.resolve(Modules.FULFILLMENT)

  const { data: existingRegions } = await query.graph({
    entity: 'region',
    fields: ['id', 'name'],
    filters: { name: 'Nigeria' },
  })
  if (existingRegions.length) {
    logger.info('Nigeria region already exists, only adding missing NGN prices.')
    await addNgnPrices(container)
    return
  }

  const { data: stores } = await query.graph({
    entity: 'store',
    fields: ['id', 'default_sales_channel_id', 'supported_currencies.*'],
  })
  const store = stores[0]
  const { data: profiles } = await query.graph({
    entity: 'shipping_profile',
    fields: ['id'],
  })
  const shippingProfile = profiles[0]
  if (!store || !shippingProfile) {
    throw new Error('Store or shipping profile missing. Run migrations first.')
  }

  logger.info('Adding NGN as the default store currency...')
  const existingCurrencies = (store.supported_currencies ?? []).flatMap((c) =>
    c && c.currency_code !== "ngn" ? [c.currency_code] : []
  )
  const currencies = [
    { currency_code: "ngn", is_default: true },
    ...existingCurrencies.map((currency_code) => ({
      currency_code,
      is_default: false,
    })),
  ]
  await updateStoresWorkflow(container).run({
    input: { selector: { id: store.id }, update: { supported_currencies: currencies } },
  })

  logger.info('Creating Nigeria region (Paystack + manual)...')
  const {
    result: [region],
  } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: 'Nigeria',
          currency_code: 'ngn',
          countries: ['ng'],
          payment_providers: ['pp_paystack', 'pp_system_default'],
          metadata: {
            return_window_days: 7,
            free_returns: false,
            shipping_rate: STANDARD_SHIPPING_NGN,
            handling_days_min: 0,
            handling_days_max: 1,
            transit_days_min: 2,
            transit_days_max: 5,
          },
        },
      ],
    },
  })

  await createTaxRegionsWorkflow(container).run({
    input: [
      {
        country_code: 'ng',
        provider_id: 'tp_system',
        default_tax_rate: { rate: VAT_RATE, code: 'VAT', name: 'VAT' },
      },
    ],
  })

  logger.info('Creating Lagos stock location and shipping options...')
  const {
    result: [stockLocation],
  } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: 'Lagos Warehouse',
          address: { city: 'Lagos', country_code: 'NG', address_1: '' },
        },
      ],
    },
  })

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: 'manual_manual' },
  })

  const fulfillmentSet = await fulfillment.createFulfillmentSets({
    name: 'Lagos Warehouse delivery',
    type: 'shipping',
    service_zones: [
      {
        name: 'Nigeria',
        geo_zones: [{ country_code: 'ng', type: 'country' }],
      },
    ],
  })
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  })

  const rules = [
    { attribute: 'enabled_in_store', value: 'true', operator: 'eq' as const },
    { attribute: 'is_return', value: 'false', operator: 'eq' as const },
  ]
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: 'Standard Shipping',
        price_type: 'flat',
        provider_id: 'manual_manual',
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: 'Standard',
          description: 'Delivery in 2-5 days.',
          code: 'standard',
        },
        prices: [
          { currency_code: 'ngn', amount: STANDARD_SHIPPING_NGN },
          { region_id: region.id, amount: STANDARD_SHIPPING_NGN },
        ],
        rules,
      },
      {
        name: 'Express Shipping',
        price_type: 'flat',
        provider_id: 'manual_manual',
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: 'Express',
          description: 'Delivery in 24-48 hours (Lagos).',
          code: 'express',
        },
        prices: [
          { currency_code: 'ngn', amount: EXPRESS_SHIPPING_NGN },
          { region_id: region.id, amount: EXPRESS_SHIPPING_NGN },
        ],
        rules,
      },
    ],
  })

  if (store.default_sales_channel_id) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: stockLocation.id, add: [store.default_sales_channel_id] },
    })
  }

  const { data: inventoryItems } = await query.graph({
    entity: 'inventory_item',
    fields: ['id'],
  })
  if (inventoryItems.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryItems.map((item) => ({
          location_id: stockLocation.id,
          inventory_item_id: item.id,
          stocked_quantity: 1000000,
        })),
      },
    })
  }

  const added = await addNgnPrices(container)

  logger.info(`Done. Nigeria region ${region.id}; added NGN prices to ${added} variants.`)
}

async function addNgnPrices(container: ExecArgs['container']) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const pricing = container.resolve(Modules.PRICING)

  logger.info(`Adding placeholder NGN prices (1 EUR = ${EUR_TO_NGN} NGN)...`)
  let offset = 0
  let added = 0
  for (;;) {
    const { data: variants } = await query.graph({
      entity: 'product_variant',
      fields: ['id', 'price_set.*', 'price_set.prices.*'],
      pagination: { skip: offset, take: PRICE_PAGE_SIZE, order: { id: 'ASC' } },
    })
    if (!variants.length) break
    offset += variants.length

    for (const variant of variants) {
      const priceSet = variant.price_set
      if (!priceSet?.id) continue
      const prices = priceSet.prices ?? []
      if (prices.some((p) => p?.currency_code === 'ngn')) continue
      const eur = prices.find((p) => p?.currency_code === 'eur')
      if (!eur) continue
      const amount = Math.max(100, Math.round((Number(eur.amount) * EUR_TO_NGN) / 100) * 100)
      await pricing.addPrices({
        priceSetId: priceSet.id,
        prices: [{ currency_code: 'ngn', amount }],
      })
      added++
    }
  }
  logger.info(`Added NGN prices to ${added} variants.`)
  return added
}
