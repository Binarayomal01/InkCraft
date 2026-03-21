# Database Seed Guide

This guide explains how to use the seed file to populate your database with sample data.

## What Gets Created

The seed file creates:
- **4 Users** (1 admin, 3 regular users)
- **10 Tattoo Designs** (various styles and categories)
- **5 Bookings** (with different statuses)
- **7 Chat Messages** (sample conversations)

## How to Run

### Option 1: Using npm script (Recommended)
```bash
npm run seed
```

### Option 2: Direct execution
```bash
node seed.js
```

## Login Credentials

After seeding, you can log in with these credentials:

### Admin Account
- **Email:** admin@inkcraft.com
- **Password:** admin123

### User Accounts
- **Email:** john@example.com | **Password:** user123
- **Email:** jane@example.com | **Password:** user123
- **Email:** mike@example.com | **Password:** user123

## Important Notes

⚠️ **Warning:** Running the seed file will:
1. Delete ALL existing data in the database
2. Create fresh sample data
3. This action cannot be undone

💡 **Tip:** Only run this in development environments, never in production!

## Sample Data Includes

### Users
- Admin user with full permissions
- Regular users with different preferences and locations

### Tattoo Designs
- Various styles: Japanese, Minimalist, Realistic, Geometric, Watercolor, Traditional, Blackwork, Neo-Traditional, Tribal
- Different sizes and price ranges
- Featured and non-featured designs
- Pre-populated likes from users

### Bookings
- Pending bookings waiting for approval
- Approved bookings with confirmed dates
- Rejected booking with reason
- Various tattoo styles and body placements

### Chat Messages
- Different message types: greeting, booking_faq, aftercare, studio_info, pricing
- Sample conversations with helpful responses
- User feedback (helpful/not helpful ratings)
- Follow-up suggestions

## Troubleshooting

### Connection Error
If you get a MongoDB connection error:
- Make sure MongoDB is running
- Check your `.env` file for `MONGODB_URI`
- Default connection: `mongodb://localhost:27017/inkcraft`

### Duplicate Key Error
If you get a duplicate key error:
- The database might already have data
- The seed script will automatically clear existing data
- If the error persists, manually clear the database

## Environment Variables

Make sure your `.env` file has:
```
MONGODB_URI=mongodb://localhost:27017/inkcraft
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

## Next Steps

After seeding:
1. Start your backend server: `npm start` or `npm run dev`
2. Test the login with provided credentials
3. Explore the API endpoints with sample data
4. Start your frontend to see the data in action

---

Need help? Check the main README.md or contact the development team.
