require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Only connect to DB if not in Vercel environment or if DB URI is available
if (process.env.MONGODB_URI) {
  const connectDB = require('./config/db');
  connectDB();
}

const shipmentsRouter = require('./routes/shipments');
const emissionsRouter = require('./routes/emissions');
const lanesRouter = require('./routes/lanes');
const reportsRouter = require('./routes/reports');
const chatbotRouter = require('./routes/chatbot');
const insightsRouter = require('./routes/insights');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api/shipments', shipmentsRouter);
app.use('/api/emissions', emissionsRouter);
app.use('/api/lanes', lanesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/insights', insightsRouter);

app.get('/api/config', (req, res) => {
  res.json({
    googleMapsKey: process.env.GOOGLE_MAPS_API_KEY || ''
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'EvaFlow API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch-all handler for frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Vercel serverless handler
module.exports = app;

// Local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`EvaFlow Carbon Intelligence Platform running on http://localhost:${PORT}`);
  });
}
