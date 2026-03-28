import { Router } from 'express';
import multer from 'multer';
import { parseDocument, parseRawText } from '../services/parser.js';
import { maskPII, detectInjection, sanitizeInput } from '../services/piiMasker.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|txt)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Accepted: PDF, DOCX, TXT'), false);
    }
  }
});

/**
 * POST /api/upload/file - Upload a BRD document
 */
router.post('/file', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const parsed = await parseDocument(req.file.buffer, req.file.mimetype, req.file.originalname);
    const fullText = parsed.chunks.map(c => c.content).join('\n');

    // PII scanning
    const piiResult = maskPII(fullText);
    const injectionCheck = detectInjection(fullText);

    res.json({
      success: true,
      document: {
        id: parsed.document_id,
        filename: parsed.filename,
        total_chunks: parsed.total_chunks,
        raw_text_length: parsed.raw_text_length
      },
      chunks: parsed.chunks,
      security: {
        pii: piiResult.stats,
        injection: injectionCheck,
        sanitized_content: piiResult.maskedText
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/upload/text - Submit raw BRD text
 */
router.post('/text', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'No content provided' });
    }

    const sanitized = sanitizeInput(content);
    const injectionCheck = detectInjection(sanitized);

    if (!injectionCheck.is_safe) {
      return res.status(400).json({
        error: 'Potential prompt injection detected',
        threats: injectionCheck.threats
      });
    }

    const parsed = parseRawText(sanitized);
    const piiResult = maskPII(sanitized);

    res.json({
      success: true,
      document: {
        id: parsed.document_id,
        filename: 'raw_input.txt',
        total_chunks: parsed.total_chunks,
        raw_text_length: parsed.raw_text_length
      },
      chunks: parsed.chunks,
      security: {
        pii: piiResult.stats,
        injection: injectionCheck,
        sanitized_content: piiResult.maskedText
      }
    });
  } catch (error) {
    console.error('Text upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
