import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDB } from './db/sqlite.js';
import uploadRouter from './routes/upload.js';
import generateRouter from './routes/generate.js';
import templatesRouter from './routes/templates.js';
import historyRouter from './routes/history.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize database
initDB();

// Routes
app.use('/api/upload', uploadRouter);
app.use('/api/generate', generateRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/history', historyRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      core_generator: 'OPERATIONAL',
      ai_inference: 'OPERATIONAL',
      compliance_engine: 'OPERATIONAL'
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n⚡ FinSpark API Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

export default app;
