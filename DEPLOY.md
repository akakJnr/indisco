# Deploying R'Indisco Supermarket on Render

Everything runs on Render in one region (Frankfurt, closest to Nigeria), so the
services talk over Render's fast private network:

| Service | What it is |
|---|---|
| `indisco-db` | Postgres database |
| `indisco-redis` | Redis (events, workflows, locks, sessions) |
| `indisco-backend` | Medusa backend; the admin dashboard is at `/app` |
| `indisco-storefront` | The Next.js store |

Costs: Postgres, Redis and both web services use paid plans (see `render.yaml`).
Free web services go to sleep, which breaks emails and payment webhooks, so the
backend should not run on the free plan.

## 1. Create everything from the blueprint

1. In Render choose **New > Blueprint** and connect the GitHub repo
   `akakJnr/indisco`. Render reads `render.yaml`.
2. Render asks for the values marked `sync: false`. For now:
   - **Secrets and keys:** `PAYSTACK_SECRET_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`,
     `EMAIL_REPLY_TO`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
     `CLOUDINARY_API_SECRET`. Use fresh keys (rotate the ones used in
     development).
   - **Leave blank for now:** `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`,
     `NEXT_PUBLIC_*`. They need the addresses Render creates; you set them in
     step 4.
3. Apply the blueprint. The database and Redis come up first. The first
   storefront build is expected to fail until step 4 is done.

If Render does not offer Postgres 18 yet, set `postgresMajorVersion: "17"` in
`render.yaml` and commit.

## 2. Put your data in the new database

Pick **A** (keep everything you have now) or **B** (start clean).

### A. Copy the current local data (recommended)

This keeps the Nigeria region, the whole catalog, shipping, tax, the
publishable key, reviews and your admin user.

1. In Render open `indisco-db` > **Connections** and temporarily add your own IP
   address to the allow list. Copy the **External Database URL**.
2. Start your local database (`start-dev-db.cmd`), then from a terminal with the
   PostgreSQL 18 tools on the path:

   ```bash
   pg_dump "<LOCAL_DATABASE_URL>" -Fc --no-owner --no-privileges -f indisco.dump
   pg_restore --no-owner --no-privileges -d "<RENDER_EXTERNAL_DATABASE_URL>" indisco.dump
   ```

   `<LOCAL_DATABASE_URL>` is the `DATABASE_URL` line in `apps/backend/.env`.
3. Remove your IP from the allow list again.
4. Redeploy `indisco-backend`. It applies any pending migrations on start.

Orders and customers created while testing come along. Delete them in the admin
if you do not want them live.

### B. Start clean

1. Let the backend deploy once. Its migrations create the tables and Medusa's
   default demo data (a Europe region).
2. Open the backend service **Shell** and run:

   ```bash
   cd apps/backend/.medusa/server
   npx medusa exec ./src/scripts/setup-nigeria.js
   npx medusa exec ./src/scripts/seed-indisco.js
   ```

   Warning: `seed-indisco.js` deletes every product, category and collection
   first. It also uploads about 80 images to Cloudinary.

## 3. Create your real admin user

In the backend **Shell**:

```bash
cd apps/backend/.medusa/server
npx medusa user -e you@yourdomain.com -p "a-strong-password"
```

If you used option A, also remove the old `admin@store.local` account in the
admin (Settings > Users), because its password was generated for development.

## 4. Connect the storefront and backend

1. Copy the public address of each service from Render, for example
   `https://indisco-backend.onrender.com` and
   `https://indisco-storefront.onrender.com`.
2. On **indisco-backend** set:
   - `STORE_CORS` = the storefront address
   - `ADMIN_CORS` = the backend address
   - `AUTH_CORS` = both, separated by a comma
3. Find the publishable API key: open the admin (`<backend address>/app`) >
   Settings > Publishable API keys, and copy the token (it starts with `pk_`).
4. On **indisco-storefront** set:
   - `NEXT_PUBLIC_MEDUSA_BACKEND_URL` = the backend address
   - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` = the key from step 3
   - `NEXT_PUBLIC_BASE_URL` = the storefront address
5. Redeploy the storefront (these values are baked in at build time).

## 5. After it is live

- **Paystack:** in the Paystack dashboard set the webhook URL to
  `<backend address>/hooks/payment/paystack`. Switch to live keys only when you
  are ready to take real payments.
- **Resend:** confirm your sending domain is verified, or sign-up codes and
  order emails will not be delivered.
- **Custom domain:** add it to the storefront in Render, then update
  `STORE_CORS`, `AUTH_CORS` and `NEXT_PUBLIC_BASE_URL` and redeploy both.
- **Test once:** sign up with a real email (you should get a 6-digit code),
  place a test order, and confirm the confirmation email arrives.

## Notes

- Redis modules turn on only in production (`NODE_ENV=production` with
  `REDIS_URL` set). Local development needs no Redis.
- If you ever must use a database outside Render's private network, set
  `DATABASE_SSL=true` on the backend. Expect slower requests: Medusa runs many
  queries per action, so keep the database in the same region as the backend.
- Secrets live only in Render's environment settings, never in this repository.
