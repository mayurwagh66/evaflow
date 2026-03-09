require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Only connect to DB if not in Vercel environment or if DB URI is available
if (process.env.MONGODB_URI) {
  const connectDB = require('../backend/config/db');
  connectDB();
}

const shipmentsRouter = require('../backend/routes/shipments');
const emissionsRouter = require('../backend/routes/emissions');
const lanesRouter = require('../backend/routes/lanes');
const reportsRouter = require('../backend/routes/reports');
const chatbotRouter = require('../backend/routes/chatbot');
const insightsRouter = require('../backend/routes/insights');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/shipments', shipmentsRouter);
app.use('/emissions', emissionsRouter);
app.use('/lanes', lanesRouter);
app.use('/reports', reportsRouter);
app.use('/chatbot', chatbotRouter);
app.use('/insights', insightsRouter);

app.get('/config', (req, res) => {
  res.json({
    googleMapsKey: process.env.GOOGLE_MAPS_API_KEY || ''
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'EvaFlow API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Export for Vercel serverless
module.exports = app;
