import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: false });

/**
 * JSON Schema for validating generated gateway configs
 */
const gatewayConfigSchema = {
  type: 'object',
  required: ['gateway_config'],
  properties: {
    gateway_config: { type: 'string', minLength: 10 },
    auth_policy: { type: 'string' },
    rate_limiting: { type: 'string' },
    circuit_breaker: { type: 'string' },
    jolt_transform: { type: 'string' },
    test_cases: { type: 'string' },
    security_notes: { type: 'array', items: { type: 'string' } },
    compliance_flags: { type: 'array', items: { type: 'string' } },
    warnings: { type: 'array', items: { type: 'string' } }
  }
};

const validateSchema = ajv.compile(gatewayConfigSchema);

/**
 * Validate generated config against schema
 */
export function validateConfig(config) {
  const valid = validateSchema(config);
  const securityChecks = runSecurityChecks(config);
  const complianceChecks = runComplianceChecks(config);

  return {
    schema_valid: valid,
    schema_errors: valid ? [] : validateSchema.errors,
    security_checks: securityChecks,
    compliance_checks: complianceChecks,
    overall_status: valid && securityChecks.passed && complianceChecks.passed ? 'PASS' : 'REVIEW_REQUIRED'
  };
}

/**
 * Security-specific validation checks
 */
function runSecurityChecks(config) {
  const issues = [];
  const gatewayConfig = config.gateway_config || '';

  // Check for authentication
  if (!gatewayConfig.includes('jwt') && !gatewayConfig.includes('oauth') && !gatewayConfig.includes('key-auth')) {
    issues.push({ severity: 'CRITICAL', message: 'No authentication plugin detected' });
  }

  // Check for rate limiting
  if (!gatewayConfig.includes('rate-limit')) {
    issues.push({ severity: 'HIGH', message: 'No rate limiting configured' });
  }

  // Check for hardcoded secrets
  const secretPatterns = [
    /password\s*[:=]\s*["'][^$]/i,
    /secret\s*[:=]\s*["'][^$]/i,
    /api_key\s*[:=]\s*["'][^$]/i
  ];
  for (const pattern of secretPatterns) {
    if (pattern.test(gatewayConfig)) {
      issues.push({ severity: 'CRITICAL', message: 'Hardcoded secret detected in config' });
    }
  }

  // Check for HTTPS
  if (gatewayConfig.includes('http://') && !gatewayConfig.includes('http://localhost')) {
    issues.push({ severity: 'HIGH', message: 'Non-HTTPS URL detected' });
  }

  return {
    passed: issues.filter(i => i.severity === 'CRITICAL').length === 0,
    issues,
    checks_run: 4
  };
}

/**
 * Compliance-specific validation checks
 */
function runComplianceChecks(config) {
  const issues = [];
  const fullConfig = JSON.stringify(config);

  // Check for audit logging
  if (!fullConfig.includes('audit') && !fullConfig.includes('log')) {
    issues.push({ regulation: 'RBI-2025', message: 'Audit logging not configured' });
  }

  // Check for PII masking awareness
  if (!fullConfig.includes('mask') && !fullConfig.includes('pii') && !fullConfig.includes('tokeniz')) {
    issues.push({ regulation: 'DPDP-Act', message: 'No PII masking/tokenization mentioned' });
  }

  // Check for Aadhaar tokenization
  if (fullConfig.toLowerCase().includes('aadhaar') && !fullConfig.includes('vault') && !fullConfig.includes('token')) {
    issues.push({ regulation: 'UIDAI', message: 'Aadhaar data referenced without vault tokenization' });
  }

  return {
    passed: issues.length === 0,
    issues,
    regulations_checked: ['RBI-2025', 'DPDP-Act', 'UIDAI']
  };
}
