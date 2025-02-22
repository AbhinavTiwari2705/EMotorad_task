import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import { setupDatabase } from './database.js';
import { identifyRouter } from './routes/identify.js';
import {
  errorHandler,
  requestLogger,
  notFoundHandler
} from './middleware/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const RATE_LIMIT_WINDOW = process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000;
const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || 100;
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: RATE_LIMIT_MAX,
  message: 'Too many requests, please try again later.'
});

// Basic middleware
app.use(cors());
app.use(limiter);
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10kb' }));
app.use(requestLogger);

// Initialize database
await setupDatabase();

// Routes
app.use('/identify', identifyRouter);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;