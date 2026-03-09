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

// Add sample data
const MemoryStore = require('./services/memoryStore');
const addSampleData = require('./addSampleData');

// Initialize sample data
setTimeout(async () => {
  try {
    const existingData = await MemoryStore.find();
    if (existingData.length === 0) {
      console.log('Adding sample data...');
      await addSampleData();
      console.log('Sample data added successfully!');
    }
  } catch (error) {
    console.log('Sample data error:', error.message);
  }
}, 1000);

app.listen(PORT, () => {
  console.log(`🚀 EvaFlow running on http://localhost:${PORT}`);
  console.log('📊 Dashboard: http://localhost:3000');
  console.log('📦 API: http://localhost:3000/api');
});

console.log('Starting EvaFlow Carbon Intelligence Platform...');
