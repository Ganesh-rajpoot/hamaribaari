# HamariBaari — MVP

"Join the queue from home. Reach closer to your turn."

## Stack
- Frontend: React + Vite + Tailwind + React Router + Axios + Lucide + Context API
- Backend: Node.js + Express + PostgreSQL + Prisma + JWT + bcryptjs

## Phase status
- [x] Phase 1 — Setup, schema, auth, seed
- [ ] Phase 2 — Hospital/Dept/Doctor/Schedules, Daily OPD
- [ ] Phase 3 — Token generation, receptionist queue
- [ ] Phase 4 — Patient & Doctor dashboards
- [ ] Phase 5 — Admin, tests, docs, deploy

## Quick start (Phase 1)
See per-phase sections below.


# HamariBaari — MVP

> **“Join the queue from home. Reach closer to your turn.”**

A simple, mobile-first HamariBaari Management System. Patients join a
hospital’s OPD queue online, receive a token, and track their position.
Receptionists control daily OPD sessions, doctors call patients from a
minimal dashboard. **No online payments** — registration and consultation
fees are collected at the hospital reception.

---

## 1. Project Overview

- **Patients** register with a mobile + password, browse hospitals, view
  today’s live OPD sessions, join a queue, get a token, and see a
  real-time estimate of when to arrive.
- **Receptionists** open / pause / resume / close each doctor’s daily
  OPD session, add walk-in patients, and manage the queue (arrive, call,
  start, complete, skip, recall, put-at-end).
- **Doctors** see only their own queue and can Start, Complete, or Skip
  the current patient.
- **Hospital admins** manage the hospital’s details, departments,
  doctors, weekly schedules, and staff accounts.
- Every queue-changing action is transactional and audited.

---

## 2. Technology Stack

**Frontend:** React 18, Vite, JavaScript, React Router v6, Tailwind CSS,
Axios, Lucide React, React Context API, basic PWA.
**Backend:** Node.js, Express, JavaScript, PostgreSQL, Prisma ORM, JWT,
bcryptjs, express-validator, dotenv, cors, helmet, express-rate-limit.

---

## 3. Project Structure

```
hospital-queue-mvp/
├── frontend/            # React + Vite + Tailwind app
│   └── src/{api,components,context,hooks,layouts,pages,utils}
├── backend/             # Express + Prisma API
│   ├── prisma/{schema.prisma,migrations,seed.js}
│   └── src/{config,controllers,middleware,routes,services,utils,validators}
└── README.md
```

---

## 4. Prerequisites

- Node.js ≥ 18, npm ≥ 9
- PostgreSQL ≥ 13 (local or cloud)
- Git

---

## 5. PostgreSQL Setup

**Local (Windows / macOS / Linux):**

```bash
# Start Postgres (package dependent)
# macOS (Homebrew): brew services start postgresql
# Ubuntu: sudo systemctl start postgresql
# Windows: start the “PostgreSQL” service

# Create dev + test databases
psql -U postgres -c "CREATE DATABASE hospital_queue;"
psql -U postgres -c "CREATE DATABASE hospital_queue_test;"
```

**Cloud:** Neon, Railway, Supabase, or RDS — copy the connection string
into `DATABASE_URL`.

---

## 6. Database Creation

Handled above. Confirm with:

```bash
psql -U postgres -d hospital_queue -c "\dt"
```

---

## 7. Environment Configuration

**backend/.env**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hospital_queue?schema=public"
JWT_SECRET="replace_with_a_long_random_secret_at_least_32_chars"
PORT=5000
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"

SEED_ADMIN_PASSWORD="Admin@123"
SEED_RECEPTIONIST_PASSWORD="Recept@123"
SEED_DOCTOR_PASSWORD="Doctor@123"
SEED_PATIENT_PASSWORD="Patient@123"
```

**backend/.env.test** — same, but `DATABASE_URL` → `hospital_queue_test`
and `NODE_ENV="test"`.

**frontend/.env**

```env
VITE_API_BASE_URL="http://localhost:5000/api/v1"
```

Never commit `.env` files. Only `.env.example` is checked in.

---

## 8. Prisma Schema & Migrations

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

The initial migration is followed by a **custom migration** for the
partial unique index (see § 15):

```bash
npx prisma migrate dev --name partial_unique_active_token --create-only
# paste SQL from the "Custom migration" block below, then:
npx prisma migrate dev
```

**Custom migration SQL**

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_token_per_patient_session
  ON "QueueToken" ("sessionId", "patientId")
  WHERE "status" IN ('WAITING', 'CALLED', 'IN_CONSULTATION');

CREATE INDEX IF NOT EXISTS idx_queue_session_status_position_token
  ON "QueueToken" ("sessionId", "status", "position", "tokenNumber");

CREATE INDEX IF NOT EXISTS idx_queue_patient_status
  ON "QueueToken" ("patientId", "status");
```

**Production migration flow**

```bash
# 1. Build the image / checkout code
# 2. Run only the pending migrations (never resets data)
npx prisma migrate deploy
# 3. Restart the app server
```

---

## 9. Seeding Demo Data

```bash
cd backend
npx prisma db seed
```

Seeds a fictional demo hospital, 3 departments, 3 doctors, 1 admin,
1 receptionist, 3 patients, today’s sessions in different states.
**Never** run the seed against production.

---

## 10–13. Install & Run

```bash
# Backend
cd backend
npm install
npm run dev             # http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

Quick sanity check:

```bash
curl http://localhost:5000/api/v1/health
# {"ok":true,"ts":"..."}
```

---

## 14. Demo Credentials

| Role | Mobile | Password |
|---|---|---|
| Hospital admin | 9000000001 | `Admin@123` |
| Receptionist | 9000000002 | `Recept@123` |
| Doctor (Gen Med) | 9000000003 | `Doctor@123` |
| Doctor (Ortho) | 9000000004 | `Doctor@123` |
| Doctor (Paeds) | 9000000005 | `Doctor@123` |
| Patient A | 9111111111 | `Patient@123` |
| Patient B | 9222222222 | `Patient@123` |
| Patient C | 9333333333 | `Patient@123` |

All names, doctors, and data are fictional.

---

## 15. Queue-Generation Logic

Token generation is **transaction-safe and lock-based**:

1. `SELECT … FOR UPDATE` on the target `OPDSession` row.
2. Validate `status = OPEN`, `bookedCount < maxCapacity`, and (for
   ONLINE) `onlineCutoffTime` not passed.
3. Look up or create the patient (walk-in only).
4. Fast pre-check for an **active** token for the same patient+session
   (authoritative guard is the partial unique index).
5. Insert the `QueueToken` with `tokenNumber = nextTokenNumber`.
6. Update the session: `nextTokenNumber += 1`, `bookedCount += 1`.
7. Write an audit-log entry.
8. Commit. Rollback on any failure — counter and token always stay
   consistent.

Retry wrapper handles Postgres `40001` (serialization) and `40P01`
(deadlock) plus Prisma `P2034` up to 3 times with a short backoff.

The partial unique index

```sql
CREATE UNIQUE INDEX uniq_active_token_per_patient_session
  ON "QueueToken" ("sessionId", "patientId")
  WHERE "status" IN ('WAITING','CALLED','IN_CONSULTATION');
```

is the **database-enforced** guarantee that a patient can never hold two
active tokens in one session.

---

## 16. Queue Status Transitions

**OPDSession:** `SCHEDULED → OPEN → PAUSED → OPEN → CLOSED`, with
`UNAVAILABLE` and `CANCELLED` reachable from the appropriate states.

**QueueToken:** `WAITING → CALLED → IN_CONSULTATION → COMPLETED`, plus
`SKIPPED` (from WAITING/CALLED/IN_CONSULTATION), `NO_SHOW` (from
WAITING/CALLED), and `CANCELLED` (WAITING only, by the patient, or by
staff). Skipped tokens can be **recalled** to WAITING.

Arrival is tracked separately: `NOT_ARRIVED | ARRIVED`.

---

## 17. Daily OPD Opening & Cancellation

- A doctor’s **weekly** schedule describes when they normally work.
- Sessions for a specific day are materialised via **Admin → Ensure
  today’s sessions** (or `POST /admin/sessions/ensure`). The operation is
  idempotent.
- The receptionist must explicitly **Open** each doctor’s queue for the
  day before tokens are accepted.
- **Pause** blocks new tokens; existing tokens stay valid.
- **Close** prevents new tokens and stops the queue for the day.
- **Cancel** requires a reason and preserves all historical tokens.
- **Mark unavailable** hides the doctor for the day without erasing
  history.

---

## 18. API Reference

All endpoints under `/api/v1`. Bearer JWT in `Authorization`.

**Auth**

```
POST   /auth/register              { fullName, mobile, password, confirmPassword }
POST   /auth/login                 { mobile, password }
GET    /auth/me
```

**Public**

```
GET    /hospitals[?q=...]
GET    /hospitals/:id
GET    /hospitals/:id/departments
GET    /hospitals/:id/doctors
GET    /doctors/:id/sessions[?date=YYYY-MM-DD]
```

**Patient**

```
POST   /tokens                     { sessionId }
GET    /tokens/my
GET    /tokens/:id
PATCH  /tokens/:id/cancel
```

**Receptionist / Hospital admin**

```
GET    /receptionist/today
GET    /sessions/:id
POST   /sessions/:id/open|pause|resume|close|unavailable|cancel
POST   /sessions/:id/walk-in       { patientName, patientMobile }
GET    /sessions/:id/queue
PATCH  /tokens/:id/arrive|call|start|complete|skip|recall|put-at-end|no-show
```

**Doctor**

```
GET    /doctor/today
GET    /doctor/queue
PATCH  /doctor/tokens/:id/start|complete|skip
```

**Hospital admin**

```
GET/PATCH  /admin/hospital
GET/POST/PATCH/DELETE  /admin/departments[/:id]
GET/POST/PATCH         /admin/doctors[/:id]
GET/POST/DELETE        /admin/doctors/:id/schedules[/:sid]
POST                   /admin/staff
POST                   /admin/sessions/ensure
GET                    /admin/sessions[?date=YYYY-MM-DD]
```

Errors use a consistent shape:

```json
{ "error": { "code": "CONFLICT", "message": "...", "requestId": "..." } }
```

---

## 19. Common Troubleshooting

| Problem | Fix |
|---|---|
| `P1001: Can't reach database` | Postgres not running, or `DATABASE_URL` wrong. |
| `P3005` on migrate | Existing schema not managed by Prisma. Use a fresh DB. |
| `prisma generate` fails | Delete `node_modules/.prisma`, rerun. |
| `EADDRINUSE: 5000` | Change `PORT` in `.env`. |
| CORS errors | Ensure `FRONTEND_URL` matches the browser origin exactly. |
| Token duplicates | Confirm the partial unique index exists (`\d "QueueToken"`). |
| 401 after login | `JWT_SECRET` changed between restarts. Log in again. |
| Timezone weirdness | Sessions store `sessionDate` as `DATE`; render in IST on the client. |
| Tests fail on fresh DB | Run `npx prisma migrate deploy` inside `backend/` first. |

---

## 20. Deployment

**Postgres** — Neon / Railway / Render Managed Postgres. Copy the pooled
connection string. Run `npx prisma migrate deploy` once per release.

**Backend (Render example)**

- Runtime: Node 20
- Build: `npm ci && npx prisma generate`
- Start: `node src/server.js`
- Pre-deploy: `npx prisma migrate deploy`
- Env: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`

**Frontend (Vercel example)**

- Framework preset: Vite
- Build: `npm run build`
- Output: `dist`
- Env: `VITE_API_BASE_URL=https://<backend-host>/api/v1`

**Checklist before going live**

- [ ] Rotate `JWT_SECRET`
- [ ] Set strong DB password, disable public Postgres port
- [ ] Add real domain to `FRONTEND_URL` and to Helmet `connectSrc`
- [ ] Enable HTTPS everywhere
- [ ] Schedule daily DB backups
- [ ] Do **not** run the seed against production

---

## Testing

```bash
cd backend
npm test
```

Covers auth, hospital isolation, session lifecycle, token generation
(including concurrency), walk-in flows, transitions, patient-cancel,
and doctor flow.

---

## License

Internal MVP — no license granted for redistribution.