# LeaseWild isolated staging
Branch: `staging/leasewild-sandbox`. Production `main` remains untouched.

## Preview entry
`sandbox/index.html` is a safe standalone staging placeholder. It deliberately does not load production JavaScript, production Supabase configuration, or Stripe keys. All listed features are pending integration and must not be represented as functional.

## Free temporary URL (deployment required)
Use Cloudflare Pages (or another free static host) with the GitHub repository. Configure the **production branch** for the sandbox Pages project to `staging/leasewild-sandbox`, build command empty, and **output directory** `sandbox`. The provider will issue a `*.pages.dev` address after successful deployment. Do not connect `leasewild.com`, and do not deploy the repository root as a sandbox because it contains production configuration.

## Isolated services
Supabase project `leasewild-payment-testing` (ref `kbkdfpmlyggfijkyjxoi`) exists. Configure only its publishable key in any future staging client; never put service-role keys, Stripe secret keys, or cleaning worker secrets in browser files or Git. Use Stripe Sandbox only. Validate webhook signatures, database RLS, and sandbox event deliveries before enabling bookings. Never copy production user data to staging.

## Release process
Implement and validate features in staging, review changes, and merge only explicitly approved changes into `main`. Keep staging and production credentials isolated.
