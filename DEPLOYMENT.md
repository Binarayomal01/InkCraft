# InkCraft — Deployment notes

This file has the detailed deployment and demo checklist. I rewrote it to be short and practical — follow these steps when you want to run or present the project.

## Quick deploy (local)

Prereqs
- Node.js (16+)
- npm
- MongoDB (local or Atlas)

Clone and install
```bash
git clone <repo-url>
cd inkcraft

# backend
cd backend
npm install

# frontend (separate terminal)
cd ../frontend
npm install
```

Env files
- Backend: create `backend/.env` with at minimum:
	- `MONGODB_URI` (mongodb://localhost:27017/inkcraft)
	- `JWT_SECRET`
	- `PORT` (optional)
- Frontend: `frontend/.env` (optional)

Run
```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm start
```

Open http://localhost:3000 (API: http://localhost:5000)

## Demo checklist
- Admin login works (admin@inkcraft.com / admin123)
- Register and login as user
- Create a booking
- Create / view designs
- Use AI generator and chat

## Common fixes
- MongoDB not running: start `mongod` or use Atlas
- Port in use: change `PORT` in `backend/.env` or kill process
- Missing packages: `rm -rf node_modules && npm install`
- Email/Cloudinary: set the required env vars if using those features

## Reset DB (developer)
```bash
mongosh --eval "use inkcraft; db.dropDatabase();"
```

## Submission checklist
- Include `README.md` and `backend/.env.example` (don’t commit real `.env`)
- Ensure both apps run locally
- Verify the demo flow above

If you want, I can add a `backend/.env.example` and `frontend/.env.example` next.