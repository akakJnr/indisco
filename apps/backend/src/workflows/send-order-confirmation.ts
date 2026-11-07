import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  sendNotificationsStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import {
  orderPlacedEmail,
  type OrderEmailData,
} from "../lib/emails/order-placed"

type Input = { id: string }

export const sendOrderConfirmationWorkflow = createWorkflow(
  "send-order-confirmation",
  ({ id }: Input) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "currency_code",
        "total",
        "subtotal",
        "shipping_total",
        "tax_total",
        "items.title",
        "items.product_title",
        "items.quantity",
        "items.unit_price",
        "items.thumbnail",
        "shipping_address.first_name",
        "shipping_address.last_name",
        "shipping_address.address_1",
        "shipping_address.city",
        "shipping_address.province",
      ],
      filters: { id },
    }).config({ name: "get-order-for-email" })

    const notifications = transform({ orders }, ({ orders }) => {
      const order = orders[0]
      if (!order?.email) {
        return []
      }
      const { subject, html } = orderPlacedEmail(
        order as unknown as OrderEmailData
      )
      return [
        {
          to: order.email,
          channel: "email",
          template: "order-placed",
          content: { subject, html },
        },
      ]
    })

    sendNotificationsStep(notifications)

    return new WorkflowResponse({ sent: notifications })
  }
)
