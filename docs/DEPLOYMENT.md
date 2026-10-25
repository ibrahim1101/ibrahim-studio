# GitHub → Cloudflare Workers → services.ibrahimshaik.com

This is a standalone Vinext/React/Three.js project using the tested pinned dependency versions. Native Cloudflare Vite integration produces `dist/server/wrangler.json` and `dist/client`. No Sites plugin, project manifest, ChatGPT authentication or connector bindings remain. Existing ChatGPT-hosted site is a separate fallback and is not modified by this export.

## 1. Repository

Create an empty **private** repository named `ibrahim-studio` under your GitHub account (no generated README, gitignore or license). Import this source, including the lockfile and local model files. Each asset is below GitHub's 100 MiB per-file limit and the Cloudflare static asset 25 MiB limit; do not publish `.dev.vars`, `.env`, node_modules, dist or deployment credentials. No Git LFS pointers are used.

## 2. Cloudflare Git integration

Cloudflare dashboard → Workers & Pages → Create → Import a repository (Workers Git integration). Select this repository and authorize only the repo access needed. Use:

| Setting | Value |
|---|---|
| Worker name | `ibrahim-studio` |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `pnpm run build` |
| Deploy command | `pnpm run deploy` |
| Preview branch command | `pnpm run deploy:preview` |
| Build environment | Node.js 22; pnpm 11.25.0 from package.json |

The deploy script uses the generated config, not the source entrypoint. No GitHub Actions workflow is needed; Cloudflare builds on pushes, so GitHub Actions minutes are not consumed by this setup. No account IDs or tokens are committed. Complete any required Cloudflare authentication in your own account. Inspect deployment logs and open the returned workers.dev URL before binding the domain. Preview deployments do not accept contact email sends because allowed origin remains the owned domain only.

## 3. Domain cutover

**Do not add the earlier ChatGPT CNAME/TXT records.** Do not point the new site at `custom-domains.chatgpt.site`.

After a successful independent deployment, add `services.ibrahimshaik.com` as a Custom Domain on the `ibrahim-studio` Worker. Cloudflare manages the Worker DNS/certificate. If you already added the earlier Sites `services` CNAME, review and remove/replace only that conflicting record during cutover. The `_openai-site-verification.services` and `_cf-custom-hostname.services` records are unnecessary for the new deployment; remove only those obsolete records if present. Never change root, portfolio, MX, SPF or unrelated records. The old Sites binding can remain pending until the replacement is verified, then detach it. No DNS changes or public activation were performed by preparing this source.

## 4. Enquiry delivery

Destination is fixed server-side: `contact@ibrahimshaik.com`. Reply-To is the visitor email. No visitor autoresponder or arbitrary recipient API is provided.

1. Verify `notify.ibrahimshaik.com` in Resend using only its exact generated DNS records; preserve existing inbound email routing.
2. Create a sending-only Resend API key restricted to that verified domain.
3. Create a Cloudflare Turnstile widget allowing `services.ibrahimshaik.com`.
4. Set Worker runtime variables/secrets (not only build variables):

| Name | Type | Value |
|---|---|---|
| ENQUIRY_FROM | Plaintext var, already in source config | `Ibrahim Studio <enquiries@notify.ibrahimshaik.com>` |
| RESEND_API_KEY | Secret | Your restricted sending key |
| TURNSTILE_SITE_KEY | Plaintext variable | Your widget public site key |
| TURNSTILE_SECRET_KEY | Secret | Your widget verification secret |

For CLI setup from your authenticated local machine after the first build:

```sh
pnpm exec wrangler secret put RESEND_API_KEY --config dist/server/wrangler.json
pnpm exec wrangler secret put TURNSTILE_SECRET_KEY --config dist/server/wrangler.json
```

Keep the nonsecret TURNSTILE_SITE_KEY in wrangler.jsonc vars so future deployments retain it. Never put secret keys in source or chat. Update/deploy the Worker after configuration changes, then test `/api/enquiries` configuration and submit a sample brief from the real custom domain. Verify its arrival in the actual inbox/spam folder and Reply-To behavior. Missing any required value keeps direct sending disabled. Provider acceptance does not prove inbox delivery. Existing mailto/copy/download remain available.

## 5. Acceptance checks

Check all five category × three tier routes, nested item/booking routes, models and licenses, downloads, mobile overlays, restaurant wall-menu scrolling/exit, keyboard and reduced-motion behavior. GPU appearance must be reviewed on actual devices. Confirm public access signed out on the new Worker, HTTPS on services, main contact form and recipient delivery. Keep the old site until these checks pass.

Official references:
- https://developers.cloudflare.com/workers/ci-cd/builds/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://resend.com/docs/api-reference/emails/send-email
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
