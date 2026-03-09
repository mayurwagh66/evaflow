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

// Add sample data for demo
const MemoryStore = require('./services/memoryStore');
const addSampleData = require('./addSampleData');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

// Initialize with sample data if empty
let sampleDataInitialized = false;

const initializeSampleData = async () => {
  if (!sampleDataInitialized) {
    try {
      const existingData = await MemoryStore.find();
      if (existingData.length === 0) {
        console.log('Adding sample data...');
        await addSampleData();
        console.log('Sample data added successfully');
      }
      sampleDataInitialized = true;
    } catch (error) {
      console.log('Error adding sample data:', error.message);
    }
  }
};

// For Vercel serverless
module.exports = async (req, res) => {
  await initializeSampleData();
  return app(req, res);
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  initializeSampleData();
  app.listen(PORT, () => {
    console.log(`EvaFlow Carbon Intelligence Platform running on http://localhost:${PORT}`);
  });
}
