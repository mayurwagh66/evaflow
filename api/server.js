const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sample data
const shipments = [
  { id: 1, origin: 'Mumbai', destination: 'Delhi', co2Emission: 532.50, distance: 1420, weight: 5000, truckType: 'Heavy', fuelType: 'Diesel', carrierName: 'ABC Logistics', shipmentDate: '2026-01-15' },
  { id: 2, origin: 'Delhi', destination: 'Bangalore', co2Emission: 698.25, distance: 2100, weight: 3500, truckType: 'Medium', fuelType: 'Diesel', carrierName: 'XYZ Transport', shipmentDate: '2026-01-20' },
  { id: 3, origin: 'Bangalore', destination: 'Chennai', co2Emission: 66.50, distance: 350, weight: 2000, truckType: 'Light', fuelType: 'CNG', carrierName: 'Green Freight', shipmentDate: '2026-02-05' },
  { id: 4, origin: 'Mumbai', destination: 'Hyderabad', co2Emission: 303.52, distance: 710, weight: 4500, truckType: 'Medium', fuelType: 'Diesel', carrierName: 'ABC Logistics', shipmentDate: '2026-02-10' },
  { id: 5, origin: 'Pune', destination: 'Delhi', co2Emission: 368.10, distance: 818, weight: 6000, truckType: 'Heavy', fuelType: 'Diesel', carrierName: 'Fast Cargo', shipmentDate: '2026-02-15' }
];

// API Routes
app.get('/api/emissions/summary', (req, res) => {
  const totalEmissions = shipments.reduce((sum, s) => sum + s.co2Emission, 0);
  const totalDistance = shipments.reduce((sum, s) => sum + s.distance, 0);
  const avgEmission = totalEmissions / shipments.length;
  
  res.json({
    totalEmissions,
    shipmentCount: shipments.length,
    totalDistance,
    avgEmission
  });
});

app.get('/api/emissions/trends', (req, res) => {
  res.json([
    { month: '2026-01', totalEmissions: 1230.75, shipmentCount: 2 },
    { month: '2026-02', totalEmissions: 738.12, shipmentCount: 3 }
  ]);
});

app.get('/api/lanes/analytics', (req, res) => {
  const laneData = {};
  shipments.forEach(s => {
    const lane = `${s.origin} → ${s.destination}`;
    if (!laneData[lane]) {
      laneData[lane] = { totalEmissions: 0, count: 0, totalDistance: 0 };
    }
    laneData[lane].totalEmissions += s.co2Emission;
    laneData[lane].count += 1;
    laneData[lane].totalDistance += s.distance;
  });
  
  const result = Object.entries(laneData).map(([lane, data]) => ({
    lane,
    totalEmissions: data.totalEmissions,
    shipmentCount: data.count,
    avgEmission: data.totalEmissions / data.count,
    totalDistance: data.totalDistance
  }));
  
  res.json(result);
});

app.get('/api/lanes/carrier-comparison', (req, res) => {
  const carrierData = {};
  shipments.forEach(s => {
    if (!carrierData[s.carrierName]) {
      carrierData[s.carrierName] = { totalEmissions: 0, count: 0 };
    }
    carrierData[s.carrierName].totalEmissions += s.co2Emission;
    carrierData[s.carrierName].count += 1;
  });
  
  const result = Object.entries(carrierData).map(([carrier, data]) => ({
    carrier,
    totalEmissions: data.totalEmissions,
    shipmentCount: data.count,
    avgEmission: data.totalEmissions / data.count
  }));
  
  res.json(result);
});

app.get('/api/lanes/high-emission', (req, res) => {
  const laneData = {};
  shipments.forEach(s => {
    const lane = `${s.origin} → ${s.destination}`;
    if (!laneData[lane]) {
      laneData[lane] = { totalEmissions: 0, count: 0, shipments: [] };
    }
    laneData[lane].totalEmissions += s.co2Emission;
    laneData[lane].count += 1;
    laneData[lane].shipments.push(s);
  });
  
  const result = Object.entries(laneData)
    .map(([lane, data]) => ({
      lane,
      totalEmissions: data.totalEmissions,
      shipmentCount: data.count,
      avgEmission: data.totalEmissions / data.count,
      shipments: data.shipments
    }))
    .sort((a, b) => b.totalEmissions - a.totalEmission)
    .slice(0, 5);
    
  res.json(result);
});

app.get('/api/shipments', (req, res) => {
  res.json(shipments);
});

app.get('/api/reports', (req, res) => {
  res.json({
    summary: {
      totalEmissions: shipments.reduce((sum, s) => sum + s.co2Emission, 0),
      totalShipments: shipments.length,
      avgEmissionPerShipment: shipments.reduce((sum, s) => sum + s.co2Emission, 0) / shipments.length
    },
    shipments: shipments
  });
});

app.get('/api/insights', (req, res) => {
  res.json({
    insights: [
      "Consider optimizing routes between Mumbai and Delhi for better fuel efficiency",
      "CNG trucks show 20% lower emissions on average",
      "Heavy trucks contribute 60% of total emissions"
    ]
  });
});

app.post('/api/chatbot', (req, res) => {
  res.json({
    response: "Based on your shipment data, I recommend optimizing your Mumbai-Delhi route and considering more CNG vehicles to reduce emissions by approximately 15-20%."
  });
});

app.get('/api/config', (req, res) => {
  res.json({ googleMapsKey: 'demo-key' });
});

// Export for Vercel
module.exports = app;
