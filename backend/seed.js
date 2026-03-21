const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const TattooDesign = require('./models/TattooDesign');
const Booking = require('./models/Booking');
const ChatMessage = require('./models/ChatMessage');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inkcraft', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Sample data
const seedData = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    
    // Clear existing data
    await User.deleteMany({});
    await TattooDesign.deleteMany({});
    await Booking.deleteMany({});
    await ChatMessage.deleteMany({});
    
    console.log('✅ Existing data cleared');

    // Create Users
    console.log('👤 Creating users...');
    
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@inkcraft.com',
        password: 'admin123',
        phone: '1234567890',
        gender: 'Other',
        role: 'admin',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'user123',
        phone: '9876543210',
        gender: 'Male',
        role: 'user',
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001'
        },
        preferences: {
          tattooStyles: ['Traditional', 'Japanese'],
          communicationMethod: 'both'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'user123',
        phone: '5551234567',
        gender: 'Female',
        role: 'user',
        address: {
          street: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601'
        },
        preferences: {
          tattooStyles: ['Minimalist', 'Watercolor'],
          communicationMethod: 'email'
        }
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'user123',
        phone: '5559876543',
        gender: 'Male',
        role: 'user',
        address: {
          street: '321 Elm St',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101'
        },
        preferences: {
          tattooStyles: ['Realistic', 'Geometric'],
          communicationMethod: 'phone'
        }
      }
    ]);
    
    console.log(`✅ Created ${users.length} users`);

    // Create Tattoo Designs
    console.log('🎨 Creating tattoo designs...');
    
    const designs = await TattooDesign.create([
      {
        title: 'Majestic Dragon',
        description: 'A fierce and detailed dragon design with intricate scales and flowing movement. Perfect for those seeking a powerful and dynamic piece.',
        style: 'Japanese',
        category: 'Fantasy',
        size: 'Large (8+ inches)',
        difficulty: 'Expert',
        estimatedTime: 8,
        estimatedPrice: 1200,
        imageUrl: null,
        colors: 'Color',
        bodyPlacements: ['Back', 'Chest', 'Arm'],
        tags: ['dragon', 'japanese', 'mythical', 'detailed'],
        isFeatured: true,
        artist: 'Master Tanaka',
        views: 245,
        createdBy: users[0]._id
      },
      {
        title: 'Minimalist Mountain Range',
        description: 'Simple yet elegant mountain silhouette with clean lines. Represents adventure, strength, and love for nature.',
        style: 'Minimalist',
        category: 'Nature',
        size: 'Small (2-4 inches)',
        difficulty: 'Beginner',
        estimatedTime: 1.5,
        estimatedPrice: 150,
        imageUrl: null,
        colors: 'Black Only',
        bodyPlacements: ['Wrist', 'Ankle', 'Shoulder'],
        tags: ['mountains', 'minimalist', 'nature', 'simple'],
        isFeatured: true,
        artist: 'Sarah Lin',
        views: 532,
        createdBy: users[0]._id
      },
      {
        title: 'Realistic Rose Bouquet',
        description: 'Stunningly realistic roses with intricate shading and depth. A timeless classic that never goes out of style.',
        style: 'Realistic',
        category: 'Nature',
        size: 'Medium (4-8 inches)',
        difficulty: 'Advanced',
        estimatedTime: 5,
        estimatedPrice: 650,
        imageUrl: null,
        colors: 'Black & Grey',
        bodyPlacements: ['Arm', 'Leg', 'Shoulder'],
        tags: ['rose', 'realistic', 'flowers', 'classic'],
        isFeatured: false,
        artist: 'Carlos Rivera',
        views: 189,
        createdBy: users[0]._id
      },
      {
        title: 'Geometric Wolf',
        description: 'Modern geometric interpretation of a wolf combining angular shapes with organic form. Bold and contemporary.',
        style: 'Geometric',
        category: 'Animals',
        size: 'Medium (4-8 inches)',
        difficulty: 'Intermediate',
        estimatedTime: 4,
        estimatedPrice: 500,
        imageUrl: null,
        colors: 'Black Only',
        bodyPlacements: ['Arm', 'Leg', 'Back'],
        tags: ['wolf', 'geometric', 'modern', 'animal'],
        isFeatured: true,
        artist: 'Alex Chen',
        views: 412,
        createdBy: users[0]._id
      },
      {
        title: 'Watercolor Butterfly',
        description: 'Vibrant watercolor butterfly with splashes of color and soft edges. Represents transformation and beauty.',
        style: 'Watercolor',
        category: 'Nature',
        size: 'Small (2-4 inches)',
        difficulty: 'Intermediate',
        estimatedTime: 2.5,
        estimatedPrice: 300,
        imageUrl: null,
        colors: 'Color',
        bodyPlacements: ['Shoulder', 'Ankle', 'Wrist'],
        tags: ['butterfly', 'watercolor', 'colorful', 'nature'],
        isFeatured: false,
        artist: 'Emma Watson',
        views: 328,
        createdBy: users[0]._id
      },
      {
        title: 'Traditional Anchor',
        description: 'Classic traditional style anchor with bold lines and vintage appeal. A nautical symbol of stability and hope.',
        style: 'Traditional',
        category: 'Symbols',
        size: 'Small (2-4 inches)',
        difficulty: 'Beginner',
        estimatedTime: 2,
        estimatedPrice: 200,
        imageUrl: null,
        colors: 'Color',
        bodyPlacements: ['Arm', 'Leg', 'Chest'],
        tags: ['anchor', 'traditional', 'nautical', 'classic'],
        isFeatured: false,
        artist: 'Old School Pete',
        views: 156,
        createdBy: users[0]._id
      },
      {
        title: 'Blackwork Mandala',
        description: 'Intricate mandala pattern with heavy blackwork and detailed dot work. Represents balance and harmony.',
        style: 'Blackwork',
        category: 'Geometric',
        size: 'Large (8+ inches)',
        difficulty: 'Advanced',
        estimatedTime: 6,
        estimatedPrice: 800,
        imageUrl: null,
        colors: 'Black Only',
        bodyPlacements: ['Back', 'Chest', 'Shoulder'],
        tags: ['mandala', 'blackwork', 'geometric', 'spiritual'],
        isFeatured: true,
        artist: 'Priya Sharma',
        views: 387,
        createdBy: users[0]._id
      },
      {
        title: 'Neo-Traditional Phoenix',
        description: 'Bold neo-traditional phoenix rising from flames with rich colors and modern styling. Symbol of rebirth and renewal.',
        style: 'Neo-Traditional',
        category: 'Fantasy',
        size: 'Extra Large (12+ inches)',
        difficulty: 'Expert',
        estimatedTime: 10,
        estimatedPrice: 1500,
        imageUrl: null,
        colors: 'Color',
        bodyPlacements: ['Back', 'Chest'],
        tags: ['phoenix', 'neo-traditional', 'mythical', 'colorful'],
        isFeatured: true,
        artist: 'Marcus Stone',
        views: 567,
        createdBy: users[0]._id
      },
      {
        title: 'Tribal Sleeve Design',
        description: 'Traditional tribal patterns flowing together to create a cohesive full sleeve design. Bold and timeless.',
        style: 'Tribal',
        category: 'Cultural',
        size: 'Extra Large (12+ inches)',
        difficulty: 'Advanced',
        estimatedTime: 12,
        estimatedPrice: 2000,
        imageUrl: null,
        colors: 'Black Only',
        bodyPlacements: ['Arm'],
        tags: ['tribal', 'sleeve', 'traditional', 'polynesian'],
        isFeatured: false,
        artist: 'Kai Malo',
        views: 298,
        createdBy: users[0]._id
      },
      {
        title: 'Minimalist Wave',
        description: 'Simple continuous line forming an elegant wave. Perfect for ocean lovers and minimalist enthusiasts.',
        style: 'Minimalist',
        category: 'Nature',
        size: 'Small (2-4 inches)',
        difficulty: 'Beginner',
        estimatedTime: 1,
        estimatedPrice: 120,
        imageUrl: null,
        colors: 'Black Only',
        bodyPlacements: ['Wrist', 'Ankle', 'Ribcage'],
        tags: ['wave', 'ocean', 'minimalist', 'simple'],
        isFeatured: false,
        artist: 'Sarah Lin',
        views: 445,
        createdBy: users[0]._id
      }
    ]);
    
    console.log(`✅ Created ${designs.length} tattoo designs`);

    // Add some likes to designs
    designs[0].likes.push({ userId: users[1]._id });
    designs[0].likes.push({ userId: users[2]._id });
    designs[1].likes.push({ userId: users[1]._id });
    designs[3].likes.push({ userId: users[2]._id });
    designs[3].likes.push({ userId: users[3]._id });
    designs[7].likes.push({ userId: users[1]._id });
    
    await Promise.all(designs.map(design => design.save()));

    // Create Bookings
    console.log('📅 Creating bookings...');
    
    const today = new Date();
    const futureDate1 = new Date(today);
    futureDate1.setDate(today.getDate() + 7);
    
    const futureDate2 = new Date(today);
    futureDate2.setDate(today.getDate() + 14);
    
    const futureDate3 = new Date(today);
    futureDate3.setDate(today.getDate() + 21);
    
    const futureDate4 = new Date(today);
    futureDate4.setDate(today.getDate() + 28);

    const bookings = await Booking.create([
      {
        userId: users[1]._id,
        tattooIdea: 'I want a dragon wrapping around my forearm with detailed scales and flames.',
        tattooStyle: 'Japanese',
        bodyPlacement: 'Arm',
        size: 'Large (8+ inches)',
        preferredDate: futureDate1,
        preferredTime: '12:00 PM - 3:00 PM',
        status: 'approved',
        estimatedDuration: 6,
        estimatedPrice: 900,
        notes: 'First tattoo, a bit nervous but excited!',
        adminNotes: 'Customer seems enthusiastic. Confirmed appointment.'
      },
      {
        userId: users[2]._id,
        tattooIdea: 'Minimalist mountain range on my wrist to represent my love for hiking.',
        tattooStyle: 'Minimalist',
        bodyPlacement: 'Wrist',
        size: 'Small (2-4 inches)',
        preferredDate: futureDate2,
        preferredTime: '3:00 PM - 6:00 PM',
        status: 'pending',
        notes: 'Looking for something simple and elegant.'
      },
      {
        userId: users[3]._id,
        tattooIdea: 'Realistic portrait of my late grandmother based on a photo I will bring.',
        tattooStyle: 'Realistic',
        bodyPlacement: 'Chest',
        size: 'Medium (4-8 inches)',
        preferredDate: futureDate3,
        preferredTime: '9:00 AM - 12:00 PM',
        status: 'approved',
        estimatedDuration: 5,
        estimatedPrice: 750,
        notes: 'Very important to me, want it to be perfect.',
        adminNotes: 'High-detail portrait. Scheduled consultation to review photo.'
      },
      {
        userId: users[1]._id,
        tattooIdea: 'Geometric wolf design with sharp lines and modern styling.',
        tattooStyle: 'Geometric',
        bodyPlacement: 'Leg',
        size: 'Medium (4-8 inches)',
        preferredDate: futureDate4,
        preferredTime: '12:00 PM - 3:00 PM',
        status: 'pending',
        notes: 'Can you make the eyes more prominent?'
      },
      {
        userId: users[2]._id,
        tattooIdea: 'Small anchor on my ankle as a symbol of stability.',
        tattooStyle: 'Traditional',
        bodyPlacement: 'Ankle',
        size: 'Small (2-4 inches)',
        preferredDate: futureDate1,
        preferredTime: '6:00 PM - 9:00 PM',
        status: 'rejected',
        notes: 'Quick session preferred.',
        rejectionReason: 'Unfortunately we are fully booked on this date. Please select another date.',
        adminNotes: 'Suggested alternative dates via email.'
      }
    ]);
    
    console.log(`✅ Created ${bookings.length} bookings`);

    // Create Chat Messages
    console.log('💬 Creating chat messages...');
    
    const chatMessages = await ChatMessage.create([
      {
        userId: users[1]._id,
        sessionId: 'session_001',
        message: 'Hi, I want to book a tattoo appointment',
        response: 'Hello! Welcome to InkCraft Studio! 🎨 To book a tattoo appointment: 1) Browse our tattoo gallery for inspiration 2) Fill out the booking form with your tattoo idea, preferred style, and date 3) Our team will review and confirm your appointment within 24-48 hours. You can also use our AI Design Generator for custom ideas!',
        messageType: 'booking_faq',
        confidence: 0.95,
        keywords: ['book', 'appointment'],
        wasHelpful: true,
        followUpSuggestions: ['What are booking requirements?', 'What is your cancellation policy?', 'Tell me about pricing']
      },
      {
        userId: users[1]._id,
        sessionId: 'session_001',
        message: 'What do I need to bring to my appointment?',
        response: 'For your tattoo appointment, please bring: • Valid government-issued ID (18+ required) • Recent meal (no empty stomach) • Comfortable clothing • Payment method • Be well-rested and sober • Avoid alcohol 24 hours before appointment',
        messageType: 'booking_faq',
        confidence: 0.98,
        keywords: ['bring', 'appointment', 'requirements'],
        wasHelpful: true,
        followUpSuggestions: ['Aftercare instructions', 'How long does healing take?', 'Studio location']
      },
      {
        userId: users[2]._id,
        sessionId: 'session_002',
        message: 'How do I take care of my new tattoo?',
        response: 'Essential tattoo aftercare: 1) Keep bandage on for 2-4 hours 2) Gently wash with antibacterial soap 3) Pat dry, don\'t rub 4) Apply thin layer of unscented lotion 2-3 times daily 5) Avoid soaking (pools, baths) for 2-3 weeks 6) No direct sunlight 7) Don\'t pick scabs or scratch. Full healing takes 2-6 weeks.',
        messageType: 'aftercare',
        confidence: 0.99,
        keywords: ['aftercare', 'care', 'tattoo'],
        wasHelpful: true,
        followUpSuggestions: ['Can I exercise after getting a tattoo?', 'When can I swim?', 'Sun exposure guidelines']
      },
      {
        userId: users[3]._id,
        sessionId: 'session_003',
        message: 'What are your studio hours?',
        response: 'InkCraft Studio is open: Monday-Saturday 10 AM - 8 PM, Sunday 12 PM - 6 PM. We\'re closed on major holidays. Walk-ins welcome subject to availability, but appointments are recommended.',
        messageType: 'studio_info',
        confidence: 0.99,
        keywords: ['hours', 'open'],
        wasHelpful: true,
        followUpSuggestions: ['Where are you located?', 'Do you take walk-ins?', 'Book an appointment']
      },
      {
        userId: null,
        sessionId: 'session_004',
        message: 'Hello',
        response: 'Hi there! Thanks for visiting InkCraft Studio! ✨ I can help you with booking questions, aftercare tips, studio policies, and more. What would you like to know?',
        messageType: 'greeting',
        confidence: 1.0,
        keywords: ['hello', 'hi'],
        wasHelpful: null,
        followUpSuggestions: ['Book an appointment', 'Browse designs', 'Aftercare information', 'Studio hours']
      },
      {
        userId: users[2]._id,
        sessionId: 'session_005',
        message: 'How much does a tattoo cost?',
        response: 'Tattoo pricing varies based on size, complexity, and time required. Small designs start around $100-200, medium pieces $300-800, and large custom work $1000+. Our consultation is free and we\'ll provide an accurate quote based on your specific design. Check our gallery for estimated prices on various styles!',
        messageType: 'pricing',
        confidence: 0.92,
        keywords: ['cost', 'price', 'much'],
        wasHelpful: true,
        followUpSuggestions: ['Deposit requirements', 'Payment methods', 'View design gallery']
      },
      {
        userId: users[1]._id,
        sessionId: 'session_006',
        message: 'Can I go swimming after getting a tattoo?',
        response: 'Avoid swimming pools, hot tubs, baths, and ocean water for 2-3 weeks. These can introduce bacteria and prolonged soaking can damage healing skin. Quick showers are fine after 24 hours.',
        messageType: 'aftercare',
        confidence: 0.97,
        keywords: ['swimming', 'water'],
        wasHelpful: false,
        followUpSuggestions: ['Other aftercare tips', 'Exercise recommendations', 'Signs of infection']
      }
    ]);
    
    console.log(`✅ Created ${chatMessages.length} chat messages`);

    console.log('\n✨ ===================================');
    console.log('✨ SEED DATA SUCCESSFULLY CREATED!');
    console.log('✨ ===================================\n');
    
    console.log('📊 Summary:');
    console.log(`   👤 Users: ${users.length}`);
    console.log(`   🎨 Designs: ${designs.length}`);
    console.log(`   📅 Bookings: ${bookings.length}`);
    console.log(`   💬 Chat Messages: ${chatMessages.length}\n`);
    
    console.log('🔑 Login Credentials:');
    console.log('   Admin: admin@inkcraft.com / admin123');
    console.log('   User 1: john@example.com / user123');
    console.log('   User 2: jane@example.com / user123');
    console.log('   User 3: mike@example.com / user123\n');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedData();
