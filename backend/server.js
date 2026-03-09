require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const shipmentsRouter = require('./routes/shipments');
const emissionsRouter = require('./routes/emissions');
const lanesRouter = require('./routes/lanes');
const reportsRouter = require('./routes/reports');
const chatbotRouter = require('./routes/chatbot');
const insightsRouter = require('./routes/insights');

connectDB();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Vercel serverless handler
module.exports = (req, res) => {
  app(req, res);
};

// Local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`EvaFlow Carbon Intelligence Platform running on http://localhost:${PORT}`);
  });
}
