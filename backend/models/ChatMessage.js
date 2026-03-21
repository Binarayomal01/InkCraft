const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for anonymous users
  },
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  response: {
    type: String,
    required: [true, 'Response content is required'],
    trim: true,
    maxlength: [2000, 'Response cannot exceed 2000 characters']
  },
  messageType: {
    type: String,
    enum: ['greeting', 'booking_faq', 'aftercare', 'studio_info', 'pricing', 'general', 'unknown'],
    default: 'general'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1.0 // For rule-based responses, confidence is always high
  },
  keywords: [String], // Keywords that triggered this response
  wasHelpful: {
    type: Boolean,
    default: null // null means not rated yet
  },
  followUpSuggestions: [String],
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatMessageSchema.index({ sessionId: 1, createdAt: -1 });
chatMessageSchema.index({ userId: 1, createdAt: -1 });
chatMessageSchema.index({ messageType: 1 });
chatMessageSchema.index({ createdAt: -1 });

// Virtual for session duration (if multiple messages in same session)
chatMessageSchema.virtual('sessionDuration').get(function() {
  // This would be calculated when querying multiple messages from the same session
  return null;
});

// Static method to get predefined responses
chatMessageSchema.statics.getPredefinedResponses = function() {
  return {
    greeting: [
      "Hello! Welcome to InkCraft Studio! 🎨 I'm here to help you with any questions about our tattoo services, booking process, or aftercare instructions. How can I assist you today?",
      "Hi there! Thanks for visiting InkCraft Studio! ✨ I can help you with booking questions, aftercare tips, studio policies, and more. What would you like to know?",
      "Welcome to InkCraft! 👋 I'm your virtual assistant. I can help with booking inquiries, tattoo aftercare, studio information, and general questions. How may I help you?"
    ],
    booking_faq: {
      "how to book|make appointment|schedule": "To book a tattoo appointment: 1) Create an account or log in 2) Browse our tattoo gallery for inspiration 3) Fill out the booking form with your tattoo idea, preferred style, and date 4) Our team will review and confirm your appointment within 24-48 hours. You can also use our AI Design Generator for custom ideas!",
      
      "booking requirements|what do i need": "For your tattoo appointment, please bring: • Valid government-issued ID (18+ required) • Recent meal (no empty stomach) • Comfortable clothing • Payment method • Be well-rested and sober • Avoid alcohol 24 hours before appointment",
      
      "cancellation policy|cancel appointment": "You can cancel or reschedule your appointment up to 48 hours in advance without penalty. Cancellations within 48 hours may incur a fee. Please contact us as soon as possible if you need to make changes to your booking.",
      
      "consultation|design process": "All bookings include a free consultation where we discuss your design, placement, size, and any modifications. We'll create a custom stencil and you can make adjustments before we begin. The design process is collaborative!",

      "deposit|payment": "We require a 50% deposit to secure your booking, with the remaining balance due on the day of your appointment. We accept cash, card, and digital payments. Deposits are non-refundable but can be transferred to a new date with 48+ hours notice."
    },
    aftercare: {
      "aftercare instructions|how to care": "Essential tattoo aftercare: 1) Keep bandage on for 2-4 hours 2) Gently wash with antibacterial soap 3) Pat dry, don't rub 4) Apply thin layer of unscented lotion 2-3 times daily 5) Avoid soaking (pools, baths) for 2-3 weeks 6) No direct sunlight 7) Don't pick scabs or scratch. Full healing takes 2-6 weeks.",
      
      "infection signs|when to worry": "See a doctor if you notice: • Excessive redness spreading • Green or yellow pus • Red streaks • Fever • Intense heat from tattoo area • Excessive swelling after 48 hours. Some redness, mild swelling, and clear fluid are normal for first few days.",
      
      "swimming|water activities": "Avoid swimming pools, hot tubs, baths, and ocean water for 2-3 weeks. These can introduce bacteria and prolonged soaking can damage healing skin. Quick showers are fine after 24 hours.",
      
      "sun exposure|sunscreen": "Keep new tattoo out of direct sunlight for at least 3 weeks. After healing, always use SPF 30+ sunscreen to prevent fading. UV rays can damage tattoo ink and cause premature fading.",
      
      "exercise|gym|working out": "Light activity is fine, but avoid intense workouts for first week. Excessive sweating and stretching can interfere with healing. Listen to your body and don't overdo it."
    },
    studio_info: {
      "hours|when open": "InkCraft Studio is open: Monday-Saturday 10 AM - 8 PM, Sunday 12 PM - 6 PM. We're closed on major holidays. Walk-ins welcome subject to availability, but appointments are recommended.",
      
      "location|address|where": "We're located in the heart of downtown. Check our contact page for exact address and directions. We're accessible by public transit and have parking nearby.",
      
      "artists|who works": "Our talented team includes certified tattoo artists specializing in various styles: traditional, realistic, watercolor, minimalist, and more. Each artist brings unique skills and artistic vision to create your perfect tattoo.",
      
      "safety|health standards": "InkCraft maintains the highest health and safety standards: • All equipment is sterilized • Single-use needles • Licensed and certified artists • Regular health inspections • Clean, sterile environment • Following all local health regulations"
    },
    pricing: {
      "cost|price|how much": "Tattoo pricing varies by size, complexity, and estimated time: • Small (2-4 inches): $80-200 • Medium (4-8 inches): $200-500 • Large (8+ inches): $500-1500+ • Hourly rate: $100-150/hour. Free consultations include price estimates. Complex designs and color work may cost more.",
      
      "minimum|smallest price": "Our shop minimum is $80, which covers small tattoos up to 2-3 inches. This includes setup, equipment, and artist time. Even small tattoos require the same safety protocols and preparation.",
      
      "touch up|free touch ups": "We offer one free touch-up session within 6 months if needed, provided you followed all aftercare instructions. Additional touch-ups or changes to original design may incur charges."
    },
    general: [
      "I'm here to help with questions about tattoos, booking, aftercare, and our studio. Could you be more specific about what you'd like to know?",
      "I can assist with information about our tattoo services, booking process, aftercare instructions, or studio policies. What specific topic interests you?",
      "Feel free to ask about tattoo styles, booking procedures, aftercare tips, pricing, or anything else related to InkCraft Studio!"
    ],
    unknown: [
      "I'm not sure I understand that question. I can help with tattoo booking, aftercare instructions, studio information, and general tattoo questions. Could you rephrase or ask about one of these topics?",
      "I don't have information about that specific topic. I specialize in tattoo-related questions, booking assistance, and studio information. Is there something tattoo-related I can help with?",
      "That's outside my area of expertise. I'm designed to help with InkCraft Studio services, tattoo booking, aftercare, and general tattoo information. What can I help you with in those areas?"
    ]
  };
};

// Static method to process user message and generate response
chatMessageSchema.statics.generateResponse = function(userMessage) {
  const responses = this.getPredefinedResponses();
  const message = userMessage.toLowerCase().trim();
  
  // Greeting patterns
  if (/(^hi|^hello|^hey|^good morning|^good afternoon|^good evening)/.test(message)) {
    const greetings = responses.greeting;
    return {
      response: greetings[Math.floor(Math.random() * greetings.length)],
      type: 'greeting',
      confidence: 1.0,
      keywords: ['greeting'],
      suggestions: ['How do I book an appointment?', 'What are your aftercare instructions?', 'What are your prices?']
    };
  }
  
  // Check booking FAQ patterns
  for (const [pattern, response] of Object.entries(responses.booking_faq)) {
    const regex = new RegExp(pattern.split('|').join('|'), 'i');
    if (regex.test(message)) {
      return {
        response: response,
        type: 'booking_faq',
        confidence: 0.9,
        keywords: pattern.split('|'),
        suggestions: ['Tell me about aftercare', 'What are your studio hours?', 'How much do tattoos cost?']
      };
    }
  }
  
  // Check aftercare patterns
  for (const [pattern, response] of Object.entries(responses.aftercare)) {
    const regex = new RegExp(pattern.split('|').join('|'), 'i');
    if (regex.test(message)) {
      return {
        response: response,
        type: 'aftercare',
        confidence: 0.9,
        keywords: pattern.split('|'),
        suggestions: ['More aftercare tips', 'How to book an appointment', 'Studio safety standards']
      };
    }
  }
  
  // Check studio info patterns
  for (const [pattern, response] of Object.entries(responses.studio_info)) {
    const regex = new RegExp(pattern.split('|').join('|'), 'i');
    if (regex.test(message)) {
      return {
        response: response,
        type: 'studio_info',
        confidence: 0.9,
        keywords: pattern.split('|'),
        suggestions: ['How to book', 'Pricing information', 'Aftercare instructions']
      };
    }
  }
  
  // Check pricing patterns
  for (const [pattern, response] of Object.entries(responses.pricing)) {
    const regex = new RegExp(pattern.split('|').join('|'), 'i');
    if (regex.test(message)) {
      return {
        response: response,
        type: 'pricing',
        confidence: 0.9,
        keywords: pattern.split('|'),
        suggestions: ['Book an appointment', 'View tattoo gallery', 'Aftercare information']
      };
    }
  }
  
  // Check for tattoo-related general terms
  const generalTerms = /tattoo|ink|design|artist|studio|pain|hurt|heal/;
  if (generalTerms.test(message)) {
    const generalResponses = responses.general;
    return {
      response: generalResponses[Math.floor(Math.random() * generalResponses.length)],
      type: 'general',
      confidence: 0.7,
      keywords: ['general'],
      suggestions: ['How to book an appointment', 'Aftercare instructions', 'Pricing information', 'View our gallery']
    };
  }
  
  // Default unknown response
  const unknownResponses = responses.unknown;
  return {
    response: unknownResponses[Math.floor(Math.random() * unknownResponses.length)],
    type: 'unknown',
    confidence: 0.3,
    keywords: ['unknown'],
    suggestions: ['How do I book a tattoo?', 'What are your aftercare instructions?', 'What services do you offer?', 'What are your hours?']
  };
};

// Ensure virtual fields are serialized
chatMessageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);