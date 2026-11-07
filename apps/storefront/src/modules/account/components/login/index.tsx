import { login, type CustomerAuthState } from "@lib/data/customer"
import VerifyEmailCode from "@modules/account/components/verify-email-code"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState, useState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  // Set when the account exists but its email is not confirmed yet. The
  // credentials stay in memory only, to finish signing in after the code.
  const [pendingVerification, setPendingVerification] = useState<{
    email: string
    password: string
  } | null>(null)

  const [message, formAction] = useActionState(
    async (previous: CustomerAuthState, formData: FormData) => {
      const result = await login(previous, formData)
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
        onBack={() => setPendingVerification(null)}
      />
    )
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Welcome back</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Sign in to access an enhanced shopping experience.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="login-error-message"
        />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          Sign in
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          Join us
        </button>
        .
      </span>
    </div>
  )
}

export default Login
