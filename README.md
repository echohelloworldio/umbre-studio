# Umbre Studio Commerce v3 — full-store starter

React + Vite storefront with 22 sample lamps, product/category/filter pages, customer authentication and account area, saved addresses, order tracking, return requests, delivery issue reporting, admin order operations, Razorpay payment verification/refunds, Supabase database/RLS, and Shiprocket forward/reverse shipment functions.

> This is a full integration starter, not a claim that a live merchant account has been configured or that every carrier response has been verified against your account. Run all integrations in sandbox/test mode first. The actual courier serviceability, pickup availability, shipment payload requirements, labels, webhook payloads and refund settlement depend on your merchant account and products.

## The Halo product page update

The storefront now includes **The Halo Sculptural Table Lamp** as the first product in the home and shop grids. Its product detail page includes a four-image gallery (hero render, bedside lifestyle render, close-up detail and the original design board), clickable thumbnails, colour choices, dimensions, a specifications tab, and an explicit prototype/safety note. Product imagery is stored locally under `public/product-images/`.

The generated STL files so far are multiple components and revisions of **one lamp design (The Halo)**: shade, base and holder adapter. They are not separate lamp models, so the catalogue adds The Halo as one product rather than falsely listing those parts or CAD revisions as separate lamps. Other catalogue entries remain concept/sample listings until separate CAD files and product specifications are created. The displayed ₹1,999 price is an editable launch-price assumption, not a validated commercial price.


## 1. Run the storefront locally

Requires Node.js 20+ recommended.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Add the Supabase project URL and anon/publishable key to `.env`; restart Vite after changes. `VITE_RAZORPAY_KEY_ID` is the public checkout key ID only. Do not put secret keys in any `VITE_` variable.

## 2. Set up the database

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`. It includes an additive migration section for the earlier v2 schema.
3. Run `supabase/seed.sql` to load 22 sample catalog entries.
4. In Supabase Authentication, configure the site's URL and allowed redirect URLs. Decide whether email confirmation should be enabled for customer sign-up.
5. Create your account through `/login` in the app. Promote that user to admin from Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
```

Do not expose the service-role key to the browser. RLS policies restrict customer data by authenticated user; admin-only operations go through Edge Functions which verify the caller's admin role.

## 3. Razorpay setup

Use Razorpay Test Mode first. Configure the Key ID in `.env`, then configure the following **server-side Supabase Edge Function secrets** (never in `.env` or browser code):

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY SITE_URL=http://localhost:5173
```

`SUPABASE_URL` is normally provided to Edge Functions by Supabase. If your project does not expose `SUPABASE_ANON_KEY` automatically, set it as a secret as shown above. Keep the live key secret separate from test credentials.

Deploy:

```powershell
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy razorpay-webhook
supabase functions deploy admin-refund-payment
```

In the Razorpay dashboard, register the deployed `razorpay-webhook` URL and subscribe to at least `payment.captured`, `payment.failed`, and `order.paid`. The webhook secret must exactly match `RAZORPAY_WEBHOOK_SECRET`. Test duplicate events, failed payments, closing the checkout window, full refunds and partial refunds before launch.

## 4. Shiprocket shipping integration

Shiprocket is the suggested first integration because its aggregator APIs cover order creation, courier/AWB assignment, pickup scheduling, tracking, NDR handling and return shipments in one account. You can choose supported couriers through your Shiprocket panel. If you want a direct Delhivery contract later, add a separate carrier adapter; direct Delhivery API access requires a Delhivery business account and its own token/serviceability setup.

Create a Shiprocket API user in the Shiprocket panel, verify your pickup location and package dimensions/weights, and set these secrets in Supabase:

```powershell
supabase secrets set SHIPROCKET_EMAIL=YOUR_API_USER_EMAIL SHIPROCKET_PASSWORD=YOUR_API_USER_PASSWORD SHIPROCKET_PICKUP_LOCATION=YOUR_REGISTERED_PICKUP_LOCATION SHIPROCKET_WEBHOOK_SECRET=YOUR_RANDOM_WEBHOOK_SECRET STORE_RETURN_NAME="Umbre Studio Returns" STORE_RETURN_ADDRESS="YOUR_RETURN_ADDRESS" STORE_RETURN_CITY="YOUR_CITY" STORE_RETURN_STATE="YOUR_STATE" STORE_RETURN_PINCODE=YOUR_RETURN_PINCODE STORE_RETURN_PHONE=YOUR_BUSINESS_PHONE STORE_RETURN_EMAIL=YOUR_SUPPORT_EMAIL DEFAULT_STATE=Gujarat RETURN_WINDOW_DAYS=7
```

The pickup location must exactly match the pickup location configured in Shiprocket. The return address is where returned goods should be received. Configure actual weights, dimensions, origin address, business contact details, and return policy before making a shipment.

Deploy:

```powershell
supabase functions deploy shiprocket-create-shipment
supabase functions deploy shiprocket-create-return
supabase functions deploy shiprocket-webhook
```

Configure the Shiprocket tracking webhook to call the deployed `shiprocket-webhook` URL and send `x-webhook-secret: YOUR_RANDOM_WEBHOOK_SECRET` if your Shiprocket webhook settings support custom headers. If the account does not support custom webhook headers, do not expose an unprotected endpoint as-is; put an authenticated relay in front or implement the provider's supported signature/authentication scheme. Restrict `SITE_URL` to the production storefront origin in production.

The forward-shipment function creates a Shiprocket order, assigns an AWB, requests pickup and attempts to generate a label. Inspect provider responses in test mode because available courier services and response fields vary by account. Reverse pickups are created after an admin approves a return.

## 5. Included pages and workflows

- `/` home and featured products
- `/shop` product grid, categories, search, sort, colour and price filters
- `/product/:slug` individual product details
- `/login` customer sign-up/sign-in
- `/account` profile, saved addresses, order history, return requests and issue reporting
- `/track` guest order tracking using order number + checkout email; exposes only a limited tracking summary
- `/admin` admin dashboard for order status, shipment creation, internal notes, return decisions, reverse pickup creation, delivery issues and refund initiation
- Supabase Edge Functions for checkout order creation, payment verification, Razorpay webhook reconciliation, admin updates/refunds, public tracking, customer returns/issues and Shiprocket forward/reverse shipments/webhooks

## 6. Required production work before launch

- Replace the illustrative products, stock counts, photos, prices, actual electrical specifications, safety certifications, materials, dimensions and delivery/return claims with verified information. Confirm the images are licensed for your use.
- Configure shipping rates and delivery estimates at checkout. This starter currently uses zero shipping charge and does not dynamically quote courier prices.
- Add atomic inventory reservation/decrement and restoration on payment cancellation/failure, and prevent overselling under concurrent checkout.
- Add robust idempotency and reconciliation for Razorpay/Shiprocket webhooks; monitor the webhook event table and configure alerts for processing failures.
- Add rate limiting and abuse protection for public order tracking and issue forms, plus CAPTCHA where appropriate.
- Add transactional emails/SMS for order confirmation, shipping, delivery, return/refund and failed delivery (e.g. Resend/SendGrid plus an SMS provider), and make sure delivery contact details are consented to and secured.
- Add a proper cancellation flow, COD only if you decide to support it, GST/tax invoices and accounting, privacy policy, terms, shipping policy, returns/refunds policy, contact details, consent/cookie disclosures as applicable, and customer-support SLAs.
- Add product admin CRUD, inventory adjustment/audit log, product image uploads, promotions/coupons, abandoned-cart recovery, analytics, backups, observability, and accessibility/mobile QA.
- Refunds are requested through Razorpay's API; confirm the resulting status with webhook reconciliation before treating money as settled. Reverse pickup is not the same as refund approval.
- Review India consumer-protection, GST, privacy/data protection and product electrical-safety requirements with an appropriate professional before selling.
- Use a production domain and set `SITE_URL` accordingly. Never commit `.env`, Supabase service-role keys, Razorpay secrets or Shiprocket credentials.

## 7. Project layout

- `src/main.jsx` — storefront, cart and checkout
- `src/extra-pages.jsx` — customer auth/account, tracking and admin screens
- `src/catalog.js` — sample product catalogue
- `src/styles.css` — responsive UI
- `src/supabase.js` — browser Supabase client
- `supabase/schema.sql` — tables, migration support, RLS and indexes
- `supabase/seed.sql` — 22 sample products
- `supabase/functions/` — payment, tracking, returns, admin and carrier integration functions
