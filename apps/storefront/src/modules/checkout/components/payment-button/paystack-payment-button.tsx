"use client"

import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

type PaystackPaymentButtonProps = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}

const PaystackPaymentButton: React.FC<PaystackPaymentButtonProps> = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const session = cart.payment_collection?.payment_sessions?.find(
    (paymentSession) => paymentSession.provider_id === "pp_paystack"
  )
  const accessCode = session?.data?.paystackTxAccessCode as string | undefined

  const completeOrder = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = async () => {
    if (!accessCode) {
      setErrorMessage("Payment is not ready. Go back and select Paystack again.")
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      // Loaded on demand: the library touches `window`.
      const { default: PaystackPop } = await import("@paystack/inline-js")

      new PaystackPop().resumeTransaction(accessCode, {
        // The backend verifies the transaction with Paystack when the order is
        // placed, so success here only triggers order completion.
        onSuccess: () => {
          completeOrder()
        },
        onCancel: () => {
          setSubmitting(false)
        },
        onError: (error: { message?: string }) => {
          setErrorMessage(error?.message ?? "Paystack could not start the payment.")
          setSubmitting(false)
        },
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Paystack could not start the payment."
      )
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        disabled={notReady || !accessCode}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Pay with Paystack
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="paystack-payment-error-message"
      />
    </>
  )
}

export default PaystackPaymentButton
