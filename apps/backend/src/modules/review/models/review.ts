import { model } from "@medusajs/framework/utils"

/**
 * A customer's review of a product. One review per customer per product is
 * enforced by the create workflow.
 */
const Review = model
  .define("review", {
    id: model.id({ prefix: "rev" }).primaryKey(),
    product_id: model.text().index("IDX_review_product_id"),
    customer_id: model.text().index("IDX_review_customer_id"),
    author_name: model.text(),
    rating: model.number(),
    title: model.text().nullable(),
    content: model.text(),
    status: model.enum(["pending", "approved", "rejected"]).default("approved"),
  })

export default Review
