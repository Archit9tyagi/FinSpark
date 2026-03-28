import { Router } from 'express';
import { getAllTemplates, getTemplate, getTemplateConfig } from '../services/templates.js';

const router = Router();

/**
 * GET /api/templates - List all integration templates
 */
router.get('/', (req, res) => {
  const templates = getAllTemplates();
  res.json({ success: true, templates });
});

/**
 * GET /api/templates/:id - Get specific template details
 */
router.get('/:id', (req, res) => {
  const template = getTemplate(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json({ success: true, template });
});

/**
 * GET /api/templates/:id/config - Get deployable config for a template
 */
router.get('/:id/config', (req, res) => {
  const config = getTemplateConfig(req.params.id);
  if (!config) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json({ success: true, config });
});

export default router;
