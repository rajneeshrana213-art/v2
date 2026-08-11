---
name: ui-component-standards
description: >
  Frontend component development guide for LearnXChain. Covers brand design system,
  component hierarchy, dark mode, React Query data fetching, form patterns, toast
  notifications, animations, charts, accessibility, and responsive design. Use this
  skill when building or modifying any dashboard UI component.
---

# LearnXChain — UI Component Standards Skill

> **Every pixel matters.** LearnXChain UI is dark-first, premium, accessible, and performant.
> Follow this skill when building any frontend component.

---

## 🎨 Brand Design System (Single Source of Truth)

### Color Palette
```
Primary Dark:     #071B2C   →  bg-brand-primary-dark     (base background)
Primary Blue:     #2C81B4   →  bg-brand-primary-blue     (CTA, links, active)
Secondary Blue:   #224662   →  bg-brand-secondary-blue   (cards, panels)
Accent Green:     #75B96D   →  bg-brand-accent-green     (success, positive)
Text Muted:       #9FB3C8   →  text-brand-text-muted     (secondary text)
Border:           #1E3A52   →  border-brand-border       (dividers, outlines)
Gradient:         #071B2C → #2C81B4 → #75B96D
```

### Usage Rules
- **Backgrounds**: `bg-brand-primary-dark` for page bg | `bg-brand-secondary-blue` for cards
- **Text primary**: `text-white` (dark) | `text-gray-900` (light)
- **Text secondary**: `text-brand-text-muted`
- **Interactive**: `bg-brand-primary-blue hover:bg-brand-primary-blue/90`
- **Success states**: `text-brand-accent-green` / `bg-brand-accent-green`
- **NEVER** use generic colors (plain red, blue, green) — use the brand palette

### Typography
```
Heading font:  font-outfit   (CSS var: --font-outfit)
Body font:     font-inter    (CSS var: --font-inter)

Hierarchy:
  h1 → text-2xl md:text-3xl font-bold font-outfit
  h2 → text-xl md:text-2xl font-semibold font-outfit
  h3 → text-lg font-semibold
  body → text-sm md:text-base font-inter
  caption → text-xs text-brand-text-muted
```

---

## 🧱 Component Hierarchy

```
components/
├── ui/                        → PRIMITIVES (atomic, reusable, no business logic)
│   ├── button.tsx             → <Button variant="..." size="..." />
│   ├── card.tsx               → <Card> with header/content/footer slots
│   ├── badge.tsx              → Status badges (active, inactive, pending)
│   ├── avatar.tsx             → User avatars with fallback
│   ├── dialog.tsx             → Modal dialogs
│   ├── data-table.tsx         → Sortable, filterable data table
│   ├── select.tsx             → Dropdown select
│   ├── switch.tsx             → Toggle switch
│   ├── tabs.tsx               → Tab navigation
│   ├── input.tsx              → Text input
│   ├── label.tsx              → Form labels
│   ├── dropdown-menu.tsx      → Context/action menus
│   ├── forms/                 → Form-specific primitives
│   ├── charts/                → Chart wrappers (recharts)
│   ├── modals/                → Pre-built modal patterns
│   ├── table/                 → Table sub-components
│   ├── feedback/              → Loading, empty, error states
│   └── layout/                → Layout utilities
│
├── dashboard/
│   ├── layout/                → DashboardLayout (sidebar, header, content)
│   ├── config/                → dashboardConfig.ts (sidebar navigation)
│   ├── shared/                → Cross-role reusable components (stats cards, filters)
│   ├── admin/                 → Admin-specific domain components
│   ├── student/               → Student portal components
│   ├── teacher/               → Teacher portal components
│   └── [role]/                → Role-specific components
│
├── home/                      → Landing page sections (Hero, Features, Pricing, etc.)
├── seo/                       → DynamicSEO component
└── common/                    → App-wide components (Navbar, Footer)
```

### Rules
1. **Primitives** (`ui/`) → NO business logic, NO API calls, fully props-driven
2. **Domain components** (`dashboard/[role]/`) → Can use hooks, API calls, auth context
3. **Pages** (`pages/dashboard/`) → Assemble domain components, provide auth gating via `getServerSideProps`
4. **NEVER** put business logic in primitives
5. **NEVER** create inline `<button>` / `<input>` — always use the `ui/` primitives

---

## 🌙 Dark Mode Implementation

### Rule: Tailwind `dark:` Variants Only (No JS Conditionals)

```tsx
// ✅ CORRECT — CSS-only dark mode via Tailwind
<div className="bg-white dark:bg-brand-primary-dark">
  <h1 className="text-gray-900 dark:text-white">Title</h1>
  <p className="text-gray-600 dark:text-brand-text-muted">Description</p>
</div>

// ❌ WRONG — JS conditional (causes hydration mismatch)
<div style={{ backgroundColor: theme === 'dark' ? '#071B2C' : '#fff' }}>
```

### When You Need `mounted` Guard

Use the `mounted` pattern ONLY when you need to read `theme` value in JS:

```tsx
const { theme, toggleTheme, mounted } = useTheme();

// ✅ For theme toggle buttons
{mounted && (
  <button onClick={toggleTheme} aria-label="Toggle theme">
    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
  </button>
)}

// ✅ For chart theme configuration
const chartColors = mounted
  ? { stroke: theme === 'dark' ? '#9FB3C8' : '#374151' }
  : { stroke: '#374151' }; // safe default
```

### What DOESN'T Need `mounted`
- Pure `dark:` CSS class variants (Tailwind handles these automatically)
- Static content that looks the same in both themes
- Form inputs, labels, tables with only `dark:` styling

---

## 📊 Data Fetching Patterns (React Query)

### Standard List Page Hook
```tsx
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useModuleList(params: { page: number; limit: number; search?: string }) {
  return useQuery({
    queryKey: ['module-name', 'list', params],
    queryFn: () =>
      axios.get('/api/v1/module-name/list', { params }).then(r => r.data),
    staleTime: 30_000,     // Data stays fresh for 30s
    placeholderData: (prev) => prev,  // Keep old data visible while fetching new page
  });
}
```

### Mutation with Cache Invalidation
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';

export function useCreateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInput) =>
      axios.post('/api/v1/module-name/create', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['module-name'] });
      toast.success('Created successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to create. Please try again.');
    },
  });
}
```

### Loading, Error, and Empty States
```tsx
export function ModuleListPage() {
  const { data, isLoading, error } = useModuleList({ page: 1, limit: 10 });

  // ─── Loading State ──────────────────────────
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  // ─── Error State ────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to load data</h3>
        <p className="text-sm text-gray-500 dark:text-brand-text-muted mt-1">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  // ─── Empty State ────────────────────────────
  if (!data?.data?.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <InboxIcon className="w-12 h-12 text-brand-text-muted mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No records found</h3>
        <p className="text-sm text-brand-text-muted mt-1">Get started by creating your first record.</p>
      </div>
    );
  }

  // ─── Data Rendering ────────────────────────
  return <DataTable columns={columns} data={data.data.data} />;
}
```

---

## 📝 Form Patterns (react-hook-form + Zod)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';

const FormSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional(),
});

type FormData = z.infer<typeof FormSchema>;

export function CreateForm({ onSubmit }: { onSubmit: (data: FormData) => Promise<void> }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  const onFormSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch {
      toast.error('Submission failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          className="w-full rounded-lg border border-gray-300 dark:border-brand-border
                     bg-white dark:bg-brand-secondary-blue px-4 py-2.5
                     text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-brand-primary-blue focus:border-transparent
                     transition-all duration-200"
          placeholder="Enter name"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          {...register('email')}
          type="email"
          className="w-full rounded-lg border border-gray-300 dark:border-brand-border
                     bg-white dark:bg-brand-secondary-blue px-4 py-2.5
                     text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-brand-primary-blue focus:border-transparent
                     transition-all duration-200"
          placeholder="Enter email"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-brand-primary-blue text-white px-6 py-2.5
                   font-medium hover:bg-brand-primary-blue/90
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Creating...
          </span>
        ) : 'Create'}
      </button>
    </form>
  );
}
```

---

## 🔔 Toast Notifications

> **react-toastify ONLY.** NEVER import `react-hot-toast`.

```tsx
import { toast } from 'react-toastify';

// ─── Success ────────────────────────────────
toast.success('Student created successfully!');

// ─── Error ──────────────────────────────────
toast.error('Failed to save. Please try again.');

// ─── Warning ────────────────────────────────
toast.warning('This action cannot be undone.');

// ─── Info ───────────────────────────────────
toast.info('Your data is being processed...');

// ─── With custom options ────────────────────
toast.success('Saved!', {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
});
```

### API Error Toast Pattern
```tsx
// Standard mutation error handler
onError: (err: any) => {
  const message = err?.response?.data?.error
    || err?.response?.data?.message
    || 'Something went wrong. Please try again.';
  toast.error(message);
}
```

---

## ✨ Animations (framer-motion)

### Page Transition
```tsx
import { motion } from 'framer-motion';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
```

### Staggered List Animation
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(i => (
    <motion.div key={i.id} variants={item}>
      <Card>{i.name}</Card>
    </motion.div>
  ))}
</motion.div>
```

### Modal Entry Animation
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  <Dialog>{/* content */}</Dialog>
</motion.div>
```

### Glassmorphism Card Animation (Brand Signature)
```tsx
<motion.div
  whileHover={{ scale: 1.02, y: -2 }}
  transition={{ type: 'spring', stiffness: 300 }}
  className="rounded-2xl p-6
             bg-white/5 dark:bg-white/5
             backdrop-blur-lg
             border border-white/10 dark:border-brand-border
             shadow-lg"
>
  {/* Card content */}
</motion.div>
```

---

## 📈 Charts (recharts)

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/hooks/useTheme';

export function AttendanceChart({ data }: { data: ChartData[] }) {
  const { theme, mounted } = useTheme();

  if (!mounted) return <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />;

  const textColor = theme === 'dark' ? '#9FB3C8' : '#374151';
  const gridColor = theme === 'dark' ? '#1E3A52' : '#E5E7EB';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 12 }} />
        <YAxis tick={{ fill: textColor, fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: theme === 'dark' ? '#224662' : '#fff',
            border: `1px solid ${gridColor}`,
            borderRadius: '8px',
            color: theme === 'dark' ? '#fff' : '#1f2937',
          }}
        />
        <Bar dataKey="present" fill="#75B96D" radius={[4, 4, 0, 0]} />
        <Bar dataKey="absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

---

## ♿ Accessibility Checklist

Every interactive component MUST include:

- [ ] `aria-label` on icon-only buttons
- [ ] `role` attribute on custom interactive elements
- [ ] **Keyboard navigation**: All actions reachable via Tab + Enter/Space
- [ ] **Focus visible**: `focus:ring-2 focus:ring-brand-primary-blue focus:outline-none`
- [ ] **Contrast ratio**: Minimum 4.5:1 for normal text, 3:1 for large text
- [ ] **Alt text**: All `<img>` / `next/image` have descriptive alt text
- [ ] **Form labels**: Every input has an associated `<label>`
- [ ] **Error messages**: Screen-reader-accessible via `aria-describedby`
- [ ] **Loading states**: `aria-busy="true"` on loading containers
- [ ] **Modal focus trap**: Focus is trapped inside open modals

### Example: Accessible Icon Button
```tsx
<button
  onClick={handleDelete}
  aria-label="Delete student record"
  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10
             focus:ring-2 focus:ring-red-500 focus:outline-none
             transition-colors duration-200"
>
  <Trash2 className="w-4 h-4" />
</button>
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind Default)
```
sm:  640px   → Large phones (landscape)
md:  768px   → Tablets
lg:  1024px  → Small laptops
xl:  1280px  → Desktops
2xl: 1536px  → Large screens
```

### Mobile-First Pattern
```tsx
// ✅ Always start with mobile, then add larger breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <Card />
</div>

// ✅ Responsive text
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Dashboard</h1>

// ✅ Hide/show based on screen
<div className="block md:hidden">Mobile menu</div>
<div className="hidden md:block">Desktop sidebar</div>

// ✅ Responsive padding
<div className="px-4 md:px-6 lg:px-8">Content</div>
```

---

## 🖼️ Dashboard Page Template

```tsx
// pages/dashboard/admin/[module]/index.tsx
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { Role } from '@prisma/client';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useModuleList, useCreateModule } from '@/hooks/useModuleName';

interface Props {
  user: { id: string; name: string; role: string; schoolId: string };
}

export default function ModulePage({ user }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useModuleList({ page, limit: 10, search });

  return (
    <DashboardLayout role={user.role as any}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-outfit">
              Module Name
            </h1>
            <p className="text-sm text-gray-500 dark:text-brand-text-muted mt-1">
              Manage your module records
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg
                           bg-brand-primary-blue text-white font-medium
                           hover:bg-brand-primary-blue/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search records..."
            className="w-full md:w-80 pl-10 pr-4 py-2.5 rounded-lg
                     border border-gray-300 dark:border-brand-border
                     bg-white dark:bg-brand-secondary-blue
                     text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-brand-primary-blue focus:border-transparent
                     transition-all duration-200"
          />
        </div>

        {/* Content Area */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <DataTable data={data?.data?.data || []} />
        )}

        {/* Pagination */}
        {data?.data && (
          <Pagination
            currentPage={page}
            totalPages={data.data.totalPages}
            onPageChange={setPage}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session?.user) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const user = session.user as any;
  if (![Role.admin, Role.superadmin].includes(user.role)) {
    return { redirect: { destination: '/dashboard', permanent: false } };
  }

  return {
    props: {
      user: { id: user.id, name: user.name, role: user.role, schoolId: user.schoolId },
    },
  };
};
```

---

## ⚠️ Anti-Patterns

```tsx
// ❌ Using react-hot-toast
import toast from 'react-hot-toast'; // WRONG — use react-toastify

// ❌ Inline HTML buttons (no accessibility)
<button onClick={fn}>Click</button> // WRONG — use <Button> from ui/button

// ❌ Hardcoded colors
<div style={{ color: '#ff0000' }}>Error</div> // WRONG — use Tailwind classes

// ❌ console.log in production
console.log('data:', data); // WRONG — remove or use Logger

// ❌ Theme conditional in className (hydration risk)
<div className={theme === 'dark' ? 'bg-black' : 'bg-white'}> // WRONG — use dark: variants

// ❌ Missing loading/error states
const { data } = useQuery(...);
return <div>{data.items.map(...)}</div>; // CRASHES when data is undefined

// ❌ Not using DashboardLayout
return <div><Sidebar /><Content /></div>; // WRONG — use DashboardLayout
```
