# Login Flow Design (2026-06-23)

## Overview
This design adds a secure JWT‑based authentication flow to the EIS monorepo.
It introduces a new login API endpoint, a server‑side middleware that protects
protected routes, a test‑user seed, and updates the frontend login page to use
the endpoint and rely on an **HTTP‑Only cookie** for the token.

---

## 1. Backend – `apps/api`
### 1.1 Server (`index.js`)
- Runs on `process.env.PORT` (default 4000).
- Uses `express`, `helmet`, `cors`, `dotenv`.
- Body parser `express.json()`.
- **POST `/auth/login`**
  1. Reads `{ email, password }` from the request body.
  2. Looks up the user via Prisma (`prisma.user.findUnique`).
  3. Uses `bcrypt.compare` to verify the password.
  4. On success creates a JWT (`jsonwebtoken.sign`) with payload `{ userId, role }`
     and expiration `process.env.JWT_EXPIRES_IN` (default **1h**).
  5. Sends the JWT back as an **HTTP‑Only, Secure, SameSite=Strict** cookie named
     `eis_token` (`res.cookie('eis_token', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: <ms> })`).
  6. Returns `200 OK` with a minimal JSON body `{ user: { email, role } }`.
  7. On failure returns `401 Unauthorized` with `{ error: "Invalid email or password" }`.
- Central error‑handling middleware returns JSON errors.

### 1.2 Environment (`apps/api/.env.example`)
```
JWT_SECRET=your_secret_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/eis
PORT=4000
JWT_EXPIRES_IN=1h
```
A real `.env` file must be created from this example.

### 1.3 Seed (`packages/db/prisma/seed.ts`)
Creates a test admin user:
```ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@eis.com' },
    update: { password_hash: hash, role: 'ADMIN' },
    create: {
      email: 'admin@eis.com',
      password_hash: hash,
      role: 'ADMIN',
      company: { create: { name: 'DemoCo' } },
    },
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
```
Run with `node -r ts-node/register packages/db/prisma/seed.ts` (add a script if desired).

---

## 2. Frontend – `apps/web`
### 2.1 Login Page (`app/login/page.tsx`)
- Uses `'use client'` directive.
- On submit, calls `fetch('http://localhost:3000/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })`.
- On **200** redirects to `/dashboard` via `next/navigation` router.
- On **401** shows red error text “Invalid email or password”.
- No `localStorage` usage – token handled by the HTTP‑Only cookie.

### 2.2 Middleware (`middleware.ts`)
```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const PROTECTED = ['/dashboard', '/leave', '/manager', '/hr', '/admin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some(p => pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get('eis_token')?.value;
  if (!token) return redirectToLogin(req);

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    return NextResponse.next();
  } catch {
    return redirectToLogin(req);
  }
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

export const config = { matcher: PROTECTED };
```
- Reads the `eis_token` cookie, verifies it with the same secret, redirects to `/login` on missing/invalid token.

---

## 3. Environment Synchronisation
- Both API and Next.js read `JWT_SECRET` from their respective `.env` files. The same value must be used.
- The web app can place the same variables in its own `.env.local` (or rely on the shared monorepo root env).

---

## 4. Security Considerations
- **HTTP‑Only, Secure, SameSite=Strict** cookie mitigates XSS/CSRF.
- Token expiration is **1 hour** (configurable via `JWT_EXPIRES_IN`).
- Generic error message avoids user enumeration.
- Bcrypt cost factor of 10 balances security and performance for development.

---

## 5. Open Items (post‑implementation)
- Add unit/integration tests for the login endpoint and middleware (deferred).
- Possibly add a logout endpoint that clears the `eis_token` cookie.
- Review role‑based access for the protected routes in future iterations.

---

**Implementation next steps** will create the API server, middleware, env files, and seed script, then run the seed to insert the admin user.
