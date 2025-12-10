/**
 * Validation middleware for request data
 */

/**
 * Validate registration data
 */
const validateRegistration = (req, res, next) => {
  const { fullName, email, phone, citizenshipNumber, citizenship, address, password } = req.body;
  
  const errors = [];

  // Log the incoming data for debugging
  console.log('Registration validation - Incoming data:', {
    fullName: fullName ? '✓' : '✗',
    email: email ? '✓' : '✗',
    phone: phone ? '✓' : '✗',
    citizenshipNumber: citizenshipNumber ? '✓' : '✗',
    citizenship: citizenship ? '✓' : '✗',
    address: address ? '✓' : '✗',
    password: password ? '✓' : '✗',
  });
  
  console.log('Raw values:', {
    fullName: `"${fullName}"`,
    address: `"${address}"`,
    phone: `"${phone}"`,
  });

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!phone || !isValidPhone(phone)) {
    errors.push(`Valid phone number is required (10 digits). Received: ${phone}`);
  }

  const citizenshipNo = citizenshipNumber || citizenship;
  if (!citizenshipNo || typeof citizenshipNo !== 'string' || citizenshipNo.trim().length < 5) {
    errors.push('Valid citizenship number is required (at least 5 characters)');
  }

  if (!address || typeof address !== 'string' || address.trim().length < 5) {
    errors.push(`Valid address is required (at least 5 characters). Received: "${address}"`);
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (errors.length > 0) {
    console.log('Validation failed:', errors);
    return res.status(400).json({
      error: 'Validation failed',
      message: errors.join(', '),
      errors,
    });
  }

  console.log('✓ Validation passed');
  next();
};

/**
 * Validate login data
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate election data
 */
const validateElection = (req, res, next) => {
  const { title, titleNepali, description, level, category, startDate, endDate } = req.body;
  
  const errors = [];

  if (!title || title.trim().length < 5) {
    errors.push('Title must be at least 5 characters');
  }

  if (!titleNepali || titleNepali.trim().length < 5) {
    errors.push('Nepali title must be at least 5 characters');
  }

  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  if (!level || !['local', 'central'].includes(level)) {
    errors.push('Valid level is required (local or central)');
  }

  if (!category || !['election', 'referendum', 'policy', 'community_issue'].includes(category)) {
    errors.push('Valid category is required');
  }

  if (!startDate || !isValidDate(startDate)) {
    errors.push('Valid start date is required');
  }

  if (!endDate || !isValidDate(endDate)) {
    errors.push('Valid end date is required');
  }

  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    errors.push('End date must be after start date');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate candidate data
 */
const validateCandidate = (req, res, next) => {
  const { name, party, level, province, district, commitmentTitle, commitmentDescription } = req.body;
  
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!party || party.trim().length < 2) {
    errors.push('Party name must be at least 2 characters');
  }

  if (!level || !['local', 'central'].includes(level)) {
    errors.push('Valid level is required (local or central)');
  }

  if (!province || province.trim().length < 2) {
    errors.push('Province is required');
  }

  if (!district || district.trim().length < 2) {
    errors.push('District is required');
  }

  if (!commitmentTitle || commitmentTitle.trim().length < 5) {
    errors.push('Commitment title must be at least 5 characters');
  }

  if (!commitmentDescription || commitmentDescription.trim().length < 10) {
    errors.push('Commitment description must be at least 10 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate feedback data
 */
const validateFeedback = (req, res, next) => {
  const { category, message } = req.body;
  
  const errors = [];

  if (!category || !['general', 'bug', 'feature', 'security', 'usability'].includes(category)) {
    errors.push('Valid category is required');
  }

  if (!message || message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate vote casting
 */
const validateVote = (req, res, next) => {
  const { electionId, candidateId } = req.body;
  
  const errors = [];

  if (!electionId) {
    errors.push('Election ID is required');
  }

  if (!candidateId) {
    errors.push('Candidate ID is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      errors,
    });
  }

  next();
};

// Helper functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  if (!phone) return false;
  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.toString().replace(/[\s\-\(\)]/g, '');
  // Check if it's 10 digits (Nepali mobile numbers)
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(cleanPhone);
};

const isValidDate = (date) => {
  return !isNaN(Date.parse(date));
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateElection,
  validateCandidate,
  validateFeedback,
  validateVote,
};
