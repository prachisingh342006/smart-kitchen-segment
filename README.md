# Smart Kitchen Segment (Vercel)

This project serves static HTML pages at the root and exposes the backend API under `/api/*` for Vercel serverless deployment.

## Routes

- `/` → `cg.html`
- `/admin` → `admin.html`
- `/admin-users` → `admin-users.html`
- `/api/*` → serverless API powered by `backend/server.js`

## Local usage

1. Install dependencies at the repo root (required for Vercel-style runtime):
   - `npm install`
2. Run the backend locally (optional, for development):
   - `node backend/server.js`

## Deploy (Vercel)

- Root Directory must be the repository root (`.`)
- Framework preset: **Other**
- Deploy with the default build (no custom build command required)

## Troubleshooting

- **404 NOT_FOUND**: Ensure `vercel.json` is present and the root directory is set to `.` in Vercel project settings.
- **API errors**: Check `/api/health` for a quick health response.
