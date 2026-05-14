# InkCraft

Hi — this is my InkCraft project: a small MERN app for managing tattoo designs, bookings and a simple chatbot. I wrote this for a university project; the code is intentionally straightforward so it's easy to explain.

If you want the full deployment notes (Docker, hosting tips, environment examples), see [DEPLOYMENT.md](DEPLOYMENT.md).

## Quick start (what I usually do)

Prereqs
- Node.js (16+)
- npm
- MongoDB (local or Atlas)

Clone and run locally
```bash
git clone <repo-url>
cd inkcraft

# backend (API)
cd backend
npm install
# create .env (see example or DEPLOYMENT.md)
npm run dev

# in a new terminal: frontend
cd ../frontend
npm install
npm start
```

Open http://localhost:3000 and the API runs on port 5000 by default.

Default admin for quick testing
- Email: admin@inkcraft.com
- Password: admin123

## What I kept in this README
- Short project intent and quick local setup
- Minimal env vars and how to run front/backend
- Pointer to DEPLOYMENT.md for longer deployment instructions

## Required environment variables (backend)
The app reads these from the environment. Put them in `backend/.env`:

- `PORT` (optional, default 5000)
- `MONGODB_URI` (e.g. mongodb://localhost:27017/inkcraft)
- `JWT_SECRET`
- `FRONTEND_URL` (optional, e.g. http://localhost:3000)
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (optional unless you use image uploads)
- File size: `MAX_FILE_SIZE` (optional)
- Email (optional): `EMAIL_ENABLED`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`

Frontend expects (optional)
- `REACT_APP_API_URL` (defaults to http://localhost:5000/api)

If you need exact examples, check `DEPLOYMENT.md` or ask me to add a `.env.example`.

## Useful scripts

- Backend: `npm run dev` (uses nodemon), `npm start` (prod)
- Backend helpers: `npm run seed` (seed data), `npm run migrate:public-designs`
- Frontend: `npm start`, `npm run build`

## Notes for reviewers / viva
- This is a student project — I focused on clear separation between frontend and backend and readable code.
- AI features are rule-based/mock for demonstration.

---

If you want this to read even more like you wrote it, tell me which phrases or sections you want changed and I’ll update the README accordingly.