# Login Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB‑SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task‑by‑task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secure JWT‑based login flow (API endpoint, cookie handling, middleware, seed data, and frontend integration) so employees can authenticate and be protected from unauthenticated access.

**Architecture:** An Express API (`apps/api`) provides `/auth/login` which validates credentials via Prisma and bcrypt, then issues a JWT stored in an HTTP‑Only, Secure, SameSite=Strict cookie (`eis_token`). Next.js middleware (`apps/web/middleware.ts`) protects designated routes by verifying that cookie. The login UI posts to the API with `credentials: 'include'` and redirects on success.

**Tech Stack:** Node 18, Express, Prisma, PostgreSQL, bcrypt, jsonwebtoken, Next.js 13 (App Router), TypeScript for seed script.

---

### Task 1: Add environment files for API

**Files:**
- Create: `apps/api/.env.example`
- Modify: `apps/api/.env` (already created)

- [ ] **Step 1: Write the .env.example file**

```text
JWT_SECRET=your_secret_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/eis
PORT=4000
JWT_EXPIRES_IN=1h
```

- [ ] **Step 2: Commit env files**

```bash
git add apps/api/.env.example apps/api/.env
git commit -m "chore(api): add env example and real env for auth"
```

---

### Task 2: Implement Express auth server

**Files:**
- Create: `apps/api/index.js`

- [ ] **Step 1: Write index.js**

```javascript
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// POST /auth/login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Invalid');

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // 1 hour = 3600000 ms
    res.cookie('eis_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3600000,
    });

    return res.json({ user: { email: user.email, role: user.role } });
  } catch (err) {
    // Generic error to avoid enumeration
    return res.status(401).json({ error: 'Invalid email or password' });
  }
});

// Global error handler (fallback)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth API listening on port ${PORT}`);
});
```

- [ ] **Step 2: Install server dependencies**

```bash
cd apps/api
npm install express helmet cors bcrypt jsonwebtoken @prisma/client dotenv
npm install -D @types/express @types/helmet @types/cors @types/bcrypt @types/jsonwebtoken
```

- [ ] **Step 3: Commit server file**

```bash
git add apps/api/index.js
git commit -m "feat(api): add login endpoint with JWT cookie"
```

---

### Task 3: Add seed script for admin test user

**Files:**
- Create: `packages/db/prisma/seed.ts`

- [ ] **Step 1: Write seed script**

```typescript
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

- [ ] **Step 2: Add seed npm script** (edit root `package.json` or the db package)

```json
"scripts": {
  "seed": "ts-node -r ts-node/register packages/db/prisma/seed.ts"
}
```

- [ ] **Step 3: Install TypeScript tooling if missing**

```bash
npm install -D ts-node typescript @types/node
```

- [ ] **Step 4: Commit seed script and script entry**

```bash
git add packages/db/prisma/seed.ts package.json
git commit -m "chore(db): add seed script for admin test user"
```

---

### Task 4: Add Next.js middleware to protect routes

**Files:**
- Create: `apps/web/middleware.ts`

- [ ] **Step 1: Write middleware**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const PROTECTED = ['/dashboard', '/leave', '/manager', '/hr', '/admin'];

export function middleware(req: NextRequest) {
  if (!PROTECTED.some(p => req.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

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

- [ ] **Step 5: (Optional) Add .env.example for web**

```text
JWT_SECRET=your_secret_key_here
```

- [ ] **Step 6: Commit middleware**

```bash
git add apps/web/middleware.ts
git commit -m "feat(web): protect routes with JWT cookie middleware"
```

---

### Task 5: Verify login page sends credentials include

**Files:**
- Modify (if needed): `apps/web/app/login/page.tsx`

- [ ] **Step 1: Ensure fetch includes `credentials: 'include'`** (already present in the page we wrote). If missing, add it.

- [ ] **Step 2: Commit any change**

```bash
git add apps/web/app/login/page.tsx
git commit -m "fix(web): ensure login fetch includes credentials for cookie"
```

---

### Task 6: Manual end‑to‑end verification (not automated in CI)

**Commands (run locally):**

```bash
# 1. Start API
cd apps/api
npm run dev   # runs node index.js (listening on 4000)

# 2. Seed DB
npm run seed

# 3. Start Next.js app
cd ../../apps/web
npm run dev   # usually starts on 3000
```

- Open `http://localhost:3000/login`, log in with `admin@eis.com` / `admin123`.
- Verify redirection to `/dashboard` and that a cookie named `eis_token` exists (HttpOnly, Secure, SameSite=Strict).
- Try accessing `/dashboard` in a new incognito window – should redirect back to `/login`.

- [ ] **Step 1: Record that the manual test passed** (add a short note in the commit).

```bash
git commit --allow-empty -m "chore: manual verification of login flow passed"
```

---

### Task 7: Documentation & final cleanup

**Files:**
- Create or update: `docs/authentication.md`
- Ensure `.gitignore` does not ignore the newly added `.env` files that are needed for local dev (they can stay ignored for secrets, but the example files must be committed).

- [ ] **Step 1: Write brief docs**

```markdown
# Authentication Flow

- **Env variables** – see `apps/api/.env.example` and `apps/web/.env.example`.
- **Login endpoint** – POST `http://localhost:3000/auth/login` with JSON `{ email, password }`. Returns an HTTP‑Only cookie `eis_token`.
- **Protected routes** – middleware guards `/dashboard`, `/leave`, `/manager`, `/hr`, `/admin`.
- **Seeding** – run `npm run seed` to create the admin user (`admin@eis.com` / `admin123`).
```

- [ ] **Step 2: Commit docs**

```bash
git add docs/authentication.md
git commit -m "docs: add authentication flow documentation"
```

- [ ] **Step 3: Push branch** (or create PR)

```bash
git push origin HEAD
```

---

**All tasks are now defined.** The subagent‑driven execution engine will now iterate through each task, performing implementation, spec compliance review, and code‑quality review automatically.
