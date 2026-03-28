/**
 * Pre-built integration templates for Indian banking ecosystem
 */

export const TEMPLATES = {
  cibil: {
    id: 'cibil-credit-bureau',
    name: 'CIBIL Credit Bureau',
    version: '2.1.0',
    category: 'credit-bureau',
    icon: 'speed',
    status: 'Stable',
    description: 'Hardened XML-to-JSON transformer with built-in retry logic and encryption handling for CIBIL TransUnion credit score retrieval.',
    authentication: {
      type: 'certificate-based',
      mtls: true,
      certificate_store: 'hsm'
    },
    gateway_config: `_format_version: "3.0"
_transform: true

services:
  - name: cibil-credit-check-service
    url: https://api.cibil.com/v2/credit/inquiry
    protocol: https
    connect_timeout: 10000
    write_timeout: 30000
    read_timeout: 30000
    retries: 3
    client_certificate:
      id: "\${CIBIL_CLIENT_CERT_ID}"
    ca_certificates:
      - "\${CIBIL_CA_CERT_ID}"
    routes:
      - name: cibil-credit-check-route
        paths:
          - /api/v1/lending/credit-check
        methods:
          - POST
        strip_path: true
    plugins:
      - name: jwt
        config:
          key_claim_name: iss
          claims_to_verify:
            - exp
          maximum_expiration: 900
      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
          policy: redis
          redis_host: "\${REDIS_HOST}"
      - name: circuit-breaker
        config:
          error_threshold: 5
          window_size: 60
          half_open_requests: 2
      - name: opentelemetry
        config:
          endpoint: "\${OTEL_COLLECTOR_ENDPOINT}"

upstreams:
  - name: cibil-upstream
    algorithm: round-robin
    healthchecks:
      active:
        https_sni: api.cibil.com
        type: https
        healthy:
          interval: 30
          successes: 2
        unhealthy:
          interval: 10
          tcp_failures: 3`,
    jolt_transform: {
      spec: [
        {
          operation: 'shift',
          spec: {
            applicant: {
              pan_number: 'inquiry.id_details.pan',
              full_name: 'inquiry.consumer.name',
              date_of_birth: 'inquiry.consumer.dob',
              loan_amount: 'inquiry.loan_details.amount'
            },
            application_id: 'inquiry.reference_id'
          }
        },
        {
          operation: 'default',
          spec: {
            inquiry: {
              inquiry_purpose: 'CREDIT_ASSESSMENT',
              report_type: 'COMPREHENSIVE',
              consent_flag: 'Y'
            }
          }
        }
      ]
    },
    compliance: {
      consent_required: true,
      data_retention: '90_days',
      purpose_limitation: 'credit_assessment',
      rbi_guideline_ref: 'DL-2025-Section-4.2'
    }
  },

  uidai: {
    id: 'uidai-ekyc',
    name: 'UIDAI eKYC',
    version: '4.0.2',
    category: 'identity-verification',
    icon: 'fingerprint',
    status: 'Secure',
    description: 'Aadhaar Data Vault (ADV) compliance integrated with HSM digital signing hooks for UIDAI e-KYC verification.',
    authentication: {
      type: 'asa-license',
      encryption: 'rsa-2048',
      signing: 'sha256'
    },
    gateway_config: `_format_version: "3.0"
_transform: true

services:
  - name: uidai-ekyc-service
    url: https://api.uidai.gov.in/v3/kyc
    protocol: https
    connect_timeout: 15000
    write_timeout: 30000
    read_timeout: 30000
    retries: 2
    routes:
      - name: uidai-otp-request
        paths:
          - /api/v1/identity/otp
        methods:
          - POST
      - name: uidai-ekyc-verify
        paths:
          - /api/v1/identity/verify
        methods:
          - POST
    plugins:
      - name: jwt
        config:
          key_claim_name: iss
          claims_to_verify:
            - exp
      - name: rate-limiting
        config:
          minute: 50
          hour: 500
      - name: request-transformer
        config:
          add:
            headers:
              - "X-AUA-Code: \${UIDAI_AUA_CODE}"
              - "X-ASA-License: \${UIDAI_ASA_LICENSE}"`,
    jolt_transform: {
      spec: [
        {
          operation: 'shift',
          spec: {
            aadhaar_token: 'auth.uid_token',
            consent: 'auth.consent',
            biometric_data: 'auth.data'
          }
        }
      ]
    },
    compliance: {
      aadhaar_vault: 'required',
      data_encryption: 'aes-256-gcm',
      no_storage: true,
      consent_type: 'explicit',
      audit_log: 'mandatory'
    }
  },

  razorpay: {
    id: 'razorpay-payment',
    name: 'Razorpay Checkout',
    version: '1.8.4',
    category: 'payment-gateway',
    icon: 'payments',
    status: 'Enterprise',
    description: 'Webhook security, signature verification, and automated idempotent processing for Razorpay payment integration.',
    authentication: {
      type: 'api-key',
      key_id: '${RAZORPAY_KEY_ID}',
      key_secret: '${RAZORPAY_KEY_SECRET}'
    },
    gateway_config: `_format_version: "3.0"
_transform: true

services:
  - name: razorpay-payment-service
    url: https://api.razorpay.com/v1
    protocol: https
    connect_timeout: 10000
    write_timeout: 30000
    read_timeout: 30000
    retries: 3
    routes:
      - name: razorpay-create-order
        paths:
          - /api/v1/payments/create-order
        methods:
          - POST
      - name: razorpay-verify
        paths:
          - /api/v1/payments/verify
        methods:
          - POST
    plugins:
      - name: key-auth
        config:
          key_names:
            - x-api-key
      - name: rate-limiting
        config:
          minute: 200
          hour: 2000
      - name: hmac-auth
        config:
          enforce_headers:
            - x-razorpay-signature`,
    jolt_transform: {
      spec: [
        {
          operation: 'shift',
          spec: {
            amount: 'amount',
            currency: 'currency',
            receipt: 'receipt',
            payment_capture: 'payment_capture'
          }
        },
        {
          operation: 'default',
          spec: {
            currency: 'INR',
            payment_capture: 1
          }
        }
      ]
    },
    compliance: {
      pci_dss: 'required',
      settlement_tracking: 'enabled',
      webhook_verification: 'mandatory'
    }
  }
};

export function getTemplate(id) {
  return TEMPLATES[id] || null;
}

export function getAllTemplates() {
  return Object.entries(TEMPLATES).map(([key, t]) => ({
    id: key,
    name: t.name,
    version: t.version,
    category: t.category,
    icon: t.icon,
    status: t.status,
    description: t.description
  }));
}

export function getTemplateConfig(id) {
  const t = TEMPLATES[id];
  if (!t) return null;
  return {
    gateway_config: t.gateway_config,
    auth_policy: `authentication:\n  type: ${t.authentication.type}\n  mtls: ${t.authentication.mtls || false}`,
    jolt_transform: JSON.stringify(t.jolt_transform, null, 2),
    compliance: t.compliance
  };
}
