const express = require('express');
const router = express.Router();
const MemoryStore = require('../services/memoryStore');
const { generateChatResponse } = require('../services/geminiService');

router.post('/', async (req, res) => {
  try {
    console.log('Chatbot API called with message:', req.body.message);
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // Get all shipments from memory store
    const shipments = MemoryStore.find();
    console.log('Found shipments:', shipments.length);
    
    // Calculate summary statistics
    const summary = shipments.reduce((acc, shipment) => {
      acc.totalEmissions += shipment.co2Emission || 0;
      acc.shipmentCount += 1;
      acc.totalDistance += shipment.distance || 0;
      return acc;
    }, { totalEmissions: 0, shipmentCount: 0, totalDistance: 0 });

    // Calculate high emission lanes
    const laneEmissions = {};
    shipments.forEach(shipment => {
      if (shipment.lane) {
        if (!laneEmissions[shipment.lane]) {
          laneEmissions[shipment.lane] = 0;
        }
        laneEmissions[shipment.lane] += shipment.co2Emission || 0;
      }
    });
    
    const highEmissionLanes = Object.entries(laneEmissions)
      .map(([lane, totalEmissions]) => ({ _id: lane, totalEmissions }))
      .sort((a, b) => b.totalEmissions - a.totalEmissions)
      .slice(0, 5);

    // Calculate lowest emission carriers
    const carrierEmissions = {};
    shipments.forEach(shipment => {
      if (shipment.carrierName) {
        if (!carrierEmissions[shipment.carrierName]) {
          carrierEmissions[shipment.carrierName] = 0;
        }
        carrierEmissions[shipment.carrierName] += shipment.co2Emission || 0;
      }
    });
    
    const lowestEmissionCarriers = Object.entries(carrierEmissions)
      .map(([carrierName, totalEmissions]) => ({ _id: carrierName, totalEmissions }))
      .sort((a, b) => a.totalEmissions - b.totalEmissions)
      .slice(0, 5);

    // Calculate monthly trends
    const monthlyTrends = {};
    shipments.forEach(shipment => {
      if (shipment.shipmentDate) {
        const month = new Date(shipment.shipmentDate).toISOString().slice(0, 7);
        if (!monthlyTrends[month]) {
          monthlyTrends[month] = 0;
        }
        monthlyTrends[month] += shipment.co2Emission || 0;
      }
    });
    
    const trends = Object.entries(monthlyTrends)
      .map(([month, totalEmissions]) => ({ _id: month, totalEmissions }))
      .sort((a, b) => a._id.localeCompare(b._id))
      .slice(0, 6);

    // Get all lanes
    const allLanes = [...new Set(shipments.map(s => s.lane).filter(Boolean))].slice(0, 30);

    // Calculate Mumbai-Delhi specific data
    const mumbaiToDelhiShipments = shipments.filter(s => 
      s.lane && (s.lane.includes('Mumbai') && s.lane.includes('Delhi'))
    );
    
    const mumbaiToDelhi = mumbaiToDelhiShipments.reduce((acc, shipment) => {
      acc.totalEmissions += shipment.co2Emission || 0;
      acc.count += 1;
      return acc;
    }, { totalEmissions: 0, count: 0 });

    const contextData = {
      summary,
      highEmissionLanes,
      lowestEmissionCarriers,
      monthlyTrends: trends,
      allLanes,
      mumbaiToDelhi: mumbaiToDelhi.count > 0 ? mumbaiToDelhi : null
    };

    console.log('Calling Gemini API...');
    const response = await generateChatResponse(message, contextData);
    console.log('Gemini response received');
    res.json({ response });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
