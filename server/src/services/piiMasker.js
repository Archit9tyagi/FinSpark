import crypto from 'crypto';

/**
 * PII Detection & Masking for Indian Financial Context
 * Detects: Aadhaar, PAN, phone, email, bank accounts, IFSC
 */

const PII_PATTERNS = {
  aadhaar: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  pan: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
  phone: /\b(?:\+91[\s-]?)?\d{10}\b/g,
  email: /\b[\w.-]+@[\w.-]+\.\w{2,}\b/g,
  bank_account: /\b\d{9,18}\b/g,
  ifsc: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
  credit_card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g
};

// Injection detection patterns
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+(instructions|prompts)/i,
  /you\s+are\s+now/i,
  /system\s*:/i,
  /\bforget\b.*\binstructions\b/i,
  /\boverride\b.*\bsystem\b/i,
  /\bpretend\b.*\byou\b/i,
  /\bact\s+as\b/i,
  /\brole\s*:\s*system\b/i,
  /<\/?script>/i,
  /javascript:/i
];

/**
 * Detect and mask PII in text, returning tokenized text and a token map
 */
export function maskPII(text) {
  const tokenMap = {};
  let maskedText = text;
  let piiCount = 0;
  const detectedTypes = new Set();

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    // Skip bank_account pattern if too aggressive (only match if context suggests it)
    if (type === 'bank_account') {
      const bankContext = /\b(account|a\/c|acct)\s*(?:no|number|#)?[\s.:]*(\d{9,18})\b/gi;
      maskedText = maskedText.replace(bankContext, (match, prefix, accNum) => {
        const tokenId = crypto.randomBytes(4).toString('hex');
        const token = `[BANK_ACCT_TOKEN_${tokenId}]`;
        tokenMap[token] = accNum;
        piiCount++;
        detectedTypes.add('bank_account');
        return `${prefix} ${token}`;
      });
      continue;
    }

    maskedText = maskedText.replace(pattern, (match) => {
      const tokenId = crypto.randomBytes(4).toString('hex');
      const token = `[${type.toUpperCase()}_TOKEN_${tokenId}]`;
      tokenMap[token] = match;
      piiCount++;
      detectedTypes.add(type);
      return token;
    });
  }

  return {
    maskedText,
    tokenMap,
    stats: {
      total_pii_found: piiCount,
      types_detected: Array.from(detectedTypes),
      tokens_generated: Object.keys(tokenMap).length
    }
  };
}

/**
 * Check for prompt injection attempts
 */
export function detectInjection(text) {
  const threats = [];
  for (const pattern of INJECTION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      threats.push({
        pattern: pattern.source,
        matched: match[0],
        severity: 'HIGH'
      });
    }
  }
  return {
    is_safe: threats.length === 0,
    threats,
    sanitized: threats.length > 0
  };
}

/**
 * Sanitize input text - strip control characters and suspicious patterns
 */
export function sanitizeInput(text) {
  // Remove control characters
  let clean = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  // Remove zero-width characters
  clean = clean.replace(/[\u200B-\u200D\uFEFF\u2060]/g, '');
  // Limit length
  if (clean.length > 50000) {
    clean = clean.substring(0, 50000);
  }
  return clean;
}

/**
 * Restore tokens back to original values (for authorized use only)
 */
export function unmaskPII(text, tokenMap) {
  let restored = text;
  for (const [token, original] of Object.entries(tokenMap)) {
    restored = restored.replace(token, original);
  }
  return restored;
}
