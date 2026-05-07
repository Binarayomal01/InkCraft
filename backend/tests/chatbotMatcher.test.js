const assert = require('assert');
const ChatMessage = require('../models/ChatMessage');

const expectIntent = (message, expectedType, context = {}) => {
  const result = ChatMessage.generateResponse(message, context);
  assert.strictEqual(
    result.type,
    expectedType,
    `Expected intent ${expectedType} for message: "${message}", but got ${result.type}`
  );

  return result;
};

const run = () => {
  expectIntent('how do i bok an appoinment', 'booking_faq');
  expectIntent('aftercare for new tatto', 'aftercare');
  expectIntent('what are your open hours', 'studio_info');
  expectIntent('how much does it cost', 'pricing');

  const explicitFollowUp = expectIntent('what about price?', 'pricing', { lastIntent: 'booking_faq' });
  assert.ok(explicitFollowUp.confidence >= 0.6, 'Expected explicit follow-up to keep strong confidence');

  const contextualFollowUp = expectIntent('what about that?', 'booking_faq', { lastIntent: 'booking_faq' });
  assert.ok(contextualFollowUp.suggestions.length <= 3, 'Expected top 3 follow-up suggestions');

  const unknownFallback = expectIntent('xqzv random words here', 'unknown');
  assert.ok(unknownFallback.suggestions.length <= 3, 'Expected top 3 fallback suggestions');
  assert.ok(
    /book a consultation|contact the studio team|contact the studio/i.test(unknownFallback.response),
    'Expected fallback to include booking/contact escalation guidance'
  );

  console.log('All chatbot matcher tests passed.');
};

run();
