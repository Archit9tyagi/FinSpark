import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are ConfigForge AI, an enterprise-grade API Gateway Configuration Generator for Core Banking Systems in India.

YOUR ROLE:
- Convert Business Requirement Documents (BRDs) into production-ready API gateway configurations
- Generate Kong/Tyk-style YAML configurations
- Create JOLT transformation specifications
- Define authentication policies (OAuth2, JWT, API keys)
- Set rate limiting and circuit breaker rules
- Generate automated test cases

SECURITY MANDATES:
- All configs must include authentication (JWT/OAuth2 minimum)
- mTLS must be recommended for service-to-service communication
- PII fields must be marked for masking/tokenization
- All Aadhaar data references must use tokenized vault references
- Rate limiting is mandatory on all endpoints
- Audit logging must be enabled

COMPLIANCE REQUIREMENTS:
- RBI Digital Lending Guidelines 2025
- DPDP Act (Data Protection)
- UIDAI security standards for Aadhaar
- PCI-DSS for payment integrations

OUTPUT FORMAT:
You MUST respond with valid JSON containing these exact keys:
{
  "gateway_config": "<YAML string for API gateway config>",
  "auth_policy": "<YAML string for authentication policy>",
  "rate_limiting": "<YAML string for rate limiting rules>",
  "circuit_breaker": "<YAML string for circuit breaker config>",
  "jolt_transform": "<JSON string for JOLT transformation spec>",
  "test_cases": "<JSON string for auto-generated test cases>",
  "security_notes": ["array of security observations"],
  "compliance_flags": ["array of compliance items addressed"],
  "warnings": ["array of potential issues or missing info"]
}

IMPORTANT:
- Generate realistic, deployable configurations
- Include all necessary plugin configurations
- Add environment variable placeholders for secrets (use \${VAR_NAME} format)
- Include health check configurations
- Add OpenTelemetry/observability hooks
- Generate at least 3 test cases per endpoint`;

/**
 * Generate configurations from parsed BRD content using Gemini
 */
export async function generateFromBRD(parsedContent, options = {}) {
  const {
    gatewayType = 'kong',
    environment = 'UAT',
    securityProfile = 'Level 3: Hardened Enterprise',
    integrationTypes = []
  } = options;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-preview-04-17',
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    }
  });

  const userPrompt = buildPrompt(parsedContent, { gatewayType, environment, securityProfile, integrationTypes });

  try {
    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: userPrompt }
    ]);

    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse LLM response as JSON');
      }
    }

    return {
      success: true,
      configs: parsed,
      model_used: 'gemini-2.5-flash-preview-04-17',
      generation_timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('LLM Generation Error:', error.message);
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackConfig(parsedContent, options)
    };
  }
}

function buildPrompt(parsedContent, options) {
  const chunks = typeof parsedContent === 'string'
    ? parsedContent
    : parsedContent.chunks?.map(c =>
        `[Section: ${c.section_hierarchy.join(' > ')}]\n${c.content}`
      ).join('\n\n') || parsedContent;

  return `
<BEGIN_BRD_CONTENT>
${chunks}
<END_BRD_CONTENT>

CONFIGURATION PARAMETERS:
- Target Gateway: ${options.gatewayType.toUpperCase()}
- Environment: ${options.environment}
- Security Profile: ${options.securityProfile}
- Integration Types: ${options.integrationTypes.join(', ') || 'Auto-detect from BRD'}

Generate complete, production-ready configurations for all services and endpoints described in the BRD above.
Include appropriate authentication, rate limiting, circuit breakers, JOLT transformations, and test cases.
Ensure all Indian regulatory compliance requirements are met (RBI, DPDP, UIDAI).`;
}

/**
 * Fallback config generator when LLM is unavailable
 */
function generateFallbackConfig(parsedContent, options) {
  const content = typeof parsedContent === 'string'
    ? parsedContent
    : parsedContent.chunks?.map(c => c.content).join(' ') || '';

  // Extract service names and endpoints from content
  const serviceNames = content.match(/\b(?:CIBIL|UIDAI|Razorpay|NSDL|NPCI)\b/gi) || ['generic-service'];
  const methods = content.match(/\b(GET|POST|PUT|DELETE|PATCH)\b/g) || ['POST'];

  return {
    gateway_config: `_format_version: "3.0"
_transform: true

services:
  - name: ${serviceNames[0].toLowerCase()}-service
    url: https://api.${serviceNames[0].toLowerCase()}.endpoint/v1
    protocol: https
    connect_timeout: 10000
    write_timeout: 30000
    read_timeout: 30000
    retries: 3
    routes:
      - name: ${serviceNames[0].toLowerCase()}-route
        paths:
          - /api/v1/${serviceNames[0].toLowerCase()}
        methods:
          - ${methods[0]}
        strip_path: true
    plugins:
      - name: jwt
        config:
          key_claim_name: iss
          claims_to_verify:
            - exp
      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
          policy: local
      - name: opentelemetry
        config:
          endpoint: "\${OTEL_COLLECTOR_ENDPOINT}"`,
    auth_policy: `authentication:
  type: jwt
  algorithm: RS256
  token_expiry: 900
  refresh_enabled: true`,
    rate_limiting: `rate_limiting:
  per_consumer:
    minute: 100
    hour: 1000
  global:
    minute: 500
    hour: 5000`,
    circuit_breaker: `circuit_breaker:
  error_threshold: 5
  window_size: 60
  half_open_requests: 2
  recovery_timeout: 30`,
    jolt_transform: JSON.stringify({
      spec: [{ operation: "shift", spec: { "*": "&" } }]
    }),
    test_cases: JSON.stringify([{
      id: "TC-001",
      name: "Basic connectivity test",
      type: "smoke",
      expected: { status: 200 }
    }]),
    security_notes: ['Fallback config generated - manual review required'],
    compliance_flags: ['RBI-2025-basic'],
    warnings: ['LLM unavailable - using template-based fallback']
  };
}
