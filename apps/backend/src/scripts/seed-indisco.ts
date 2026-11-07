/**
 * Replaces the starter's demo catalog with Indisco Supermarket's products:
 * supermarket categories plus a Laboratory range, all priced in naira.
 *
 *   npx medusa exec ./src/scripts/seed-indisco.ts
 *
 * WARNING: this deletes ALL existing products, categories, collections and
 * inventory items first. Product images are rendered locally and uploaded
 * through the configured file provider (Cloudinary).
 */
import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  deleteCollectionsWorkflow,
  deleteInventoryItemWorkflow,
  deleteProductCategoriesWorkflow,
  deleteProductsWorkflow,
  deleteReservationsWorkflow,
} from "@medusajs/medusa/core-flows"
import { renderProductImage } from "./indisco/art"
import {
  CATEGORY_STYLE,
  COLLECTIONS,
  LAB_SUBCATEGORIES,
  PRODUCTS,
  type CatalogProduct,
  type CategoryKey,
  type CollectionKey,
} from "./indisco/catalog"

const BATCH_SIZE = 8
const UPLOAD_CONCURRENCY = 4
const STOCK_PER_VARIANT = 200

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const CATEGORY_HANDLES: Record<CategoryKey, string> = {
  groceries: "groceries",
  beverages: "beverages",
  dairy: "dairy-breakfast",
  fresh: "fresh-produce",
  meat: "meat-fish",
  household: "household",
  personal: "personal-care",
  baby: "baby-kids",
  lab: "laboratory",
}

const COLLECTION_FOR: Record<CategoryKey, CollectionKey> = {
  groceries: "pantry",
  beverages: "pantry",
  dairy: "pantry",
  fresh: "fresh",
  meat: "fresh",
  household: "deals",
  personal: "deals",
  baby: "deals",
  lab: "lab",
}

export default async function seedIndisco({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fileModule = container.resolve(Modules.FILE)

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "default_sales_channel_id"],
  })
  const salesChannelId = stores[0]?.default_sales_channel_id
  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
    filters: { name: "Lagos Warehouse" },
  })
  const shippingProfileId = profiles[0]?.id
  const stockLocationId = locations[0]?.id
  if (!salesChannelId || !shippingProfileId || !stockLocationId) {
    throw new Error(
      "Missing sales channel, shipping profile or Lagos Warehouse. Run setup-nigeria.ts first."
    )
  }

  logger.info("Clearing the old catalog...")
  const { data: oldReservations } = await query.graph({
    entity: "reservation_item",
    fields: ["id"],
  })
  if (oldReservations.length) {
    await deleteReservationsWorkflow(container).run({
      input: { ids: oldReservations.map((r) => r.id) },
    })
  }
  const { data: oldProducts } = await query.graph({
    entity: "product",
    fields: ["id"],
  })
  if (oldProducts.length) {
    await deleteProductsWorkflow(container).run({
      input: { ids: oldProducts.map((p) => p.id) },
    })
  }
  const { data: oldItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  })
  if (oldItems.length) {
    await deleteInventoryItemWorkflow(container).run({
      input: oldItems.map((i) => i.id),
    })
  }
  const { data: oldCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "parent_category_id"],
  })
  if (oldCategories.length) {
    // Children first so parents can be removed.
    const children = oldCategories.filter((c) => c.parent_category_id)
    const parents = oldCategories.filter((c) => !c.parent_category_id)
    if (children.length) {
      await deleteProductCategoriesWorkflow(container).run({
        input: children.map((c) => c.id),
      })
    }
    await deleteProductCategoriesWorkflow(container).run({
      input: parents.map((c) => c.id),
    })
  }
  const { data: oldCollections } = await query.graph({
    entity: "product_collection",
    fields: ["id"],
  })
  if (oldCollections.length) {
    await deleteCollectionsWorkflow(container).run({
      input: { ids: oldCollections.map((c) => c.id) },
    })
  }

  logger.info("Creating categories and collections...")
  const topKeys = Object.keys(CATEGORY_STYLE) as CategoryKey[]
  const { result: topCategories } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: topKeys.map((key) => ({
        name: CATEGORY_STYLE[key].name,
        handle: CATEGORY_HANDLES[key],
        is_active: true,
      })),
    },
  })
  const categoryIdByKey = Object.fromEntries(
    topKeys.map((key, i) => [key, topCategories[i].id])
  ) as Record<CategoryKey, string>

  const { result: subCategories } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: LAB_SUBCATEGORIES.map((name) => ({
        name,
        handle: slug(name),
        is_active: true,
        parent_category_id: categoryIdByKey.lab,
      })),
    },
  })
  const subCategoryId = Object.fromEntries(
    LAB_SUBCATEGORIES.map((name, i) => [name, subCategories[i].id])
  ) as Record<string, string>

  const collectionKeys = Object.keys(COLLECTIONS) as CollectionKey[]
  const { result: collections } = await createCollectionsWorkflow(
    container
  ).run({
    input: {
      collections: collectionKeys.map((key) => ({
        title: COLLECTIONS[key],
        handle: slug(COLLECTIONS[key]),
      })),
    },
  })
  const collectionIdByKey = Object.fromEntries(
    collectionKeys.map((key, i) => [key, collections[i].id])
  ) as Record<CollectionKey, string>

  logger.info(`Rendering and uploading ${PRODUCTS.length} product images...`)
  const imageUrls: string[] = new Array(PRODUCTS.length)
  let nextIndex = 0
  let uploaded = 0
  const worker = async () => {
    for (;;) {
      const i = nextIndex++
      if (i >= PRODUCTS.length) return
      const product = PRODUCTS[i]
      const style = CATEGORY_STYLE[product.cat]
      const png = await renderProductImage({
        name: product.title,
        size: product.size,
        shape: product.shape,
        color: product.color ?? style.color,
        tint: style.tint,
      })
      const file = await fileModule.createFiles({
        filename: `${slug(product.title)}.png`,
        mimeType: "image/png",
        content: png.toString("base64"),
        access: "public",
      })
      imageUrls[i] = file.url
      uploaded++
      if (uploaded % 10 === 0) {
        logger.info(`Uploaded ${uploaded}/${PRODUCTS.length} images`)
      }
    }
  }
  await Promise.all(Array.from({ length: UPLOAD_CONCURRENCY }, worker))

  logger.info("Creating products...")
  const counters: Record<string, number> = {}
  const toInput = (product: CatalogProduct, index: number) => {
    counters[product.cat] = (counters[product.cat] ?? 0) + 1
    const skuBase = `IND-${CATEGORY_HANDLES[product.cat]
      .slice(0, 3)
      .toUpperCase()}-${String(counters[product.cat]).padStart(3, "0")}`
    const variants = product.variants ?? [[product.size, product.price]]
    const categoryIds = [categoryIdByKey[product.cat]]
    if (product.sub) {
      categoryIds.push(subCategoryId[product.sub])
    }
    return {
      title: product.title,
      handle: slug(product.title),
      description: product.desc,
      status: ProductStatus.PUBLISHED,
      thumbnail: imageUrls[index],
      images: [{ url: imageUrls[index] }],
      category_ids: categoryIds,
      collection_id: collectionIdByKey[COLLECTION_FOR[product.cat]],
      shipping_profile_id: shippingProfileId,
      sales_channels: [{ id: salesChannelId }],
      options: [{ title: "Size", values: variants.map(([label]) => label) }],
      variants: variants.map(([label, price], v) => ({
        title: label,
        sku: `${skuBase}-${v + 1}`,
        manage_inventory: true,
        options: { Size: label },
        prices: [{ currency_code: "ngn", amount: price }],
      })),
    }
  }

  for (let start = 0; start < PRODUCTS.length; start += BATCH_SIZE) {
    const batch = PRODUCTS.slice(start, start + BATCH_SIZE)
    await createProductsWorkflow(container).run({
      input: { products: batch.map((p, i) => toInput(p, start + i)) },
    })
    logger.info(
      `Created ${Math.min(start + BATCH_SIZE, PRODUCTS.length)}/${PRODUCTS.length} products`
    )
  }

  logger.info("Stocking the Lagos warehouse...")
  const { data: items } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  })
  if (items.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: items.map((item) => ({
          location_id: stockLocationId,
          inventory_item_id: item.id,
          stocked_quantity: STOCK_PER_VARIANT,
        })),
      },
    })
  }

  logger.info(
    `Done: ${PRODUCTS.length} products, ${topKeys.length + LAB_SUBCATEGORIES.length} categories, ${collectionKeys.length} collections.`
  )
}
