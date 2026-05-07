const nodemailer = require('nodemailer');

const DEFAULT_FROM = 'InkCraft <no-reply@inkcraft.local>';
const REQUIRED_SMTP_VARS = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];

const escapeHtml = (value = '') => {
  const stringValue = String(value);
  return stringValue
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const getMissingSmtpVars = () => {
  return REQUIRED_SMTP_VARS.filter((key) => !process.env[key]);
};

const isSmtpConfigured = () => getMissingSmtpVars().length === 0;

const isEmailSendingEnabled = () => {
  if (process.env.EMAIL_ENABLED !== undefined) {
    return process.env.EMAIL_ENABLED.toLowerCase() === 'true';
  }

  return isSmtpConfigured();
};

const getTransporter = () => {
  const missingVars = getMissingSmtpVars();
  if (missingVars.length > 0) {
    throw new Error(`Missing SMTP configuration: ${missingVars.join(', ')}`);
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async ({ to, subject, html, text, requireDelivery = false }) => {
  if (!to) {
    throw new Error('Email recipient address is required');
  }

  if (!isEmailSendingEnabled()) {
    const disabledMessage = 'Email sending is disabled. Enable it with EMAIL_ENABLED=true and valid SMTP credentials.';

    if (requireDelivery) {
      throw new Error(disabledMessage);
    }

    console.warn(`Skipped email (${subject}) to ${to}. ${disabledMessage}`);
    return { skipped: true };
  }

  const transporter = getTransporter();

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || DEFAULT_FROM,
    to,
    subject,
    text,
    html
  });
};

const formatPreferredDate = (preferredDate) => {
  if (!preferredDate) {
    return 'TBD';
  }

  const date = new Date(preferredDate);
  if (Number.isNaN(date.getTime())) {
    return String(preferredDate);
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const buildPasswordResetTemplate = (resetUrl) => {
  const safeResetUrl = escapeHtml(resetUrl);

  return {
    subject: 'InkCraft Password Reset',
    text: `Password Reset Request\n\nUse this link to reset your password (expires in 15 minutes): ${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
        <h2 style="margin-bottom: 12px;">Password Reset Request</h2>
        <p>We received a request to reset your InkCraft account password.</p>
        <p>Click the button below to set a new password. This link expires in 15 minutes.</p>
        <p style="margin: 24px 0;">
          <a href="${safeResetUrl}" style="background: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 6px; display: inline-block;">Reset Password</a>
        </p>
        <p>If the button does not work, copy and paste this URL into your browser:</p>
        <p>${safeResetUrl}</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `
  };
};

const buildBookingSummaryRows = (booking) => {
  const fields = [
    ['Booking ID', booking._id],
    ['Tattoo Style', booking.tattooStyle],
    ['Body Placement', booking.bodyPlacement],
    ['Size', booking.size],
    ['Preferred Date', formatPreferredDate(booking.preferredDate)],
    ['Preferred Time', booking.preferredTime],
    ['Status', booking.status]
  ];

  return fields
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([label, value]) => `<tr><td style="padding: 6px 10px; border: 1px solid #e5e7eb;"><strong>${escapeHtml(label)}</strong></td><td style="padding: 6px 10px; border: 1px solid #e5e7eb;">${escapeHtml(value)}</td></tr>`)
    .join('');
};

const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const template = buildPasswordResetTemplate(resetUrl);
  return sendEmail({
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
    requireDelivery: true
  });
};

const sendBookingConfirmationEmail = async ({ to, name, booking }) => {
  const safeName = escapeHtml(name || 'there');
  const rows = buildBookingSummaryRows(booking);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
      <h2 style="margin-bottom: 8px;">Booking Received</h2>
      <p>Hi ${safeName}, your booking request has been received and is now pending review.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">${rows}</table>
      <p style="margin-top: 16px;">We will notify you when the booking status is updated.</p>
    </div>
  `;

  const text = [
    `Hi ${name || 'there'},`,
    'Your booking request has been received and is now pending review.',
    `Booking ID: ${booking._id}`,
    `Style: ${booking.tattooStyle}`,
    `Body Placement: ${booking.bodyPlacement}`,
    `Size: ${booking.size}`,
    `Preferred Date: ${formatPreferredDate(booking.preferredDate)}`,
    `Preferred Time: ${booking.preferredTime}`,
    `Status: ${booking.status}`
  ].join('\n');

  return sendEmail({
    to,
    subject: 'InkCraft Booking Confirmation',
    text,
    html
  });
};

const sendBookingStatusEmail = async ({ to, name, booking }) => {
  const safeName = escapeHtml(name || 'there');
  const rows = buildBookingSummaryRows(booking);
  const statusLabel = escapeHtml((booking.status || '').toUpperCase());
  const safeAdminNotes = booking.adminNotes ? escapeHtml(booking.adminNotes) : '';
  const safeRejectionReason = booking.rejectionReason ? escapeHtml(booking.rejectionReason) : '';

  const extraDetails = [
    safeAdminNotes ? `<p><strong>Admin Notes:</strong> ${safeAdminNotes}</p>` : '',
    booking.status === 'rejected' && safeRejectionReason
      ? `<p><strong>Rejection Reason:</strong> ${safeRejectionReason}</p>`
      : ''
  ].join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
      <h2 style="margin-bottom: 8px;">Booking Status Updated</h2>
      <p>Hi ${safeName}, your booking status is now <strong>${statusLabel}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">${rows}</table>
      <div style="margin-top: 16px;">${extraDetails}</div>
    </div>
  `;

  const textParts = [
    `Hi ${name || 'there'},`,
    `Your booking status is now ${booking.status}.`,
    `Booking ID: ${booking._id}`,
    `Preferred Date: ${formatPreferredDate(booking.preferredDate)}`,
    `Preferred Time: ${booking.preferredTime}`,
    safeAdminNotes ? `Admin Notes: ${booking.adminNotes}` : '',
    booking.status === 'rejected' && safeRejectionReason ? `Rejection Reason: ${booking.rejectionReason}` : ''
  ].filter(Boolean);

  return sendEmail({
    to,
    subject: `InkCraft Booking ${statusLabel}`,
    text: textParts.join('\n'),
    html
  });
};

module.exports = {
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendBookingStatusEmail,
  isEmailSendingEnabled,
  isSmtpConfigured
};
