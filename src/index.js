import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import { setupDatabase } from './database.js';
import { identifyRouter } from './routes/identify.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Initialize database
await setupDatabase();

// Routes
app.use('/identify', identifyRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'An unexpected error occurred',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;