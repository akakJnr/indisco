declare module "@paystack/inline-js" {
  type ResumeTransactionCallbacks = {
    onSuccess?: (transaction: { reference: string; status: string }) => void
    onCancel?: () => void
    onError?: (error: { message?: string }) => void
    onLoad?: (response: unknown) => void
  }

  export default class PaystackPop {
    constructor()
    resumeTransaction(
      accessCode: string,
      callbacks?: ResumeTransactionCallbacks
    ): void
  }
}
