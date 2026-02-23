# Product Review System

Full-stack product review app built with Next.js (App Router), Prisma ORM, PostgreSQL, NextAuth credentials auth (admin only), Vercel Blob image uploads, Tailwind CSS, and Lucide React icons.

## Features

- Public review form per product: multi-select options per category + required 1–5 star rating
- Admin login and protected admin routes
- Product management: create, edit, activate/deactivate, image upload
- Aggregated results per product with per-option bars and percentages
- Raw review table and CSV export
- Seeded data: 1 admin user + 6 products (5 juices, 1 beignets)

## Tech Stack

- Next.js 16 App Router (compatible with Next.js 14+ architecture)
- Prisma ORM + PostgreSQL (Neon/Supabase)
- NextAuth credentials provider
- Vercel Blob for image uploads
- Tailwind CSS + custom design tokens in global styles

## Environment Variables

Copy `.env.example` to `.env` and fill values:

```bash
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=
```

Generate a password hash for admin:

```bash
node -e 'require("bcryptjs").hash("your-admin-password",10).then(console.log)'
```

If `ADMIN_PASSWORD_HASH` is omitted, seed uses fallback password `admin12345`.

## Setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Required by the project spec:

- `prisma migrate dev` is available via `npm run prisma:migrate`
- `prisma db seed` is available via `npm run prisma:seed`

## Main Routes

- Public review: `/review/[productSlug]`
- Public summary: `/review/[productSlug]/results`
- Admin login: `/admin/login`
- Admin dashboard: `/admin/dashboard`
- New product: `/admin/products/new`
- Edit product: `/admin/products/[id]/edit`
- Product results: `/admin/products/[id]/results`

## API Routes

- `POST /api/reviews`
- `POST /api/admin/products`
- `PUT /api/admin/products/[id]`
- `PATCH /api/admin/products/[id]/toggle`
- `GET /api/admin/products/[id]/export`
- `POST /api/admin/upload`
- `GET|POST /api/auth/[...nextauth]`

All custom API routes validate input with Zod.

## Deployment (Vercel)

1. Push repo to GitHub.
2. Import project in Vercel.
3. Add all environment variables from `.env.example`.
4. Set a Postgres `DATABASE_URL` from Neon or Supabase.
5. Deploy.

After first deploy, run migrations/seed against production database:

```bash
npx prisma migrate deploy
npx prisma db seed
```
