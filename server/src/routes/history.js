import { Router } from 'express';
import { getAuditHistory, getConfigHistory } from '../db/sqlite.js';

const router = Router();

/**
 * GET /api/history/audit - Get audit log entries
 */
router.get('/audit', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const history = getAuditHistory(limit);
  res.json({ success: true, entries: history, count: history.length });
});

/**
 * GET /api/history/configs - Get generated config history
 */
router.get('/configs', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const history = getConfigHistory(limit);
  res.json({ success: true, configs: history, count: history.length });
});

export default router;
