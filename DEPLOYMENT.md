# InkCraft Deployment Guide

## 🚀 Quick Setup for University Submission

### Step 1: Prerequisites Installation
1. Install Node.js (v14+) from [nodejs.org](https://nodejs.org)
2. Install MongoDB Community Edition from [mongodb.com](https://mongodb.com)
3. Ensure Git is installed

### Step 2: Download Project
```bash
# If you have the project folder already, navigate to it
cd inkcraft

# Or if downloading from repository
git clone [repository-url]
cd inkcraft
```

### Step 3: Backend Setup
```bash
cd backend
npm install
```

**Create .env file in backend folder with:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/inkcraft
JWT_SECRET=inkcraft_university_project_secret_key_2024
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@inkcraft.com
ADMIN_PASSWORD=admin123
```

### Step 4: Frontend Setup
```bash
cd ../frontend
npm install
```

**Create .env file in frontend folder with:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=InkCraft
REACT_APP_DEBUG=true
REACT_APP_STUDIO_NAME=InkCraft Tattoo Studio
```

### Step 5: Start MongoDB
- Windows: Start MongoDB service from Services or run `mongod`
- Mac: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

### Step 6: Run the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

### Step 7: Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Admin Login: http://localhost:3000/admin/login

### Default Login Credentials
**Admin Access:**
- Email: admin@inkcraft.com
- Password: admin123

**Test User (Register new or use these if created):**
- Email: test@example.com  
- Password: test123

## 🎯 Demo Flow for Viva/Presentation

### 1. User Journey Demo (5 minutes)
1. Open http://localhost:3000
2. Navigate through home page
3. View gallery
4. Register new user account
5. Login with new account
6. Create a booking
7. Use AI design generator
8. Chat with bot
9. View user dashboard

### 2. Admin Features Demo (3 minutes)
1. Go to http://localhost:3000/admin/login
2. Login with admin credentials
3. View admin dashboard analytics
4. Manage bookings (approve/reject)
5. View design portfolio
6. Check chat analytics

### 3. Technical Explanation Points
- **MERN Stack**: Show React frontend, Express backend, MongoDB data
- **Authentication**: Demonstrate JWT tokens, role-based access
- **API**: Show network tab with REST endpoints
- **Database**: Show data storage in MongoDB
- **Responsive Design**: Resize browser to show mobile view

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB service is running

**Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** 
- Kill process: `npx kill-port 5000`
- Or change PORT in backend .env file

**Module Not Found:**
```
Error: Cannot resolve module
```
**Solution:** 
- Delete node_modules and package-lock.json
- Run `npm install` again

**CORS Error:**
```
Access to fetch blocked by CORS policy
```
**Solution:** Ensure backend is running on port 5000

### Reset Database
If you need to reset all data:
```bash
# Connect to MongoDB
mongosh
use inkcraft
db.dropDatabase()
```

## 📦 Project Submission Checklist

### Before Submitting:
- [ ] Both frontend and backend run without errors
- [ ] MongoDB connection works
- [ ] Admin login successful
- [ ] User registration/login works
- [ ] Booking creation works
- [ ] AI design generator responds
- [ ] Chat bot responds to messages
- [ ] All admin features accessible
- [ ] No console errors in browser
- [ ] README.md is complete

### Files to Include:
- [ ] Complete source code
- [ ] README.md with setup instructions
- [ ] .env.example files (not actual .env)
- [ ] package.json files with dependencies
- [ ] Database schema documentation

### Demo Preparation:
- [ ] Practice the demo flow
- [ ] Prepare explanation of technical choices
- [ ] Understand the code architecture
- [ ] Be able to explain MERN stack benefits
- [ ] Know how authentication works
- [ ] Understand database relationships

## 🎓 Academic Value Points

### Technical Skills Demonstrated:
1. **Frontend Development**: React, modern JavaScript, responsive design
2. **Backend Development**: Node.js, Express, RESTful APIs
3. **Database Management**: MongoDB, data modeling, relationships
4. **Security**: Authentication, authorization, data protection
5. **Full-Stack Integration**: Frontend-backend communication
6. **Modern Development**: Component architecture, hooks, async operations

### Learning Outcomes:
- Understanding of full-stack web development
- Practical experience with MERN technologies
- Knowledge of modern authentication practices
- Experience with database design and operations
- Understanding of API development and consumption
- Responsive web design principles

## 📞 Emergency Contact

If you encounter issues during demo/submission:
- Check all services are running (MongoDB, Backend, Frontend)
- Verify environment variables are set correctly
- Ensure all dependencies are installed
- Check console for specific error messages

**Remember**: This is a learning project showcasing full-stack development skills suitable for university-level assessment.