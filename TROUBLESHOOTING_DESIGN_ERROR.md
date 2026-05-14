# Troubleshooting — Design validation (quick guide)

Problem: adding a new design returns a 400 Validation error. This usually means the `createdBy` field wasn't set because the request didn't include a valid admin token.

Quick checks
- Are you logged in as admin? Visit http://localhost:3000/admin/login (admin@inkcraft.com / admin123)
- In the browser DevTools -> Network, find the POST to `/api/tattoo-designs/admin` and check headers for `Authorization: Bearer <token>`

If token is missing
1. Logout and log back in.
2. Clear local storage in the console: `localStorage.clear()` and refresh.

If token is present but backend still rejects
1. Check backend logs for the incoming request and the decoded user info. Look for a log like:

```
=== CREATE DESIGN REQUEST ===
Request body: { ... }
User: { userId: '...', role: 'admin', ... }
```

2. If the `User` line is missing or shows role != `admin`, authentication failed — check the `JWT_SECRET` in your `backend/.env` and ensure the frontend uses the same API URL.

Restart servers (fast)
```bash
# backend
cd backend && npm run dev

# frontend (new terminal)
cd frontend && npm start
```

Field validation checklist (make sure these are filled correctly before submitting):
- Title (min 3 chars)
- Description (min 10 chars)
- Style (select)
- Category (select)
- Size (select)
- Difficulty (select)
- Estimated Time (0.5 - 20)
- Estimated Price (50 - 5000)

If problems remain, paste the backend log lines here and I’ll help interpret them.
