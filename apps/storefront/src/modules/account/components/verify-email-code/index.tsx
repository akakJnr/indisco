"use client"

import { resendVerificationCode, verifyEmailCode } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { Button } from "@modules/common/components/ui"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const RESEND_SECONDS = 60
const CODE_LENGTH = 6

type Props = {
  email: string
  /** Kept in memory only, to finish signing in once the code is confirmed. */
  password: string
  onBack: () => void
}

/** Asks for the 6-digit code emailed to a new or unverified account. */
export default function VerifyEmailCode({ email, password, onBack }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const handleVerify = async (event?: React.FormEvent) => {
    event?.preventDefault()
    if (code.length !== CODE_LENGTH || verifying) return

    setError(null)
    setNotice(null)
    setVerifying(true)
    const result = await verifyEmailCode(email, password, code)
    setVerifying(false)

    if (result?.state === "success") {
      router.refresh()
      return
    }
    setError(
      result?.state === "error" ? result.error : "Could not verify the code."
    )
    setCode("")
    inputRef.current?.focus()
  }

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return

    setError(null)
    setNotice(null)
    setResending(true)
    const result = await resendVerificationCode(email, password)
    setResending(false)

    if (result.ok) {
      setNotice("A new code is on its way. Check your inbox and spam folder.")
      setSecondsLeft(RESEND_SECONDS)
      setCode("")
      inputRef.current?.focus()
    } else {
      setError(result.error)
    }
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="verify-email-code"
    >
      <h1 className="text-large-semi uppercase mb-4 text-center">
        Verify your email
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-1">
        We sent a 6-digit code to
      </p>
      <p className="text-center text-base-semi text-ui-fg-base mb-6 break-all">
        {email}
      </p>

      <form className="w-full" onSubmit={handleVerify}>
        <label htmlFor="email-code" className="sr-only">
          6-digit verification code
        </label>
        <input
          id="email-code"
          ref={inputRef}
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
          }
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={CODE_LENGTH}
          placeholder="000000"
          className="w-full rounded-xl border border-grey-20 bg-white px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-grey-90 outline-none transition-colors placeholder:text-grey-30 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          data-testid="email-code-input"
        />

        <ErrorMessage error={error} data-testid="verify-code-error" />
        {notice && (
          <p
            className="mt-2 text-center text-small-regular text-brand-700"
            role="status"
            data-testid="verify-code-notice"
          >
            {notice}
          </p>
        )}

        <Button
          type="submit"
          size="large"
          className="w-full mt-6"
          isLoading={verifying}
          disabled={code.length !== CODE_LENGTH}
          data-testid="verify-code-button"
        >
          Verify and continue
        </Button>
      </form>

      <p className="mt-6 text-center text-small-regular text-ui-fg-base">
        Did not get it?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={secondsLeft > 0 || resending}
          className="font-semibold text-brand-700 underline disabled:cursor-not-allowed disabled:text-grey-40 disabled:no-underline"
          data-testid="resend-code-button"
        >
          {resending
            ? "Sending..."
            : secondsLeft > 0
              ? `Resend code in ${secondsLeft}s`
              : "Resend code"}
        </button>
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-3 text-small-regular text-grey-50 underline"
        data-testid="verify-back-button"
      >
        Use a different account
      </button>
    </div>
  )
}
