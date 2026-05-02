# Prisma

Prisma schema and migrations live in this directory.

Setup flow:
- copy the database URL from Supabase into `.env` as `DATABASE_URL`
- run `npm run prisma:generate`
- run `npm run prisma:migrate -- --name init`
