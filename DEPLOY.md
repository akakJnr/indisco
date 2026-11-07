# Deploying R'Indisco Supermarket on Render (free demo)

This guide uses only Render's **free** plans, so it costs nothing. It is meant
for a demo, not for real customers. The last section lists what to change when
you go live.

| Service | What it is | Plan |
|---|---|---|
| `indisco-db` | Postgres database | Free |
| `indisco-backend` | Medusa backend; the admin dashboard is at `/app` | Free |
| `indisco-storefront` | The Next.js store | Free |

There is no Redis in the demo setup. Events and workflows run in memory, which
works for one instance but is not meant for production.

## What "free" means here

- **Sleeping:** a free web service falls asleep after about 15 minutes with no
  visitors. The next visit waits roughly a minute while it wakes up. Wake the
  backend before a demo by opening `<backend address>/health`.
- **Database expiry:** the free Postgres database is deleted after **30 days**
  (Render lets you upgrade it before then). Keep the dump file; you can restore
  it into a new free database.
- **Memory:** free web services have **512 MB**, which is tight for Medusa. See
  *If something runs out of memory* below.
- **Emails and webhooks:** a sleeping backend can miss a Paystack webhook. In
  test mode this does not matter. The order and sign-up code emails are sent
  while the backend is awake handling the request.
- **Free hours:** Render gives a workspace 750 free instance hours a month.
  Sleeping services use fewer, so two services are fine for a demo.

## 1. Create everything from the blueprint

A Blueprint is only a settings file; it is free. The cost depends on the plans
inside it, and `render.yaml` now uses free plans only.

1. In Render choose **New > Blueprint** and connect the GitHub repo
   `akakJnr/indisco`. Render reads `render.yaml`.
2. Render asks for the values marked `sync: false`. For now enter:
   `PAYSTACK_SECRET_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`,
   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Use
   fresh keys, not the ones used in development. Leave `STORE_CORS`,
   `ADMIN_CORS`, `AUTH_CORS` and `NEXT_PUBLIC_*` blank; they need the addresses
   Render creates (step 4).
3. Apply the blueprint. The first storefront build is expected to fail until
   step 4 is done, because the storefront needs the backend's address.

If Render does not offer Postgres 18 yet, set `postgresMajorVersion: "17"` in
`render.yaml` and commit. If Render asks for a payment card before it will
create a Blueprint, create the three services by hand instead (see *Without the
blueprint* at the end); the free plans are the same.

## 2. Put your data in the new database

### A. Copy the current local data (recommended)

This keeps the Nigeria region, the whole catalog, shipping, tax, the
publishable key, reviews and your admin user. The dump is already made:
`ecommerce\indisco-local.dump` (outside the git repo; it contains customer
emails, so keep it private and delete it when you are done).

1. In Render open `indisco-db` > **Connections**, temporarily add your own IP
   address to the allow list, and copy the **External Database URL**.
2. Run:

   ```bash
   "C:\Program Files\PostgreSQL\18\bin\pg_restore.exe" --no-owner --no-privileges -d "<EXTERNAL_DATABASE_URL>" "C:\Users\ASUS\Documents\Codes\ebeano\ecommerce\indisco-local.dump"
   ```

3. Remove your IP from the allow list again.
4. Redeploy `indisco-backend`. It applies any pending migrations on start.

To make a fresh dump later (start your local database first with
`start-dev-db.cmd`):

```bash
pg_dump "<LOCAL_DATABASE_URL>" -Fc --no-owner --no-privileges -f indisco-local.dump
```

`<LOCAL_DATABASE_URL>` is the `DATABASE_URL` line in `apps/backend/.env`.

### B. Start clean

1. Let the backend deploy once. Its migrations create the tables and Medusa's
   default demo data (a Europe region).
2. Open the backend service **Shell** (Render's shell may need a paid plan; if
   it is unavailable, use option A) and run:

   ```bash
   cd apps/backend/.medusa/server
   npx medusa exec ./src/scripts/setup-nigeria.js
   npx medusa exec ./src/scripts/seed-indisco.js
   ```

   Warning: `seed-indisco.js` deletes every product, category and collection
   first, and uploads about 80 images to Cloudinary.

## 3. Create your real admin user

Render's free plan may not include a shell. Without one, use option A and sign
in with the admin account from your local setup (its password is in
`apps/backend/.admin-credentials.txt` on your PC), then immediately create your
own admin under Settings > Users, delete the old one, and change passwords.

With a shell:

```bash
cd apps/backend/.medusa/server
npx medusa user -e you@yourdomain.com -p "a-strong-password"
```

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
5. Redeploy the storefront (these values are baked in at build time). The
   backend must be awake and healthy while the storefront builds.

## 5. After it is live

- **Paystack:** in the Paystack dashboard set the webhook URL to
  `<backend address>/hooks/payment/paystack`. Stay on test keys for the demo.
- **Resend:** confirm your sending domain is verified, or sign-up codes and
  order emails will not be delivered.
- **Test once:** sign up with a real email (you should get a 6-digit code),
  place a test order, and confirm the confirmation email arrives.

## If something runs out of memory

Medusa is memory hungry and the free plan has 512 MB.

- **The build fails or is killed:** the admin dashboard is the heaviest part.
  On `indisco-backend` add the variable `DISABLE_MEDUSA_ADMIN=true` and
  redeploy. The build then skips the admin (about 12 seconds instead of about
  100). You lose the admin on Render; you can still manage the store by running
  the admin locally against a database copy.
- **The service restarts with "out of memory" while running:** the same switch
  helps. If it still happens, the plan is too small; the fix is a larger paid
  plan (2 GB).

## Going live later

Switch these for real customers:

1. Change every `plan:` in `render.yaml` from `free` to a paid plan, so nothing
   sleeps or expires. Use a 2 GB web plan for the backend.
2. Add Redis: create a Key Value instance in the same region and set `REDIS_URL`
   on the backend to its internal address. The Redis modules in
   `apps/backend/medusa-config.ts` turn on by themselves in production when
   `REDIS_URL` is set. Remove `NODE_OPTIONS` from the backend.
3. Use live Paystack keys, a verified Resend domain, a custom domain (update
   `STORE_CORS`, `AUTH_CORS`, `NEXT_PUBLIC_BASE_URL` and redeploy both), and new
   secrets everywhere.

## Without the blueprint

In Render choose **New** for each item, all with the **Free** plan, in the same
region:

1. **PostgreSQL** named `indisco-db`. Copy its **Internal Database URL**.
2. **Web Service** `indisco-backend` from the repo. Runtime Node. Build command
   and start command exactly as in `render.yaml`. Environment: the variables
   listed under `indisco-backend` in `render.yaml`, with `DATABASE_URL` set to
   the internal URL, and your own long random `JWT_SECRET` and `COOKIE_SECRET`.
3. **Web Service** `indisco-storefront` from the same repo, with the build and
   start commands and variables listed under it in `render.yaml`.

Then follow steps 2 to 5 above.

## Notes

- Redis modules turn on only in production with `REDIS_URL` set. Local
  development needs no Redis.
- If you ever use a database outside Render's private network, set
  `DATABASE_SSL=true` on the backend. Expect slower requests: Medusa runs many
  queries per action, so keep the database in the same region as the backend.
- Secrets live only in Render's environment settings, never in this repository.
