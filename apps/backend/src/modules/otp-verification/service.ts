import { MedusaError } from "@medusajs/framework/utils"
import crypto from "node:crypto"

type Options = {
  /** How long a code stays valid. Default 10 minutes. */
  ttl_seconds?: number
  /** Minimum time between two codes for the same account. Default 60 seconds. */
  resend_cooldown_seconds?: number
  /** Wrong guesses allowed before a new code is needed. Default 5. */
  max_attempts?: number
}

type Verification = {
  id: string
  auth_identity_id: string
  entity_id: string
  entity_type: string
  code_provider: string
  requested_at: Date | string | null
  verified_at: Date | string | null
  provider_metadata?: { code_hash?: string; attempts?: number } | null
  metadata?: Record<string, unknown> | null
}

/** The auth module's internal CRUD service for verification records. */
type VerificationStore = {
  list(
    filters: Record<string, unknown>,
    config?: Record<string, unknown>,
    context?: Record<string, unknown>
  ): Promise<Verification[]>
  create(data: Record<string, unknown>, context?: Record<string, unknown>): Promise<Verification>
  update(data: Record<string, unknown>, context?: Record<string, unknown>): Promise<Verification>
}

type RequestInput = {
  auth_identity_id: string
  entity_id: string
  entity_type: string
  code_provider: string
  metadata?: Record<string, unknown> | null
}

type ConfirmInput = {
  auth_identity_id?: string
  code?: string
  code_provider?: string
}

const hashCode = (authIdentityId: string, code: string) =>
  crypto.createHash("sha256").update(`${authIdentityId}:${code}`).digest("hex")

/**
 * Email verification with a 6-digit one-time code (OTP) instead of a link.
 *
 * A code is only valid for the account that asked for it: confirming needs the
 * limited token returned by a correct sign-in, so a code cannot be guessed
 * against someone else's account. Codes expire, are stored hashed, and lock
 * after too many wrong guesses.
 */
class OtpVerificationProvider {
  static identifier = "otp"
  identifier = OtpVerificationProvider.identifier

  protected store_: VerificationStore
  protected options_: Options

  constructor(
    { authVerificationService }: { authVerificationService: VerificationStore },
    options: Options = {}
  ) {
    this.store_ = authVerificationService
    this.options_ = options
  }

  protected get ttlMs_() {
    return (this.options_.ttl_seconds ?? 600) * 1000
  }

  async request(data: RequestInput, sharedContext: Record<string, unknown> = {}) {
    const [existing] = await this.store_.list(
      {
        auth_identity_id: data.auth_identity_id,
        entity_id: data.entity_id,
        entity_type: data.entity_type,
      },
      { take: 1, skip: 0 },
      sharedContext
    )

    if (existing?.verified_at) {
      return existing
    }

    const cooldownMs = (this.options_.resend_cooldown_seconds ?? 60) * 1000
    if (
      existing?.provider_metadata?.code_hash &&
      existing.requested_at &&
      Date.now() - new Date(existing.requested_at).getTime() < cooldownMs
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Please wait a minute before asking for another code."
      )
    }

    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0")
    const requestedAt = new Date()
    const providerMetadata = {
      code_hash: hashCode(data.auth_identity_id, code),
      attempts: 0,
    }

    const verification = existing
      ? await this.store_.update(
          {
            id: existing.id,
            code_provider: data.code_provider,
            provider_metadata: providerMetadata,
            requested_at: requestedAt,
            verified_at: null,
          },
          sharedContext
        )
      : await this.store_.create(
          {
            auth_identity_id: data.auth_identity_id,
            entity_id: data.entity_id,
            entity_type: data.entity_type,
            code_provider: data.code_provider,
            provider_metadata: providerMetadata,
            requested_at: requestedAt,
            metadata: data.metadata ?? null,
          },
          sharedContext
        )

    return {
      ...verification,
      code,
      expires_at: new Date(requestedAt.getTime() + this.ttlMs_),
    }
  }

  async confirm(data: ConfirmInput, sharedContext: Record<string, unknown> = {}) {
    if (!data.auth_identity_id) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Please sign in again to confirm your email."
      )
    }
    if (!data.code || !/^\d{6}$/.test(data.code)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Enter the 6-digit code from your email."
      )
    }

    const candidates = await this.store_.list(
      { auth_identity_id: data.auth_identity_id, code_provider: "otp" },
      {},
      sharedContext
    )
    const verification = candidates
      .slice()
      .sort(
        (a, b) =>
          new Date(b.requested_at ?? 0).getTime() -
          new Date(a.requested_at ?? 0).getTime()
      )[0]

    if (!verification) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "There is no pending code. Request a new one."
      )
    }
    if (verification.verified_at) {
      return verification
    }

    const attempts = verification.provider_metadata?.attempts ?? 0
    const maxAttempts = this.options_.max_attempts ?? 5
    if (attempts >= maxAttempts) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Too many wrong codes. Request a new code."
      )
    }

    const requestedAt = new Date(verification.requested_at ?? 0).getTime()
    if (requestedAt + this.ttlMs_ <= Date.now()) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This code has expired. Request a new one."
      )
    }

    const expected = Buffer.from(verification.provider_metadata?.code_hash ?? "", "hex")
    const actual = Buffer.from(hashCode(data.auth_identity_id, data.code), "hex")
    const matches =
      expected.length === actual.length && crypto.timingSafeEqual(expected, actual)

    if (!matches) {
      await this.store_.update(
        {
          id: verification.id,
          provider_metadata: { ...verification.provider_metadata, attempts: attempts + 1 },
        },
        sharedContext
      )
      const remaining = maxAttempts - attempts - 1
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        remaining > 0
          ? `That code is not right. ${remaining} ${remaining === 1 ? "try" : "tries"} left.`
          : "Too many wrong codes. Request a new code."
      )
    }

    return await this.store_.update(
      {
        id: verification.id,
        verified_at: new Date(),
        provider_metadata: { attempts },
      },
      sharedContext
    )
  }
}

export default OtpVerificationProvider
