import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { parseRawText } from '../services/parser.js';
import { maskPII, sanitizeInput, detectInjection } from '../services/piiMasker.js';
import { generateFromBRD } from '../services/llmClient.js';
import { validateConfig } from '../services/validator.js';
import { logAudit, saveConfig } from '../db/sqlite.js';

const router = Router();

/**
 * POST /api/generate - Generate configs from BRD content
 */
router.post('/', async (req, res) => {
  const startTime = Date.now();
  const requestId = uuidv4();

  try {
    const {
      content,
      chunks,
      gatewayType = 'kong',
      environment = 'UAT',
      securityProfile = 'Level 3: Hardened Enterprise',
      integrationTypes = []
    } = req.body;

    if (!content && !chunks) {
      return res.status(400).json({ error: 'No BRD content provided' });
    }

    // Step 1: Sanitize input
    const rawContent = content || chunks.map(c => c.content).join('\n');
    const sanitized = sanitizeInput(rawContent);

    // Step 2: Check for injection
    const injectionCheck = detectInjection(sanitized);
    if (!injectionCheck.is_safe) {
      logAudit({
        request_id: requestId,
        action: 'GENERATION_BLOCKED',
        validation_status: 'INJECTION_DETECTED'
      });
      return res.status(400).json({
        error: 'Potential security threat detected in input',
        request_id: requestId
      });
    }

    // Step 3: Mask PII
    const piiResult = maskPII(sanitized);

    // Step 4: Parse into structured chunks
    const parsed = parseRawText(piiResult.maskedText);

    // Step 5: Generate configs via LLM
    const llmResult = await generateFromBRD(parsed, {
      gatewayType,
      environment,
      securityProfile,
      integrationTypes
    });

    const configs = llmResult.success ? llmResult.configs : llmResult.fallback;

    // Step 6: Validate generated configs
    const validation = validateConfig(configs);

    // Step 7: Compute hashes for audit
    const inputHash = crypto.createHash('sha256').update(sanitized).digest('hex').slice(0, 16);
    const outputHash = crypto.createHash('sha256').update(JSON.stringify(configs)).digest('hex').slice(0, 16);

    const generationTime = Date.now() - startTime;

    // Step 8: Log to audit trail
    logAudit({
      request_id: requestId,
      action: 'CONFIG_GENERATED',
      input_hash: inputHash,
      output_hash: outputHash,
      environment,
      gateway_type: gatewayType,
      security_profile: securityProfile,
      integration_types: integrationTypes.join(','),
      pii_detected: piiResult.stats.total_pii_found,
      pii_masked: piiResult.stats.tokens_generated,
      validation_status: validation.overall_status,
      generation_time_ms: generationTime
    });

    // Step 9: Save generated config
    saveConfig({
      request_id: requestId,
      config_type: gatewayType,
      config_content: JSON.stringify(configs),
      schema_valid: validation.schema_valid,
      environment
    });

    // Step 10: Respond
    res.json({
      success: true,
      request_id: requestId,
      configs,
      validation,
      security: {
        pii_stats: piiResult.stats,
        injection_check: injectionCheck
      },
      metadata: {
        model_used: llmResult.model_used || 'fallback-template',
        generation_time_ms: generationTime,
        environment,
        gateway_type: gatewayType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Generation error:', error);
    logAudit({
      request_id: requestId,
      action: 'GENERATION_FAILED',
      validation_status: 'ERROR'
    });
    res.status(500).json({
      error: 'Configuration generation failed',
      request_id: requestId,
      message: error.message
    });
  }
});

export default router;
