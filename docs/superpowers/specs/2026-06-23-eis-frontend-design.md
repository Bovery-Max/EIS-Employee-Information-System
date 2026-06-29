# CLAUDE Design Spec – Frontend (EmployeeDashboard & LeaveRequestForm)

**Date:** 2026-06-23

---

## 1. Repository‑wide layout (Hybrid Tailwind)

```
/ (repo root)
├─ apps/
│   └─ web/                     # Next.js application
│       ├─ app/
│       │   ├─ layout.tsx        # Root layout – imports globals.css
│       │   ├─ globals.css       # Tailwind @tailwind directives + base styles
│       │   ├─ (auth)/login/page.tsx
│       │   ├─ (dashboard)/layout.tsx   # Shared dashboard layout (sidebar, header)
│       │   ├─ (dashboard)/employee/dashboard/page.tsx   ← EmployeeDashboard
│       │   ├─ (dashboard)/leave/new/page.tsx          ← LeaveRequestForm
│       │   └─ … (other pages)
│       ├─ public/
│       └─ package.json
├─ packages/db/                # Prisma client (already present)
│   └─ src/client.ts
├─ tailwind.config.ts          # Workspace‑wide Tailwind config (semantic palette)
├─ postcss.config.js           # Workspace‑wide PostCSS config
└─ …
```

*All UI lives under `apps/web/app/` using **Next.js App Router** route groups (`(auth)`, `(dashboard)`, etc.).*

---

## 2. Tailwind CSS setup (workspace‑wide)

```bash
# run at repository root
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
npx tailwindcss init -p --config tailwind.config.ts
```

**tailwind.config.ts** (excerpt)
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './apps/web/app/**/*.{js,ts,jsx,tsx}',
    './apps/web/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        success: '#16a34a',   // approvals, success
        error:   '#dc2626',   // rejections, errors
        info:    '#2563eb',   // informational / pending
        background: { light: '#f9fafb' },
      },
    },
  },
  plugins: [],
};
export default config;
```

**postcss.config.js**
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**globals.css** (imported in `app/layout.tsx`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body { @apply bg-background-light text-gray-900 antialiased; }
```

---

## 3. Theming & color palette

Semantic Tailwind colors are used throughout the UI:
- `bg-success` / `text-success` for approved / success states (green).
- `bg-error` / `text-error` for rejections / errors (red).
- `bg-info` / `text-info` for pending / informational (blue).
- Default background: `bg-background-light` (light gray/white).

Example badge component:
```tsx
<span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-sm font-medium text-success">
  Approved
</span>
```
---

## 4. Component hierarchy (core UI)

```
components/
├─ ui/
│   ├─ Button.tsx          // primary (green), secondary (gray), destructive (red)
│   ├─ Card.tsx            // generic container
│   ├─ Badge.tsx           // colored status badge (uses success/error/info)
│   └─ Input.tsx           // styled input + label
├─ forms/
│   ├─ LeaveRequestForm.tsx
│   └─ LoginForm.tsx
├─ dashboards/
│   ├─ EmployeeDashboard.tsx
│   ├─ ManagerDashboard.tsx
│   └─ HRDashboard.tsx
├─ tables/
│   └─ DataTable.tsx        // generic sortable table
└─ layout/
    ├─ DashboardLayout.tsx // sidebar + top bar
    └─ AuthLayout.tsx      // centered layout for login
```
---

## 5. **EmployeeDashboard** – component sketch

```tsx
export default function EmployeeDashboard() {
  const { data: balance } = useLeaveBalance();
  const { data: recent } = useRecentRequests();

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold">Employee Dashboard</h1>

      {/* Balance cards */}
      <div className="grid gap-4 md:grid-cols-3 mt-4">
        {balance.map(b => (
          <Card key={b.type}>
            <h2 className="text-lg font-medium">{b.type} Balance</h2>
            <p className="mt-2 text-3xl">{b.days} days</p>
            <Badge
              color={b.perc > 0.75 ? 'success' : b.perc > 0.25 ? 'info' : 'error'}
            >
              {b.perc > 0.75 ? 'Plenty' : b.perc > 0.25 ? 'Limited' : 'Low'}
            </Badge>
          </Card>
        ))}
      </div>

      {/* Recent Requests */}
      <section className="mt-8">
        <h2 className="text-xl font-medium">Recent Requests</h2>
        <DataTable columns={requestColumns} data={recent} showHeader={false} maxRows={5} />
        <Button href="/leave/new" className="mt-4">New Leave Request</Button>
      </section>
    </DashboardLayout>
  );
}
```
---

## 6. **LeaveRequestForm** – component sketch

```tsx
export default function LeaveRequestForm() {
  const [type, setType] = useState('Annual');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const days = calculateWorkingDays(start, end);
  const requiresUpload = type === 'Medical' || type === 'Maternity';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // POST /api/leave with {type, start, end, file}
  };

  return (
    <DashboardLayout>
      <Card className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold mb-4">New Leave Request</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Leave type */}
          <label className="block">
            <span className="text-gray-700">Leave type</span>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300"
            >
              <option value="Annual">Annual</option>
              <option value="Sick">Sick</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Medical">Medical (requires docs)</option>
            </select>
          </label>

          {/* Date range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-gray-700">Start date</span>
              <input
                type="date"
                value={start}
                onChange={e => setStart(e.target.value)}
                className="mt-1 block w-full rounded border-gray-300"
                required
              />
            </label>
            <label className="block">
              <span className="text-gray-700">End date</span>
              <input
                type="date"
                value={end}
                onChange={e => setEnd(e.target.value)}
                className="mt-1 block w-full rounded border-gray-300"
                required
              />
            </label>
          </div>

          {/* Working‑day calculator */}
          {start && end && (
            <p className="text-sm text-gray-600">
              Working days: <strong>{days}</strong>
            </p>
          )}

          {/* Conditional upload */}
          {requiresUpload && (
            <label className="block">
              <span className="text-gray-700">Upload supporting document</span>
              <input
                type="file"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700"
                required
              />
            </label>
          )}

          <Button type="submit" className="w-full bg-success hover:bg-success/90 text-white" disabled={!type || !start || !end}>
            Submit Request
          </Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}
```
---

## 7. Routing (App Router) summary

| Route | File | Layout |
|-------|------|--------|
| `/login` | `(auth)/login/page.tsx` | `AuthLayout` |
| `/dashboard/employee` | `(dashboard)/employee/dashboard/page.tsx` | `DashboardLayout` |
| `/leave/new` | `(dashboard)/leave/new/page.tsx` | `DashboardLayout` |
| *(other pages omitted for brevity)* |

All dashboard pages share `DashboardLayout` (sidebar + header). The sidebar contains links to Employee, Manager, HR, Leave, Admin sections.
---

## 8. Next steps (implementation plan)

The **writing‑plans** skill will be invoked next to generate a step‑by‑step plan that covers:
1. Installing Tailwind & configuring the workspace files.
2. Scaffolding the App Router folder structure.
3. Implementing the shared UI components (`Button`, `Card`, `Badge`, `DashboardLayout`).
4. Adding the two page components (`EmployeeDashboard`, `LeaveRequestForm`).
5. Hooking up data fetching hooks (`useLeaveBalance`, `useRecentRequests`).
6. Adding unit / integration tests for the new pages.
7. Running lint, type‑checking, and committing the changes.

---

*Please review the spec file located at `docs/superpowers/specs/2026-06-23-eis-frontend-design.md`. Let me know if anything needs adjustment; otherwise I will move on to the implementation plan and then start the next feature (company registration & organization management).*