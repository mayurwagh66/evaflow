const express = require('express');
const router = express.Router();
const MemoryStore = require('../services/memoryStore');

// Get lane analytics
router.get('/analytics', async (req, res) => {
  try {
    const shipments = await MemoryStore.find();
    
    // Group by lane
    const laneData = {};
    shipments.forEach(shipment => {
      const lane = shipment.lane || `${shipment.originCity} → ${shipment.destinationCity}`;
      if (!laneData[lane]) {
        laneData[lane] = {
          originCity: shipment.originCity,
          destinationCity: shipment.destinationCity,
          totalEmissions: 0,
          co2Emissions: [],
          shipmentCount: 0,
          totalDistance: 0,
          totalWeight: 0,
          co2PerTonKms: []
        };
      }
      laneData[lane].totalEmissions += shipment.co2Emission || 0;
      laneData[lane].co2Emissions.push(shipment.co2Emission || 0);
      laneData[lane].shipmentCount += 1;
      laneData[lane].totalDistance += shipment.distance || 0;
      laneData[lane].totalWeight += shipment.shipmentWeight || 0;
      laneData[lane].co2PerTonKms.push(shipment.co2PerTonKm || 0);
    });

    const lanes = Object.entries(laneData).map(([lane, data]) => ({
      lane,
      originCity: data.originCity,
      destinationCity: data.destinationCity,
      totalEmissions: data.totalEmissions,
      avgEmissions: data.co2Emissions.reduce((a, b) => a + b, 0) / data.co2Emissions.length,
      shipmentCount: data.shipmentCount,
      totalDistance: data.totalDistance,
      totalWeight: data.totalWeight,
      co2PerTonKm: data.co2PerTonKms.reduce((a, b) => a + b, 0) / data.co2PerTonKms.length
    })).sort((a, b) => b.totalEmissions - a.totalEmissions);

    res.json(lanes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get high emission lanes
router.get('/high-emission', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const shipments = await MemoryStore.find();
    
    // Group by lane
    const laneData = {};
    shipments.forEach(shipment => {
      const lane = shipment.lane || `${shipment.originCity} → ${shipment.destinationCity}`;
      if (!laneData[lane]) {
        laneData[lane] = {
          totalEmissions: 0,
          shipmentCount: 0,
          co2PerTonKms: []
        };
      }
      laneData[lane].totalEmissions += shipment.co2Emission || 0;
      laneData[lane].shipmentCount += 1;
      laneData[lane].co2PerTonKms.push(shipment.co2PerTonKm || 0);
    });

    const lanes = Object.entries(laneData).map(([lane, data]) => ({
      lane,
      totalEmissions: data.totalEmissions,
      shipmentCount: data.shipmentCount,
      avgCO2PerTonKm: data.co2PerTonKms.reduce((a, b) => a + b, 0) / data.co2PerTonKms.length
    })).sort((a, b) => b.totalEmissions - a.totalEmissions).slice(0, parseInt(limit));

    res.json(lanes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Carrier emission comparison
router.get('/carrier-comparison', async (req, res) => {
  try {
    const shipments = await MemoryStore.find();
    
    // Group by carrier
    const carrierData = {};
    shipments.forEach(shipment => {
      const carrier = shipment.carrierName || 'Unknown';
      if (!carrierData[carrier]) {
        carrierData[carrier] = {
          totalEmissions: 0,
          shipmentCount: 0,
          co2Emissions: []
        };
      }
      carrierData[carrier].totalEmissions += shipment.co2Emission || 0;
      carrierData[carrier].shipmentCount += 1;
      carrierData[carrier].co2Emissions.push(shipment.co2Emission || 0);
    });

    const carriers = Object.entries(carrierData).map(([carrier, data]) => ({
      _id: carrier,
      totalEmissions: data.totalEmissions,
      shipmentCount: data.shipmentCount,
      avgEmission: data.co2Emissions.reduce((a, b) => a + b, 0) / data.co2Emissions.length
    })).sort((a, b) => b.totalEmissions - a.totalEmissions);

    res.json(carriers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
