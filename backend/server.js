const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const tattooDesignRoutes = require('./routes/tattooDesigns');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inkcraft', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tattoo-designs', tattooDesignRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'InkCraft Backend is running!' });
});

// Debug route to check database connection
app.get('/api/debug/db-status', async (req, res) => {
  try {
    const { TattooDesign } = require('./models');
    const dbName = mongoose.connection.name;
    const dbHost = mongoose.connection.host;
    const totalDesigns = await TattooDesign.countDocuments({});
    const activeDesigns = await TattooDesign.countDocuments({ isActive: true });
    const sampleDesigns = await TattooDesign.find({ isActive: true }).limit(3).select('title style');
    
    res.json({
      success: true,
      database: {
        name: dbName,
        host: dbHost,
        connected: mongoose.connection.readyState === 1
      },
      counts: {
        total: totalDesigns,
        active: activeDesigns
      },
      sampleDesigns: sampleDesigns.map(d => ({ title: d.title, style: d.style }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//vercel error handling
app.use(cors({
  origin: [
    'https://ink-craft-lilac.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));