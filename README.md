# Lite-Intel Attendance

A kiosk-based sign-in/sign-out attendance system for students and staff, built for a single shared device at the office/school entrance.

## How it works

- One shared laptop/tablet sits at the entrance, running the sign-in page (`/`) in the browser.
- Students and staff each tap their name from a role-filtered list (Students / Staff tabs).
- **Signing in** requires entering a personal PIN code (issued once by an admin).
- **Signing out** requires no code — just tap your name again.
- Each person can sign in and out once per day.
- Sign-in is blocked from **6:00 PM to 6:00 AM** (office hours only).
- Signing in after **9:10 AM** is automatically flagged as **Late**.

There are no personal user accounts — nobody logs in individually. The kiosk device itself is the proof of presence, since it never leaves the building.

## Roles

- **Admin** — manages the roster (add people, generate codes) and views attendance records. Protected by a separate password-gated `/admin` login.
- **Students / Staff** — no login. Just a name + a permanent PIN, used only at sign-in.

## Tech stack

- **Framework:** Next.js (App Router, TypeScript, no `src/` directory)
- **Database:** MongoDB via Mongoose
- **Icons:** Hugeicons (`@hugeicons/react`)
- **Styling:** Tailwind CSS
- **Package manager:** pnpm
- **Deployment:** Vercel

## Branding

- Primary color: Lite-Intel orange `#f54800`
- Supporting colors: white and black

## Project structure

attendance-app/
├── middleware.ts # protects /admin routes with a password-gated session cookie
├── .env.local
├── app/
│ ├── page.tsx # kiosk sign-in/sign-out page (public)
│ ├── layout.tsx
│ ├── globals.css
│ ├── admin/
│ │ ├── page.tsx # admin dashboard (people, codes, attendance records)
│ │ └── login/page.tsx # admin password login
│ └── api/
│ ├── people/
│ │ └── route.ts # GET roster, POST add person (generates code)
│ ├── attendance/
│ │ └── route.ts # GET records (by date or range), POST sign in/out
│ └── admin/
│ ├── login/route.ts
│ ├── logout/route.ts
│ └── check-auth/route.ts
├── components/
│ ├── Header.tsx
│ ├── AddPersonForm.tsx # admin: add a person, generates their PIN
│ └── PeopleList.tsx # admin: look up anyone's PIN if they lose it
├── lib/
│ ├── db.ts # MongoDB connection
│ ├── adminAuth.ts # admin session token helper
│ └── timeUtils.ts # office-hours time logic (Africa/Lagos timezone)
└── models/
├── Person.ts # name, role, group, code
└── AttendanceRecord.ts # person, date, signInTime, signOutTime, isLate

## Getting started

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000` for the kiosk sign-in screen, and `http://localhost:3000/admin` for the admin dashboard (password-protected).

## Admin workflow

1. Log in at `/admin` with `ADMIN_PASSWORD`.
2. Use **Add Person** to register a student or staff member — this generates a permanent 6-digit PIN, shown once on screen.
3. Give the PIN to that person directly (write it down, tell them in person).
4. If someone loses their PIN, look it up again anytime in the **People & Codes** list.
5. View attendance by day or by week, with presets (Today / Yesterday / This Week), search by name, and status pills showing who's currently signed in, signed out, or late.

## Sign-in rules

| Rule             | Behavior                                        |
| ---------------- | ----------------------------------------------- |
| Office hours     | Sign-in allowed 6:00 AM – 6:00 PM               |
| Outside hours    | Sign-in blocked, sign-out still allowed         |
| Late threshold   | Sign-in after 9:10 AM flagged as "Late"         |
| Frequency        | One sign-in and one sign-out per person per day |
| Code requirement | Required for sign-in, not required for sign-out |

## Roadmap / not yet built

- Export attendance reports (PDF/Excel)
- Per-person attendance streaks/stats
- Multiple kiosk devices (e.g. one per classroom)
