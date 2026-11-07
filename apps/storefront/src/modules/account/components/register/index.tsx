"use client"

import { useActionState, useState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup, type CustomerAuthState } from "@lib/data/customer"
import VerifyEmailCode from "@modules/account/components/verify-email-code"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  // Set once the account is created and its email still needs confirming.
  const [pendingVerification, setPendingVerification] = useState<{
    email: string
    password: string
  } | null>(null)

  const [message, formAction] = useActionState(
    async (previous: CustomerAuthState, formData: FormData) => {
      const result = await signup(previous, formData)
      if (result?.state === "verification_required") {
        setPendingVerification({
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        })
      }
      return result
    },
    null as CustomerAuthState
  )

  if (pendingVerification) {
    return (
      <VerifyEmailCode
        email={pendingVerification.email}
        password={pendingVerification.password}
        onBack={() => {
          setPendingVerification(null)
          setCurrentView(LOGIN_VIEW.SIGN_IN)
        }}
      />
    )
  }

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Become a Indisco Supermarket Member
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Create your Indisco Supermarket Member profile, and get access to an enhanced
        shopping experience.
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="register-error"
        />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          By creating an account, you agree to Indisco Supermarket&apos;s{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            Terms of Use
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Join
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register
