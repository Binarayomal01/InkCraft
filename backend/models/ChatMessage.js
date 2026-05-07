const mongoose = require('mongoose');
const chatbotConfig = require('../services/chatbotConfig');

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
  return chatbotConfig.responses;
};

chatMessageSchema.statics.pickRandom = function(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  return items[Math.floor(Math.random() * items.length)];
};

chatMessageSchema.statics.escapeRegex = function(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

chatMessageSchema.statics.normalizeMessage = function(message) {
  if (!message) {
    return '';
  }

  let normalizedMessage = String(message)
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const replacements = chatbotConfig.typoReplacements || {};

  for (const [source, target] of Object.entries(replacements)) {
    const sourcePattern = new RegExp(`\\b${this.escapeRegex(source)}\\b`, 'g');
    normalizedMessage = normalizedMessage.replace(sourcePattern, target);
  }

  return normalizedMessage;
};

chatMessageSchema.statics.tokenizeMessage = function(normalizedMessage) {
  if (!normalizedMessage) {
    return [];
  }

  return normalizedMessage.split(' ').filter(Boolean);
};

chatMessageSchema.statics.getEditDistance = function(sourceWord, targetWord) {
  const matrix = Array.from({ length: sourceWord.length + 1 }, () => []);

  for (let i = 0; i <= sourceWord.length; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= targetWord.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= sourceWord.length; i += 1) {
    for (let j = 1; j <= targetWord.length; j += 1) {
      const substitutionCost = sourceWord[i - 1] === targetWord[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + substitutionCost
      );
    }
  }

  return matrix[sourceWord.length][targetWord.length];
};

chatMessageSchema.statics.isNearWordMatch = function(sourceWord, targetWord) {
  if (!sourceWord || !targetWord) {
    return false;
  }

  if (sourceWord === targetWord) {
    return true;
  }

  if (Math.abs(sourceWord.length - targetWord.length) > 1) {
    return false;
  }

  if (sourceWord.length < 4 || targetWord.length < 4) {
    return false;
  }

  if (sourceWord.startsWith(targetWord) || targetWord.startsWith(sourceWord)) {
    return true;
  }

  return this.getEditDistance(sourceWord, targetWord) <= 1;
};

chatMessageSchema.statics.scorePattern = function(normalizedMessage, tokenSet, pattern) {
  const patternTerms = pattern
    .split('|')
    .map((term) => this.normalizeMessage(term))
    .filter(Boolean);

  const tokenList = Array.from(tokenSet);
  const matchedKeywords = [];
  let score = 0;

  for (const term of patternTerms) {
    if (term.includes(' ')) {
      if (normalizedMessage.includes(term)) {
        score += 3;
        matchedKeywords.push(term);
        continue;
      }

      const termWords = term.split(' ').filter(Boolean);
      const matchedWords = termWords.filter((termWord) => {
        return tokenSet.has(termWord) || tokenList.some((token) => this.isNearWordMatch(token, termWord));
      }).length;
      const stopWords = new Set(chatbotConfig.stopWords || []);
      const meaningfulTermWords = termWords.filter((termWord) => termWord.length >= 4 && !stopWords.has(termWord));
      const meaningfulMatches = meaningfulTermWords.filter((termWord) => {
        return tokenSet.has(termWord) || tokenList.some((token) => this.isNearWordMatch(token, termWord));
      }).length;

      if (matchedWords === termWords.length && termWords.length > 0) {
        score += 2.2;
        matchedKeywords.push(term);
      } else if (matchedWords >= Math.ceil(termWords.length * 0.7) && matchedWords > 0) {
        score += 1.3;
        matchedKeywords.push(term);
      } else if (matchedWords > 0 && termWords.length >= 2 && meaningfulMatches > 0) {
        score += 1;
        matchedKeywords.push(term);
      }

      continue;
    }

    if (tokenSet.has(term)) {
      score += 2;
      matchedKeywords.push(term);
      continue;
    }

    if (tokenList.some((token) => this.isNearWordMatch(token, term))) {
      score += 1.2;
      matchedKeywords.push(term);
      continue;
    }

    if (term.length > 4 && normalizedMessage.includes(term)) {
      score += 0.8;
      matchedKeywords.push(term);
    }
  }

  return {
    score,
    matchedKeywords
  };
};

chatMessageSchema.statics.getSuggestionsByType = function() {
  return chatbotConfig.suggestionsByType || {};
};

chatMessageSchema.statics.getIntentDefinitions = function(responses) {
  const suggestions = this.getSuggestionsByType();
  const intentOrder = chatbotConfig.intentOrder || [];

  return intentOrder
    .filter((type) => responses[type] && typeof responses[type] === 'object')
    .map((type) => ({
      type,
      patterns: responses[type],
      suggestions: suggestions[type] || []
    }));
};

chatMessageSchema.statics.getIntentHints = function() {
  return chatbotConfig.intentHints || {};
};

chatMessageSchema.statics.getTopicLabel = function(intentType) {
  const topicLabelMap = {
    booking_faq: 'booking',
    aftercare: 'aftercare',
    studio_info: 'studio information',
    pricing: 'pricing',
    general: 'tattoo services',
    unknown: 'tattoo services'
  };

  return topicLabelMap[intentType] || 'tattoo services';
};

chatMessageSchema.statics.getEscalationSuggestions = function(baseSuggestions = []) {
  const escalationActions = chatbotConfig.escalationActions || [];
  return Array.from(new Set([...baseSuggestions, ...escalationActions])).slice(0, 3);
};

chatMessageSchema.statics.isFollowUpMessage = function(normalizedMessage, tokens) {
  const followUpPhrases = chatbotConfig.followUpPhrases || [];
  const followUpReferenceTokens = chatbotConfig.followUpReferenceTokens || [];

  const hasFollowUpPhrase = followUpPhrases.some((phrase) => normalizedMessage.includes(phrase));
  const hasReferenceToken = tokens.some((token) => followUpReferenceTokens.includes(token));
  const isShortPrompt = tokens.length > 0 && tokens.length <= 7;

  return hasFollowUpPhrase || (hasReferenceToken && isShortPrompt);
};

chatMessageSchema.statics.detectExplicitIntent = function(normalizedMessage, tokenSet) {
  const tokenList = Array.from(tokenSet);
  const intentHints = this.getIntentHints();
  let bestMatch = null;

  for (const [intentType, hints] of Object.entries(intentHints)) {
    const matchedHints = (hints || []).filter((hint) => {
      const normalizedHint = this.normalizeMessage(hint);

      if (!normalizedHint) {
        return false;
      }

      if (normalizedHint.includes(' ')) {
        return normalizedMessage.includes(normalizedHint);
      }

      return tokenSet.has(normalizedHint)
        || tokenList.some((token) => this.isNearWordMatch(token, normalizedHint));
    });

    if (matchedHints.length === 0) {
      continue;
    }

    if (!bestMatch || matchedHints.length > bestMatch.matchCount) {
      bestMatch = {
        intentType,
        keywords: matchedHints,
        matchCount: matchedHints.length
      };
    }
  }

  return bestMatch;
};

chatMessageSchema.statics.generateResponse = function(userMessage, sessionContext = {}) {
  const responses = this.getPredefinedResponses();
  const suggestionsByType = this.getSuggestionsByType();
  const normalizedMessage = this.normalizeMessage(userMessage);
  const tokens = this.tokenizeMessage(normalizedMessage);
  const tokenSet = new Set(tokens);
  const thresholds = chatbotConfig.thresholds || {};
  const strongIntentThreshold = thresholds.strongIntent || 2;
  const weakIntentThreshold = thresholds.weakIntent || 1.2;
  const confidenceFloor = thresholds.confidenceFloor || 0.62;
  const hasFollowUpCue = this.isFollowUpMessage(normalizedMessage, tokens);
  const explicitIntentMatch = this.detectExplicitIntent(normalizedMessage, tokenSet);
  const explicitIntentType = explicitIntentMatch ? explicitIntentMatch.intentType : null;

  if (!normalizedMessage) {
    return {
      response: this.pickRandom(responses.unknown),
      type: 'unknown',
      confidence: 0.2,
      keywords: ['unknown'],
      suggestions: this.getEscalationSuggestions(suggestionsByType.unknown || [])
    };
  }

  const greetingPhrases = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
  const hasGreetingPrefix = greetingPhrases.some((phrase) => normalizedMessage.startsWith(phrase));
  const hasOnlyGreeting = hasGreetingPrefix && tokens.length <= 3;

  if (hasOnlyGreeting) {
    return {
      response: this.pickRandom(responses.greeting),
      type: 'greeting',
      confidence: 0.98,
      keywords: ['greeting'],
      suggestions: this.getEscalationSuggestions(suggestionsByType.greeting || [])
    };
  }

  const intentDefinitions = this.getIntentDefinitions(responses);
  const intentCandidates = [];

  for (const intentDefinition of intentDefinitions) {
    for (const [pattern, responseText] of Object.entries(intentDefinition.patterns)) {
      const patternResult = this.scorePattern(normalizedMessage, tokenSet, pattern);
      if (patternResult.score <= 0) {
        continue;
      }

      let candidateScore = patternResult.score;

      if (explicitIntentType && explicitIntentType === intentDefinition.type) {
        candidateScore += 0.7;
      }

      if (!explicitIntentType && hasFollowUpCue && sessionContext.lastIntent === intentDefinition.type) {
        candidateScore += 0.9;
      }

      intentCandidates.push({
        type: intentDefinition.type,
        response: responseText,
        score: candidateScore,
        keywords: patternResult.matchedKeywords,
        suggestions: intentDefinition.suggestions
      });
    }
  }

  intentCandidates.sort((left, right) => right.score - left.score);
  const bestCandidate = intentCandidates[0];

  if (bestCandidate && bestCandidate.score >= strongIntentThreshold) {
    if (hasGreetingPrefix && tokens.length <= 5 && bestCandidate.score < 3) {
      return {
        response: this.pickRandom(responses.greeting),
        type: 'greeting',
        confidence: 0.88,
        keywords: ['greeting'],
        suggestions: this.getEscalationSuggestions(bestCandidate.suggestions)
      };
    }

    const boundedScore = Math.min(bestCandidate.score, 6);
    const confidence = Number((confidenceFloor + ((boundedScore - strongIntentThreshold) / (6 - strongIntentThreshold)) * 0.34).toFixed(2));

    return {
      response: bestCandidate.response,
      type: bestCandidate.type,
      confidence: Math.max(confidenceFloor, Math.min(confidence, 0.96)),
      keywords: bestCandidate.keywords.slice(0, 6),
      suggestions: this.getEscalationSuggestions(bestCandidate.suggestions)
    };
  }

  if (hasFollowUpCue && !explicitIntentType && sessionContext.lastIntent && suggestionsByType[sessionContext.lastIntent]) {
    const contextualTopic = this.getTopicLabel(sessionContext.lastIntent);
    return {
      response: `I can continue on ${contextualTopic}. Do you want details, pricing, or next steps? If you want personal help, you can book a consultation or contact the studio team.`,
      type: sessionContext.lastIntent,
      confidence: 0.56,
      keywords: ['follow_up', sessionContext.lastIntent],
      suggestions: this.getEscalationSuggestions(suggestionsByType[sessionContext.lastIntent])
    };
  }

  const generalTerms = ['tattoo', 'ink', 'design', 'artist', 'studio', 'pain', 'hurt', 'heal', 'healing'];
  const matchedGeneralTerms = generalTerms.filter((term) => {
    return tokenSet.has(term) || Array.from(tokenSet).some((token) => this.isNearWordMatch(token, term));
  });

  if (bestCandidate && bestCandidate.score >= weakIntentThreshold) {
    const topicLabel = this.getTopicLabel(bestCandidate.type);
    return {
      response: `I think you might be asking about ${topicLabel}. Could you add one more detail so I can answer precisely? If needed, you can book a consultation or contact the studio team.`,
      type: 'unknown',
      confidence: 0.45,
      keywords: bestCandidate.keywords.slice(0, 4),
      suggestions: this.getEscalationSuggestions(bestCandidate.suggestions)
    };
  }

  if (matchedGeneralTerms.length >= 2) {
    return {
      response: this.pickRandom(responses.general),
      type: 'general',
      confidence: 0.58,
      keywords: matchedGeneralTerms.slice(0, 5),
      suggestions: this.getEscalationSuggestions(suggestionsByType.general || [])
    };
  }

  const topCandidateTypes = Array.from(new Set(intentCandidates.map((candidate) => candidate.type))).slice(0, 2);
  const fallbackSuggestions = this.getEscalationSuggestions(
    topCandidateTypes.length > 0
      ? topCandidateTypes.flatMap((type) => suggestionsByType[type] || [])
      : (suggestionsByType.unknown || [])
  );

  return {
    response: `${this.pickRandom(responses.unknown)} If you want personal help, you can book a consultation or contact the studio team.`,
    type: 'unknown',
    confidence: 0.3,
    keywords: topCandidateTypes.length > 0 ? topCandidateTypes : ['unknown'],
    suggestions: fallbackSuggestions
  };
};

// Ensure virtual fields are serialized
chatMessageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);