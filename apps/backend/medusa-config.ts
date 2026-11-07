import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const fs = require("fs")
const path = require("path")

const svgDataUri = (file: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    fs.readFileSync(path.join(process.cwd(), "brand", file), "utf8")
  )}`

/**
 * Brands the admin dashboard with the R'Indisco logo: browser tab icon and
 * title, the logo on the sign-in screens, and the store icon in the sidebar.
 * Medusa has no logo setting, so this is injected into the admin's index.html.
 */
const indiscoAdminBranding = () => {
  const logo = svgDataUri("logo.svg")
  const logoLight = svgDataUri("logo-light.svg")
  const mark = svgDataUri("logo-mark.svg")

  const css = `
    /* Sign-in, invite and reset screens: replace Medusa's mark with our logo. */
    .after\\:button-neutral-gradient[class*="h-[50px]"] {
      width: 240px !important;
      height: 76px !important;
      margin-bottom: 1.25rem !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      background: url("${logo}") center / contain no-repeat !important;
    }
    .after\\:button-neutral-gradient[class*="h-[50px]"]::after,
    .after\\:button-neutral-gradient[class*="h-[50px]"] > div {
      display: none !important;
    }
    /* Dark mode: use the white version of the logo. */
    html.dark .after\\:button-neutral-gradient[class*="h-[50px]"] {
      background-image: url("${logoLight}") !important;
    }
    /* Sidebar: show the Indisco icon instead of the store-name initial. */
    button[class*="grid-cols-[24px_1fr_15px]"] > :first-child {
      background: url("${mark}") center / cover no-repeat !important;
      color: transparent !important;
      box-shadow: none !important;
    }
    button[class*="grid-cols-[24px_1fr_15px]"] > :first-child * {
      opacity: 0 !important;
    }
  `

  return {
    name: "indisco-admin-branding",
    transformIndexHtml(html: string) {
      return html
        .replace(/<link[^>]*rel="icon"[^>]*>/gi, "")
        .replace(/<title>[^<]*<\/title>/i, "")
        .replace(
          "</head>",
          `<title>Indisco Supermarket Admin</title><link rel="icon" type="image/svg+xml" href="${mark}" /><style>${css}</style></head>`
        )
    },
  }
}

// Production runs on Redis (events, workflows, locks, sessions). In development
// Medusa falls back to in-memory versions, so no Redis is needed locally.
const redisUrl = process.env.REDIS_URL
const useRedis = process.env.NODE_ENV === "production" && !!redisUrl

module.exports = defineConfig({
  admin: {
    // The public address of this backend. Optional: the admin is served by the
    // backend itself, so it falls back to the browser's own address.
    backendUrl: process.env.MEDUSA_BACKEND_URL,
    // Medusa merges what this returns into its own Vite config, so return
    // only the additions. Returning the whole config duplicates its plugins.
    vite: () => ({
      plugins: [indiscoAdminBranding()],
    }),
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: useRedis ? redisUrl : undefined,
    // Hosted Postgres reached over the public internet needs SSL; set
    // DATABASE_SSL=true for that. Private-network URLs do not need it.
    ...(process.env.DATABASE_SSL === "true"
      ? {
          databaseDriverOptions: {
            connection: { ssl: { rejectUnauthorized: false } },
          },
        }
      : {}),
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
      // Customers must confirm their email before they can sign in. Guest
      // checkout is unaffected: it never creates a signed-in account.
      authVerificationsPerActor: {
        customer: [
          {
            entity_type: "email",
            auth_provider: "emailpass",
          },
        ],
      },
    }
  },
  modules: [
    ...(useRedis
      ? [
          {
            resolve: "@medusajs/medusa/event-bus-redis",
            options: { redisUrl },
          },
          {
            resolve: "@medusajs/medusa/workflow-engine-redis",
            options: { redis: { redisUrl } },
          },
          {
            resolve: "@medusajs/medusa/locking",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/locking-redis",
                  id: "locking-redis",
                  is_default: true,
                  options: { redisUrl },
                },
              ],
            },
          },
        ]
      : []),
    {
      resolve: "./src/modules/review",
    },
    {
      // Same as Medusa's default auth setup, plus the email OTP provider.
      resolve: "@medusajs/medusa/auth",
      options: {
        mfa: {
          encryption_key: process.env.AUTH_MFA_ENCRYPTION_KEY,
        },
        providers: [
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
        ],
        verification: {
          providers: [
            {
              resolve: "./src/modules/otp-verification",
              id: "otp",
              options: {
                ttl_seconds: 600,
                resend_cooldown_seconds: 60,
                max_attempts: 5,
              },
            },
          ],
        },
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "medusa-payment-paystack",
            options: {
              secret_key: process.env.PAYSTACK_SECRET_KEY,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "./src/modules/cloudinary-file",
            id: "cloudinary",
            options: {
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
              api_key: process.env.CLOUDINARY_API_KEY,
              api_secret: process.env.CLOUDINARY_API_SECRET,
              folder: "indisco",
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/resend-notification",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.EMAIL_FROM,
              reply_to: process.env.EMAIL_REPLY_TO,
            },
          },
          {
            resolve: "@medusajs/medusa/notification-local",
            id: "local",
            options: {
              channels: ["feed"],
            },
          },
        ],
      },
    },
  ],
})
