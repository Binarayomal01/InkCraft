# InkCraft - Tattoo Studio Web Platform

A comprehensive MERN stack web application for managing a tattoo studio, featuring customer bookings, AI design generation, chatbot assistance, and administrative management tools.

## 🎓 University Project Overview

**Project Type**: MERN Stack Web Application  
**Complexity Level**: Medium (Suitable for university submission)  
**Viva-Friendly**: Easy to explain and demonstrate  
**Academic Value**: Demonstrates full-stack development skills

### Key Features for Academic Assessment
- ✅ Complete MERN Stack Implementation
- ✅ Role-Based Authentication (User/Admin)
- ✅ REST API with MVC Architecture
- ✅ Responsive UI with Modern Design
- ✅ Real-time Chat System
- ✅ AI Integration (Mock Implementation)
- ✅ Data Visualization & Analytics
- ✅ CRUD Operations for All Entities

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or cloud)
- Git

### Installation

1. **Clone the repository**
```bash
git clone [your-repo-url]
cd inkcraft
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database configuration
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Admin Panel: http://localhost:3000/admin/login

### Default Admin Credentials
- Email: admin@inkcraft.com
- Password: admin123

## 📋 Project Structure

```
inkcraft/
├── backend/                 # Node.js/Express API
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── server.js          # Entry point
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── hooks/         # Custom hooks
│   │   └── services/      # API services
│   └── public/
└── README.md
```

## 🔧 Technical Stack

### Frontend
- **React 18** - Modern UI library
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM library
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 🎨 Features Overview

### User Features
1. **Home Page** - Studio showcase and navigation
2. **Gallery** - Tattoo portfolio display
3. **Booking System** - Appointment scheduling
4. **AI Design Generator** - Mock tattoo design creation
5. **Chat Support** - Rule-based chatbot assistance
6. **User Dashboard** - Personal booking management
7. **Authentication** - Secure login/registration

### Admin Features
1. **Admin Dashboard** - Analytics and overview
2. **Booking Management** - Appointment oversight
3. **Design Management** - Portfolio administration
4. **Chat Analytics** - Customer interaction insights
5. **User Management** - Customer administration

## 🤖 AI Implementation (Student-Friendly)

### Mock AI Design Generator
- **Implementation**: Rule-based system (no paid APIs)
- **Functionality**: Generates design descriptions based on user input
- **Educational Value**: Demonstrates AI integration concepts
- **Viva Explanation**: "Simulated AI for cost-effective demonstration"

### Rule-Based Chatbot
- **Technology**: Pattern matching and predefined responses
- **Coverage**: 20+ common tattoo-related questions
- **Fallback**: Default responses for unmatched queries
- **Analytics**: Tracks conversation metrics

## 📊 Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  phone: String,
  createdAt: Date
}
```

### Booking Collection
```javascript
{
  user: ObjectId,
  tattooStyle: String,
  placement: String,
  size: String,
  description: String,
  preferredDate: Date,
  preferredTime: String,
  status: String,
  budget: String
}
```

### TattooDesign Collection
```javascript
{
  title: String,
  description: String,
  style: String,
  tags: [String],
  imageUrl: String,
  aiGenerated: Boolean,
  createdBy: ObjectId
}
```

### ChatMessage Collection
```javascript
{
  user: ObjectId,
  message: String,
  response: String,
  category: String,
  sentiment: String,
  responseTime: Number
}
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get all bookings (admin)
- `GET /api/bookings/user` - Get user bookings
- `PATCH /api/bookings/:id/status` - Update booking status

### Tattoo Designs
- `POST /api/tattoo-designs` - Create design
- `GET /api/tattoo-designs` - Get all designs
- `POST /api/tattoo-designs/ai-generate` - Generate AI design

### Chat
- `POST /api/chat` - Send message
- `GET /api/chat/history` - Get chat history
- `GET /api/chat/analytics` - Get chat analytics

## 🎯 Academic Presentation Points

### For Viva/Demo
1. **Full-Stack Integration**: Demonstrate seamless frontend-backend communication
2. **Authentication Flow**: Show secure login/logout with role-based access
3. **CRUD Operations**: Create, read, update, delete bookings and designs
4. **Responsive Design**: Mobile-friendly interface demonstration
5. **Data Visualization**: Admin analytics and charts
6. **Error Handling**: Graceful error management and user feedback
7. **Code Organization**: Clean MVC architecture and component structure

### Technical Learning Outcomes
- RESTful API design and implementation
- Modern React development patterns
- Database design and relationships
- Authentication and authorization
- State management techniques
- Responsive web design
- Error handling and validation

## 🔒 Environment Configuration

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inkcraft
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
EMAIL_ENABLED=true
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_smtp_username
EMAIL_PASS=your_smtp_password
EMAIL_FROM="InkCraft <no-reply@inkcraft.local>"
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=InkCraft
```

## 🧪 Development & Testing

### Running in Development
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm start
```

### Testing the Application
1. Register a new user account
2. Login and explore user features
3. Create a booking
4. Use the AI design generator
5. Chat with the bot
6. Login as admin (admin@inkcraft.com / admin123)
7. Manage bookings and view analytics

## 📝 Common Viva Questions & Answers

**Q: Why did you choose MERN stack?**  
A: MERN provides a complete JavaScript ecosystem, enabling efficient development with a single language across frontend and backend, which is ideal for learning full-stack concepts.

**Q: How does your authentication work?**  
A: We use JWT tokens for stateless authentication, with bcrypt for password hashing and role-based access control for admin/user differentiation.

**Q: Explain your database design.**  
A: We use MongoDB with Mongoose ODM, implementing references between collections (User->Booking, User->ChatMessage) for relational data while maintaining NoSQL flexibility.

**Q: How did you implement the AI features?**  
A: For academic purposes, we implemented mock AI using rule-based systems. This demonstrates integration patterns without requiring expensive third-party APIs, making it suitable for student projects.

**Q: What security measures did you implement?**  
A: Password hashing with bcrypt, JWT authentication, input validation, CORS configuration, and protected routes based on user roles.

## 🚧 Future Enhancements

- Real AI integration with image generation APIs
- Email notifications for bookings
- Payment integration
- Real-time messaging with Socket.io
- Image upload functionality
- Advanced analytics with charts
- Multi-language support

## 📊 Project Statistics

- **Lines of Code**: ~3,000+ (estimated)
- **Components**: 25+ React components
- **API Endpoints**: 15+ RESTful routes
- **Database Collections**: 4 main collections
- **Pages**: 12+ user and admin pages

## 🤝 Contributing

This is a university project created for educational purposes. The codebase is structured to be easily understood and extended for learning purposes.

## 📄 License

This project is created for educational purposes - university assignment.

## 👨‍💻 Developer

**Students Name**: [Your Name]  
**University**: [Your University]  
**Course**: [Course Name]  
**Year**: 2025

---

### 📞 Support

For questions about this academic project, please contact:
- Email: [your-email]
- University ID: [your-id]

**Note**: This project is designed to be easily explainable in academic settings and demonstrates practical full-stack development skills suitable for university-level assessment.