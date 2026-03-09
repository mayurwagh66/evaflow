require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Try to connect to DB, but don't fail if it doesn't work
try {
  require('./config/db');
} catch (error) {
  console.log('Database connection skipped, using in-memory storage');
}

const shipmentsRouter = require('./routes/shipments');
const emissionsRouter = require('./routes/emissions');
const lanesRouter = require('./routes/lanes');
const reportsRouter = require('./routes/reports');
const chatbotRouter = require('./routes/chatbot');
const insightsRouter = require('./routes/insights');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/shipments', shipmentsRouter);
app.use('/api/emissions', emissionsRouter);
app.use('/api/lanes', lanesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/insights', insightsRouter);

// API Config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    googleMapsKey: process.env.GOOGLE_MAPS_API_KEY || '',
    geminiKey: process.env.GEMINI_API_KEY || ''
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'EvaFlow API is running',
    timestamp: new Date().toISOString()
  });
});

// Catch all handler for frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Vercel serverless handler
module.exports = app;

// Local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`EvaFlow Carbon Intelligence Platform running on http://localhost:${PORT}`);
  });
}
