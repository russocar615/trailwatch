# 🏕️ TrailWatch — National Park Monitoring Platform

Real-time trail and parking monitoring for national and state parks. Built with Next.js 14, Tailwind CSS, and Supabase.

---

## 🚀 Deploy to Vercel in 5 Minutes

### Step 1 — Clone & install

```bash
git clone <your-repo>
cd trailwatch
npm install
```

### Step 2 — Set up Supabase (for real auth)

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In your project, go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon / public` key

### Step 3 — Environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_PARKS_SIGNUP_CODE=TRAILWATCH_PARKS_2025
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

> ⚠️ **Change `NEXT_PUBLIC_PARKS_SIGNUP_CODE`** to something private before going live. This is the code parks department staff use to create ranger accounts.

### Step 4 — Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) and set the environment variables in **Project Settings → Environment Variables**.

---

## 🔐 Demo Accounts (No Supabase Needed)

The app works **immediately without Supabase** using demo mode. Use these credentials on the login page:

| Account Type | Email | Password |
|---|---|---|
| 🏕️ **Parks Department (Ranger)** | `ranger@trailwatch.demo` | `TrailWatch2025!` |
| 🥾 **Hiker** | `hiker@trailwatch.demo` | `Hiker2025!` |

Or click the **Demo: Ranger Login** / **Demo: Hiker Login** buttons on the sign-in page.

---

## 🌐 App Routes

| Route | Description | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/auth/login` | Sign in | Public |
| `/auth/signup` | Create hiker account (default) or parks dept with code | Public |
| `/ranger` | Ranger operations dashboard | `parks_dept` role only |
| `/hiker` | Hiker trail & parking browser | `hiker` role only |

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── not-found.tsx         # 404 page
│   ├── global-error.tsx      # Error boundary
│   ├── globals.css           # Global styles
│   ├── auth/
│   │   ├── login/page.tsx    # Sign in
│   │   ├── signup/page.tsx   # Register
│   │   └── callback/route.ts # Supabase auth callback
│   ├── ranger/
│   │   └── page.tsx          # Ranger dashboard
│   └── hiker/
│       └── page.tsx          # Hiker dashboard
├── components/
│   └── AppNav.tsx            # Top navigation bar
├── lib/
│   ├── data.ts               # Mock park/trail/parking data
│   ├── demo-auth.ts          # localStorage demo auth hook
│   ├── auth-context.tsx      # Supabase auth context (for real auth)
│   └── supabase/
│       ├── client.ts         # Browser Supabase client
│       └── server.ts         # Server Supabase client
└── middleware.ts             # Route protection
```

---

## 🎨 Design System

**Colors:** Hunter green (`#2d6a4f`) + Crème (`#faf7ed`)
**Fonts:** DM Serif Display (headings) + Instrument Sans (body)
**Framework:** Tailwind CSS with custom color palette

---

## 🔑 Parks Department Access Control

- **Default signup** → creates a `hiker` account
- **Parks dept signup** → requires `NEXT_PUBLIC_PARKS_SIGNUP_CODE` set in env
- The code is shown on the signup page only when "Parks Department staff?" is toggled
- Change this code in your environment variables before going live
- For production, consider making this an invite-only flow via Supabase

---

## 📡 Adding Real IoT Data

Replace the mock data in `src/lib/data.ts` with real Supabase queries. Each table (`parks`, `trails`, `parking_lots`, `alerts`) maps directly to the data shape used by the components.

Example:
```typescript
// Instead of importing from data.ts:
const { data: trails } = await supabase
  .from('trails')
  .select('*')
  .eq('park_id', selectedPark.id)
```

---

## 📄 License

Proprietary — TrailWatch © 2025
