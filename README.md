# OrderUp — Campus Food Ordering System
***COMS3009A: Software Design 2026***

> OrderUp is a web-based food ordering platform built for university campuses. Students browse menus, place orders across multiple vendors, and track them in real time — cutting out the queue. Vendors manage incoming orders and menus from a dedicated dashboard. Admins oversee the platform and approve or suspend vendor accounts.

University food courts experience heavy congestion during peak hours. Students and potentially, staff, spend significant time waiting in queues which lead them to being late for lectures of missing meals. At the same time, vendors are overwhelmed during these peak times, leading to a decline in quality and customer satisfaction.

OrderUp addresses this problem by providing a centralized, web-based food ordering platform for campus environments. The system allows customers to browse menus, place orders across multiple vendors in a single transaction, and track order progress in real time. Vendors are provided with a management interface to update menus and process incoming orders efficiently and give order status updates.
---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Local Setup](#local-setup)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [Running the App](#running-the-app)
9. [Git Workflow](#git-workflow)
10. [License](#license)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | UI & routing |
| Backend | Node.js + Express + TypeScript | REST API |
| Database | PostgreSQL (Azure) | Data storage |
| Authentication | Auth0 (Google) | Secure sessions |
| File Storage | Cloudinary | Menu images, certificates |
| Payments | Paystack | Online payment processing |
| Push Notifications | VAPID / Web Push | Order status alerts |
| Styling | Tailwind CSS | UI styling |

---

## Features

### Student
- Secure login via Google (Auth0)
- Browse vendor menus with prices, photos, and allergen info
- Place orders directly to a vendor and proceed to checkout
- Pay online via Paystack
- Real-time order status tracking (Received → Preparing → Ready)
- Push notifications when order is ready for collection
- View full order history

### Vendor
- Apply to join the platform (admin approval required)
- Dashboard with live incoming orders and filter by status
- Update order status (Received → Preparing → Ready)
- Full menu management (add, edit, mark sold out)
- Analytics: sales over time, peak hours, custom reports
- Upload health certificate and stall photos during onboarding

### Admin
- Approve or suspend vendor accounts
- Platform-wide analytics access

---

## Project Structure

```
OrderUp/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
├── backend/           # Express + TypeScript API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── analytics/
│   │   │   ├── auth/
│   │   │   ├── menu/
│   │   │   ├── notifications/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   ├── users/
│   │   │   └── vendors/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env
│   └── package.json
│
├── db/                # Database migrations (Flyway)
│   └── migrations/
│
├──docs/
|
├── README
└──react setup files
```

---

## Prerequisites

Make sure you have these installed before starting:

- [Node.js v18+](https://nodejs.org) — runtime for both frontend and backend
- npm — comes bundled with Node.js
- [Flyway CLI](https://flywaydb.org/documentation/usage/commandline/) — for running database migrations
- [pgAdmin](https://www.pgadmin.org/) or the VS Code PostgreSQL extension — to inspect the database
- Access to the project's Azure resource group — ask a team member to add you
- An Auth0 account with access to the team's tenant — ask a team member for the credentials

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/<your-org>/OrderUp.git
cd OrderUp
```

### 2. Install dependencies

You need to install separately for frontend and backend.

```bash
# Backend
cd backend
npm install

# Frontend (open a new terminal)
cd frontend
npm install
```

### 3. Set up environment variables

Each folder needs its own `.env` file. See the [Environment Variables](#environment-variables) section below for what goes in each one.

```bash
# Create the files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Then fill in the values — ask a team member for the secrets.

---

## Environment Variables

### Backend — `backend/.env`

```env
# PostgreSQL (Azure)
DB_HOST=your-server.postgres.database.azure.com
DB_PORT=5432
DB_NAME=OrderUpDB
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Server
PORT=3000

# Google OAuth (via Auth0)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=any_random_string_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_key_here
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# VAPID (Web Push Notifications)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:your@email.com
```

### Frontend — `frontend/.env`

```env
# Auth0
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id

# Backend API
VITE_API_URL=http://localhost:3000

# Auth bypass for local testing (set true to skip login)
VITE_SKIP_AUTH=false

# VAPID (must match backend)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

> **Note:** All frontend env variables must be prefixed with `VITE_` to be accessible in the browser via Vite.

> **Never commit `.env` files.** They are in `.gitignore`. Share secrets with teammates privately.

---

## Database Setup

The database runs on Azure PostgreSQL. You do not run it locally — you connect to the shared cloud instance.

### Running migrations with Flyway

Make sure the Flyway CLI is installed and configured to point at the Azure database, then run:

```bash
cd db
flyway migrate
```

> **Note:** Not all migrations may be present. If you add a new table or column, create a new migration file in `db/migrations/` following the naming convention `V{version}__{description}.sql` (e.g. `V4__add_allergens_column.sql`). Do not edit existing migration files.

### Wiping all data (dev only)

If you need to clear all tables without dropping them, run the following in pgAdmin or Azure Data Studio:

```sql
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;
```

> Azure automatically backs up the database daily — check the Azure Portal under your PostgreSQL server → Backup before wiping.

---

## Running the App

You need **two terminals** open — one for the backend, one for the frontend.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:3000`

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`

Open `http://localhost:5173` in your browser.

---

## Git Workflow

- `main` — production branch, always stable. Do not push directly.
- `dev` or feature branches — do all work here, then open a pull request into `main`.

### Typical workflow

```bash
# Pull latest main before starting
git checkout main
git pull origin main

# Create a feature branch
git checkout -b feature/your-feature-name

# Do your work, then stage and commit
git add .
git commit -m "feat: describe what you did"

# Push and open a PR
git push origin feature/your-feature-name
```

### Rules
- Keep `main` stable at all times
- Do not commit `.env` files
- Do not commit `node_modules/`
- Use meaningful commit messages
- At least one team member must review a PR before merging

---

## License

This is an academic project submitted as part of COMS3009A Software Design at the University of the Witwatersrand, 2026.
