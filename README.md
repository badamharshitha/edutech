# EduBridge

EduBridge is a full-stack educational support platform connecting verified volunteers, sponsors, and students. The app includes JWT authentication, role-based workspaces, deterministic AI-style need scoring, sponsorship workflows, status tracking, audit logs, and MongoDB configuration.

## Run

```bash
npm install
npm install --prefix server
npm install --prefix client
npm run dev
```

The client runs at `http://localhost:5173` and the API at `http://localhost:5000`. Both bind to `0.0.0.0` for Codespaces forwarding. For durable data, copy `server/.env.example` to `server/.env` and configure MongoDB Atlas. For a local demo without MongoDB, set `DEMO_MODE=true`; the API reports `demo-mode` and data resets when the process restarts. MongoDB mode requires `MONGODB_URI` and a strong `JWT_SECRET`.

## Demo accounts

All demo accounts use `EduBridge2026!`.

- Admin: `admin@edubridge.demo`
- Volunteer: `volunteer@edubridge.demo`
- Sponsor: `sponsor@edubridge.demo`

Admin registration is intentionally disabled. `OPENAI_API_KEY` is optional: without it, the server uses a deterministic local scoring algorithm based on income, family size, educational need, dropout risk, and academic performance.

## API highlights

`POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PATCH /api/profile`, `GET /api/stats`, `GET/POST /api/students`, `POST /api/ai/analyze-student`, `GET /api/recommendations/students`, `GET/POST /api/support`, `PATCH /api/support/:id`, and admin overview, volunteer, sponsor, and audit endpoints. Sessions use an HttpOnly cookie; the bearer header remains accepted for API clients.

## Workflow test

1. Sign in as the volunteer and review or submit a student.
2. Sign in as the sponsor, open Recommendations, and create support.
3. Open My sponsorships to confirm the API record.
4. Sign in as admin to review overview and support records.
5. Check `GET /api/health` for API and database mode.

For production, configure a long random `JWT_SECRET`, MongoDB Atlas access, `CLIENT_URL`, and `COOKIE_SECURE=true` behind HTTPS. `OPENAI_API_KEY` is optional; deterministic scoring remains the fallback. Sponsorship records track support allocations only and do not process payments.

## Codespaces

Run `npm run dev` from the repository root. Open forwarded port `5173` for the client; the API listens on forwarded port `5000`.

## MongoDB Atlas setup

1. Create a MongoDB Atlas free-tier cluster and create a database user.
2. In Network Access, allow the Codespaces outbound IP or temporarily allow `0.0.0.0/0` for development.
3. Copy the connection string from Atlas and replace its username, password, and database name.
4. Put the connection string in `server/.env` as `MONGODB_URI`, set a random `JWT_SECRET`, set `DEMO_MODE=false`, and set `CLIENT_URL` to the forwarded frontend origin.
5. Start with `npm run dev` and confirm `/api/health` reports `mongodb`, not `demo-mode`.

Without `MONGODB_URI`, production mode exits with an error. Use `DEMO_MODE=true` only for an intentional local demo.

## Tests

Run `npm test` for the backend scoring tests and `npm --prefix client run build` for the frontend production build.