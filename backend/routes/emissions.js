const express = require('express');
const router = express.Router();
const MemoryStore = require('../services/memoryStore');

// Get emission trends (monthly)
router.get('/trends', async (req, res) => {
  try {
    const shipments = await MemoryStore.find();
    
    // Group by month and calculate totals
    const monthlyData = {};
    shipments.forEach(shipment => {
      const month = new Date(shipment.shipmentDate).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = {
          totalEmissions: 0,
          shipmentCount: 0,
          co2Emissions: []
        };
      }
      monthlyData[month].totalEmissions += shipment.co2Emission || 0;
      monthlyData[month].shipmentCount += 1;
      monthlyData[month].co2Emissions.push(shipment.co2Emission || 0);
    });

    const trends = Object.entries(monthlyData).map(([month, data]) => ({
      _id: month,
      totalEmissions: data.totalEmissions,
      shipmentCount: data.shipmentCount,
      avgEmission: data.co2Emissions.reduce((a, b) => a + b, 0) / data.co2Emissions.length
    })).sort((a, b) => a._id.localeCompare(b._id));

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate emissions for a shipment (without saving)
router.post('/calculate', async (req, res) => {
  try {
    const { getDistance } = require('../services/distanceService');
    const { calculateCO2, calculateCO2PerTonKm } = require('../config/emissionFactors');
    const { originCity, destinationCity, truckType, fuelType, shipmentWeight, loadFactor = 1 } = req.body;

    if (!originCity || !destinationCity || !truckType || !fuelType || !shipmentWeight) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { distance } = await getDistance(originCity, destinationCity);
    const weight = parseFloat(shipmentWeight);
    const co2 = calculateCO2(distance, weight, truckType, fuelType, parseFloat(loadFactor));
    const co2PerTonKm = calculateCO2PerTonKm(co2, distance, weight);

    res.json({ distance, co2Emission: co2, co2PerTonKm });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get emission summary
router.get('/summary', async (req, res) => {
  try {
    const shipments = await MemoryStore.find();
    
    if (shipments.length === 0) {
      return res.json({ 
        totalEmissions: 0, 
        totalDistance: 0, 
        totalWeight: 0, 
        shipmentCount: 0, 
        avgEmission: 0 
      });
    }

    const summary = shipments.reduce((acc, shipment) => {
      acc.totalEmissions += shipment.co2Emission || 0;
      acc.totalDistance += shipment.distance || 0;
      acc.totalWeight += shipment.shipmentWeight || 0;
      acc.shipmentCount += 1;
      return acc;
    }, { totalEmissions: 0, totalDistance: 0, totalWeight: 0, shipmentCount: 0 });

    summary.avgEmission = summary.totalEmissions / summary.shipmentCount;

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
