import type {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import { Resend } from "resend"

type Options = {
  api_key: string
  from: string
  reply_to?: string
}

/**
 * Sends email notifications through Resend. The notification's `content`
 * carries the subject and HTML; `data` is not rendered by this provider.
 */
class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "resend"

  protected options_: Options
  protected client_: Resend

  static validateOptions(options: Record<string, unknown>) {
    if (!options.api_key || !options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Resend options "api_key" and "from" are required.'
      )
    }
  }

  constructor(_container: Record<string, unknown>, options: Options) {
    super()
    this.options_ = options
    this.client_ = new Resend(options.api_key)
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const subject = notification.content?.subject ?? "Indisco Supermarket"
    const html = notification.content?.html ?? notification.content?.text ?? ""

    // Development switch: log the email instead of sending it.
    if (process.env.EMAIL_DRY_RUN === "true") {
      console.log(
        `[email dry run] to=${notification.to} template=${notification.template} subject="${subject}"`
      )
      return { id: "dry-run" }
    }

    const { data, error } = await this.client_.emails.send({
      from: notification.from || this.options_.from,
      to: notification.to,
      subject,
      html,
      ...(this.options_.reply_to ? { replyTo: this.options_.reply_to } : {}),
    })

    if (error) {
      const status = error.statusCode ? ` HTTP ${error.statusCode}` : ""
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Resend failed to send the email (${error.name}${status}): ${error.message}`
      )
    }

    return { id: data?.id }
  }
}

export default ResendNotificationProviderService
