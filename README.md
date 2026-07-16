# ROOTORA

**Naturally Bangladeshi.**

Premium Bangladeshi ecommerce marketplace for organic foods, fresh produce, traditional clothing, and artisan handmade products.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **UI:** shadcn/ui + Radix UI
- **Animation:** Framer Motion
- **State:** Zustand
- **Data Fetching:** TanStack Query
- **Forms:** React Hook Form + Zod
- **Database:** PostgreSQL + Prisma
- **Auth:** Better Auth (configured, pending integration)
- **Payments:** SSLCommerz, bKash, Nagad, Stripe (configured, pending integration)

## Getting Started

### Prerequisites

- Node.js 20.9+ (recommended: 24.x)
- PostgreSQL (for database features)

### Installation

```bash
# Requires Node.js 20.9+ and Docker Desktop
npm install
cp .env.example .env
docker compose up -d          # PostgreSQL on localhost:5433
npm run db:setup              # generate + push schema + seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- User area: `/account`
- Admin panel: `/admin`
- Auth: `/login`, `/register` (email/password + Google OAuth ready)

### Enable Google login later

1. Create OAuth Client (Web) in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Put values in `.env`:

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED="true"
```

4. Restart `npm run dev`

### Database Setup

```bash
docker compose up -d
npm run db:push      # Push schema to database
npm run db:seed      # Seed catalog + demo users
npm run db:studio    # Open Prisma Studio
```

For Vercel production, set `DATABASE_URL` (Neon/Postgres), `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` to your live domain. The build runs `prisma generate` automatically before `next build`.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (shop)/           # Shop, cart, checkout routes
│   ├── (auth)/           # Authentication routes
│   ├── (account)/        # User dashboard
│   └── (admin)/          # Admin dashboard
├── components/
│   ├── ui/               # shadcn/ui primitives
│   ├── layout/           # Navbar, Footer, etc.
│   ├── common/           # Shared components
│   └── shop/             # Shop-specific components
├── features/             # Feature-based modules
│   ├── home/
│   ├── products/
│   ├── cart/
│   └── wishlist/
├── hooks/
├── providers/
├── services/
├── lib/
├── config/
├── constants/
├── types/
└── styles/
prisma/
└── schema.prisma         # Database schema
```

## Design System

| Token | Value |
|-------|-------|
| Primary | `#355E3B` |
| Secondary | `#739072` |
| Accent | `#A9B388` |
| Background | `#FEFCF3` |
| Surface | `#FFFFFF` |

**Typography:** Cormorant Garamond (headings), Inter (body), Manrope (buttons)

## Features

### Implemented
- Premium landing page with all sections
- Product listing with filters and sorting
- Product detail pages with farmer info
- Shopping cart with Zustand persistence
- Wishlist functionality
- Dark/light mode
- Responsive design
- SEO metadata and structured data
- Prisma database schema

### Planned
- User authentication (Better Auth)
- Checkout flow with payment gateways
- Admin dashboard with analytics
- User account dashboard
- Blog and recipe CMS
- Farmer profile pages
- Search with instant suggestions
- Order tracking

## License

Private — All rights reserved.
