import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { sendOrderConfirmationWorkflow } from "../workflows/send-order-confirmation"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await sendOrderConfirmationWorkflow(container).run({
      input: { id: data.id },
    })
  } catch (error) {
    // A failed email must never break order placement.
    container
      .resolve("logger")
      .error(
        `Could not send order confirmation for ${data.id}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
