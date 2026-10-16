# Halcyon Auto — Website & Admin

A modern car-sales website and admin dashboard for a single-owner dealership. Buyers browse cars, estimate payments and get in touch on WhatsApp. The owner manages everything, with no code changes, from one dashboard.

API repo: **halcyon-auto-api** (Laravel).

## Features

### Public website
- **Home** — full-screen hero (image, GIF or video, with a separate mobile version), search card, latest cars, fuel-type shortcuts, trust section, map
- **Cars** — filters, sorting, search, removable filter chips, pagination, loading skeletons
- **Car page** — photo gallery with swipe and full-screen viewer, discounts, down payment, sold status, specs, WhatsApp and call buttons, finance estimate for that car
- **Finance calculator** — reducing or flat rate, durations up to 7 years, repayment schedule, duration comparison, effective rate for flat-rate quotes, and down-payment checks against Central Bank loan-to-value limits
- **Articles** — categories, search, Markdown content, share buttons
- **FAQ**, **Careers**, **About**, **Our Trust**, **Contact** (with map and Get directions)
- **Cookie consent**, privacy page, and a pop-up image ad shown again after 2 hours
- Responsive, keyboard-friendly, supports reduced motion

### Admin dashboard (`/admin`)
- Add, edit and delete cars; set discounts, sold status and down payment
- Statistics overview
- Articles editor with Markdown toolbar, photo upload and live preview
- FAQ and careers management
- **Website content**: hero media, contact details, About, Our Trust, location (paste a Google Maps link), pop-up ad, finance defaults

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 16 (App Router), React, TypeScript |
| Styling | Tailwind CSS v4, custom design system (kingfisher palette) |
| UI | lucide-react, class-variance-authority |
| API | Laravel REST API (separate repo) |
| Media | Cloudinary (via the API) |

## Getting started

Requires **Node.js 20.9+**.

```bash
git clone <this-repo>
cd halcyon-auto-web

npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

Start the API repo too (default `http://localhost:8000`).

### Environment variables

| Variable | Purpose |
|---|---|
| `LARAVEL_API_URL` | Base URL of the API, for example `http://localhost:8000` |
| `NEXT_PUBLIC_SITE_URL` | Public site address (used for sharing and page metadata) |

### Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # run the production build
npm run lint     # ESLint
```

## Project structure

```
app/(site)/         Public pages (home, cars, finance, articles, faq, careers, about, contact…)
app/admin/          Admin dashboard (login + panel)
app/api/            Route handlers that talk to the Laravel API
components/site/    Public components (navbar, footer, hero media, finance calculator…)
components/admin/   Admin components (forms, editors, sidebar…)
lib/                API client, settings, finance maths, formatting helpers
proxy.ts            Route protection for /admin and admin API routes
```

## Notes

- Hero **videos** can be up to 40 MB. `next.config.ts` raises the proxy upload limit to 60 MB; the API's PHP limits must allow it too.
- Fonts (Bricolage Grotesque, Figtree) load from Google Fonts.
- The finance calculator is an estimate, not an offer. Loan-to-value limits and default rates are editable in **Admin → Website content → Finance**.

## License

Private project. All rights reserved.
