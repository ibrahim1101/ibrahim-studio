# Ibrahim Studio

Independent digital studio and fifteen business demos: Restaurant, Stillwater Resort, AURA Estates, FORM Commerce and Automotive, each with Essential, Interactive and 3D Signature editions.

Standalone GitHub + Cloudflare Workers project. No ChatGPT hosting, sign-in, source credentials, connectors or Sites deployment scripts are needed. All shipped models, licenses, pricing documents and presentations are included.

## Local development

Use Node.js 22 and pnpm 11.25.0 (the version pinned in package.json).

```sh
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Optional local mail configuration: copy `.dev.vars.example` to `.dev.vars` and supply your own test credentials. Never commit `.dev.vars` or API keys. Direct sending is disabled without all required configuration. The email endpoint accepts only the intended production domain; local UI testing does not send mail.

```sh
pnpm check
pnpm test
pnpm build
pnpm deploy:check
```

## Deploy from GitHub

Use **Cloudflare Workers Builds**, not GitHub Pages or a static Pages deployment. See [deployment instructions](docs/DEPLOYMENT.md). The frontend, dynamic routes and email API deploy together as a Worker with static assets.

## Scope and credits

Business demos use browser-local simulated reservations, carts and customer feedback. Only the main studio contact form has a prepared server-side delivery integration. No real payments or booking inventory are connected. Model rendering requires WebGL; fallbacks are explicit. The resort is conceptual architecture, not a real resort scan.

Asset credits and modification notices remain in `public/models/*/LICENSE.txt` and [asset provenance](docs/ASSET-LICENSES.md). Do not replace third-party asset licenses with a blanket source-code license. No source-code reuse license has been chosen by the owner yet.
