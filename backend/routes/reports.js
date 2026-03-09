const express = require('express');
const router = express.Router();
const MemoryStore = require('../services/memoryStore');
const PDFService = require('../services/pdfService');

// Helper function to clean lane formatting
const cleanLaneFormat = (lane) => {
  if (!lane) return lane;
  // Replace any ! or !' with → arrow and ensure proper spacing
  return lane.replace(/!'\s*/g, ' → ').replace(/!\s*/g, ' → ').replace(/\s+→\s+/g, ' → ').trim();
};

// Generate emission report data
router.get('/', async (req, res) => {
  try {
    const shipments = await MemoryStore.find();
    
    if (shipments.length === 0) {
      return res.json({
        period: { startDate: req.query.startDate || 'All', endDate: req.query.endDate || 'All' },
        summary: { totalEmissions: 0, totalDistance: 0, shipmentCount: 0 },
        laneSummary: [],
        carrierPerformance: [],
        topHighEmissionRoutes: [],
        generatedAt: new Date().toISOString()
      });
    }

    // Calculate summary
    const summary = shipments.reduce((acc, shipment) => {
      acc.totalEmissions += shipment.co2Emission || 0;
      acc.totalDistance += shipment.distance || 0;
      acc.shipmentCount += 1;
      return acc;
    }, { totalEmissions: 0, totalDistance: 0, shipmentCount: 0 });

    // Group by lane
    const laneData = {};
    shipments.forEach(shipment => {
      const lane = cleanLaneFormat(shipment.lane) || cleanLaneFormat(`${shipment.originCity} → ${shipment.destinationCity}`);
      if (!laneData[lane]) {
        laneData[lane] = { totalEmissions: 0, shipmentCount: 0 };
      }
      laneData[lane].totalEmissions += shipment.co2Emission || 0;
      laneData[lane].shipmentCount += 1;
    });

    const laneSummary = Object.entries(laneData)
      .map(([lane, data]) => ({ _id: lane, ...data }))
      .sort((a, b) => b.totalEmissions - a.totalEmissions)
      .slice(0, 20);

    // Group by carrier
    const carrierData = {};
    shipments.forEach(shipment => {
      const carrier = shipment.carrierName || 'Unknown';
      if (!carrierData[carrier]) {
        carrierData[carrier] = { totalEmissions: 0, shipmentCount: 0 };
      }
      carrierData[carrier].totalEmissions += shipment.co2Emission || 0;
      carrierData[carrier].shipmentCount += 1;
    });

    const carrierPerformance = Object.entries(carrierData)
      .map(([carrier, data]) => ({ _id: carrier, ...data }))
      .sort((a, b) => b.totalEmissions - a.totalEmissions);

    // High emission routes (same as laneSummary but limited)
    const topHighEmissionRoutes = laneSummary.slice(0, 10);

    const report = {
      period: { startDate: req.query.startDate || 'All', endDate: req.query.endDate || 'All' },
      summary,
      laneSummary,
      carrierPerformance,
      topHighEmissionRoutes,
      generatedAt: new Date().toISOString()
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate enhanced PDF report
router.post('/pdf', async (req, res) => {
  try {
    // Get query parameters
    const start = req.query.startDate;
    const end = req.query.endDate;
    
    // Build query string
    let queryString = '';
    if (start) queryString += `startDate=${encodeURIComponent(start)}&`;
    if (end) queryString += `endDate=${encodeURIComponent(end)}`;
    if (queryString) queryString = '?' + queryString;
    
    // Get report data directly without fetch
    const shipments = await MemoryStore.find();
    
    // Calculate summary
    const summary = shipments.reduce((acc, shipment) => {
      acc.totalEmissions += shipment.co2Emission || 0;
      acc.totalDistance += shipment.distance || 0;
      acc.shipmentCount += 1;
      return acc;
    }, { totalEmissions: 0, totalDistance: 0, shipmentCount: 0 });

    // Group by lane
    const laneData = {};
    shipments.forEach(shipment => {
      const lane = cleanLaneFormat(shipment.lane) || cleanLaneFormat(`${shipment.originCity} → ${shipment.destinationCity}`);
      if (!laneData[lane]) {
        laneData[lane] = { totalEmissions: 0, shipmentCount: 0 };
      }
      laneData[lane].totalEmissions += shipment.co2Emission || 0;
      laneData[lane].shipmentCount += 1;
    });

    const laneSummary = Object.entries(laneData)
      .map(([lane, data]) => ({ _id: lane, ...data }))
      .sort((a, b) => b.totalEmissions - a.totalEmissions)
      .slice(0, 20);

    // Group by carrier
    const carrierData = {};
    shipments.forEach(shipment => {
      const carrier = shipment.carrierName || 'Unknown';
      if (!carrierData[carrier]) {
        carrierData[carrier] = { totalEmissions: 0, shipmentCount: 0 };
      }
      carrierData[carrier].totalEmissions += shipment.co2Emission || 0;
      carrierData[carrier].shipmentCount += 1;
    });

    const carrierPerformance = Object.entries(carrierData)
      .map(([carrier, data]) => ({ _id: carrier, ...data }))
      .sort((a, b) => b.totalEmissions - a.totalEmissions);

    // High emission routes
    const topHighEmissionRoutes = laneSummary.slice(0, 10);

    const reportData = {
      period: { startDate: start || 'All', endDate: end || 'All' },
      summary,
      laneSummary,
      carrierPerformance,
      topHighEmissionRoutes,
      generatedAt: new Date().toISOString()
    };
    
    // Generate enhanced PDF
    const pdfBuffer = await PDFService.generateEnhancedReport(reportData);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="EvaFlow-Carbon-Emissions-Report-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF report: ' + error.message });
  }
});

module.exports = router;
