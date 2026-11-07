import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import {
  AuthWorkflowEvents,
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"
import { sendVerificationCodeWorkflow } from "../workflows/send-verification-code"

type VerificationRequestedData = {
  entity_id: string
  entity_type: string
  code_provider: string
  code?: string
  expires_at?: string | Date | null
}

/** Emails the one-time code when a customer must confirm their email. */
export default async function sendVerificationCodeHandler({
  event: { data },
  container,
}: SubscriberArgs<VerificationRequestedData>) {
  // Only the OTP flow for email addresses is handled here.
  if (
    data.entity_type !== "email" ||
    data.code_provider !== "otp" ||
    !data.code
  ) {
    return
  }

  try {
    await sendVerificationCodeWorkflow(container).run({
      input: {
        email: data.entity_id,
        code: data.code,
        expires_at: data.expires_at,
      },
    })
  } catch (error) {
    // The customer can ask for a new code; never fail the sign-in request.
    const message =
      error !== null &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
        ? error.message
        : "Unknown notification error"

    container
      .resolve(ContainerRegistrationKeys.LOGGER)
      .error(`Could not send the verification code email: ${message}`)
  }
}

export const config: SubscriberConfig = {
  event: AuthWorkflowEvents.VERIFICATION_REQUESTED,
}
