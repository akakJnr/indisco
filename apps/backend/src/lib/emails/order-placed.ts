type OrderItem = {
  title: string
  product_title?: string | null
  quantity: number
  unit_price: number
  thumbnail?: string | null
}

export type OrderEmailData = {
  display_id: number
  currency_code: string
  total: number
  subtotal: number
  shipping_total: number
  tax_total: number
  items: OrderItem[]
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    address_1?: string | null
    city?: string | null
    province?: string | null
  } | null
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount)

export function orderPlacedEmail(order: OrderEmailData) {
  const name = escapeHtml(order.shipping_address?.first_name ?? "there")
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#1f2937;">
          ${escapeHtml(item.product_title ?? item.title)}
          <span style="color:#6b7280;"> x ${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#1f2937;text-align:right;">
          ${money(item.unit_price * item.quantity, order.currency_code)}
        </td>
      </tr>`
    )
    .join("")

  const address = order.shipping_address
    ? [
        order.shipping_address.address_1,
        order.shipping_address.city,
        order.shipping_address.province,
      ]
        .filter(Boolean)
        .map((part) => escapeHtml(String(part)))
        .join(", ")
    : ""

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f4f6f4;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#1a5490;padding:24px 32px;">
            <div style="color:#ffffff;font-size:22px;font-weight:bold;">Indisco Supermarket</div>
            <div style="color:#ffb05c;font-size:13px;margin-top:4px;">Fresh groceries and laboratory supplies, delivered.</div>
          </td></tr>
          <tr><td style="padding:32px;">
            <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">Thank you for your order, ${name}!</h1>
            <p style="margin:0 0 24px;font-size:14px;color:#4b5563;">
              We have received order <strong>#${order.display_id}</strong> and we are getting it ready.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr><td style="font-size:14px;color:#4b5563;padding:4px 0;">Subtotal</td><td style="font-size:14px;color:#4b5563;text-align:right;">${money(order.subtotal, order.currency_code)}</td></tr>
              <tr><td style="font-size:14px;color:#4b5563;padding:4px 0;">Delivery</td><td style="font-size:14px;color:#4b5563;text-align:right;">${money(order.shipping_total, order.currency_code)}</td></tr>
              <tr><td style="font-size:14px;color:#4b5563;padding:4px 0;">VAT</td><td style="font-size:14px;color:#4b5563;text-align:right;">${money(order.tax_total, order.currency_code)}</td></tr>
              <tr><td style="font-size:16px;font-weight:bold;color:#111827;padding:10px 0;">Total</td><td style="font-size:16px;font-weight:bold;color:#1a5490;text-align:right;">${money(order.total, order.currency_code)}</td></tr>
            </table>
            ${
              address
                ? `<p style="margin:24px 0 0;font-size:13px;color:#4b5563;"><strong>Delivering to:</strong> ${address}</p>`
                : ""
            }
          </td></tr>
          <tr><td style="background:#f9fafb;padding:20px 32px;font-size:12px;color:#6b7280;">
            Questions about your order? Reply to this email and our team will help.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`

  return {
    subject: `Your Indisco Supermarket order #${order.display_id}`,
    html,
  }
}
