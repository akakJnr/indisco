import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { sendNotificationsStep } from "@medusajs/medusa/core-flows"
import { verificationCodeEmail } from "../lib/emails/verification-code"

type Input = {
  email: string
  code: string
  expires_at?: Date | string | null
}

export const sendVerificationCodeWorkflow = createWorkflow(
  "send-verification-code",
  (input: Input) => {
    const notifications = transform({ input }, ({ input }) => {
      const minutes = input.expires_at
        ? Math.max(
            1,
            Math.round(
              (new Date(input.expires_at).getTime() - Date.now()) / 60000
            )
          )
        : 10
      const { subject, html } = verificationCodeEmail(input.code, minutes)

      return [
        {
          to: input.email,
          channel: "email",
          template: "verification-code",
          content: { subject, html },
        },
      ]
    })

    sendNotificationsStep(notifications)

    return new WorkflowResponse({ sent: true })
  }
)
