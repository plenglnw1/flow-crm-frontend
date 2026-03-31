# FlowCRM — Sales frontend (SvelteKit)

Sales-facing app (pipeline, customers, action stream, dashboard). It works with **flow-crm-backend** using Laravel’s session cookie.

---

## Quick start (Docker Compose)

1. **Clone the repo**

   ```bash
   git clone <repository-url>.git
   cd flow-crm-frontend
   ```

2. **Environment**

   Create `.env` in the project root (server-side SvelteKit can read variables without the `PUBLIC_` prefix).

   ```env
   API_URL="http://host.docker.internal"
   N8N_URL="https://localhost:5678"
   ```

3. From the project directory:

   ```bash
   docker compose up -d
   ```

4. The app maps **port 3000 → 5173** inside the container — open `http://localhost:3000`.

5. **Sign in** with a Sales account from the backend (e.g. `sales1@org1.com` / `password`) on `/login`.

---
