import dotenv from 'dotenv';
dotenv.config(); // MUST BE AT THE VERY TOP before importing routes or services!

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import assistantRoutes from './routes/assistantRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Configure CORS and Helmet for Chrome Extensions
app.use(cors({ origin: '*', credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '5mb' }));

// Root Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '🚀 Nexora AI Backend API Server is running with live Gemini AI!',
    healthCheck: `http://localhost:${PORT}/api/assistant/health`,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/assistant', assistantRoutes);

// Global Error Handler
app.use(errorHandler);

// Listen on 0.0.0.0 to support IPv4 and IPv6 localhost resolution
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  🚀 NEXORA AI BACKEND SERVER RUNNING ON PORT ${PORT}`);
  console.log(`  Root URL: http://localhost:${PORT}/`);
  console.log(`  Health Check: http://localhost:${PORT}/api/assistant/health`);
  console.log(`=======================================================`);
});
