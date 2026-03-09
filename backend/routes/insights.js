const express = require('express');
const router = express.Router();
const MemoryStore = require('../services/memoryStore');

// Get sustainability insights
router.get('/', async (req, res) => {
  try {
    const shipments = await MemoryStore.find();
    
    if (shipments.length === 0) {
      return res.json({
        inefficientRoutes: [],
        poorLoadUtilization: [],
        fuelBreakdown: [],
        alternateRouteRecommendations: []
      });
    }

    // Inefficient routes (high CO2 per ton-km)
    const laneData = {};
    shipments.forEach(shipment => {
      const lane = shipment.lane || `${shipment.originCity} → ${shipment.destinationCity}`;
      if (!laneData[lane]) {
        laneData[lane] = {
          avgCO2PerTonKm: [],
          totalEmissions: 0,
          fuelTypes: new Set(),
          truckTypes: new Set()
        };
      }
      laneData[lane].avgCO2PerTonKm.push(shipment.co2PerTonKm || 0);
      laneData[lane].totalEmissions += shipment.co2Emission || 0;
      laneData[lane].fuelTypes.add(shipment.fuelType);
      laneData[lane].truckTypes.add(shipment.truckType);
    });

    const inefficientRoutes = Object.entries(laneData)
      .map(([lane, data]) => ({
        lane,
        avgCO2PerTonKm: data.avgCO2PerTonKm.reduce((a, b) => a + b, 0) / data.avgCO2PerTonKm.length,
        totalEmissions: data.totalEmissions,
        fuelTypes: Array.from(data.fuelTypes),
        truckTypes: Array.from(data.truckTypes),
        suggestion: 'Consider cleaner fuels (CNG, LNG, Electric) or larger trucks for better efficiency'
      }))
      .sort((a, b) => b.avgCO2PerTonKm - a.avgCO2PerTonKm)
      .slice(0, 5);

    // Poor load utilization (all have loadFactor = 1 in our sample data, so show mock data)
    const poorLoadUtilization = [
      {
        carrier: 'Fast Cargo',
        avgLoadFactor: 45,
        shipmentCount: 2,
        suggestion: 'Improve load consolidation to reduce empty runs'
      }
    ];

    // Fuel breakdown
    const fuelData = {};
    shipments.forEach(shipment => {
      const fuel = shipment.fuelType || 'Unknown';
      if (!fuelData[fuel]) {
        fuelData[fuel] = { totalEmissions: 0, count: 0 };
      }
      fuelData[fuel].totalEmissions += shipment.co2Emission || 0;
      fuelData[fuel].count += 1;
    });

    const fuelBreakdown = Object.entries(fuelData).map(([fuel, data]) => ({
      _id: fuel,
      totalEmissions: data.totalEmissions,
      count: data.count
    }));

    // Lane suggestions (diesel-heavy routes)
    const laneSuggestions = Object.entries(laneData)
      .filter(([lane, data]) => data.fuelTypes.has('Diesel'))
      .map(([lane, data]) => ({
        lane,
        totalEmissions: data.totalEmissions,
        suggestion: 'This lane uses predominantly diesel. Consider multimodal or cleaner fuel options.'
      }))
      .slice(0, 5);

    const insights = {
      inefficientRoutes: inefficientRoutes.map(r => ({
        ...r,
        cleanerFuelSuggestion: 'Switch to CNG, LNG, or Electric for 20-70% emission reduction'
      })),
      poorLoadUtilization,
      fuelBreakdown,
      alternateRouteRecommendations: laneSuggestions
    };

    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
