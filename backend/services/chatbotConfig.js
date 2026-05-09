const chatbotConfig = {
  responses: {
    greeting: [
      "Hello. Welcome to InkCraft Studio. I can help with booking, aftercare, pricing, and studio information. How can I help today?",
      "Hi there. Thanks for visiting InkCraft Studio. Ask me about booking, aftercare, pricing, or studio policies.",
      "Welcome to InkCraft. I am your virtual assistant for booking guidance, tattoo aftercare, and studio information."
    ],
    booking_faq: {
      "how to book|make appointment|schedule|book|appointment": "To book a tattoo appointment: 1) Create an account or log in. 2) Browse our gallery for inspiration. 3) Submit the booking form with your tattoo idea, style, and preferred date. 4) Our team reviews and confirms within 24-48 hours.",
      "booking requirements|what do i need": "For your appointment, please bring: valid government ID (18+ required), payment method, and comfortable clothing. Eat before your session, stay rested, and avoid alcohol for 24 hours.",
      "cancellation policy|cancel appointment": "You can cancel or reschedule up to 48 hours in advance without penalty. Changes within 48 hours may incur a fee.",
      "consultation|design process": "All bookings include a consultation to confirm design, placement, and size. We finalize details before your session begins.",
      "deposit|payment": "We require a 50 percent deposit to secure your booking. The remaining balance is due on appointment day."
    },
    aftercare: {
      "aftercare instructions|how to care|aftercare|healing": "Essential aftercare: keep the bandage for 2-4 hours, gently clean with mild antibacterial soap, pat dry, apply unscented lotion, avoid soaking and direct sun, and do not pick or scratch while healing.",
      "infection signs|when to worry": "Seek medical advice if you notice spreading redness, green or yellow discharge, red streaks, fever, intense heat, or severe swelling after 48 hours.",
      "swimming|swim|water activities|pool|hot tub": "Avoid pools, hot tubs, baths, and ocean water for 2-3 weeks. Quick showers are fine after the first 24 hours.",
      "sun exposure|sunscreen": "Keep a new tattoo out of direct sunlight for at least 3 weeks. After healing, use SPF 30+ regularly to protect the ink.",
      "exercise|gym|working out": "Light activity is usually fine. Avoid intense workouts during the first week because sweating and skin stress can slow healing."
    },
    studio_info: {
      "hours|when open": "InkCraft Studio is open Monday-Saturday 10 AM - 8 PM and Sunday 12 PM - 6 PM. Walk-ins are subject to availability.",
      "location|address|where": "We are located in downtown. Check the contact page for exact address, directions, and nearby parking info.",
      "artists|who works": "Our artists cover multiple styles including traditional, realism, watercolor, and minimalist designs.",
      "safety|health standards": "We follow strict hygiene standards with sterilized equipment, single-use needles, and licensed artists."
    },
    pricing: {
      "cost|price|how much": "Pricing depends on size, complexity, and time. Typical ranges: small $80-200, medium $200-500, large $500+. Hourly work is usually $100-150/hour.",
      "minimum|smallest price": "Our shop minimum is $80. This covers setup, sterile equipment, and artist time.",
      "touch up|free touch ups": "We provide one free touch-up within 6 months when aftercare guidance is followed."
    },
    general: [
      "I can help with booking, aftercare, pricing, and studio information. Tell me which one you want.",
      "Ask me about tattoo booking, aftercare guidance, studio info, or pricing and I will point you quickly.",
      "If you share a bit more detail, I can give a more precise answer."
    ],
    unknown: [
      "I am not fully sure what you mean yet. Could you rephrase the question with a bit more detail?",
      "I could not confidently match that question. Try asking about booking, aftercare, pricing, or studio information.",
      "That looks outside my current rule set. Rephrase it and I will try again."
    ]
  },
  suggestionsByType: {
    greeting: [
      "How do I book an appointment?",
      "What are your aftercare instructions?",
      "What are your prices?"
    ],
    booking_faq: [
      "How do I book an appointment?",
      "What do I need for my appointment?",
      "What is your cancellation policy?"
    ],
    aftercare: [
      "How do I care for my tattoo?",
      "When can I swim again?",
      "What are infection warning signs?"
    ],
    studio_info: [
      "What are your studio hours?",
      "Where are you located?",
      "Do you accept walk-ins?"
    ],
    pricing: [
      "How much does a small tattoo cost?",
      "What is your shop minimum?",
      "Do you offer touch-ups?"
    ],
    general: [
      "How do I book an appointment?",
      "What are your aftercare instructions?",
      "How much do tattoos cost?"
    ],
    unknown: [
      "How do I book an appointment?",
      "What are your aftercare instructions?",
      "How can I contact the studio?"
    ]
  },
  intentOrder: ['booking_faq', 'aftercare', 'studio_info', 'pricing'],
  intentHints: {
    booking_faq: ['book', 'booking', 'appointment', 'schedule', 'cancel', 'deposit', 'consultation', 'payment'],
    aftercare: ['aftercare', 'care', 'heal', 'healing', 'infection', 'swim', 'pool', 'sun', 'sunscreen', 'exercise', 'gym'],
    studio_info: ['hours', 'open', 'location', 'address', 'where', 'artist', 'safety', 'walkin', 'walk-ins'],
    pricing: ['price', 'pricing', 'cost', 'minimum', 'touch', 'hourly', 'how much']
  },
  typoReplacements: {
    tatto: 'tattoo',
    tatoo: 'tattoo',
    tatttoo: 'tattoo',
    bok: 'book',
    appoinment: 'appointment',
    appointement: 'appointment',
    adress: 'address',
    pricng: 'pricing',
    watrcolor: 'watercolor',
    aftercaree: 'aftercare',
    aftercareing: 'aftercare',
    wheree: 'where',
    hrs: 'hours',
    thx: 'thanks',
    u: 'you'
  },
  stopWords: ['a', 'an', 'the', 'to', 'do', 'i', 'we', 'you', 'what', 'how', 'when', 'where', 'is', 'are', 'can', 'my', 'your'],
  followUpPhrases: ['what about', 'how about', 'what else', 'tell me more', 'and what', 'and also', 'more details'],
  followUpReferenceTokens: ['that', 'this', 'it', 'also', 'more', 'else', 'then', 'same'],
  escalationActions: [
    'How do I book an appointment?',
    'How can I contact the studio?',
    'Show me pricing basics'
  ],
  thresholds: {
    strongIntent: 2,
    weakIntent: 1.2,
    confidenceFloor: 0.62
  }
};

module.exports = chatbotConfig;
